"use client";

import { useEffect, useState } from "react";
import { ArrowRight, ExternalLink, Landmark, X } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AUTORIDADES,
  PERMISOS_NOTA,
  PERMISOS_PASOS,
  PERMISOS_RESUMEN,
  PERMISOS_TITULO,
} from "@/lib/content/permisos";

const CLAVE_CERRADO = "grillia-aviso-permisos-cerrado";

/**
 * Aviso de permisos ambientales para criar grillos a escala o venderlos.
 *
 * Dos formas:
 *  - `franja`: una linea arriba de las paginas de la guia, que abre el
 *    detalle. Se puede cerrar y queda cerrada en ese telefono; no es un modal
 *    que aparezca solo, porque taparia lo que la persona vino a leer.
 *  - `bloque`: a la vista y sin boton de cerrar, en "Busque sus grillos",
 *    que es donde se decide si recoger grillos del monte.
 */
export function AvisoPermisos({ forma }: { forma: "franja" | "bloque" }) {
  const [cerrado, setCerrado] = useState(true);

  useEffect(() => {
    try {
      setCerrado(window.localStorage.getItem(CLAVE_CERRADO) === "1");
    } catch {
      setCerrado(false);
    }
  }, []);

  if (forma === "franja") {
    if (cerrado) return null;
    return (
      <div className="border-b border-warning/25 bg-warning-soft dark:bg-warning/10">
        <div className="mx-auto flex w-full max-w-[1240px] items-center gap-3 px-5 py-2.5 lg:px-8">
          <Landmark className="size-4 shrink-0 text-warning" strokeWidth={2} aria-hidden />
          <p className="min-w-0 flex-1 text-[13.5px] leading-snug text-foreground/85">
            <span className="font-semibold text-foreground">{PERMISOS_TITULO}</span>{" "}
            <span className="hidden sm:inline">Necesita permisos ambientales y del ICA. </span>
            <Detalle>
              <button
                type="button"
                className="inline-flex items-center gap-1 font-semibold text-foreground underline decoration-foreground/30 underline-offset-[3px] hover:decoration-foreground"
              >
                Ver cuáles
                <ArrowRight className="size-3.5" aria-hidden />
              </button>
            </Detalle>
          </p>
          <button
            type="button"
            aria-label="Cerrar el aviso"
            onClick={() => {
              setCerrado(true);
              try {
                window.localStorage.setItem(CLAVE_CERRADO, "1");
              } catch {
                /* sin almacenamiento: se cierra solo por ahora */
              }
            }}
            className="-mr-2 flex size-8 shrink-0 items-center justify-center rounded-md text-subtle transition-colors hover:bg-foreground/[0.06] hover:text-foreground"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
      </div>
    );
  }

  return (
    <aside
      aria-label="Permisos para criar y vender grillos"
      className="mt-8 flex gap-4 rounded-lg border border-warning/30 bg-warning-soft p-5 dark:bg-warning/10 sm:p-6"
    >
      <Landmark className="mt-0.5 size-5 shrink-0 text-warning" strokeWidth={1.75} aria-hidden />
      <div className="min-w-0">
        <p className="t-h3">{PERMISOS_TITULO}</p>
        <p className="t-small mt-1.5 max-w-[70ch] text-foreground/85">{PERMISOS_RESUMEN}</p>
        <Detalle>
          <button
            type="button"
            className="mt-3 inline-flex min-h-9 items-center gap-1.5 text-[14.5px] font-semibold text-foreground underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground"
          >
            Ver qué permisos y dónde pedirlos
            <ArrowRight className="size-4" aria-hidden />
          </button>
        </Detalle>
      </div>
    </aside>
  );
}

/** La ventana con el detalle: los tres permisos y a quién pedirlos. */
function Detalle({ children }: { children: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      {/* `sm:max-w-*`: la base del dialogo trae sm:max-w-sm (384 px) y le
          ganaba a un `max-w-*` simple; por eso salia tan angosto. */}
      <DialogContent className="max-h-[90dvh] gap-7 overflow-y-auto rounded-lg p-6 sm:max-w-[860px] sm:p-9">
        <DialogHeader className="gap-2 text-left">
          <p className="t-eyebrow text-subtle">Antes de criar a escala</p>
          <DialogTitle className="t-h2 !text-[1.9rem] !leading-[1.05] sm:!text-[2.4rem]">{PERMISOS_TITULO}</DialogTitle>
          <DialogDescription className="max-w-[62ch] !text-[16px] leading-relaxed text-subtle sm:!text-[17px]">
            {PERMISOS_RESUMEN}
          </DialogDescription>
        </DialogHeader>

        {/* En pantalla grande, que permisos a la izquierda y a quien
            pedirlos a la derecha. */}
        <div className="grid gap-8 md:grid-cols-[1.15fr_1fr] md:gap-10">
          <div>
            <p className="t-eyebrow text-faint">Qué permisos</p>
            <ol className="mt-4 flex flex-col gap-5">
              {PERMISOS_PASOS.map((p, i) => (
                <li key={p.titulo} className="grid grid-cols-[32px_1fr] gap-x-3">
                  <span className="flex size-8 items-center justify-center rounded-full bg-primary-soft font-mono text-[13px] font-semibold text-primary">
                    {i + 1}
                  </span>
                  <span>
                    <span className="t-h3 block">{p.titulo}</span>
                    <span className="t-small mt-1 block text-subtle">{p.texto}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <p className="t-eyebrow text-faint">Dónde pedirlos</p>
            <ul className="mt-3 divide-y divide-border border-y border-border">
              {AUTORIDADES.map((a) => (
                <li key={a.entidad}>
                  <a
                    href={a.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between gap-4 py-3.5"
                  >
                    <span className="min-w-0">
                      <span className="block text-[13px] text-subtle">{a.region}</span>
                      <span className="block text-[15.5px] font-semibold group-hover:text-primary">{a.entidad}</span>
                    </span>
                    <ExternalLink className="size-4 shrink-0 text-subtle group-hover:text-primary" aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="t-caption border-t border-border pt-5">{PERMISOS_NOTA}</p>
      </DialogContent>
    </Dialog>
  );
}
