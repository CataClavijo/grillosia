import { AlertCircle, Clock, Inbox, Loader2, WifiOff } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * Estados de producto: cargando, error, vacio, sin conexion, modelo no
 * disponible y dato pendiente. Todos con la misma forma (icono, titulo corto,
 * una frase y, si hace falta, una accion), para que ningun estado se vea
 * improvisado ni muestre un error tecnico.
 *
 * El tipo se dice con icono Y texto, nunca solo con color.
 */
const TIPOS = {
  cargando: { Icono: Loader2, clase: "text-subtle", girar: true },
  error: { Icono: AlertCircle, clase: "text-destructive", girar: false },
  vacio: { Icono: Inbox, clase: "text-subtle", girar: false },
  "sin-conexion": { Icono: WifiOff, clase: "text-warning", girar: false },
  "sin-modelo": { Icono: AlertCircle, clase: "text-warning", girar: false },
  pendiente: { Icono: Clock, clase: "text-subtle", girar: false },
} as const;

export type TipoEstado = keyof typeof TIPOS;

export function Estado({
  tipo,
  titulo,
  children,
  accion,
  compacto = false,
  className,
}: {
  tipo: TipoEstado;
  titulo: string;
  children?: React.ReactNode;
  accion?: React.ReactNode;
  compacto?: boolean;
  className?: string;
}) {
  const { Icono, clase, girar } = TIPOS[tipo];
  return (
    <div
      role={tipo === "error" ? "alert" : "status"}
      className={cn(
        "flex gap-3 rounded-lg bg-surface-2",
        compacto ? "items-start p-4" : "flex-col items-start p-6 sm:p-7",
        className,
      )}
    >
      <Icono
        aria-hidden
        className={cn(
          "shrink-0",
          compacto ? "mt-0.5 size-4" : "size-5",
          clase,
          girar && "animate-spin",
        )}
      />
      <div className="flex flex-col gap-1">
        <p className="t-h4">{titulo}</p>
        {children && <div className="t-small text-subtle">{children}</div>}
        {accion && <div className="mt-3">{accion}</div>}
      </div>
    </div>
  );
}

/** Esqueleto de una tabla o lista mientras llegan los datos. */
export function EsqueletoFilas({ filas = 3 }: { filas?: number }) {
  return (
    <div className="flex flex-col gap-3" aria-hidden>
      {Array.from({ length: filas }, (_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="size-10 rounded-md" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
      ))}
    </div>
  );
}
