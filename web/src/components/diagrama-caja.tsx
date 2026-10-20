"use client";

import { useId } from "react";

import { Revelar } from "@/components/ds/revelar";
import { cn } from "@/lib/utils";

/**
 * La caja de cria vista desde arriba (planta), dibujada con codigo.
 *
 * Acompana a la ilustracion de la caja armada como "mapa de la caja": es
 * nitido en cualquier pantalla, usa los colores del sistema (asi funciona
 * igual en claro y en oscuro) y cada parte lleva el numero del paso que la
 * explica (1 a 8), para que el diagrama y el carrusel de pasos se lean juntos.
 *
 * Con `onElegir` los numeros son botones: al tocar uno se resalta su parte
 * en el dibujo y quien lo usa (el mapa de la caja) muestra ese paso. Con
 * teclado se recorren con Tab y se eligen con Enter o espacio.
 *
 * Al entrar en pantalla, los trazos se dibujan (stroke-dashoffset) y los
 * numeros aparecen despues. Con "reducir movimiento" se ve completo de una
 * vez (ver .diagrama-trazo en globals.css).
 */

/** Partes numeradas, en el orden de los pasos de enclosure.ts. */
export const PARTES_CAJA = [
  { n: 1, nombre: "Caja con tapa" },
  { n: 2, nombre: "Ventana de malla en la tapa" },
  { n: 3, nombre: "Sustrato seco en el fondo" },
  { n: 4, nombre: "Hueveras como refugio" },
  { n: 5, nombre: "Plato bajo con alimento" },
  { n: 6, nombre: "Tapita con algodón húmedo" },
  { n: 7, nombre: "Termómetro-higrómetro" },
  { n: 8, nombre: "Esquina libre para limpiar" },
] as const;

/** Donde va el numero de cada parte. */
const MARCAS = [
  { n: 1, x: 24, y: 30 },
  { n: 2, x: 656, y: 96 },
  { n: 3, x: 64, y: 372 },
  { n: 4, x: 70, y: 62 },
  { n: 5, x: 397, y: 168 },
  { n: 6, x: 389, y: 282 },
  { n: 7, x: 400, y: 72 },
  { n: 8, x: 300, y: 372 },
];

/**
 * La forma que se resalta de cada parte, en las coordenadas del dibujo.
 * Va encima del trazo, con relleno terracota tenue y filo terracota.
 */
const RESALTE: Record<number, React.ReactNode> = {
  1: <rect x="24" y="30" width="420" height="360" rx="22" />,
  2: <rect x="516" y="96" width="110" height="228" rx="6" />,
  3: <rect x="38" y="44" width="392" height="332" rx="14" />,
  4: (
    <>
      {[70, 148, 226].map((x) => (
        <rect key={x} x={x} y="70" width="56" height="280" rx="8" />
      ))}
    </>
  ),
  5: <circle cx="355" cy="200" r="38" />,
  6: <circle cx="355" cy="310" r="30" />,
  7: <rect x="318" y="72" width="78" height="54" rx="8" />,
  8: <rect x="290" y="352" width="134" height="20" rx="6" />,
};

/** Marcador numerado: circulo terracota con el numero en blanco. */
function Marca({
  x,
  y,
  n,
  retraso,
  activo,
  onElegir,
}: {
  x: number;
  y: number;
  n: number;
  retraso: number;
  activo?: boolean;
  onElegir?: (n: number) => void;
}) {
  const parte = PARTES_CAJA[n - 1]?.nombre ?? "";
  return (
    <g
      className={cn(
        "diagrama-marca",
        onElegir &&
          "cursor-pointer outline-none [&:focus-visible>circle:first-child]:stroke-ring [&:focus-visible>circle:first-child]:stroke-[3]",
      )}
      style={{ "--d": `${retraso}ms` } as React.CSSProperties}
      {...(onElegir && {
        role: "button",
        tabIndex: 0,
        "aria-label": `Paso ${n}: ${parte}`,
        "aria-pressed": !!activo,
        onClick: () => onElegir(n),
        onKeyDown: (e: React.KeyboardEvent) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onElegir(n);
          }
        },
      })}
    >
      {/* Area de toque mas grande que el circulo (44 px en celular). */}
      {onElegir && <circle cx={x} cy={y} r={26} className="fill-transparent" />}
      {activo && (
        <circle cx={x} cy={y} r={22} className="fill-primary/20 motion-safe:animate-pulse" />
      )}
      <circle
        cx={x}
        cy={y}
        r={activo ? 17 : 15}
        className={cn(
          "fill-primary transition-[r] duration-200",
          onElegir && !activo && "opacity-90 hover:opacity-100",
        )}
      />
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-primary-foreground font-mono"
        style={{ fontSize: 15, fontWeight: 600 }}
      >
        {n}
      </text>
    </g>
  );
}

