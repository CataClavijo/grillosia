import Link from "next/link";
import { Check } from "lucide-react";

import { CAMINO } from "@/lib/camino";
import { cn } from "@/lib/utils";

/** Nombre corto de cada parada. */
const CORTO: Record<number, string> = {
  1: "Caja",
  2: "Grillos",
  3: "Consulta",
  4: "Resultado",
};

/**
 * Indicador de pasos del camino guiado: 1 Caja · 2 Grillos · 3 Consulta ·
 * 4 Resultado. Reemplaza la raya de progreso de la cabecera, que no decia en
 * que paso se estaba ni cuantos faltaban.
 *
 * Va debajo de la cabecera y NO es fijo: se lee al llegar y se va con el
 * desplazamiento, para no quitarle alto a la pantalla del celular.
 *
 * Los pasos ya hechos llevan un chulo; el actual va en terracota. Se puede
 * volver a cualquier paso anterior; el resultado solo se abre desde la
 * consulta, asi que no es enlace mientras no se haya llegado a el.
 */
export function Pasos({ actual }: { actual: number }) {
  return (
    <nav aria-label="Pasos" className="border-b border-border bg-background">
      <ol className="mx-auto flex h-12 w-full max-w-[1240px] items-center gap-2 px-5 sm:gap-3 lg:px-8">
        {CAMINO.map((p, i) => {
          const hecho = p.n < actual;
          const enEste = p.n === actual;
          const enlace = p.n !== actual && (p.n < 4 || hecho);
          const contenido = (
            <>
              <span
                aria-hidden
                className={cn(
                  "grid size-[22px] shrink-0 place-items-center rounded-full font-mono text-[11px] font-medium transition-colors",
                  enEste && "bg-primary text-primary-foreground",
                  hecho && "bg-primary-soft text-primary",
                  !enEste && !hecho && "border border-border-strong text-subtle",
                )}
              >
                {hecho ? <Check className="size-3" strokeWidth={3} /> : p.n}
              </span>
              <span
                className={cn(
                  "whitespace-nowrap text-[13.5px]",
                  enEste ? "font-semibold text-foreground" : "text-subtle",
                  // En celular solo se nombra el paso actual.
                  !enEste && "hidden sm:inline",
                )}
              >
                {CORTO[p.n]}
              </span>
            </>
          );
          return (
            <li
              key={p.n}
              className={cn("flex min-w-0 items-center gap-2 sm:gap-3", i < CAMINO.length - 1 && "flex-1")}
            >
              {enlace ? (
                <Link
                  href={p.href}
                  className="-mx-1.5 flex items-center gap-2 rounded-md px-1.5 py-1 transition-colors hover:bg-surface-2 [&>span:last-child]:hover:text-foreground"
                >
                  {contenido}
                </Link>
              ) : (
                <span
                  aria-current={enEste ? "step" : undefined}
                  className="flex items-center gap-2"
                >
                  {contenido}
                </span>
              )}
              {i < CAMINO.length - 1 && (
                <span
                  aria-hidden
                  className={cn("h-px min-w-3 flex-1", hecho ? "bg-primary/50" : "bg-border-strong/70")}
                />
              )}
            </li>
          );
        })}
      </ol>
      <p className="sr-only">
        Paso {actual} de {CAMINO.length}: {CAMINO[actual - 1]?.titulo}
      </p>
    </nav>
  );
}
