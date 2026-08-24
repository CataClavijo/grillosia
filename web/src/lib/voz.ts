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
  const ESPERA_INICIAL_MS = 2600;
  const ESPERA_CORRIENTE_MS = 1700;
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
      let enCurso = "";
      for (let i = 0; i < ev.results.length; i++) {
        const alt = ev.results[i][0]?.transcript ?? "";
        if (ev.results[i].isFinal) final.current += alt;
        else enCurso += alt;
      }
      const visible = (final.current + enCurso).trim();
      if (visible) ultimo.current = visible;
      setParcial(final.current + enCurso);

      // Cada vez que llega algo nuevo se reinicia la cuenta del silencio.
      if (silencio.current) window.clearTimeout(silencio.current);
      if (visible) {
        const palabras = visible.split(/\s+/).filter(Boolean).length;
        const espera =
          palabras < 4 ? ESPERA_INICIAL_MS : ESPERA_CORRIENTE_MS;
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
   * Por donde va la lectura, de 0 a 1.
   *
   * Sirve para ir mostrando en pantalla lo que se esta diciendo. Es una
   * fraccion y no un indice de caracter a proposito: el texto que se lee en
   * voz alta pasa por `paraLeer` y no mide igual que el que se ve, asi que
   * un indice absoluto apuntaria al sitio equivocado.
   */
  const [avance, setAvance] = useState(0);

  const callar = useCallback(() => {
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

  const leer = useCallback(
    async (texto: string, id: string) => {
      callar();
      const limpio = paraLeer(texto);
      if (!limpio) return;

      setEstado("cargando");
      setLeyendo(id);
      setAvance(0);

      try {
        const res = await fetch("/api/voz", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ texto: limpio }),
        });

        if (!res.ok) {
          // 503 es lo esperado cuando no hay servicio o se paso el tope.
          await conElNavegador(limpio, id);
          return;
        }

        const blob = await res.blob();
        // Reutiliza el elemento desbloqueado; crear uno nuevo vuelve a
        // toparse con el bloqueo del navegador.
        const a = audio.current ?? new Audio();
        audio.current = a;
        a.src = URL.createObjectURL(blob);
        setEstado("hablando");

        // Se espera al FINAL de la reproduccion, no al comienzo. Resolver al
        // empezar hacia que el modo manos libres volviera a escuchar con el
        // audio todavia sonando, y el microfono se oia a si mismo.
        await new Promise<void>((listo) => {
          let cerrado = false;
          const terminar = () => {
            if (cerrado) return;
            cerrado = true;
            cortar.current = null;
            a.ontimeupdate = null;
            setAvance(1);
            setEstado("quieto");
            setLeyendo(null);
            listo();
          };
          cortar.current = terminar;
          // Con el audio no hay marcas de palabra, asi que se reparte por
          // tiempo. Es una estimacion, pero va atada a la reproduccion real.
          a.ontimeupdate = () => {
            if (a.duration > 0) setAvance(a.currentTime / a.duration);
          };
          a.onended = terminar;
          a.onerror = () => {
            if (cerrado) return;
            cerrado = true;
            void conElNavegador(limpio, id).then(listo);
          };
          void a.play().catch((e) => {
            if (cerrado) return;
            cerrado = true;
            console.warn("[voz] el navegador bloqueo la reproduccion:", e);
            void conElNavegador(limpio, id).then(listo);
          });
        });
      } catch {
        await conElNavegador(limpio, id);
      }
    },
    [callar, conElNavegador],
  );

  useEffect(() => callar, [callar]);

  return { estado, leyendo, avance, leer, callar, desbloquear };
}
