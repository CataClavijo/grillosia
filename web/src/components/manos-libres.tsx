"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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

  const { leer, callar, desbloquear } = useLectura();

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
      setRespuesta("");
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
      await leer(limpio, "manos-libres");
      if (!vivo.current) return;

      // Pausa corta: lo justo para no pisar el final de su propia frase.
      await new Promise((listo) => window.setTimeout(listo, 400));
      if (!vivo.current) return;

      setFase("escuchando");
      volverAOir.current();
    },
    [preguntar, leer],
  );

  const dictado = useDictado(alOir);
  const { empezar, parar, estado: estadoDictado, parcial } = dictado;

  useEffect(() => {
    volverAOir.current = empezar;
  }, [empezar]);

  /**
   * Interrumpir: tocar mientras habla lo calla y pasa a escuchar.
   *
   * Sin esto hay que aguantar la respuesta entera aunque uno ya sepa que
   * quiere preguntar. Se hace con un toque y no oyendo mientras habla,
   * porque el microfono abierto durante la reproduccion se oye a si mismo.
   */
  const interrumpir = useCallback(() => {
    if (fase !== "hablando") return;
    // `callar` corta el audio, con lo que `leer` resuelve y el ciclo de
    // `alOir` reabre el microfono por su cuenta.
    callar();
  }, [fase, callar]);

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
        ? "Le escuchamos"
        : "Un momento"
      : fase === "pensando"
        ? "Pensando"
        : "Respondiendo";

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
            <figure className="w-full max-w-[420px]">
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
          ) : (
            <button
              type="button"
              onClick={interrumpir}
              aria-label={
                fase === "hablando"
                  ? "Interrumpir y hablar"
                  : "Estado de la conversación"
              }
              className="shrink-0 rounded-full"
            >
              <OrbeVoz fase={fase} />
            </button>
          )}

          <div className="flex flex-col items-center gap-3">
            {fase === "hablando" && (
              <span className="text-[13px] text-[#8E9683]">
                Toque el círculo para interrumpir
              </span>
            )}
            <span className="rotulo flex items-center gap-2 text-[#A8C08F]">
              {figura && fase === "hablando" && (
                <span className="size-2 animate-pulse rounded-full bg-[#F4F1E7]" />
              )}
              {rotulo}
            </span>
            {/* Alto fijo: mientras el productor habla, el texto crece linea a
                linea, y si la caja crece con el, el orbe salta. Eso era lo que
                se veia como un fallo. */}
            <p
              aria-live="polite"
              className="flex h-[6.5rem] max-w-[36ch] items-start justify-center overflow-hidden text-center text-[17px] leading-relaxed text-[#F4F1E7]"
            >
              <span className="line-clamp-4">{texto}</span>
            </p>
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
