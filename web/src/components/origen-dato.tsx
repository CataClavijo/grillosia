import { BookOpen, Compass, Cpu, FlaskConical } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * De donde sale cada numero.
 *
 * Regla de rigor de la plataforma: todo valor que se muestra dice su origen,
 * y los cuatro origenes nunca se mezclan ni se presentan como si fueran lo
 * mismo. Una prediccion del modelo no es un dato medido, y una cifra de la
 * literatura no es un resultado del proyecto.
 *
 * Cada origen se distingue por icono Y texto, no solo por color: la etiqueta
 * se entiende igual en blanco y negro.
 */
export type Origen = "experimental" | "literatura" | "modelo" | "orientativo";

export const ORIGENES: Record<
  Origen,
  { etiqueta: string; explicacion: string; Icono: typeof BookOpen; clase: string }
> = {
  experimental: {
    etiqueta: "Dato experimental",
    explicacion: "Medido en los ensayos de cría del proyecto.",
    Icono: FlaskConical,
    clase: "bg-vegetal-soft text-vegetal",
  },
  literatura: {
    etiqueta: "Valor de referencia científica",
    explicacion:
      "Tomado de artículos o manuales técnicos reconocidos. Puede consultar la fuente.",
    Icono: BookOpen,
    clase: "bg-surface-2 text-foreground/75",
  },
  modelo: {
    etiqueta: "Predicción del modelo GrillosIA",
    explicacion:
      "Calculado por el modelo de inteligencia artificial. No es una medición.",
    Icono: Cpu,
    clase: "bg-transparent text-foreground/75 ring-1 ring-inset ring-border-strong",
  },
  orientativo: {
    etiqueta: "Recomendación orientativa",
    explicacion: "Sugerencia de la plataforma para orientar su decisión.",
    Icono: Compass,
    clase: "bg-warning-soft text-warning",
  },
};

export function OrigenDato({
  origen,
  className,
}: {
  origen: Origen;
  className?: string;
}) {
  const { etiqueta, explicacion, Icono, clase } = ORIGENES[origen];
  return (
    <span
      title={explicacion}
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-sm px-2 py-[3px] text-[12px] font-medium leading-4 whitespace-nowrap",
        clase,
        className,
      )}
    >
      <Icono className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
      {etiqueta}
    </span>
  );
}

/**
 * Leyenda con los origenes, para poner una vez por pagina donde se muestran
 * cifras. Etiqueta arriba y explicacion debajo, en rejilla: en fila, cada
 * explicacion se cortaba en un lugar distinto.
 */
export function LeyendaOrigenes({
  origenes = ["experimental", "literatura", "modelo", "orientativo"],
  className,
}: {
  origenes?: Origen[];
  className?: string;
}) {
  return (
    <ul className={cn("grid gap-x-8 gap-y-5 text-[14px] sm:grid-cols-2", className)}>
      {origenes.map((o) => (
        <li key={o} className="flex flex-col items-start gap-1.5">
          <OrigenDato origen={o} />
          <span className="leading-snug text-subtle">{ORIGENES[o].explicacion}</span>
        </li>
      ))}
    </ul>
  );
}
