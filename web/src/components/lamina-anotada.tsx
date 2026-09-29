"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";

import type { RasgoReconocer } from "@/lib/content/catalog";
import { cn } from "@/lib/utils";

/**
 * Lamina anotada: la foto real del ejemplar con puntos numerados sobre cada
 * rasgo que sirve para reconocer un grillo, y la lista de esos rasgos al
 * lado.
 *
 * Punto y rasgo estan enlazados en los dos sentidos: al pasar el raton,
 * enfocar con el teclado o tocar uno, se resalta el otro. El resaltado no
 * depende solo del color: el punto crece y se rellena, y el rasgo de la
 * lista cambia de peso y muestra su borde.
 *
 * En pantallas anchas cada punto lleva una etiqueta corta unida por una
 * linea fina. En celular solo quedan los numeros sobre la foto y la lista va
 * debajo.
 *
 * Al entrar en pantalla, las lineas se dibujan y los puntos aparecen uno
 * tras otro (se apaga con "reducir movimiento").
 */
export function LaminaAnotada({
  foto,
  rasgos,
  className,
}: {
  foto: { src: string; width: number; height: number; alt: string; credito: string };
  rasgos: RasgoReconocer[];
  className?: string;
}) {
  const [activo, setActivo] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const caja = useRef<HTMLDivElement>(null);
  const base = useId();

  useEffect(() => {
    const el = caja.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const W = foto.width;
  const H = foto.height;

  return (
    <div className={cn("grid items-center gap-10 lg:grid-cols-12 lg:gap-14", className)}>
      {/* La foto acompana a la lista (7 de 12 columnas, no 8). En oscuro va
          sobre papel marfil: el grillo cafe oscuro se perdia en el carbon. */}
      <figure className="lg:col-span-7 dark:rounded-xl dark:bg-[#efe9dc] dark:p-5 dark:text-[#1f1b16]">
        <div
          ref={caja}
          className="relative mx-auto w-full max-w-[600px]"
          style={{ aspectRatio: `${W} / ${H}` }}
        >
          <Image
            src={foto.src}
            alt={foto.alt}
            fill
            sizes="(max-width: 1024px) 92vw, 760px"
            className="object-contain"
          />

          {/* Lineas del punto a su etiqueta: solo en pantallas anchas. */}
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="pointer-events-none absolute inset-0 hidden h-full w-full overflow-visible md:block"
            aria-hidden
          >
            {rasgos.map((r, i) => {
              const x1 = (r.punto.x / 100) * W;
              const y1 = (r.punto.y / 100) * H;
              const x2 = (r.rotulo.x / 100) * W;
              const y2 = (r.rotulo.y / 100) * H;
              const largo = Math.hypot(x2 - x1, y2 - y1);
              const on = activo === r.id;
              return (
                <line
                  key={r.id}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  vectorEffect="non-scaling-stroke"
                  strokeWidth={on ? 1.5 : 1}
                  className={cn(
                    "transition-[stroke-dashoffset,stroke] duration-700 ease-[var(--ease-natural)]",
                    on ? "stroke-primary" : "stroke-foreground/45 dark:stroke-[#5f594e]",
                  )}
                  style={{
                    strokeDasharray: largo,
                    strokeDashoffset: visible ? 0 : largo,
                    transitionDelay: `${200 + i * 120}ms`,
                  }}
                />
              );
            })}
          </svg>

          {/* Etiquetas cortas junto a cada punto (pantallas anchas). */}
          {rasgos.map((r, i) => (
            <span
              key={`r-${r.id}`}
              aria-hidden
              className={cn(
                "absolute hidden -translate-y-1/2 whitespace-nowrap rounded-sm px-1.5 py-0.5 text-[13px] font-semibold transition-[opacity,color,background-color] duration-300 md:block",
                r.rotulo.ancla === "derecha" && "-translate-x-full",
                activo === r.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-background/85 text-foreground backdrop-blur-sm",
                visible ? "opacity-100" : "opacity-0",
              )}
              style={{
                left: `${r.rotulo.x}%`,
                top: `${r.rotulo.y}%`,
                transitionDelay: visible ? `${500 + i * 120}ms` : "0ms",
              }}
            >
              {r.corto}
            </span>
          ))}

          {/* Puntos: son botones, para que se puedan tocar y enfocar. */}
          {rasgos.map((r, i) => {
            const on = activo === r.id;
            return (
              <button
                key={`p-${r.id}`}
                type="button"
                aria-label={`${i + 1}. ${r.titulo}`}
                aria-describedby={`${base}-${r.id}`}
                aria-pressed={on}
                onMouseEnter={() => setActivo(r.id)}
                onMouseLeave={() => setActivo(null)}
                onFocus={() => setActivo(r.id)}
                onBlur={() => setActivo(null)}
                onClick={() => setActivo(on ? null : r.id)}
                className={cn(
                  "absolute flex size-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 text-[12px] font-bold tabular-nums transition-[transform,background-color,color,opacity,border-color] duration-300 ease-[var(--ease-natural)] sm:size-8",
                  on
                    ? "scale-125 border-primary bg-primary text-primary-foreground"
                    : "border-primary bg-background text-primary hover:scale-110",
                  visible ? "opacity-100" : "scale-50 opacity-0",
                )}
                style={{
                  left: `${r.punto.x}%`,
                  top: `${r.punto.y}%`,
                  transitionDelay: visible && !on ? `${i * 120}ms` : "0ms",
                }}
              >
                {i + 1}
                {/* Anillo que late una vez al aparecer, para invitar a tocar. */}
                {visible && (
                  <span
                    aria-hidden
                    className="absolute inset-0 rounded-full border border-primary motion-safe:animate-[ping_1.4s_ease-out_1]"
                    style={{ animationDelay: `${600 + i * 120}ms` }}
                  />
                )}
              </button>
            );
          })}
        </div>
        <figcaption className="t-caption mt-4 text-center dark:text-[#5f594e]">
          Ejemplar del proyecto, familia Gryllidae. Foto: {foto.credito}. Toque
          un número para ver el rasgo.
        </figcaption>
      </figure>

      <ol className="flex flex-col gap-1 lg:col-span-5">
        {rasgos.map((r, i) => {
          const on = activo === r.id;
          return (
            <li key={r.id}>
              <button
                type="button"
                id={`${base}-${r.id}`}
                aria-pressed={on}
                onMouseEnter={() => setActivo(r.id)}
                onMouseLeave={() => setActivo(null)}
                onFocus={() => setActivo(r.id)}
                onBlur={() => setActivo(null)}
                onClick={() => setActivo(on ? null : r.id)}
                className={cn(
                  "grid w-full grid-cols-[32px_1fr] gap-3 rounded-lg border-l-2 py-3 pr-3 pl-3 text-left transition-[background-color,border-color] duration-200",
                  on
                    ? "border-primary bg-primary-soft"
                    : "border-transparent hover:bg-surface-2",
                )}
              >
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-primary font-display text-[17px] font-semibold tabular-nums transition-colors duration-200",
                    on ? "bg-primary text-primary-foreground" : "text-primary",
                  )}
                  aria-hidden
                >
                  {i + 1}
                </span>
                <span>
                  <span className={cn("block font-display text-[1.5rem] font-semibold leading-tight", on && "text-foreground")}>
                    {r.titulo}
                  </span>
                  <span className="t-body mt-1 block text-subtle">{r.texto}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
