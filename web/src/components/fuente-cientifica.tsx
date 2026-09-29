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
import { cn } from "@/lib/utils";

/**
 * Enlace discreto "¿De donde sale este valor?".
 *
 * Abre una ventana con la referencia completa de cada valor de literatura.
 * Si un id no tiene referencia cargada, lo dice: nunca se muestra una cita
 * que no este en el registro verificado.
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
            "inline-flex items-center gap-1.5 text-[13.5px] font-medium text-muted-foreground underline decoration-dotted underline-offset-4 transition-colors hover:text-foreground",
            className,
          )}
        >
          <BookOpen className="size-3.5" aria-hidden />
          {texto}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="font-display text-[22px] font-medium">
            Fuente científica
          </DialogTitle>
          <DialogDescription className="text-[14.5px]">
            {detalle ??
              "Estos valores vienen de la literatura científica, no de los ensayos del proyecto."}
          </DialogDescription>
        </DialogHeader>
        {refs.length === 0 ? (
          <p className="text-[15px] text-muted-foreground">
            Todavía no hemos cargado la fuente de este valor.
          </p>
        ) : (
          <ul className="flex flex-col gap-4">
            {refs.map((r) => (
              <li key={r.id} className="text-[15px] leading-relaxed">
                <p>{r.cita}</p>
                {r.ubicacion && (
                  <p className="mt-0.5 text-[13.5px] text-muted-foreground">
                    {r.ubicacion}
                  </p>
                )}
                {r.url && (
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-[14px] font-semibold text-primary underline underline-offset-2"
                  >
                    Consultar la fuente
                    <ExternalLink className="size-3.5" aria-hidden />
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}
