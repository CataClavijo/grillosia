import { cn } from "@/lib/utils";

/**
 * Barra fina de progreso. Anima su ancho al cambiar (250 ms).
 *
 * Accesible como `progressbar` con su valor en texto: quien usa lector de
 * pantalla oye "Paso 3 de 4", no un porcentaje suelto.
 */
export function Progreso({
  valor,
  total,
  etiqueta,
  className,
}: {
  valor: number;
  total: number;
  /** Texto que se lee: "Paso 3 de 4 · Consulta". */
  etiqueta: string;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, (valor / total) * 100));
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={valor}
      aria-valuetext={etiqueta}
      className={cn("h-[3px] w-full overflow-hidden bg-border", className)}
    >
      <div
        className="h-full bg-primary transition-[width] duration-[var(--dur-media)] ease-[var(--ease-natural)]"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
