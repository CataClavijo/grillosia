"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Voz del asistente.
 *
 * DICTADO: se usa el reconocimiento nativo del navegador, no un modelo
 * descargado. La version anterior de este proyecto usaba Whisper en el
 * navegador, que son unos 200 MB la primera vez. Para alguien en una vereda
 * con datos contados, eso hace la funcion inservible justo para quien mas la
 * necesita. Android Chrome —el objetivo declarado del proyecto— trae
 * reconocimiento con soporte de espanol de Colombia sin descargar nada.
 *
 * LECTURA: se pide el audio al servidor, que usa una voz natural. Si el
 * servidor no puede, se lee con la voz del sistema. Peor, pero nadie se queda
 * sin oir.
 */

type Reconocedor = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: unknown) => void) | null;
  onerror: ((e: unknown) => void) | null;
  onend: (() => void) | null;
};

function crearReconocedor(): Reconocedor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as Record<string, unknown>;
  const Ctor = (w.SpeechRecognition ?? w.webkitSpeechRecognition) as
    | (new () => Reconocedor)
    | undefined;
  return Ctor ? new Ctor() : null;
}

export function hayDictado(): boolean {
  return crearReconocedor() !== null;
}

export type EstadoDictado = "inactivo" | "escuchando" | "no-disponible";

/**
 * Dictado por voz. Devuelve lo que se va oyendo para que el campo de texto lo
 * muestre en vivo: sin eso, el productor no sabe si lo esta escuchando.
 */
