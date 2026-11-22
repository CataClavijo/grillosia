"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Mic, Square, X } from "lucide-react";

import { FIGURAS } from "@/components/figura";
import { OrbeVoz, type ModoOrbe } from "@/components/orbe-voz";
import { useDictado, useLectura, type ErrorDictado } from "@/lib/voz";
import { cn } from "@/lib/utils";

/**
 * Modo manos libres.
 *
 * Un ciclo: escucha, envia, muestra el dibujo si viene al caso, lee la
 * respuesta en voz alta y vuelve a escuchar. Sin teclado y sin botones que
 * pulsar en el medio.
 *
 * Es el modo que de verdad justifica la voz en este proyecto. Alguien que no
 * lee con soltura no gana nada con un microfono que escribe en un campo de
 * texto que despues tiene que leer; gana con preguntar y que le contesten
 * hablando, y viendo.
 *
 * Va como capa sobre el chat y no como pagina aparte: es la misma
 * conversacion y el mismo historial, solo presentado de otra forma.
 */

type Fase = "escuchando" | "pensando" | "hablando";

const POR_ID = new Map(FIGURAS.map((f) => [f.id, f]));

/** Marcador con que el asistente pide mostrar un dibujo. */
const MARCA = /\[figura:([a-z-]{1,32})\]/g;

/** El texto tal como se lee y se muestra, sin los marcadores. */
function sinMarcas(texto: string) {
  return texto.replace(MARCA, "").replace(/\n{3,}/g, "\n\n").trim();
}

/**
 * Arma el guion: cada linea con el dibujo que le toca.
 *
 * Antes se cogia SOLO el primer dibujo de la respuesta y se dejaba fijo
 * mientras hablaba. Para un "¿como armo la caja?" eso desperdicia lo que el
 * asistente ya sabe hacer: nombra la caja, la ventilacion, la cama, las
 * hueveras y el agua, cada una con su dibujo. Atando cada dibujo a su linea,
 * la imagen va cambiando al ritmo de la voz y se ve el paso a paso.
 *
 * Se parte primero por saltos de linea porque el marcador viene en una linea
 * suya; solo despues se parte en frases. El dibujo vale desde donde aparece
 * hacia adelante, hasta que llegue otro.
 */
function guionar(texto: string) {
  const lineas: string[] = [];
  const dibujos: Array<(typeof FIGURAS)[number] | undefined> = [];
  let actual: (typeof FIGURAS)[number] | undefined;

  for (const bloque of texto.split("\n")) {
    const marcas = [...bloque.matchAll(MARCA)];
    if (marcas.length) {
      const ultima = POR_ID.get(marcas[marcas.length - 1][1]);
      if (ultima) actual = ultima;
    }
    const limpio = bloque.replace(MARCA, "").trim();
    if (!limpio) continue;
    for (const linea of enLineas(limpio)) {
      lineas.push(linea);
      dibujos.push(actual);
    }
  }
  // Un marcador que quedo DESPUES de todo el texto. El asistente a veces
  // contesta en dos frases y pone el dibujo al final; como el dibujo vale
  // "de aqui en adelante" y adelante no habia nada, no se mostraba nunca.
  // Se le da a las lineas de atras que no tengan uno.
  if (actual && dibujos[dibujos.length - 1] !== actual) {
    for (let i = dibujos.length - 1; i >= 0 && !dibujos[i]; i--) {
      dibujos[i] = actual;
    }
  }
  return { lineas, dibujos };
}

/**
 * Red de seguridad contra el eco.
 *
 * El navegador no dice quien hablo: `SpeechRecognition` entrega texto, no
 * identidad. Lo que usan los asistentes de verdad es cancelacion de eco, que
 * necesita la senal de lo que suena como referencia, y la API abre su propio
 * microfono sin dejar pasarle nada. Asi que la defensa principal es no oir
 * mientras habla; esto solo cubre la fuga que quede al interrumpir o cuando
 * la voz del sistema se arrastra un instante.
 *
 * Compara por subcadena y pide cinco palabras: el eco devuelve un trozo
 * literal de lo dicho. Contar palabras sueltas descartaria preguntas reales
 * -"y la tilapia que"- por repetir terminos que el asistente acababa de usar.
 */
