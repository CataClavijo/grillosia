import { CircleCheck, Clock } from "lucide-react";

import {
  NIVELES,
  nivelConfirmado,
  type RegistroTaxonomico,
} from "@/lib/content/taxonomia";
import { cn } from "@/lib/utils";

/**
 * Ficha cientifica del ejemplar: nivel confirmado arriba y la clasificacion
 * en filas finas, como una etiqueta de coleccion.
 *
 * Lo confirmado se escribe en firme; lo pendiente se escribe en gris con un
 * reloj, y la razon se dice UNA vez al pie, no en cada fila. Nunca se rellena
 * un nivel con un nombre supuesto.
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="t-eyebrow text-subtle">Ficha del ejemplar</p>
        <span className="inline-flex items-center gap-1.5 rounded-sm bg-vegetal-soft px-2 py-1 text-[12.5px] font-semibold text-vegetal">
          <CircleCheck className="size-3.5" strokeWidth={2} aria-hidden />
          {r.estado === "confirmado"
            ? "Identificación confirmada"
            : `Confirmado hasta ${confirmadoHasta}`}
        </span>
      </div>

      {r.nombreComun && <p className="t-h3 mt-4">{r.nombreComun}</p>}

      <dl className="mt-4 divide-y divide-border border-y border-border">
        {NIVELES.map((n) => {
          const ok = nivelConfirmado(r, n.id) && valor[n.id];
          return (
            <div key={n.id} className="grid grid-cols-[96px_1fr] items-baseline gap-4 py-3">
              <dt className="t-small text-subtle">{n.etiqueta}</dt>
              <dd>
                {ok ? (
                  <span
                    className={cn(
                      "text-[16px] font-semibold",
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