export function useDictado(alTerminar: (texto: string) => void) {
  const [estado, setEstado] = useState<EstadoDictado>("inactivo");
  const [parcial, setParcial] = useState("");
  const rec = useRef<Reconocedor | null>(null);
  const final = useRef("");
  /**
   * Ultimo texto provisional.
   *
   * Chrome no siempre marca un resultado como definitivo antes de cerrar el
   * reconocimiento: a veces todo se queda en provisional y `final` llega
   * vacio. Sin esto, el productor habla, ve su frase en pantalla, calla, y no
   * se envia nada. Guardar lo provisional es la diferencia entre que la
   * funcion sirva o no.
   */
  const ultimo = useRef("");
  /** Evita enviar dos veces si `onend` llega despues de un envio manual. */
  const enviado = useRef(false);
  /**
   * Corte por silencio, adaptativo.
   *
   * El corte no puede ser fijo. Quien empieza a hablar suele dudar —"cada
   * cuanto... eh... le cambio el agua"— y una espera corta lo corta en mitad
   * de la idea. Cuando ya lleva una frase armada, en cambio, esperar tanto se
   * siente lento.
   *
   * Asi que se espera mas al principio y menos cuando ya hay algo dicho. El
   * reloj se reinicia con cada palabra nueva, de modo que solo corre durante
   * silencio de verdad.
   */
  const silencio = useRef<number | null>(null);
  const ESPERA_INICIAL_MS = 2000;
  const ESPERA_CORRIENTE_MS = 1200;
  /**
   * Cuando el navegador ya dio la frase por cerrada.
   *
   * A mitad de camino: 550 ms resultaron demasiado vivos —cortaba antes de
   * que uno terminara de pensar la frase— y los 1700 de antes se sentian
   * lentos. Este valor es el que se ajusta si vuelve a desbalancearse.
   */
  const ESPERA_TRAS_CIERRE_MS = 850;
  /** Cuando el navegador cierra solo pero seguimos queriendo escuchar. */
  const queremosOir = useRef(false);

  useEffect(() => {
    setEstado(hayDictado() ? "inactivo" : "no-disponible");
  }, []);

  const parar = useCallback(() => {
    // Pulsar el boton significa "ya termine de hablar", no "cancela": el
    // texto que alcanzo a oirse se envia igual.
    queremosOir.current = false;
    rec.current?.stop();
  }, []);

  const empezar = useCallback(() => {
    const r = crearReconocedor();
    if (!r) {
      setEstado("no-disponible");
      return;
    }
    rec.current = r;
    if (silencio.current) window.clearTimeout(silencio.current);
    final.current = "";
    ultimo.current = "";
    enviado.current = false;
    setParcial("");
    r.lang = "es-CO";
    // Modo continuo: sin esto el navegador cierra por su cuenta en cuanto
    // cree que termino un enunciado, y corta a quien encadena frases.
    r.continuous = true;
    r.interimResults = true;

    r.onresult = (e: unknown) => {
      const ev = e as {
        results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }>;
      };
      // Se REHACE la frase entera en cada evento, no se va sumando.
      //
      // En modo continuo el navegador reentrega TODOS los resultados desde el
      // principio cada vez que llega algo nuevo. Sumando, lo ya dicho se
      // volvia a pegar una y otra vez y salia "con 20 grillos puedo
      // alimentarcon 20 grillos puedo alimentar...". Rehacerlo es ademas
      // idempotente: da igual cuantas veces llegue el mismo evento.
      let definitivo = "";
      let enCurso = "";
      for (let i = 0; i < ev.results.length; i++) {
        const alt = ev.results[i][0]?.transcript ?? "";
        if (ev.results[i].isFinal) definitivo += alt;
        else enCurso += alt;
      }
      final.current = definitivo;
      const visible = (final.current + enCurso).trim();
      if (visible) ultimo.current = visible;
      setParcial(final.current + enCurso);

      // Cada vez que llega algo nuevo se reinicia la cuenta del silencio.
      if (silencio.current) window.clearTimeout(silencio.current);
      if (visible) {
        // ¿El navegador ya dio el enunciado por cerrado?
        //
        // Cuando marca un resultado como definitivo es porque SU detector de
        // fin de frase lo decidio, oyendo la senal: entonacion, pausa, energia.
        // Eso es mucho mejor que un cronometro a ciegas, asi que en ese caso
        // se espera lo justo por si la persona encadena otra frase. Antes se
        // ignoraba esa senal y se aguantaba el mismo tiempo largo siempre.
        const cerrado = ev.results[ev.results.length - 1]?.isFinal === true;
        const palabras = visible.split(/\s+/).filter(Boolean).length;
        // El atajo pide ADEMAS que haya frase. Un "cada cuanto" de dos
        // palabras que el navegador da por cerrado casi siempre es alguien
        // pensando a mitad de la idea, no una pregunta terminada: cortar ahi
        // a los 550 ms enviaria media pregunta.
        const espera =
          cerrado && palabras >= 4
            ? ESPERA_TRAS_CIERRE_MS
            : palabras < 4
              ? ESPERA_INICIAL_MS
              : ESPERA_CORRIENTE_MS;
        silencio.current = window.setTimeout(() => {
          queremosOir.current = false;
          rec.current?.stop();
        }, espera);
      }
    };

    r.onerror = () => {
      if (silencio.current) window.clearTimeout(silencio.current);
      queremosOir.current = false;
      setEstado("inactivo");
    };
    r.onend = () => {
      // El navegador cierra por su cuenta tras un rato de silencio absoluto.
      // Si nadie llego a decir nada y seguimos queriendo oir, se reabre: de
      // lo contrario el modo manos libres se queda mudo sin avisar.
      if (queremosOir.current && !final.current.trim() && !ultimo.current) {
        try {
          r.start();
          return;
        } catch {
          /* si no deja reabrir, se sigue al cierre normal */
        }
      }
      if (silencio.current) window.clearTimeout(silencio.current);
      queremosOir.current = false;
      setEstado("inactivo");
      // Se toma lo definitivo si existe; si no, lo ultimo que se oyo.
      const texto = (final.current.trim() || ultimo.current).trim();
      setParcial("");
      if (texto && !enviado.current) {
        enviado.current = true;
        alTerminar(texto);
      }
    };

    try {
      queremosOir.current = true;
      r.start();
      setEstado("escuchando");
    } catch {
      queremosOir.current = false;
      setEstado("inactivo");
    }
  }, [alTerminar]);

  useEffect(
    () => () => {
      if (silencio.current) window.clearTimeout(silencio.current);
      queremosOir.current = false;
      rec.current?.stop();
    },
    [],
  );

  return { estado, parcial, empezar, parar };
}