const llano = (t: string) =>
  t
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/**
 * Le pone tope de tiempo a una promesa.
 *
 * Una peticion que nunca responde congelaba el modo igual que un error: sin
 * tope, el turno se quedaba esperando para siempre y el microfono no volvia a
 * abrirse. Mejor rendirse y dejar preguntar otra vez.
 */
function conTope<T>(promesa: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((listo, falla) => {
    const reloj = window.setTimeout(
      () => falla(new Error(`sin respuesta en ${ms} ms`)),
      ms,
    );
    promesa.then(
      (v) => {
        window.clearTimeout(reloj);
        listo(v);
      },
      (e) => {
        window.clearTimeout(reloj);
        falla(e);
      },
    );
  });
}

function esEco(oido: string, dicho: string) {
  const a = llano(oido);
  if (a.split(" ").filter(Boolean).length < 5) return false;
  return llano(dicho).includes(a);
}

/**
 * Parte la respuesta en lineas para irlas mostrando mientras suena.
 *
 * Corta por final de frase y tambien antes de "1)", "2)": el asistente
 * enumera mucho, y sin eso una lista entera quedaba de una sola linea
 * larguisima que no se podia seguir.
 *
 * Lo que pasa de 95 caracteres se vuelve a partir por comas o punto y coma;
 * una linea que no cabe en la pantalla del telefono no sirve para seguir la
 * lectura.
 */
function enLineas(texto: string): string[] {
  // Se recorre a mano y no con una expresion regular con `lookbehind`:
  // el `lookbehind` no existe en Safari anterior a la 16.4, y un patron que el
  // navegador no entiende no falla al usarlo, sino que impide leer el archivo
  // entero. Un telefono de 2022 sin actualizar dejaba muerta toda la pagina.
  const crudas: string[] = [];
  let actual = "";

  /** Si en `i` empieza un punto de lista: "1)", "2)", "10)". */
  const abreLista = (i: number) => {
    let j = i;
    while (j < texto.length && texto[j] >= "0" && texto[j] <= "9") j++;
    return j > i && texto[j] === ")";
  };

  const espacio = (c: string | undefined) => c !== undefined && /\s/.test(c);

  /**
   * Abreviaturas que NO terminan frase.
   *
   * "Dra." parecia un final y partia la linea en mitad de "**Dra. Monica
   * Paola Higuera-Diaz**": la negrita quedaba a caballo entre dos lineas y
   * los asteriscos salian a la vista.
   */
  const ABREVIATURAS = new Set([
    "dr",
    "dra",
    "sr",
    "sra",
    "srta",
    "ing",
    "lic",
    "prof",
    "aprox",
    "etc",
    "ej",
    "no",
    "pag",
  ]);

  /** La palabra que acaba en `i` (sin contar el punto). */
  const abrevia = (i: number) => {
    let j = i - 1;
    let palabra = "";
    while (j >= 0 && /[\p{L}]/u.test(texto[j])) {
      palabra = texto[j] + palabra;
      j--;
    }
    return palabra.length > 0 && ABREVIATURAS.has(palabra.toLowerCase());
  };

  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];

    // Corte ANTES del punto de lista: el asistente enumera mucho, y sin esto
    // una lista entera quedaba de una sola linea larguisima.
    if (espacio(c) && abreLista(i + 1)) {
      if (actual.trim()) crudas.push(actual.trim());
      actual = "";
      continue;
    }

    actual += c;

    // Corte DESPUES del final de frase, solo si le sigue un espacio: asi
    // "D3." al final no parte, y "2.5" tampoco. Y tampoco tras "Dra.".
    if (".!?:".includes(c) && espacio(texto[i + 1]) && !(c === "." && abrevia(i))) {
      crudas.push(actual.trim());
      actual = "";
    }
  }
  if (actual.trim()) crudas.push(actual.trim());

  const salida: string[] = [];
  for (const linea of crudas) {
    if (linea.length <= 95) {
      salida.push(linea);
      continue;
    }
    let resto = linea;
    while (resto.length > 95) {
      const corte = resto.lastIndexOf(", ", 95);
      const punto = resto.lastIndexOf("; ", 95);
      const donde = Math.max(corte, punto);
      if (donde < 30) break;
      salida.push(resto.slice(0, donde + 1).trim());
      resto = resto.slice(donde + 1).trim();
    }
    if (resto) salida.push(resto);
  }
  return salida;
}

