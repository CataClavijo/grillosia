"use client";

import { useEffect, useRef } from "react";

/**
 * Hace aparecer su contenido con un fundido y un desplazamiento de 12 px la
 * primera vez que entra en pantalla. Es el unico efecto de entrada del sitio:
 * sutil, de 350 ms, y apagado con "reducir movimiento" (ver globals.css).
 *
 * Si el navegador no tiene IntersectionObserver, el contenido se muestra de
 * una vez: nunca se queda escondido.
 */
export function Revelar({
  children,
  retraso = 0,
  as: Etiqueta = "div",
  className,
}: {
  children: React.ReactNode;
  /** Milisegundos, para escalonar elementos hermanos (0, 60, 120...). */
  retraso?: number;
  as?: "div" | "section" | "li" | "article";
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      el.dataset.revelar = "visible";
      return;
    }
    const obs = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (e.isIntersecting) {
            (e.target as HTMLElement).dataset.revelar = "visible";
            obs.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <Etiqueta
      // @ts-expect-error: la ref sirve para cualquiera de las etiquetas permitidas
      ref={ref}
      data-revelar=""
      className={className}
      style={{ "--retraso": `${retraso}ms` } as React.CSSProperties}
    >
      {children}
    </Etiqueta>
  );
}
