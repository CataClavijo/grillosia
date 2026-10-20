"use client";

import Image from "next/image";
import { useRef, useState } from "react";

import { Carrusel } from "@/components/ds/carrusel";
import { DiagramaCaja, PARTES_CAJA } from "@/components/diagrama-caja";
import type { EnclosureStep } from "@/lib/content/enclosure";
import { cn } from "@/lib/utils";

const dos = (n: number) => String(n).padStart(2, "0");

/**
 * El mapa de la caja y los ocho pasos, conectados.
 *
 * Tocar un numero del mapa lleva el carrusel a ese paso, resalta la parte
 * en el dibujo y marca su tarjeta. Al reves tambien: deslizar el carrusel,
 * pasar el raton o enfocar una tarjeta resalta su parte en el mapa. Asi el
 * dibujo deja de ser decorado y se vuelve el indice de los pasos.
 */
export function MapaPasosCaja({ pasos }: { pasos: EnclosureStep[] }) {
  const [activo, setActivo] = useState(1);
  const carrusel = useRef<HTMLDivElement>(null);

  const elegir = (n: number) => {
    setActivo(n);
    // En celular el carrusel queda debajo del mapa: se trae a la vista.
    const c = carrusel.current;
    if (c && window.matchMedia("(max-width: 1023px)").matches) {
      const r = c.getBoundingClientRect();
      if (r.top > window.innerHeight * 0.55 || r.bottom < 0) {
        // `scrollIntoView` movia tambien el carrusel por dentro y cortaba su
        // propio desplazamiento hacia el paso: se mueve solo la ventana.
        window.scrollTo({
          top: window.scrollY + r.top - (window.innerHeight - r.height) / 2,
          behavior: "smooth",
        });
      }
    }
  };

  const parte = PARTES_CAJA[activo - 1];

  return (
    <div className="mt-10 grid gap-8 lg:grid-cols-12 lg:gap-12">
      <div className="lg:col-span-5">
        <div className="lg:sticky lg:top-28">
          <p className="t-eyebrow mb-4 text-subtle">Mapa de la caja, vista desde arriba</p>
          <DiagramaCaja leyenda={false} activo={activo} onElegir={elegir} />
          <p className="mt-4 flex items-center gap-3 text-[15px]" aria-live="polite">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary font-mono text-[12.5px] font-semibold text-primary-foreground">
              {activo}
            </span>
            <span className="font-medium">{parte?.nombre}</span>
            <span className="t-small ml-auto hidden text-subtle sm:inline">
              Toque un número para ver su paso
            </span>
          </p>
        </div>
      </div>
      <div ref={carrusel} className="min-w-0 lg:col-span-7">
        <Carrusel
          etiqueta="Pasos para armar la caja"
          claseElemento="basis-[86%] sm:basis-[calc(50%-10px)]"
          activo={activo - 1}
          onActivo={(i) => setActivo(i + 1)}
          elementos={pasos.map((s) => (
            <TarjetaPaso
              key={s.number}
              paso={s}
              total={pasos.length}
              activa={s.number === activo}
              onEnfocar={() => setActivo(s.number)}
            />
          ))}
        />
      </div>
    </div>
  );
}

function TarjetaPaso({
  paso: s,
  total,
  activa,
  onEnfocar,
}: {
  paso: EnclosureStep;
  total: number;
  activa: boolean;
  onEnfocar: () => void;
}) {
  return (
    <article
      onMouseEnter={onEnfocar}
      onFocus={onEnfocar}
      onClick={onEnfocar}
      className={cn(
        "flex h-full flex-col rounded-lg bg-surface p-6 transition-shadow duration-200",
        activa ? "ring-[1.5px] ring-primary" : "ring-1 ring-border",
      )}
    >
      {/* El numero del paso manda (cifra grande, igual al del mapa); el
          contador "07 / 08" queda como dato secundario. */}
      <div className="flex items-baseline justify-between">
        <span className="t-cifra text-[2.75rem] leading-none text-primary">{dos(s.number)}</span>
        <span className="t-eyebrow text-subtle">de {dos(total)}</span>
      </div>
      {/* Caja fija para los ocho dibujos: mismo alto y misma base, sin
          importar la proporcion de cada uno. */}
      <div className="relative mt-5 h-32 w-full">
        <Image
          src={s.imagen}
          alt=""
          aria-hidden
          fill
          sizes="(max-width: 640px) 80vw, (max-width: 1024px) 45vw, 340px"
          className="lamina object-contain object-bottom"
        />
      </div>
      <h3 className="mt-6 font-display text-[1.6rem] font-semibold leading-tight">{s.title}</h3>
      <p className="t-body mt-2 text-subtle">{s.body}</p>
      {s.tip && (
        <p className="t-caption mt-auto pt-5">
          <span className="font-semibold text-foreground">Consejo: </span>
          {s.tip}
        </p>
      )}
    </article>
  );
}
