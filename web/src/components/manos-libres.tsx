"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";

import { FIGURAS } from "@/components/figura";
import { OrbeVoz } from "@/components/orbe-voz";
import { useDictado, useLectura } from "@/lib/voz";
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

/** Saca el marcador de figura del texto y devuelve las dos cosas por separado. */
function partir(texto: string) {
  const m = texto.match(/\[figura:([a-z-]{1,32})\]/);
  return {
    figura: m ? POR_ID.get(m[1]) : undefined,
    limpio: texto.replace(/\[figura:[a-z-]+\]/g, "").trim(),
  };
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
    // "D3." al final no parte, y "2.5" tampoco.
    if (".!?:".includes(c) && espacio(texto[i + 1])) {
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

export function ManosLibres({
  abierto,
  onCerrar,
  preguntar,
}: {
  abierto: boolean;
  onCerrar: () => void;
  preguntar: (texto: string) => Promise<string>;
}) {
  const [fase, setFase] = useState<Fase>("escuchando");
  const [dicho, setDicho] = useState("");
  const [respuesta, setRespuesta] = useState("");
  const [figura, setFigura] = useState<(typeof FIGURAS)[number] | undefined>();
  const vivo = useRef(false);

  const { leer, callar, desbloquear, avance } = useLectura();

  // `empezar` nace mas abajo (depende de `alOir`), asi que se alcanza por
  // referencia para poder volver a escuchar al terminar de hablar.
  const volverAOir = useRef<() => void>(() => {});

  /** Lo ultimo que se leyo en voz alta, para reconocer el eco. */
  const ultimoDicho = useRef("");

  const alOir = useCallback(
    async (texto: string) => {
      if (!vivo.current) return;

      if (esEco(texto, ultimoDicho.current)) {
        volverAOir.current();
        return;
      }

      setDicho(texto);
      // La respuesta anterior NO se borra: se queda hasta que llegue la nueva.
      // Borrarla aqui dejaba la pantalla en blanco justo cuando uno se habia
      // quedado a medias de leerla, y ya no habia forma de volver a verla.
      setFigura(undefined);
      setFase("pensando");

      const bruto = await preguntar(texto);
      if (!vivo.current) return;

      const { figura: f, limpio } = partir(bruto);
      setFigura(f);
      setRespuesta(limpio);
      ultimoDicho.current = limpio;
      setFase("hablando");

      // Se espera a que ACABE de sonar. Antes se reabria el microfono 400 ms
      // despues de empezar a hablar, y se oia a si mismo.
      await leer(limpio, "manos-libres", { servicio: true });
      if (!vivo.current) return;

      // Pausa corta: lo justo para no pisar el final de su propia frase.
      await new Promise((listo) => window.setTimeout(listo, 400));
      if (!vivo.current) return;

      setFase("escuchando");
      volverAOir.current();
    },
    [preguntar, leer],
  );

  const lineas = useMemo(() => enLineas(respuesta), [respuesta]);

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

  const caja = useRef<HTMLDivElement>(null);

  // Arrastra la linea que suena a la vista. `nearest` y no `center`: centrar
  // mueve la caja entera en cada frase y marea.
  useEffect(() => {
    const el = caja.current?.querySelector<HTMLElement>('[data-suena="si"]');
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activa]);

  const dictado = useDictado(alOir);
  const { empezar, parar, estado: estadoDictado, parcial } = dictado;

  useEffect(() => {
    volverAOir.current = empezar;
  }, [empezar]);

  /**
   * El toque hace lo unico sensato en cada momento.
   *
   * Hablando: lo calla. `callar` corta el audio, con lo que `leer` resuelve y
   * el ciclo de `alOir` reabre el microfono por su cuenta.
   *
   * Callado sin estar oyendo: abre el microfono. Esta rama es la importante.
   * Reabrir el reconocimiento sin que medie un toque no esta garantizado
   * -Safari en iPhone lo restringe-, y si falla, el modo se queda mudo sin
   * decir nada y no hay manera de salir del atasco. Con esto siempre queda
   * una salida a un toque.
   */
  const alTocar = useCallback(() => {
    if (fase === "hablando") {
      callar();
      return;
    }
    if (estadoDictado !== "escuchando") empezar();
  }, [fase, callar, empezar, estadoDictado]);

  useEffect(() => {
    if (abierto) {
      vivo.current = true;
      // El toque que abrio esta capa es el unico momento en que el navegador
      // movil deja desbloquear el audio. Despues ya es tarde.
      desbloquear();
      setDicho("");
      setRespuesta("");
      setFigura(undefined);
      setFase("escuchando");
      empezar();
    } else {
      vivo.current = false;
      parar();
      callar();
    }
    return () => {
      vivo.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto]);

  if (!abierto) return null;

  const rotulo =
    fase === "escuchando"
      ? estadoDictado === "escuchando"
        ? parcial
          ? "Le escuchamos"
          : respuesta
            ? "Respuesta anterior"
            : "Le escuchamos"
        : "Toque para hablar"
      : fase === "pensando"
        ? "Pensando"
        : "Respondiendo";

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
    lineas.length > 0 && (siguiendo || (fase === "escuchando" && !parcial));

  const texto =
    fase === "escuchando"
      ? parcial || "Hable cuando quiera. Pregunte lo que sea."
      : fase === "pensando"
        ? dicho
        : respuesta;

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-[#12180F]">
      {/* La misma lamina de la portada, al fondo: la voz no deja de ser la
          misma aplicacion. */}
      <Image
        src="/arte/llanura.webp"
        alt=""
        width={1000}
        height={547}
        aria-hidden
        className="lamina-fundida pointer-events-none absolute inset-x-0 bottom-0 w-full max-w-none opacity-[0.22] mix-blend-screen invert"
      />

      <div className="relative flex flex-1 flex-col px-6 pb-[max(env(safe-area-inset-bottom),20px)] pt-[max(env(safe-area-inset-top),14px)]">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Salir del modo manos libres"
            className="flex size-12 items-center justify-center rounded-full border border-white/25 text-[#F4F1E7] transition-colors hover:bg-white/10"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center gap-7">
          {figura && fase === "hablando" ? (
            /* Cuando hay dibujo, manda el dibujo: el circulo se reduce a una
               senal pequena para no competir con el. */
            /* El dibujo ES el boton de interrumpir. Cuando ocupaba el sitio
               del circulo no quedaba nada que tocar, y habia que aguantar la
               respuesta entera. */
            <button
              type="button"
              onClick={alTocar}
              aria-label="Interrumpir y hablar"
              className="w-full max-w-[420px] text-left"
            >
              <figure>
                <div className="overflow-hidden rounded-2xl border border-white/15 bg-[#FBF9F2]">
                  <Image
                    src={figura.src ?? `/figuras/${figura.id}.webp`}
                    alt={figura.alt}
                    width={900}
                    height={600}
                    className="h-auto w-full"
                  />
                </div>
                <figcaption className="mt-2.5 text-center text-[13.5px] leading-snug text-[#B9B5A6]">
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
                fase === "hablando" ? "Interrumpir y hablar" : "Hablar"
              }
              className="shrink-0 rounded-full"
            >
              <OrbeVoz fase={fase} />
            </button>
          )}

          <div className="flex flex-col items-center gap-3">
            {(fase === "hablando" ||
              (fase === "escuchando" && estadoDictado !== "escuchando")) && (
              <span className="text-[13px] text-[#8E9683]">
                {fase !== "hablando"
                  ? "Toque el círculo para hablar"
                  : figura
                    ? "Toque la imagen para interrumpir"
                    : "Toque el círculo para interrumpir"}
              </span>
            )}
            <span className="rotulo flex items-center gap-2 text-[#A8C08F]">
              {figura && fase === "hablando" && (
                <span className="size-2 animate-pulse rounded-full bg-[#F4F1E7]" />
              )}
              {rotulo}
            </span>
            {/* Alto fijo: si la caja crece con el texto, el circulo salta, y
                eso se veia como un fallo. Con dibujo se reserva menos, que el
                dibujo ya ocupa lo suyo.

                Mientras habla se muestran TODAS las lineas y se resalta la que
                suena. Antes se recortaban a cuatro con puntos suspensivos y no
                habia manera de leer el resto. */}
            <div
              ref={caja}
              aria-live="polite"
              className={`w-full max-w-[36ch] overflow-y-auto ${
                figura ? "h-[9rem]" : "h-[30svh] min-h-[9rem]"
              }`}
            >
              {mostrarLineas ? (
                <div className="flex flex-col gap-2 py-1">
                  {lineas.map((linea, i) => (
                    <p
                      key={i}
                      data-suena={siguiendo && i === activa ? "si" : "no"}
                      className={`text-center text-[17px] leading-relaxed transition-colors duration-300 ${
                        !siguiendo
                          ? // Ya no suena: se puede releer entera, sin que una
                            // linea resalte por encima de las demas.
                            "text-[#B9B5A6]"
                          : i === activa
                            ? "text-[#F4F1E7]"
                            : i < activa
                              ? "text-[#7C8472]"
                              : "text-[#5E6555]"
                      }`}
                    >
                      {linea}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-center text-[17px] leading-relaxed text-[#F4F1E7]">
                  {texto}
                </p>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onCerrar}
          className="mx-auto flex min-h-14 w-full max-w-[320px] items-center justify-center rounded-full bg-[#F4F1E7] text-[16px] font-bold text-[#12180F] transition-opacity hover:opacity-90"
        >
          Terminar
        </button>
      </div>
    </div>
  );
}
