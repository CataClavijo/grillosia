"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Carrusel de pasos sin dependencias: una fila con desplazamiento nativo y
 * "snap", asi que en celular se desliza con el dedo con la fisica del
 * sistema, y en escritorio se mueve con dos botones pequenos.
 *
 * Muestra 1 elemento en celular, 2 en tableta y 3 en escritorio (lo decide
 * `claseElemento`). Arriba a la derecha dice donde va: "01 — 08".
 *
 * El contenido sigue en el DOM aunque no se vea: se puede leer con lector de
 * pantalla y encontrar con la busqueda del navegador.
 */
export function Carrusel({
  elementos,
  etiqueta,
  claseElemento = "basis-[86%] sm:basis-[calc(50%-10px)] lg:basis-[calc(33.333%-14px)]",
  className,
}: {
  elementos: React.ReactNode[];
  /** Nombre del carrusel para lectores de pantalla. */
  etiqueta: string;
  claseElemento?: string;
  className?: string;
}) {
  const pista = useRef<HTMLUListElement>(null);
  const [primero, setPrimero] = useState(0);
  const [visibles, setVisibles] = useState(1);
  const total = elementos.length;

  const medir = useCallback(() => {
    const p = pista.current;
    if (!p || !p.children.length) return;
    const hijo = p.children[0] as HTMLElement;
    const paso = hijo.offsetWidth + parseFloat(getComputedStyle(p).columnGap || "0");
    setPrimero(Math.round(p.scrollLeft / paso));
    setVisibles(Math.max(1, Math.round(p.clientWidth / paso)));
  }, []);

  useEffect(() => {
    medir();
    const p = pista.current;
    if (!p) return;
    p.addEventListener("scroll", medir, { passive: true });
    window.addEventListener("resize", medir);
    return () => {
      p.removeEventListener("scroll", medir);
      window.removeEventListener("resize", medir);
    };
  }, [medir]);

  const ir = (dir: 1 | -1) => {
    const p = pista.current;
    if (!p) return;
    const hijo = p.children[0] as HTMLElement;
    const paso = hijo.offsetWidth + parseFloat(getComputedStyle(p).columnGap || "0");
    p.scrollBy({ left: dir * paso * visibles, behavior: "smooth" });
  };

  const ultimoVisible = Math.min(total, primero + visibles);
  const dos = (n: number) => String(n).padStart(2, "0");

  return (
    <section aria-roledescription="carrusel" aria-label={etiqueta} className={className}>
      <div className="mb-5 flex items-center justify-end gap-4">
        <p className="t-eyebrow tabular-nums text-subtle" aria-live="polite">
          {dos(primero + 1)}
          {visibles > 1 && `–${dos(ultimoVisible)}`}
          <span className="px-1.5 text-faint">/</span>
          {dos(total)}
        </p>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => ir(-1)}
            disabled={primero === 0}
            aria-label="Pasos anteriores"
            className="flex size-9 items-center justify-center rounded-md border border-border-strong text-foreground transition-colors hover:bg-surface-2 disabled:border-border disabled:text-disabled-foreground"
          >
            <ArrowLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => ir(1)}
            disabled={ultimoVisible >= total}
            aria-label="Pasos siguientes"
            className="flex size-9 items-center justify-center rounded-md border border-border-strong text-foreground transition-colors hover:bg-surface-2 disabled:border-border disabled:text-disabled-foreground"
          >
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>

      <ul
        ref={pista}
        className="sin-barra -mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-5 pb-2 lg:mx-0 lg:px-0"
      >
        {elementos.map((el, i) => (
          <li
            key={i}
            aria-roledescription="paso"
            aria-label={`${i + 1} de ${total}`}
            className={cn("shrink-0 snap-start", claseElemento)}
          >
            {el}
          </li>
        ))}
      </ul>

      {/* Avance del carrusel: barra fina, no puntos. */}
      <div className="mt-5 h-[2px] w-full overflow-hidden bg-border" aria-hidden>
        <div
          className="h-full bg-foreground/70 transition-[width] duration-[var(--dur-media)] ease-[var(--ease-natural)]"
          style={{ width: `${(ultimoVisible / total) * 100}%` }}
        />
      </div>
    </section>
  );
}
