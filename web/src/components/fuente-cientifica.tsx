"use client";

import { BookOpen, ExternalLink } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { referencia } from "@/lib/content/referencias";
import { conCursivas } from "@/lib/cursivas";
import { cn } from "@/lib/utils";

/**
 * Enlace discreto "¿De donde sale este valor?".
 *
 * Abre una ventana con la referencia completa de cada valor de literatura,
 * numerada como en un articulo. Si un id no tiene referencia cargada, lo
 * dice: nunca se muestra una cita que no este en el registro verificado.
 */
export function FuenteCientifica({
  ids,
  texto = "¿De dónde sale este valor?",
  detalle,
  className,
}: {
  /** Ids de `REFERENCIAS`. */
  ids: string[];
  texto?: string;
  /** Aclaracion corta sobre como se uso la fuente. */
  detalle?: string;
  className?: string;
}) {
  const refs = ids.map((id) => referencia(id)).filter((r) => r !== undefined);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex min-h-8 w-fit items-center gap-1.5 rounded-sm text-[13.5px] font-medium text-subtle underline decoration-border-strong decoration-dotted underline-offset-[5px] transition-colors duration-150 hover:text-foreground hover:decoration-foreground/50",
            className,
          )}
        >
          <BookOpen className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
          {texto}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-[560px] gap-5 rounded-lg p-6 sm:p-7">
        <DialogHeader className="gap-2 text-left">
          <p className="t-eyebrow text-subtle">Respaldo del dato</p>
          <DialogTitle className="t-h2 !text-[1.75rem]">Fuente científica</DialogTitle>
          <DialogDescription className="text-[15px] leading-relaxed text-subtle">
            {detalle ??
              "Estos valores vienen de la literatura científica, no de los ensayos del proyecto."}
          </DialogDescription>
        </DialogHeader>
        {refs.length === 0 ? (
          <p className="text-[15px] text-subtle">
            Todavía no hemos cargado la fuente de este valor.
          </p>
        ) : (
          <ol className="flex flex-col gap-5">
            {refs.map((r, i) => (
              <li key={r.id} className="grid grid-cols-[24px_1fr] gap-x-2 text-[15px] leading-relaxed">
                <span className="t-eyebrow pt-[5px] text-faint">{i + 1}</span>
                <div>
                  <p className="[overflow-wrap:anywhere]">{conCursivas(r.cita)}</p>
                  {r.ubicacion && (
                    <p className="mt-1 text-[13.5px] text-subtle">{r.ubicacion}</p>
                  )}
                  {r.url && (
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1.5 inline-flex items-center gap-1 text-[14px] font-semibold text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
                    >
                      Consultar la fuente
                      <ExternalLink className="size-3.5" aria-hidden />
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}
      </DialogContent>
    </Dialog>
  );
}
