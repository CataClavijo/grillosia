"use client";

import { Sparkles } from "lucide-react";

import { abrirAsistente } from "@/lib/asistente";
import { cn } from "@/lib/utils";

/**
 * Acceso al asistente dentro de la barra de acciones del camino.
 *
 * En las cuatro paradas el asistente no flota sobre el contenido: vive junto
 * a "Continuar", en la franja que ya esta reservada abajo. Asi nunca tapa
 * texto ni imagenes, y queda donde la persona ya esta mirando al decidir.
 * En celular es solo el icono (48 px) para dejarle el ancho al boton
 * principal.
 */
export function BotonAsistente({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => abrirAsistente()}
      aria-label="Pregunte a GrillosIA"
      aria-haspopup="dialog"
      className={cn(
        "inline-flex size-12 shrink-0 items-center justify-center gap-2 rounded-md border border-border-strong bg-background text-[15px] font-medium text-foreground transition-colors duration-150 hover:bg-surface-2 sm:w-auto sm:px-4",
        className,
      )}
    >
      <Sparkles className="size-[18px] text-primary" aria-hidden />
      <span className="hidden sm:inline">Preguntar</span>
    </button>
  );
}
