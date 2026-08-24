"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";

import { FIGURAS } from "@/components/figura";
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

  const { leer, callar } = useLectura();

  const alOir = useCallback(
    async (texto: string) => {
      if (!vivo.current) return;
      setDicho(texto);
      setRespuesta("");
      setFigura(undefined);
      setFase("pensando");

      const bruto = await preguntar(texto);
      if (!vivo.current) return;

      const { figura: f, limpio } = partir(bruto);
      setFigura(f);
      setRespuesta(limpio);
      setFase("hablando");
      await leer(limpio, "manos-libres");
    },
    [preguntar, leer],
  );

  const dictado = useDictado(alOir);
  const { empezar, parar, estado: estadoDictado, parcial } = dictado;

  useEffect(() => {
    if (!abierto || fase !== "hablando") return;
    const t = window.setTimeout(() => {
      if (!vivo.current) return;
      setFase("escuchando");
      empezar();
    }, 900);
    return () => window.clearTimeout(t);
  }, [abierto, fase, respuesta, empezar]);

  useEffect(() => {
    if (abierto) {
      vivo.current = true;
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
        className="pointer-events-none absolute inset-x-0 bottom-0 w-full max-w-none opacity-[0.18] mix-blend-screen invert"
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
            <span
              className={cn(
                "flex items-center justify-center rounded-full border-2 transition-all duration-700",
                fase === "escuchando"
                  ? "size-44 animate-pulse border-[#A8C08F]/70 bg-[#A8C08F]/10"
                  : fase === "pensando"
                    ? "size-32 border-white/25 bg-white/5"
                    : "size-44 border-[#F4F1E7]/60 bg-[#F4F1E7]/10",
              )}
            >
              <span
                className={cn(
                  "rounded-full transition-all duration-700",
                  fase === "escuchando"
                    ? "size-24 bg-[#A8C08F]/35"
                    : fase === "pensando"
                      ? "size-8 animate-ping bg-white/40"
                      : "size-28 bg-[#F4F1E7]/30",
                )}
              />
            </span>
          )}

          <div className="flex flex-col items-center gap-3">
            <span className="rotulo flex items-center gap-2 text-[#A8C08F]">
              {figura && fase === "hablando" && (
                <span className="size-2 animate-pulse rounded-full bg-[#F4F1E7]" />
              )}
              {rotulo}
            </span>
            <p
              aria-live="polite"
              className="min-h-[4.5rem] max-w-[36ch] text-center text-[17px] leading-relaxed text-[#F4F1E7]"
            >
              {texto}
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
