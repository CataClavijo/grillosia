"use client";

import { useEffect, useId, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export interface Pestana {
  id: string;
  titulo: string;
  contenido: React.ReactNode;
}

/**
 * Pestanas discretas: texto con un subrayado fino que se desliza a la opcion
 * elegida. Sin cajas ni iconos.
 *
 * En celular la fila se desplaza con el dedo, sin barra visible, y la
 * pestana elegida se lleva sola a la vista.
 *
 * Accesibles segun el patron de WAI-ARIA: flechas izquierda/derecha, Inicio
 * y Fin mueven el foco y activan la pestana.
 */
export function Pestanas({
  pestanas,
  inicial,
  etiqueta,
  className,
}: {
  pestanas: Pestana[];
  inicial?: string;
  /** Nombre del grupo para lectores de pantalla. */
  etiqueta: string;
  className?: string;
}) {
  const [activa, setActiva] = useState(inicial ?? pestanas[0]?.id);
  const base = useId();
  const fila = useRef<HTMLDivElement>(null);
  const botones = useRef<Record<string, HTMLButtonElement | null>>({});
  const [linea, setLinea] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const b = botones.current[activa ?? ""];
    const f = fila.current;
    if (!b || !f) return;
    setLinea({ left: b.offsetLeft, width: b.offsetWidth });
    // Lleva la pestana elegida a la vista en celular.
    const izq = b.offsetLeft - f.clientWidth / 2 + b.offsetWidth / 2;
    f.scrollTo({ left: izq, behavior: "smooth" });
  }, [activa]);

  useEffect(() => {
    const recalcular = () => {
      const b = botones.current[activa ?? ""];
      if (b) setLinea({ left: b.offsetLeft, width: b.offsetWidth });
    };
    window.addEventListener("resize", recalcular);
    return () => window.removeEventListener("resize", recalcular);
  }, [activa]);

  const mover = (e: React.KeyboardEvent, i: number) => {
    let j = -1;
    if (e.key === "ArrowRight") j = (i + 1) % pestanas.length;
    else if (e.key === "ArrowLeft") j = (i - 1 + pestanas.length) % pestanas.length;
    else if (e.key === "Home") j = 0;
    else if (e.key === "End") j = pestanas.length - 1;
    if (j < 0) return;
    e.preventDefault();
    const id = pestanas[j].id;
    setActiva(id);
    botones.current[id]?.focus();
  };

  const actual = pestanas.find((p) => p.id === activa) ?? pestanas[0];

  return (
    <div className={className}>
      <div className="relative border-b border-border">
        <div
          ref={fila}
          role="tablist"
          aria-label={etiqueta}
          className="sin-barra relative -mb-px flex gap-7 overflow-x-auto"
        >
          {pestanas.map((p, i) => {
            const sel = p.id === actual?.id;
            return (
              <button
                key={p.id}
                ref={(el) => {
                  botones.current[p.id] = el;
                }}
                role="tab"
                id={`${base}-t-${p.id}`}
                aria-selected={sel}
                aria-controls={`${base}-p-${p.id}`}
                tabIndex={sel ? 0 : -1}
                onClick={() => setActiva(p.id)}
                onKeyDown={(e) => mover(e, i)}
                className={cn(
                  "shrink-0 whitespace-nowrap py-3 text-[15px] font-medium transition-colors duration-150",
                  sel ? "text-foreground" : "text-subtle hover:text-foreground",
                )}
              >
                {p.titulo}
              </button>
            );
          })}
          <span
            aria-hidden
            className="pointer-events-none absolute bottom-0 h-[2px] bg-primary transition-[left,width] duration-[var(--dur-media)] ease-[var(--ease-natural)]"
            style={{ left: linea.left, width: linea.width }}
          />
        </div>
      </div>
      {actual && (
        <div
          key={actual.id}
          role="tabpanel"
          id={`${base}-p-${actual.id}`}
          aria-labelledby={`${base}-t-${actual.id}`}
          tabIndex={0}
          className="animate-in fade-in-0 pt-8 duration-200 focus-visible:outline-none"
        >
          {actual.contenido}
        </div>
      )}
    </div>
  );
}
