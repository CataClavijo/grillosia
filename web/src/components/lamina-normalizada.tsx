import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * Proporcion (ancho / alto) de cada ilustracion, medida sobre el archivo.
 *
 * Esta aqui para que las ilustraciones tengan el mismo PESO visual aunque
 * sus proporciones sean muy distintas: un cerdo es el doble de ancho que
 * alto, una gallina es cuadrada. Con `object-contain` en una caja igual, el
 * cerdo se ve enorme y la gallina chiquita. Dandoles la misma AREA quedan
 * parejas a la vista.
 */
const PROPORCION: Record<string, number> = {
  "/acuarelas/tilapia.webp": 1.63,
  "/acuarelas/pollo-engorde.webp": 0.98,
  "/acuarelas/gallina.webp": 0.98,
  "/acuarelas/cerdo.webp": 1.95,
  "/acuarelas/ing-bore.webp": 0.93,
  "/acuarelas/ing-boton-oro.webp": 1.16,
  "/acuarelas/ing-salvado.webp": 1.58,
  "/acuarelas/ing-maiz.webp": 1.33,
  "/acuarelas/ing-avena.webp": 0.91,
};

/**
 * Ilustracion en grabado con area constante, apoyada sobre la misma linea de
 * base (abajo de su caja). `area` es el area aparente en px² a escala 1;
 * `alto` es la altura de la caja, que no cambia entre tarjetas.
 *
 * La escala se puede reducir en celular con la variable CSS `--escala` en
 * un contenedor (por ejemplo `[--escala:0.6] sm:[--escala:1]`).
 */
export function LaminaNormalizada({
  src,
  area,
  alto,
  className,
  prioridad = false,
}: {
  src: string;
  area: number;
  alto: number;
  className?: string;
  prioridad?: boolean;
}) {
  const ar = PROPORCION[src] ?? 1.2;
  const ancho = Math.round(Math.sqrt(area * ar));
  const altoImg = Math.round(ancho / ar);
  return (
    <span
      aria-hidden
      className={cn("flex items-end justify-center", className)}
      style={{ height: `calc(${alto}px * var(--escala, 1))` }}
    >
      <Image
        src={src}
        alt=""
        width={ancho * 2}
        height={altoImg * 2}
        priority={prioridad}
        sizes={`${ancho * 2}px`}
        className="lamina h-auto max-h-full object-contain"
        style={{ width: `calc(${ancho}px * var(--escala, 1))` }}
      />
    </span>
  );
}
