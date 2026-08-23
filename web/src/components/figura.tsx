"use client";

import { cn } from "@/lib/utils";

/**
 * Figuras de la guia.
 *
 * Son SVG escritos a mano, no imagenes generadas. Tres razones:
 *
 *  - Pesan dos o tres kilobytes en vez de cientos. El publico entra desde el
 *    campo, con senal irregular y planes de datos cortos.
 *  - Usan `currentColor`, asi que siguen el tema de la aplicacion sin tener
 *    que mantener dos versiones, una clara y otra oscura.
 *  - Se dibujan solas con un trazo animado, que es justo el estilo del logo.
 *
 * El trazo se anima con `stroke-dasharray`: cada linea empieza "vacia" y se
 * va llenando. Quien tenga activado el ajuste de menos movimiento en su
 * telefono las ve completas de una, sin animacion.
 */

export interface Figura {
  id: string;
  /** Titulo corto, se muestra debajo del dibujo. */
  titulo: string;
  /** Descripcion para lectores de pantalla. */
  alt: string;
  /** Cuando le sirve al asistente mostrarla. */
  cuando: string;
  dibujo: React.ReactNode;
}

/** Trazo comun a todas las figuras. */
const trazo = {
  fill: "none",
  // Normaliza el largo de cada trazo a 1 para que el CSS pueda animarlos
  // todos igual sin medirlos uno por uno.
  pathLength: 1,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const FIGURAS: Figura[] = [
  {
    id: "ventilacion",
    titulo: "La ventana de ventilación en la tapa",
    alt: "Tapa de la caja con un rectángulo recortado en el centro y malla mosquitero pegada por encima.",
    cuando:
      "Cuando pregunten por la ventilación, el calor, la humedad encerrada, el mal olor o cómo evitar que se escapen.",
    dibujo: (
      <>
        {/* Tapa */}
        <rect x="18" y="26" width="164" height="96" rx="10" strokeWidth="3" {...trazo} />
        {/* Borde interior, da grosor a la tapa */}
        <rect x="27" y="34" width="146" height="80" rx="6" strokeWidth="1.6" opacity="0.45" {...trazo} />
        {/* Recorte: linea punteada = por aqui se corta */}
        {/* Punteada a proposito: marca por donde se corta. Se queda fuera de
            la animacion porque esta usa el mismo `stroke-dasharray`. */}
        <rect
          x="60" y="50" width="80" height="48" rx="4"
          strokeWidth="2.4" strokeDasharray="7 6" fill="none"
          stroke="currentColor" className="figura-estatica text-primary"
        />
        {/* Malla */}
        <g className="text-primary" stroke="currentColor" strokeWidth="1.2" opacity="0.75">
          {[58, 68, 78, 88].map((y) => (
            <line key={y} x1="62" y1={y} x2="138" y2={y} pathLength={1} />
          ))}
          {[70, 82, 94, 106, 118, 130].map((x) => (
            <line key={x} x1={x} y1="52" x2={x} y2="96" pathLength={1} />
          ))}
        </g>
      </>
    ),
  },
  {
    id: "refugios",
    titulo: "Las hueveras paradas, como un acordeón",
    alt: "Varias hueveras de cartón puestas de canto dentro de la caja, separadas entre sí.",
    cuando:
      "Cuando pregunten por los refugios, las hueveras, el espacio, la densidad o dónde se esconden los grillos.",
    dibujo: (
      <>
        {/* Caja vista de frente */}
        <path d="M22 118 L22 44 Q22 38 28 38 L172 38 Q178 38 178 44 L178 118" strokeWidth="3" {...trazo} />
        <line x1="14" y1="118" x2="186" y2="118" strokeWidth="3" {...trazo} />
        {/* Hueveras de canto */}
        <g className="text-primary" stroke="currentColor" strokeWidth="2.2" {...trazo}>
          {[46, 76, 106, 136].map((x) => (
            <path key={x} d={`M${x} 116 L${x} 62 q7 -6 14 0 L${x + 14} 116`} />
          ))}
        </g>
        {/* Textura de huevera */}
        <g className="text-primary" stroke="currentColor" strokeWidth="1" opacity="0.5">
          {[46, 76, 106, 136].map((x) =>
            [78, 92, 106].map((y) => <line key={`${x}-${y}`} x1={x} y1={y} x2={x + 14} y2={y} pathLength={1} />),
          )}
        </g>
      </>
    ),
  },
];

const PORT_ID = new Map(FIGURAS.map((f) => [f.id, f]));

/** Todas las figuras, para armar el listado del asistente. */
export const CATALOGO_FIGURAS = FIGURAS;

export function Figura({
  id,
  className,
}: {
  id: string;
  className?: string;
}) {
  const figura = PORT_ID.get(id);
  // Si el asistente se inventa un identificador, no se pinta nada. Mejor un
  // hueco que un dibujo roto.
  if (!figura) return null;

  return (
    <figure className={cn("my-4", className)}>
      <div className="overflow-hidden rounded-2xl border bg-card p-3">
        <svg
          viewBox="0 0 200 140"
          role="img"
          aria-label={figura.alt}
          className="figura-trazo w-full text-foreground/80"
          stroke="currentColor"
        >
          {figura.dibujo}
        </svg>
      </div>
      <figcaption className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
        {figura.titulo}
      </figcaption>
    </figure>
  );
}