/**
 * Voz de mujer en espanol, entre las que trae el aparato.
 *
 * `speechSynthesis` no expone el genero, asi que se reconoce por nombre: los
 * que instala cada sistema son pocos y conocidos (Monica y Paulina en Apple,
 * Sabina y Helena en Windows, las de Google en Android). Se descartan de
 * entrada los masculinos, por si el nombre no esta en la lista.
 *
 * Entre las candidatas gana el espanol de America, que es el que suena
 * natural para quien va a usar esto.
 */
const NOMBRES_MUJER =
  /m[oó]nica|paulina|esperanza|sabina|helena|marisol|luciana|elena|laura|carmen|lupe|isabela|female|mujer/i;
const NOMBRES_HOMBRE = /jorge|diego|juan|pablo|carlos|enrique|male|hombre/i;

function vozFemenina(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const enEspanol = window.speechSynthesis
    .getVoices()
    .filter((v) => /^es/i.test(v.lang));
  if (!enEspanol.length) return null;

  const cercania = (v: SpeechSynthesisVoice) => {
    const l = v.lang.toLowerCase();
    if (l.startsWith("es-co")) return 0;
    if (l.startsWith("es-mx") || l.startsWith("es-us") || l.startsWith("es-419"))
      return 1;
    return 2;
  };

  const conNombreDeMujer = enEspanol.filter(
    (v) => NOMBRES_MUJER.test(v.name) && !NOMBRES_HOMBRE.test(v.name),
  );
  const candidatas = conNombreDeMujer.length
    ? conNombreDeMujer
    : enEspanol.filter((v) => !NOMBRES_HOMBRE.test(v.name));

  return (
    [...(candidatas.length ? candidatas : enEspanol)].sort(
      (a, b) => cercania(a) - cercania(b),
    )[0] ?? null
  );
}

/**
 * Parte el texto en trozos para pedirlos por separado.
 *
 * El PRIMERO va corto a proposito: es la unica espera que la persona oye como
 * silencio, porque los demas se piden mientras suena el anterior. Los que
 * siguen van mas largos para no multiplicar las llamadas sin necesidad.
 *
 * Se recorre a mano y no con un patron con `lookbehind`: eso no existe en
 * Safari anterior a la 16.4 y no falla al usarlo, impide leer el archivo
 * entero. Ya paso una vez y dejo la pagina muerta.
 */
const PRIMER_TROZO = 90;
const TROZO = 200;

function trocear(texto: string): string[] {
  const frases: string[] = [];
  let actual = "";
  for (let i = 0; i < texto.length; i++) {
    actual += texto[i];
    const siguiente = texto[i + 1];
    if (
      ".!?:;".includes(texto[i]) &&
      siguiente !== undefined &&
      /\s/.test(siguiente)
    ) {
      frases.push(actual.trim());
      actual = "";
    }
  }
  if (actual.trim()) frases.push(actual.trim());
  if (!frases.length) return texto.trim() ? [texto.trim()] : [];

  const trozos: string[] = [];
  for (const frase of frases) {
    // El tope depende de a QUE trozo se esta pegando, no de si la lista esta
    // vacia: mirando la lista, la segunda frase se unia al primer trozo con
    // el tope grande y el arranque volvia a ser lento.
    const ultimo = trozos[trozos.length - 1];
    const tope = trozos.length - 1 === 0 ? PRIMER_TROZO : TROZO;
    if (ultimo && ultimo.length + 1 + frase.length <= tope) {
      trozos[trozos.length - 1] = ultimo + " " + frase;
    } else {
      trozos.push(frase);
    }
  }
  return trozos;
}