/**
 * Pinta las negritas de `**asi**`.
 *
 * El asistente escribe en markdown y el chat lo interpreta, pero aqui las
 * lineas se pintaban en crudo: en pantalla salian los asteriscos. Se resuelve
 * partiendo por el par de asteriscos —los trozos impares son los resaltados—
 * en vez de traer un interprete entero de markdown por una sola marca.
 */
function conNegritas(linea: string) {
  const partes = linea.split(/\*\*/);
  // Un solo asterisco doble suelto: la negrita quedo partida entre dos
  // lineas. No se puede resaltar, pero MOSTRAR el asterisco es peor que
  // quitarlo, asi que se quita.
  if (partes.length < 3) return partes.join("");
  return partes.map((trozo, i) =>
    i % 2 === 1 ? <strong key={i} className="font-semibold">{trozo}</strong> : trozo,
  );
}

/**
 * Lo que se dice cuando el microfono no abre.
 *
 * Antes no se decia nada: con el permiso negado la pantalla quedaba en "toque
 * para hablar", uno tocaba, y volvia a quedar igual, sin una palabra de por
 * que. Cada motivo lleva que paso y que hacer, y ademas se lee en voz alta:
 * este modo es para quien no lee con soltura.
 */
const AVISOS: Record<
  Exclude<ErrorDictado, "sin-voz">,
  { titulo: string; texto: string }
> = {
  permiso: {
    titulo: "Falta el permiso del micrófono",
    texto:
      "Toque el candado que está arriba, junto a la dirección de la página, permita el micrófono y vuelva a tocar el círculo.",
  },
  "sin-microfono": {
    titulo: "No encuentro el micrófono",
    texto:
      "Puede que otra aplicación lo esté usando. Ciérrela y toque el círculo.",
  },
  "sin-red": {
    titulo: "No hay señal",
    texto:
      "Para oírle se necesita internet. Cuando vuelva la señal, toque el círculo.",
  },
  otro: {
    titulo: "No pude abrir el micrófono",
    texto: "Toque el círculo para intentar otra vez.",
  },
};

/** Cuanto se espera la respuesta antes de avisar que la senal esta lenta. */
const AVISO_LENTO_MS = 7000;

