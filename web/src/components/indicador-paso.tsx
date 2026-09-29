import Link from "next/link";

import { CAMINO, TOTAL_PARADAS } from "@/lib/camino";
import { cn } from "@/lib/utils";

/**
 * "Paso 3 de 4" con los cuatro puntos numerados.
 *
 * Es el mismo indicador que dibuja `Paso`, aparte para las paradas que
 * manejan su propia navegacion (la consulta avanza por preguntas, no por
 * paradas).
 */
export function IndicadorPaso({ n, titulo }: { n: number; titulo: string }) {
  return (
    <div className="flex flex-wrap items-center gap-4 pt-6 pb-2 lg:pt-8">
      <span className="rounded-full border bg-card px-3 py-1 text-[13.5px] font-medium text-foreground/80">
        Paso {n} de {TOTAL_PARADAS}
        <span className="sr-only"> · {titulo}</span>
      </span>
      <ol className="flex items-center" aria-hidden>
        {CAMINO.map((p, i) => (
          <li key={p.n} className="flex items-center">
            {i > 0 && (
              <span
                className={cn(
                  "h-px w-6 sm:w-9",
                  p.n <= n ? "bg-primary" : "bg-border",
                )}
              />
            )}
            <Link
              href={p.href}
              tabIndex={-1}
              className={cn(
                "flex size-6 items-center justify-center rounded-full border text-[12px] font-semibold",
                p.n <= n
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground",
              )}
            >
              {p.n}
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
