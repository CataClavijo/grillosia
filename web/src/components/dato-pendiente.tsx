import { Clock } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Lugar reservado para un dato que todavia no existe.
 *
 * Es preferible un campo pendiente que un numero inventado para que el
 * diseno se vea completo. Este componente es ese campo: discreto, dice que
 * falta y, si se sabe, por que. El reloj y el texto lo marcan como pendiente
 * sin depender del color.
 */
export function DatoPendiente({
  motivo,
  compacto = false,
  className,
}: {
  /** Por que no esta todavia, en una frase. Ej.: "Se mide al cosechar." */
  motivo?: string;
  compacto?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-start gap-1.5 text-subtle",
        compacto ? "text-[13px]" : "text-[14px]",
        className,
      )}
    >
      <Clock
        className={cn("shrink-0 text-faint", compacto ? "mt-[2px] size-3.5" : "mt-[3px] size-3.5")}
        strokeWidth={1.75}
        aria-hidden
      />
      <span className="flex flex-col gap-0.5">
        <span className="font-medium leading-snug">Dato aún no disponible</span>
        {motivo && <span className="leading-snug text-faint">{motivo}</span>}
      </span>
    </span>
  );
}