/** Corta el marcado que el asistente escribe: no se lee en voz alta. */
function paraLeer(texto: string): string {
  return texto
    .replace(/\[figura:[a-z-]+\]/g, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/[*_`#>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export type EstadoLectura = "quieto" | "cargando" | "hablando";

/**
 * Un WAV de silencio, minimo, en linea.
 *
 * Los navegadores moviles solo dejan sonar audio si la orden sale
 * DIRECTAMENTE de un toque. En el modo manos libres el audio llega segundos
 * despues, cuando contesta el modelo, y para entonces el toque ya no cuenta:
 * la respuesta se quedaba muda.
 *
 * La forma de resolverlo es desbloquear un elemento de audio durante el toque
 * —reproduciendo este silencio— y reutilizar SIEMPRE ese mismo elemento.
 * Una vez desbloqueado, ya acepta reproducir sin gesto.
 */
const SILENCIO = "data:audio/wav;base64,UklGRmQGAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YUAGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

/** Lee un texto en voz alta. */
export function useLectura() {
  const [estado, setEstado] = useState<EstadoLectura>("quieto");
  const [leyendo, setLeyendo] = useState<string | null>(null);
  /** Elemento unico, desbloqueado por un toque y reutilizado siempre. */
  const audio = useRef<HTMLAudioElement | null>(null);
  const desbloqueado = useRef(false);

  /**
   * Desbloquea el audio. Hay que llamarlo DENTRO del manejador del toque,
   * no despues: fuera del gesto el navegador lo rechaza igual.
   */
  const desbloquear = useCallback(() => {
    if (desbloqueado.current) return;
    try {
      const a = audio.current ?? new Audio();
      a.src = SILENCIO;
      a.volume = 0;
      void a.play().then(() => {
        a.pause();
        a.volume = 1;
        desbloqueado.current = true;
      });
      audio.current = a;

      // La voz del sistema pide el mismo permiso, por si toca usarla.
      if (typeof window !== "undefined" && window.speechSynthesis) {
        const u = new SpeechSynthesisUtterance("");
        u.volume = 0;
        window.speechSynthesis.speak(u);
      }
    } catch {
      /* si no se puede, se intentara igual al reproducir */
    }
  }, []);

  /**
   * Cierra la lectura en curso desde fuera.
   *
   * `pause()` no dispara `onended`, asi que sin esto interrumpir dejaba la
   * promesa de `leer` colgada y el modo manos libres se quedaba mudo.
   */
  const cortar = useRef<(() => void) | null>(null);

  /**
   * Numero de la lectura en curso.
   *
   * Al leer por frases hay un bucle vivo entre peticion y peticion. Sin esto,
   * callar o empezar otra lectura no lo paraba: seguia pidiendo y soltando
   * frases de una respuesta que ya nadie queria oir.
   */
  const generacion = useRef(0);

  /**
   * Por donde va la lectura, de 0 a 1.
   *
   * Sirve para ir mostrando en pantalla lo que se esta diciendo. Es una
   * fraccion y no un indice de caracter a proposito: el texto que se lee en
   * voz alta pasa por `paraLeer` y no mide igual que el que se ve, asi que
   * un indice absoluto apuntaria al sitio equivocado.
   */
  const [avance, setAvance] = useState(0);

  const callar = useCallback(() => {
    generacion.current++;
    audio.current?.pause();
    cortar.current?.();
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    setEstado("quieto");
    setLeyendo(null);
  }, []);

  const conElNavegador = useCallback(
    (texto: string, id: string) =>
      new Promise<void>((listo) => {
        if (typeof window === "undefined" || !window.speechSynthesis) {
          setEstado("quieto");
          listo();
          return;
        }
        const u = new SpeechSynthesisUtterance(texto);
        u.lang = "es-CO";
        u.rate = 0.95;
        const suya = vozFemenina();
        if (suya) {
          u.voice = suya;
          u.lang = suya.lang;
        }
        let cerrado = false;
        const terminar = () => {
          if (cerrado) return;
          cerrado = true;
          cortar.current = null;
          setAvance(1);
          setEstado("quieto");
          setLeyendo(null);
          listo();
        };
        cortar.current = terminar;
        u.onend = terminar;
        u.onerror = terminar;
        // `onboundary` da la posicion de verdad, palabra por palabra.
        u.onboundary = (e) => {
          if (texto.length) setAvance(e.charIndex / texto.length);
        };
        setEstado("hablando");
        setLeyendo(id);
        window.speechSynthesis.speak(u);
      }),
    [],
  );

  /**
   * Lee un texto en voz alta.
   *
   * `servicio` decide de donde sale la voz, y por defecto es NO.
   *
   * ElevenLabs se reserva para el modo manos libres, que es una conversacion
   * hablada y ahi la calidad de la voz es la funcion. El boton de escuchar de
   * cada mensaje es el que mas se pulsa —uno puede oir la misma respuesta
   * varias veces— y gastar cupo de pago en eso vaciaria la cuenta sin darle
   * nada a nadie. Ese usa la voz del propio aparato, que no cuesta.
   */
  /**
   * Pide UN trozo de audio, reintentando. Devuelve null si no se pudo.
   *
   * Los reintentos importan mas de lo que parece: al leer por frases, un solo
   * tropiezo de red dejaba el resto de la respuesta en la voz del navegador y
   * se oian DOS voces distintas en la misma contestacion. Un fallo pasajero
   * no deberia costar eso, asi que se insiste dos veces mas antes de rendirse.
   *
   * Solo se reintenta lo que puede mejorar esperando. Un 503 con motivo
   * "tope" o "sin-servicio" es una respuesta firme del servidor: insistir ahi
   * es gastar tiempo mientras la persona espera en silencio.
   */
  const pedirAudio = useCallback(async (trozo: string) => {
    const esperas = [0, 250, 700];
    for (const espera of esperas) {
      if (espera) await new Promise((listo) => setTimeout(listo, espera));
      try {
        const res = await fetch("/api/voz", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ texto: trozo }),
        });
        if (res.ok) return await res.blob();
        // 503 es lo esperado cuando no hay servicio o se paso el tope: es
        // definitivo, no se insiste.
        if (res.status === 503) return null;
      } catch {
        // Red: eso si puede arreglarse solo. Se sigue intentando.
      }
    }
    return null;
  }, []);

  /**
   * Reproduce un trozo y espera a que ACABE.
   *
   * `base` y `tramo` situan este trozo dentro del texto completo, para que el
   * avance que sigue la pantalla no se reinicie en cada frase.
   */
  const reproducir = useCallback(
    (blob: Blob, base: number, tramo: number) =>
      new Promise<boolean>((listo) => {
        // Reutiliza el elemento desbloqueado; crear uno nuevo vuelve a
        // toparse con el bloqueo del navegador.
        const a = audio.current ?? new Audio();
        audio.current = a;
        a.src = URL.createObjectURL(blob);

        let cerrado = false;
        const terminar = (bien: boolean) => {
          if (cerrado) return;
          cerrado = true;
          cortar.current = null;
          a.ontimeupdate = null;
          listo(bien);
        };
        cortar.current = () => terminar(false);
        // Con el audio no hay marcas de palabra, asi que se reparte por
        // tiempo. Es una estimacion, pero va atada a la reproduccion real.
        a.ontimeupdate = () => {
          if (a.duration > 0)
            setAvance(base + (a.currentTime / a.duration) * tramo);
        };
        a.onended = () => terminar(true);
        a.onerror = () => terminar(false);
        void a.play().catch((e) => {
          console.warn("[voz] el navegador bloqueo la reproduccion:", e);
          terminar(false);
        });
      }),
    [],
  );

  /**
   * Lee un texto en voz alta.
   *
   * `servicio` decide de donde sale la voz, y por defecto es NO.
   *
   * ElevenLabs se reserva para el modo manos libres, que es una conversacion
   * hablada y ahi la calidad de la voz es la funcion. El boton de escuchar de
   * cada mensaje es el que mas se pulsa —uno puede oir la misma respuesta
   * varias veces— y gastar cupo de pago en eso vaciaria la cuenta sin darle
   * nada a nadie. Ese usa la voz del propio aparato, que no cuesta.
   *
   * Con el servicio se lee POR FRASES, no de una sola vez: se pide la
   * primera, y mientras suena se va pidiendo la siguiente. Medido contra la
   * API, una respuesta entera tarda 0,79 s en volver y la primera frase sola
   * 0,43 s; esa es la espera que oye la persona antes de que empiece a hablar.
   */
  const leer = useCallback(
    async (texto: string, id: string, opciones?: { servicio?: boolean }) => {
      callar();
      const limpio = paraLeer(texto);
      if (!limpio) return;

      // Cada lectura lleva su numero. Si entra otra —o alguien calla esta—,
      // el numero cambia y el bucle de abajo se detiene en vez de seguir
      // pidiendo y soltando frases de una respuesta ya abandonada.
      const mia = ++generacion.current;
      const vigente = () => generacion.current === mia;

      setEstado("cargando");
      setLeyendo(id);
      setAvance(0);

      if (!opciones?.servicio) {
        await conElNavegador(limpio, id);
        return;
      }

      const trozos = trocear(limpio);
      const total = trozos.reduce((n, t) => n + t.length, 0) || 1;

      let pedido = pedirAudio(trozos[0]);
      let leidos = 0;

      for (let i = 0; i < trozos.length; i++) {
        const blob = await pedido;
        if (!vigente()) return;

        // Se pide el siguiente ANTES de reproducir este: asi el viaje a la
        // API ocurre mientras suena, y entre frase y frase no hay espera.
        pedido =
          i + 1 < trozos.length
            ? pedirAudio(trozos[i + 1])
            : Promise.resolve(null);

        if (!blob) {
          // Sin servicio: lo que queda lo lee el aparato.
          //
          // Si ya sono algun trozo, aqui cambia la voz a mitad de respuesta y
          // se oyen dos distintas. Con los reintentos de arriba esto solo
          // deberia ocurrir cuando el servicio responde 503 de verdad —sin
          // cupo o caido—, y entonces callar el resto seria peor que
          // terminarlo con otra voz. Se deja aviso para no tener que
          // adivinarlo la proxima vez.
          if (i > 0)
            console.warn(
              `[voz] el trozo ${i + 1} no llego; el resto va con la voz del aparato`,
            );
          await conElNavegador(trozos.slice(i).join(" "), id);
          return;
        }

        setEstado("hablando");
        const bien = await reproducir(blob, leidos / total, trozos[i].length / total);
        if (!vigente() || !bien) {
          if (!vigente()) return;
          break;
        }
        leidos += trozos[i].length;
      }

      if (!vigente()) return;
      setAvance(1);
      setEstado("quieto");
      setLeyendo(null);
    },
    [callar, conElNavegador, pedirAudio, reproducir],
  );

  /**
   * Pide la lista de voces al montar.
   *
   * En varios navegadores `getVoices()` devuelve vacio la primera vez y solo
   * se llena despues, avisando por `voiceschanged`. Sin esta llamada temprana
   * la primera lectura podia salir con la voz por defecto del sistema, que
   * suele ser de hombre y en ingles.
   */
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const pedir = () => window.speechSynthesis.getVoices();
    pedir();
    window.speechSynthesis.addEventListener("voiceschanged", pedir);
    return () =>
      window.speechSynthesis.removeEventListener("voiceschanged", pedir);
  }, []);

  useEffect(() => callar, [callar]);

  return { estado, leyendo, avance, leer, callar, desbloquear };
}
