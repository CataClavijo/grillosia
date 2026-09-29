"use client";

import { useState } from "react";
import Image from "next/image";

import { VISTAS_EJEMPLAR } from "@/lib/content/catalog";
import { cn } from "@/lib/utils";

/**
 * Lamina del ejemplar: una sola foto grande, integrada al fondo de la pagina
 * (recortada, sin el rectangulo blanco del estudio), y debajo unas miniaturas
 * para cambiar de vista.
 *
 * Una foto protagonista en vez de una galeria de cuatro marcos: se ve el
 * animal con detalle, y las otras vistas estan a un toque cuando interesan
 * (lateral para las antenas y las alas, dorsal para las patas traseras).
 */
export function LaminaEjemplar({ className }: { className?: string }) {
  const [activa, setActiva] = useState(VISTAS_EJEMPLAR[0].id);
  const v = VISTAS_EJEMPLAR.find((x) => x.id === activa) ?? VISTAS_EJEMPLAR[0];

  return (
    <figure className={cn("flex flex-col", className)}>
      <div className="relative mx-auto aspect-[4/3] w-full max-w-[540px]">
        <Image
          key={v.id}
          src={v.src}
          alt={v.alt}
          fill
          priority
          sizes="(max-width: 1024px) 90vw, 520px"
          className="animate-in fade-in-0 object-contain duration-300"
        />
      </div>

      <div className="mt-5 flex items-end justify-between gap-4">
        <figcaption className="t-caption min-w-0">
          <span className="font-semibold text-foreground/80">{v.etiqueta}</span> ·
          Ejemplar del proyecto, familia Gryllidae.
          <span className="block">Foto: {v.credit}.</span>
        </figcaption>
        <div className="flex shrink-0 gap-2" role="group" aria-label="Cambiar de vista">
          {VISTAS_EJEMPLAR.map((x) => {
            const sel = x.id === v.id;
            return (
              <button
                key={x.id}
                type="button"
                onClick={() => setActiva(x.id)}
                aria-pressed={sel}
                aria-label={x.etiqueta}
                className={cn(
                  "relative size-12 rounded-md bg-surface-2 transition-[box-shadow,background-color] duration-150 sm:size-14",
                  sel
                    ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                    : "hover:bg-accent",
                )}
              >
                <Image
                  src={x.src}
                  alt=""
                  aria-hidden
                  fill
                  sizes="56px"
                  className="object-contain p-1"
                />
              </button>
            );
          })}
        </div>
      </div>
    </figure>
  );
}