export function DiagramaCaja({
  className,
  leyenda = true,
  activo,
  onElegir,
}: {
  className?: string;
  /** La lista numerada de partes. Se omite cuando los pasos van al lado. */
  leyenda?: boolean;
  /** Numero de la parte resaltada (1 a 8). */
  activo?: number;
  /** Si llega, los numeros se pueden tocar. */
  onElegir?: (n: number) => void;
}) {
  const id = useId().replace(/:/g, "");
  const puntos = `sustrato-${id}`;
  const malla = `malla-${id}`;
  const trazo = "diagrama-trazo fill-none stroke-current";

  // Hueveras: tres hileras paradas, vistas desde arriba, con sus celdas.
  const hileras = [0, 1, 2].map((i) => 70 + i * 78);
  const celdas = [0, 1, 2, 3, 4, 5];

  return (
    <Revelar className={cn("w-full", className)}>
      <figure>
        <svg
          viewBox="0 0 680 420"
          role="img"
          aria-labelledby={`${id}-t ${id}-d`}
          className="h-auto w-full text-foreground/75"
        >
          <title id={`${id}-t`}>Diagrama de la caja de cría vista desde arriba</title>
          <desc id={`${id}-d`}>
            A la izquierda, la caja abierta con tres hileras de hueveras paradas,
            el sustrato en el fondo, un plato de alimento, una tapita con algodón
            húmedo y el termómetro-higrómetro. A la derecha, la tapa con una
            ventana de malla. Cada parte lleva el número del paso que la explica.
          </desc>
          <defs>
            <pattern id={puntos} width="12" height="12" patternUnits="userSpaceOnUse">
              <circle cx="3" cy="3" r="1.1" className="fill-current" opacity="0.35" />
              <circle cx="9" cy="9" r="0.9" className="fill-current" opacity="0.25" />
            </pattern>
            <pattern id={malla} width="7" height="7" patternUnits="userSpaceOnUse">
              <path d="M0 0L7 7M7 0L0 7" className="stroke-current" strokeWidth="0.6" opacity="0.45" />
            </pattern>
          </defs>

          {/* ── Caja abierta ── */}
          <rect x="24" y="30" width="420" height="360" rx="22" fill={`url(#${puntos})`} className="text-foreground/60" />
          <rect x="24" y="30" width="420" height="360" rx="22" className={trazo} strokeWidth="2.2" pathLength={1} />
          <rect x="38" y="44" width="392" height="332" rx="14" className={trazo} strokeWidth="1" opacity="0.55" pathLength={1} />

          {/* Hueveras paradas: tres hileras de celdas */}
          {hileras.map((x, i) => (
            <g key={x} style={{ "--d": `${200 + i * 120}ms` } as React.CSSProperties}>
              <rect
                x={x}
                y="70"
                width="56"
                height="280"
                rx="8"
                className={cn(trazo, "fill-background")}
                strokeWidth="1.6"
                pathLength={1}
              />
              {celdas.map((c) => (
                <circle
                  key={c}
                  cx={x + 28}
                  cy={96 + c * 46}
                  r="15"
                  className={trazo}
                  strokeWidth="1.2"
                  pathLength={1}
                />
              ))}
            </g>
          ))}

          {/* Plato de alimento */}
          <circle cx="355" cy="200" r="38" className={cn(trazo, "fill-background")} strokeWidth="1.6" pathLength={1} />
          <circle cx="355" cy="200" r="28" fill={`url(#${puntos})`} className="text-primary" />
          <circle cx="355" cy="200" r="28" className={trazo} strokeWidth="1" opacity="0.6" pathLength={1} />

          {/* Tapita con algodon humedo */}
          <circle cx="355" cy="310" r="30" className={cn(trazo, "fill-background")} strokeWidth="1.6" pathLength={1} />
          <path
            d="M337 312c4-9 12-9 15 0 3-9 11-9 14 0 3-7 9-6 11 1M340 322c5-6 11-6 16 0 4-6 11-6 15 0"
            className={trazo}
            strokeWidth="1.2"
            strokeLinecap="round"
            pathLength={1}
          />

          {/* Termometro-higrometro */}
          <rect x="318" y="72" width="78" height="54" rx="8" className={cn(trazo, "fill-background")} strokeWidth="1.6" pathLength={1} />
          <text x="357" y="93" textAnchor="middle" className="fill-current font-mono" style={{ fontSize: 13 }}>
            28 °C
          </text>
          <text x="357" y="112" textAnchor="middle" className="fill-current font-mono" style={{ fontSize: 11 }} opacity="0.75">
            65 % HR
          </text>

          {/* ── Tapa con ventana de malla ── */}
          <rect x="486" y="60" width="170" height="300" rx="18" className={trazo} strokeWidth="2.2" pathLength={1} />
          <rect x="516" y="96" width="110" height="228" rx="6" fill={`url(#${malla})`} className="text-foreground/70" />
          <rect x="516" y="96" width="110" height="228" rx="6" className={trazo} strokeWidth="1.4" pathLength={1} />
          <text x="571" y="386" textAnchor="middle" className="fill-current t-caption" style={{ fontSize: 13 }}>
            Tapa
          </text>

          {/* ── La parte elegida, resaltada ── */}
          {activo && RESALTE[activo] && (
            <g
              key={activo}
              aria-hidden
              className="pointer-events-none fill-primary/15 stroke-primary animate-in fade-in-0 duration-200 [&_*]:[stroke-width:2.5]"
            >
              {RESALTE[activo]}
            </g>
          )}

          {/* ── Numeros de los pasos ── */}
          {MARCAS.map((m, i) => (
            <Marca
              key={m.n}
              {...m}
              retraso={900 + i * 60}
              activo={activo === m.n}
              onElegir={onElegir}
            />
          ))}
        </svg>

        {leyenda && (
        <figcaption className="mt-6">
          <ol className="grid gap-x-8 gap-y-2.5 sm:grid-cols-2">
            {PARTES_CAJA.map((p) => (
              <li key={p.n} className="flex items-center gap-3 t-small">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary font-mono text-[12px] font-semibold text-primary-foreground">
                  {p.n}
                </span>
                <span className="text-foreground/85">{p.nombre}</span>
              </li>
            ))}
          </ol>
        </figcaption>
        )}
      </figure>
    </Revelar>
  );
}
