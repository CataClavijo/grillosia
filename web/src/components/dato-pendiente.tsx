import { Clock } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Lugar reservado para un dato que todavia no existe.
 *
 * Es preferible un campo pendiente que un numero inventado para que el
 * diseno se vea completo. Este componente es ese campo: se ve cuidado, dice
 * que falta y, si se sabe, por que.
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
        "inline-flex items-start gap-1.5 text-muted-foreground",
        compacto ? "text-[13px]" : "text-[14.5px]",
        className,
      )}
    >
      <Clock className="mt-[3px] size-3.5 shrink-0" aria-hidden />
      <span>
        <span className="font-semibold">Dato aún no disponible</span>
        {motivo && <span className="block font-normal">{motivo}</span>}
      </span>
    </span>
  );
}
