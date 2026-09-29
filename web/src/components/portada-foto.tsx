"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

/**
 * Foto de la portada con un movimiento muy leve al bajar: se desplaza a un
 * octavo de la velocidad del scroll y se detiene en 60 px. Da profundidad sin
 * marear.
 *
 * Solo se mueve si la persona no pidio "reducir movimiento", y solo mientras
 * la portada esta a la vista. Usa `transform` dentro de requestAnimationFrame:
 * no provoca reflujo ni afecta el LCP.
 */
export function PortadaFoto({
  src,
  alt,
  posicion,
}: {
  src: string;
  alt: string;
  posicion: string;
}) {
  const capa = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = capa.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let pendiente = false;
    const mover = () => {
      pendiente = false;
      const y = Math.min(window.scrollY * 0.12, 60);
      el.style.transform = `translate3d(0, ${y}px, 0)`;
    };
    const alMover = () => {
      if (pendiente || window.scrollY > 900) return;
      pendiente = true;
      requestAnimationFrame(mover);
    };
    mover();
    window.addEventListener("scroll", alMover, { passive: true });
    return () => window.removeEventListener("scroll", alMover);
  }, []);

  // La capa se extiende 64 px por encima del borde: al bajarla con el scroll
  // no deja ver un hueco arriba. Dentro, la foto entra con un acercamiento
  // muy leve (1,05 -> 1 en 1,2 s), apagado con "reducir movimiento".
  return (
    <div ref={capa} className="absolute inset-x-0 -top-16 bottom-0 will-change-transform">
      <div className="animate-in zoom-in-[1.05] absolute inset-0 duration-[1200ms] ease-[var(--ease-natural)]">
        <Image
          src={src}
          alt={alt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: posicion }}
        />
      </div>
    </div>
  );
}