export function ManosLibres({
  abierto,
  onCerrar,
  preguntar,
}: {
  abierto: boolean;
  onCerrar: () => void;
  /** `voz` le pide al asistente contestar para ser oido: corto y de a una pregunta. */
  preguntar: (texto: string, opciones?: { voz?: boolean }) => Promise<string>;
}) {
  const [fase, setFase] = useState<Fase>("escuchando");
  const [dicho, setDicho] = useState("");
  const [respuesta, setRespuesta] = useState("");
  /** La respuesta se demora: se avisa para que no parezca que se colgo. */
  const [lento, setLento] = useState(false);
  const vivo = useRef(false);

  /**
   * La fase, para leerla desde funciones asincronas, y el numero del turno.
   *
   * El turno es lo que impide que dos cosas hablen a la vez. Cada pregunta
   * toma un numero; interrumpir, salir o apagar la pantalla lo cambian, y lo
   * que quede en camino de un turno viejo (la respuesta que llega tarde, el
   * "volver a escuchar" del final) se descarta al ver que ya no es el suyo.
   *
   * Sin esto, salir mientras pensaba y volver a entrar hacia que la respuesta
   * vieja sonara encima del microfono abierto.
   */
  const faseRef = useRef<Fase>("escuchando");
  const turno = useRef(0);

  const ponerFase = useCallback((f: Fase) => {
    faseRef.current = f;
    setFase(f);
    setLento(false);
  }, []);

  const { leer, callar, desbloquear, avance, estado: estadoLectura } = useLectura();

  // `empezar` nace mas abajo (depende de `alOir`), asi que se alcanza por
  // referencia para poder volver a escuchar al terminar de hablar.
  const volverAOir = useRef<() => void>(() => {});

  /** Lo ultimo que se leyo en voz alta, para reconocer el eco. */
  const ultimoDicho = useRef("");

  const alOir = useCallback(
    async (texto: string) => {
      // Solo se atiende mientras se esta escuchando. Una frase que llegue con
      // un turno en marcha abriria otro encima.
      if (!vivo.current || faseRef.current !== "escuchando") return;

      if (esEco(texto, ultimoDicho.current)) {
        volverAOir.current();
        return;
      }

      const mio = ++turno.current;
      const vigente = () => vivo.current && turno.current === mio;

      setDicho(texto);
      // La respuesta anterior NO se borra: se queda hasta que llegue la nueva.
      // Borrarla aqui dejaba la pantalla en blanco justo cuando uno se habia
      // quedado a medias de leerla, y ya no habia forma de volver a verla.
      ponerFase("pensando");

      // TODO el turno va protegido, y el regreso a escuchar va en `finally`.
      //
      // Sin esto, un solo fallo dejaba el modo muerto para siempre: si
      // `preguntar` lanzaba —escribe en la base de datos por red, basta con
      // quedarse sin senal un momento— la funcion se cortaba a mitad y nadie
      // volvia a abrir el microfono. Quedaba en "Pensando" sin decir nada, y
      // desde fuera se ve como que dejo de reconocer la voz.
      try {
        const bruto = await conTope(preguntar(texto, { voz: true }), 40000);
        if (!vigente()) return;

        // Se guarda EN CRUDO, con los marcadores: de ahi sale el guion que
        // sincroniza cada dibujo con su linea.
        setRespuesta(bruto);
        ultimoDicho.current = sinMarcas(bruto);
        ponerFase("hablando");

        // Se espera a que ACABE de sonar. Antes se reabria el microfono 400 ms
        // despues de empezar a hablar, y se oia a si mismo.
        await leer(bruto, "manos-libres", { servicio: true });
      } catch (e) {
        console.warn("[voz] el turno no se pudo completar:", e);
        if (vigente()) {
          const aviso =
            typeof navigator !== "undefined" && navigator.onLine === false
              ? "Se fue la señal. Cuando vuelva, pregunte otra vez."
              : "No le pude responder esta vez. Vuelva a preguntar.";
          setRespuesta(aviso);
          ultimoDicho.current = aviso;
          ponerFase("hablando");
          // El aviso tambien se DICE. Antes solo se escribia, y quien no
          // estaba mirando la pantalla se quedaba esperando una respuesta
          // que no iba a llegar. Va con la voz del aparato: si no hubo red
          // para la respuesta, tampoco la hay para pedir el audio.
          await leer(aviso, "manos-libres").catch(() => {});
        }
      } finally {
        if (vigente()) {
          // Pausa corta: lo justo para no pisar el final de su propia frase.
          await new Promise((listo) => window.setTimeout(listo, 400));
          if (vigente()) {
            ponerFase("escuchando");
            volverAOir.current();
          }
        }
      }
    },
    [preguntar, leer, ponerFase],
  );

  const guion = useMemo(() => guionar(respuesta), [respuesta]);
  const lineas = guion.lineas;

  /**
   * Cual de las lineas se esta diciendo.
   *
   * Se reparte el avance por numero de caracteres. Con la voz del sistema la
   * marca es exacta; con el audio es una estimacion, pero atada al tiempo real
   * de reproduccion, no a un cronometro suelto.
   */
  const activa = useMemo(() => {
    if (!lineas.length) return 0;
    const total = lineas.reduce((n, l) => n + l.length, 0);
    const meta = avance * total;
    let suma = 0;
    for (let i = 0; i < lineas.length; i++) {
      suma += lineas[i].length;
      if (meta < suma) return i;
    }
    return lineas.length - 1;
  }, [lineas, avance]);

  /**
   * El dibujo que toca AHORA, segun la linea que se esta diciendo.
   *
   * Mientras habla va cambiando con la voz. Cuando la linea no tiene dibujo
   * propio —porque la respuesta arranca con una frase antes del primer
   * marcador— se cae al PRIMERO, no al ultimo: al empezar a oir un paso a
   * paso lo coherente es ver el primer paso, no el final.
   */
  const figura = guion.dibujos[activa] ?? guion.dibujos.find(Boolean);

  const caja = useRef<HTMLDivElement>(null);

  // Una respuesta nueva se empieza a leer desde arriba. Si la anterior era
  // larga y habia quedado corrida hasta el final, la nueva aparecia ya
  // desplazada y su primera linea quedaba fuera de la vista.
  useEffect(() => {
    if (caja.current) caja.current.scrollTop = 0;
  }, [respuesta]);

  // Arrastra la linea que suena a la vista. `nearest` y no `center`: centrar
  // mueve el texto entero en cada frase y marea. Las lineas llevan margen de
  // desplazamiento, asi que la que viene tambien alcanza a verse.
  useEffect(() => {
    if (fase !== "hablando") return;
    const el = caja.current?.querySelector<HTMLElement>('[data-suena="si"]');
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activa, fase, respuesta]);

  // Paciencia de dos: si nadie dice nada, el microfono se reabre solo dos
  // veces mas antes de quedar en pausa.
  const dictado = useDictado(alOir, { paciencia: 2 });
  const {
    empezar,
    parar,
    cancelar,
    estado: estadoDictado,
    parcial,
    voz: oyendoVoz,
    error: errorDictado,
  } = dictado;

  useEffect(() => {
    volverAOir.current = empezar;
  }, [empezar]);

  /**
   * El toque hace lo unico sensato en cada momento.
   *
   * Hablando: lo calla y abre el microfono EN el mismo toque. Antes solo
   * callaba y esperaba a que el ciclo reabriera por su cuenta casi medio
   * segundo despues: la pantalla seguia diciendo "respondiendo" y la primera
   * palabra de quien interrumpia se perdia.
   *
   * Pensando: nada. Abrir el microfono aqui dejaba dos turnos a la vez, y la
   * respuesta que venia en camino sonaba con el microfono abierto.
   *
   * Escuchando con algo ya dicho: es "ya termine", se envia sin esperar al
   * silencio.
   *
   * Callado sin estar oyendo: abre el microfono. Reabrir el reconocimiento
   * sin que medie un toque no esta garantizado -Safari en iPhone lo
   * restringe-, y si falla, el modo se queda mudo; con esto siempre queda
   * una salida a un toque.
   */
  const alTocar = useCallback(() => {
    if (faseRef.current === "pensando") return;
    if (faseRef.current === "hablando") {
      turno.current++;
      callar();
      ponerFase("escuchando");
      empezar();
      return;
    }
    if (estadoDictado === "escuchando") {
      if (parcial.trim()) parar();
      return;
    }
    // Por si se esta leyendo un aviso: que no se oiga a si mismo.
    callar();
    empezar();
  }, [callar, empezar, parar, ponerFase, estadoDictado, parcial]);

  useEffect(() => {
    if (!abierto) return;
    vivo.current = true;
    turno.current++;
    // El toque que abrio esta capa es el unico momento en que el navegador
    // movil deja desbloquear el audio. Despues ya es tarde.
    desbloquear();
    setDicho("");
    setRespuesta("");
    ultimoDicho.current = "";
    ponerFase("escuchando");
    empezar();
    return () => {
      vivo.current = false;
      turno.current++;
      // `cancelar` y no `parar`: al salir, media frase no se envia.
      cancelar();
      callar();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto]);

  // Mientras piensa: pasado un rato se avisa que la senal esta lenta, para
  // que no parezca que se colgo.
  useEffect(() => {
    if (fase !== "pensando") return;
    const reloj = window.setTimeout(() => setLento(true), AVISO_LENTO_MS);
    return () => window.clearTimeout(reloj);
  }, [fase, dicho]);

  // Cuando el microfono no abre, el motivo se dice en voz alta.
  useEffect(() => {
    if (!abierto || !errorDictado || errorDictado === "sin-voz") return;
    if (faseRef.current !== "escuchando") return;
    const aviso = AVISOS[errorDictado];
    void leer(`${aviso.titulo}. ${aviso.texto}`, "manos-libres-aviso").catch(
      () => {},
    );
  }, [abierto, errorDictado, leer]);

  const cerrar = useRef(onCerrar);
  useEffect(() => {
    cerrar.current = onCerrar;
  }, [onCerrar]);

  /**
   * Salir, por cualquiera de los caminos: el boton, la tecla Escape o el
   * boton de atras del telefono.
   *
   * Al abrir se deja una marca en el historial. Sin ella, "atras" en Android
   * -que es como mucha gente cierra las cosas- sacaba de la pagina entera en
   * vez de cerrar la conversacion. Con la marca, atras solo la cierra.
   */
  const salir = useCallback(() => {
    if (window.history.state?.manosLibres) window.history.back();
    else cerrar.current();
  }, []);

  useEffect(() => {
    if (!abierto) return;

    if (!window.history.state?.manosLibres) {
      window.history.pushState(
        { ...(window.history.state ?? {}), manosLibres: true },
        "",
      );
    }
    const alVolver = () => cerrar.current();
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === "Escape") salir();
    };
    window.addEventListener("popstate", alVolver);
    window.addEventListener("keydown", alTeclear);

    // La pagina de atras no se mueve mientras la capa esta encima.
    const antes = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("popstate", alVolver);
      window.removeEventListener("keydown", alTeclear);
      document.body.style.overflow = antes;
    };
  }, [abierto, salir]);

  /**
   * Pantalla encendida, y todo quieto si la pagina deja de verse.
   *
   * Un telefono apaga la pantalla a los treinta segundos sin tocarlo, que es
   * justo como se usa este modo; al apagarse, el reconocimiento se corta. Se
   * pide que no se apague mientras la capa esta abierta.
   *
   * Y si la persona cambia de aplicacion o bloquea el telefono, se calla y
   * se cierra el microfono: el audio seguia sonando con la pagina oculta.
   * Al volver queda en pausa, a un toque de seguir.
   */
  useEffect(() => {
    if (!abierto) return;
    type Candado = { release: () => Promise<void> };
    let candado: Candado | null = null;
    let suelto = false;

    const pedir = async () => {
      try {
        const nav = navigator as Navigator & {
          wakeLock?: { request: (tipo: "screen") => Promise<Candado> };
        };
        const nuevo = (await nav.wakeLock?.request("screen")) ?? null;
        if (suelto) void nuevo?.release().catch(() => {});
        else candado = nuevo;
      } catch {
        /* sin bateria o sin soporte: se sigue sin el */
      }
    };
    const alCambiar = () => {
      if (document.visibilityState === "visible") {
        void pedir();
        return;
      }
      turno.current++;
      cancelar();
      callar();
      ponerFase("escuchando");
    };

    void pedir();
    document.addEventListener("visibilitychange", alCambiar);
    return () => {
      suelto = true;
      document.removeEventListener("visibilitychange", alCambiar);
      void candado?.release().catch(() => {});
    };
  }, [abierto, cancelar, callar, ponerFase]);

  if (!abierto) return null;

  const oyendo = estadoDictado === "escuchando";
  const modo: ModoOrbe =
    fase === "escuchando" ? (oyendo ? "escuchando" : "pausa") : fase;

  const problema =
    modo === "pausa" && estadoDictado === "no-disponible"
      ? {
          titulo: "Este navegador no puede oírle",
          texto: "Abra la página en Chrome para hablar con el asistente.",
        }
      : modo === "pausa" && errorDictado && errorDictado !== "sin-voz"
        ? AVISOS[errorDictado]
        : null;

  /** El estado, en palabras de todos los dias. Es lo que mas grande se lee. */
  const titulo = problema
    ? problema.titulo
    : modo === "escuchando"
      ? "Le escucho"
      : modo === "pensando"
        ? "Pensando"
        : modo === "hablando"
          ? "Hablando"
          : "Toque el círculo para hablar";

  /** Una sola linea de ayuda, y solo cuando hay algo que hacer o que saber. */
  const pista =
    modo === "hablando"
      ? figura
        ? "Toque la imagen para interrumpir"
        : "Toque el círculo para interrumpir"
      : modo === "pensando" && lento
        ? "La señal está lenta. Espere un momento."
        : "";

  /**
   * ¿Se resalta la linea que suena, o se deja la respuesta quieta para releer?
   *
   * Solo se sigue mientras esta hablando. Despues el resalte sobra: la persona
   * no va detras de la voz, va leyendo a su ritmo.
   */
  const siguiendo = fase === "hablando";

  /**
   * Se muestra la respuesta —la de ahora o la anterior— siempre que haya una y
   * la persona no este hablando. Mientras habla mandan sus palabras, que le
   * confirman que se le oyo bien.
   */
  const mostrarLineas =
    !problema &&
    lineas.length > 0 &&
    (siguiendo || (fase === "escuchando" && !parcial));

  const conDibujo = Boolean(figura) && fase === "hablando";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Conversación por voz"
      data-manos-libres={modo}
      className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-[#16130F] text-[#F4F1E7]"
    >
      {/* Sin lamina de fondo: el paisaje con palmas ya no es parte de la
          identidad, y el fondo liso deja todo el foco en la conversacion. */}

      <div className="mx-auto flex min-h-0 w-full max-w-[560px] flex-1 flex-col items-center px-6 pb-[max(env(safe-area-inset-bottom),20px)] pt-[max(env(safe-area-inset-top),16px)] sm:pt-[6vh]">
        {/* Alto fijo: el circulo y el dibujo ocupan el mismo sitio, asi que
            al pasar de uno a otro nada de lo de abajo salta. */}
        <div className="flex h-[268px] w-full shrink-0 items-center justify-center [@media(max-height:620px)]:h-[212px]">
          {conDibujo && figura ? (
            /* Cuando hay dibujo, manda el dibujo, y el dibujo ES el boton de
               interrumpir. Cuando ocupaba el sitio del circulo sin serlo no
               quedaba nada que tocar, y habia que aguantar la respuesta
               entera. */
            <button
              type="button"
              onClick={alTocar}
              aria-label="Interrumpir y hablar"
              className="w-full max-w-[344px] rounded-2xl text-left outline-none focus-visible:ring-2 focus-visible:ring-[#E0A27F] [@media(max-height:620px)]:max-w-[260px]"
            >
              {/* `key` con el id: al cambiar de dibujo React monta uno nuevo y
                  la animacion vuelve a correr. Sin eso el cambio es un salto
                  seco, y como la imagen va siguiendo a la voz eso pasa varias
                  veces en una misma respuesta. */}
              <figure key={figura.id} className="animate-in fade-in duration-500">
                <div className="flex aspect-[3/2] items-center justify-center overflow-hidden rounded-2xl border border-white/15 bg-[#FBF9F2]">
                  <Image
                    src={figura.src ?? `/figuras/${figura.id}.webp`}
                    alt={figura.alt}
                    width={900}
                    height={600}
                    className="h-full w-full object-contain"
                  />
                </div>
                <figcaption className="mt-2 truncate text-center text-[14px] leading-snug text-[#B5AB9C]">
                  {figura.titulo}
                  {figura.credito && <> · Fotografía: {figura.credito}</>}
                </figcaption>
              </figure>
            </button>
          ) : (
            <button
              type="button"
              onClick={alTocar}
              aria-label={
                modo === "hablando"
                  ? "Interrumpir y hablar"
                  : modo === "pensando"
                    ? "Pensando la respuesta"
                    : modo === "escuchando"
                      ? "Ya terminé de hablar"
                      : "Hablar"
              }
              aria-disabled={modo === "pensando"}
              className={cn(
                "relative flex shrink-0 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#E0A27F] [@media(max-height:620px)]:scale-[0.8]",
                modo === "pensando" && "cursor-default",
              )}
            >
              <OrbeVoz
                modo={modo}
                voz={oyendoVoz}
                pulso={parcial.length}
                sonando={estadoLectura === "hablando"}
              />
              {/* El icono dice que hace el toque: microfono para hablar,
                  cuadro para detener. Mientras piensa no hay nada que tocar. */}
              <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                {modo === "hablando" ? (
                  <Square className="size-7 fill-[#16130F] text-[#16130F]" aria-hidden />
                ) : modo === "pensando" ? null : (
                  <Mic
                    className={cn(
                      "size-9",
                      modo === "escuchando" ? "text-[#E0A27F]" : "text-[#B5AB9C]",
                    )}
                    aria-hidden
                  />
                )}
              </span>
            </button>
          )}
        </div>

        {/* El estado, grande y en palabras. Antes iba en un rotulo
            monoespaciado en mayusculas de 12 px, que es lo mas dificil de leer
            de toda la pantalla y era justo lo que mas importaba. */}
        <p
          role="status"
          aria-live="polite"
          className="mt-2 flex items-center justify-center gap-2.5 text-balance text-center text-[26px] leading-tight font-semibold tracking-[-0.01em]"
        >
          {conDibujo && (
            <span className="size-2.5 shrink-0 animate-pulse rounded-full bg-[#F4F1E7]" aria-hidden />
          )}
          {titulo}
        </p>
        <p className="mt-1.5 min-h-[1.4em] text-center text-[16px] leading-snug text-[#B5AB9C]">
          {pista}
        </p>

        {/* El texto ocupa todo lo que queda. Antes iba en una caja de alto
            fijo con su propia barra: unas pocas lineas apretadas y el resto
            escondido. Si la respuesta es larga se desliza aqui mismo, y los
            bordes se desvanecen para que el corte no parezca un error. */}
        <div
          ref={caja}
          className="barra-fina mt-3 min-h-0 w-full flex-1 overflow-y-auto overscroll-contain [mask-image:linear-gradient(to_bottom,transparent,black_14px,black_calc(100%-22px),transparent)]"
        >
          <div className="mx-auto flex min-h-full max-w-[30ch] flex-col justify-start py-3 text-[22px] leading-[1.38] sm:max-w-[34ch]">
            {mostrarLineas ? (
              <div className="flex flex-col gap-3">
                {lineas.map((linea, i) => (
                  <p
                    key={i}
                    data-suena={siguiendo && i === activa ? "si" : "no"}
                    className={cn(
                      "scroll-my-12 text-center text-pretty transition-colors duration-300",
                      !siguiendo
                        ? // Ya no suena: se puede releer entera, sin que una
                          // linea resalte por encima de las demas.
                          "text-[#B5AB9C]"
                        : i === activa
                          ? "text-[#F4F1E7]"
                          : i < activa
                            ? "text-[#8F867A]"
                            : "text-[#6F675C]",
                    )}
                  >
                    {conNegritas(linea)}
                  </p>
                ))}
              </div>
            ) : problema ? (
              <p className="text-center text-pretty text-[#F4F1E7]">{problema.texto}</p>
            ) : fase === "pensando" ? (
              /* Sus propias palabras, en el color de quien escucha: confirman
                 que se le oyo bien mientras llega la respuesta. */
              <p className="text-center text-pretty text-[#E0A27F]">{dicho}</p>
            ) : parcial ? (
              <p className="text-center text-pretty text-[#E0A27F]">{parcial}</p>
            ) : modo === "escuchando" ? (
              <p className="text-center text-pretty text-[#B5AB9C]">
                Pregunte lo que quiera sobre sus grillos.
              </p>
            ) : null}
          </div>
        </div>

        {/* Una sola salida. Antes habia dos —una equis arriba y este boton—
            y el boton, blanco y lleno, pesaba mas que el circulo, que es lo
            que de verdad se usa. */}
        <button
          type="button"
          onClick={salir}
          className="mt-3 flex min-h-14 w-full max-w-[320px] shrink-0 items-center justify-center gap-2 rounded-full border border-white/30 text-[17px] font-semibold text-[#F4F1E7] outline-none transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-[#E0A27F] active:bg-white/15"
        >
          <X className="size-5" aria-hidden />
          Terminar
        </button>
      </div>
    </div>
  );
}
