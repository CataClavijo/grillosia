import { BookOpen, Compass, FlaskConical, Cpu } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * De donde sale cada numero.
 *
 * Regla de rigor de la plataforma: todo valor que se muestra dice su origen,
 * y los cuatro origenes nunca se mezclan ni se presentan como si fueran lo
 * mismo. Una prediccion del modelo no es un dato medido, y una cifra de la
 * literatura no es un resultado del proyecto.
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
    clase: "border-primary/30 bg-primary/8 text-primary",
  },
  literatura: {
    etiqueta: "Valor de referencia científica",
    explicacion:
      "Tomado de artículos o manuales técnicos reconocidos. Puede consultar la fuente.",
    Icono: BookOpen,
    clase:
      "border-[oklch(0.62_0.06_60/0.35)] bg-[oklch(0.62_0.06_60/0.08)] text-[oklch(0.42_0.06_55)] dark:text-[oklch(0.80_0.06_60)]",
  },
  modelo: {
    etiqueta: "Predicción del modelo GrillosIA",
    explicacion:
      "Calculado por el modelo de inteligencia artificial. No es una medición.",
    Icono: Cpu,
    clase:
      "border-[oklch(0.55_0.03_240/0.35)] bg-[oklch(0.55_0.03_240/0.07)] text-[oklch(0.40_0.03_240)] dark:text-[oklch(0.80_0.03_240)]",
  },
  orientativo: {
    etiqueta: "Recomendación orientativa",
    explicacion: "Sugerencia de la plataforma para orientar su decisión.",
    Icono: Compass,
    clase:
      "border-[oklch(0.70_0.10_85/0.40)] bg-[oklch(0.70_0.10_85/0.10)] text-[oklch(0.42_0.07_75)] dark:text-[oklch(0.82_0.09_85)]",
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
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[12.5px] font-semibold leading-5",
        clase,
        className,
      )}
    >
      <Icono className="size-3.5 shrink-0" aria-hidden />
      {etiqueta}
    </span>
  );
}

/**
 * Leyenda con los cuatro origenes, para poner una vez por pagina donde se
 * muestran cifras.
 */
export function LeyendaOrigenes({
  origenes = ["experimental", "literatura", "modelo", "orientativo"],
  className,
}: {
  origenes?: Origen[];
  className?: string;
}) {
  return (
    <ul className={cn("grid gap-3 text-[14px] sm:grid-cols-2", className)}>
      {origenes.map((o) => (
        <li key={o} className="flex flex-col items-start gap-1.5">
          <OrigenDato origen={o} />
          <span className="text-muted-foreground">{ORIGENES[o].explicacion}</span>
        </li>
      ))}
    </ul>
  );
}
