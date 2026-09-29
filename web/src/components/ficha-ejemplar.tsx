import { CircleCheck, Clock } from "lucide-react";

import {
  NIVELES,
  nivelConfirmado,
  type RegistroTaxonomico,
} from "@/lib/content/taxonomia";
import { cn } from "@/lib/utils";

/**
 * Ficha cientifica del ejemplar, como la etiqueta de una coleccion: el nivel
 * confirmado arriba y la clasificacion en tres casillas (familia, genero y
 * especie) en una sola fila, que en celular se apilan.
 *
 * Lo confirmado se escribe en firme; lo pendiente, en gris con un reloj, y
 * la razon se dice UNA vez al pie, no en cada casilla. Nunca se rellena un
 * nivel con un nombre supuesto.
 */
export function FichaEjemplar({
  registro: r,
  className,
}: {
  registro: RegistroTaxonomico;
  className?: string;
}) {
  const valor = { familia: r.familia, genero: r.genero, especie: r.especie };
  const confirmadoHasta = NIVELES.find((n) => n.id === r.nivelConfirmado)?.etiqueta.toLowerCase();
  const hayPendientes = NIVELES.some((n) => !nivelConfirmado(r, n.id) || !valor[n.id]);

  return (
    <section aria-label="Ficha del ejemplar" className={cn("flex flex-col", className)}>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <p className="t-eyebrow text-subtle">Ficha del ejemplar</p>
        {r.nombreComun && (
          <p className="text-[15px] font-semibold text-foreground">{r.nombreComun}</p>
        )}
        <span className="inline-flex items-center gap-1.5 rounded-sm bg-vegetal-soft px-2 py-1 text-[12.5px] font-semibold text-vegetal">
          <CircleCheck className="size-3.5" strokeWidth={2} aria-hidden />
          {r.estado === "confirmado"
            ? "Identificación confirmada"
            : `Confirmado hasta ${confirmadoHasta}`}
        </span>
      </div>

      <dl className="mt-4 grid divide-y divide-border border-y border-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {NIVELES.map((n) => {
          const ok = nivelConfirmado(r, n.id) && valor[n.id];
          return (
            <div
              key={n.id}
              className="flex items-baseline justify-between gap-4 py-3.5 sm:flex-col sm:items-start sm:justify-start sm:gap-1.5 sm:px-5 sm:py-4 sm:first:pl-0"
            >
              <dt className="t-eyebrow text-faint">{n.etiqueta}</dt>
              <dd>
                {ok ? (
                  <span
                    className={cn(
                      "font-display text-[1.5rem] font-semibold leading-none",
                      // En nomenclatura, solo genero y especie van en cursiva.
                      n.id !== "familia" && "italic",
                    )}
                  >
                    {valor[n.id]}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-[15px] text-faint">
                    <Clock className="size-3.5" strokeWidth={1.75} aria-hidden />
                    Dato aún no disponible
                  </span>
                )}
              </dd>
            </div>
          );
        })}
      </dl>

      {hayPendientes && (
        <p className="t-caption mt-3">
          Se mostrará cada nivel cuando la identificación esté confirmada.
          Preferimos un dato pendiente a un nombre equivocado.
        </p>
      )}
      {r.fuenteIdentificacion && (
        <p className="t-caption mt-2">Identificación: {r.fuenteIdentificacion}</p>
      )}
    </section>
  );
}
