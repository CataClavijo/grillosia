import Link from "next/link";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export interface PasoIndicador {
  titulo: string;
  /** A donde lleva tocarlo cuando ya esta hecho. Sin `href` no es enlace. */
  href?: string;
}

/**
 * Indicador de pasos: 1 Animal · 2 Etapa · 3 Clima · 4 Resultado.
 *
 * Va debajo de la cabecera y NO es fijo: se lee al llegar y se va con el
 * desplazamiento, para no quitarle alto a la pantalla del celular.
 *
 * Los pasos anteriores al actual estan hechos de verdad (la consulta no deja
 * saltarse uno), llevan un chulo y se pueden tocar para corregir esa
 * respuesta. El actual va en terracota; los que siguen, en gris.
 */
export function Pasos({ pasos, actual }: { pasos: PasoIndicador[]; actual: number }) {
  return (
    <nav aria-label="Pasos de la consulta" className="border-b border-border bg-background">
      <ol className="mx-auto flex h-12 w-full max-w-[1240px] items-center gap-2 px-5 sm:gap-3 lg:px-8">
        {pasos.map((p, i) => {
          const n = i + 1;
          const hecho = n < actual;
          const enEste = n === actual;
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
                {hecho ? <Check className="size-3" strokeWidth={3} /> : n}
              </span>
              <span
                className={cn(
                  "whitespace-nowrap text-[13.5px]",
                  enEste ? "font-semibold text-foreground" : "text-subtle",
                  // En celular solo se nombra el paso actual.
                  !enEste && "hidden sm:inline",
                )}
              >
                {p.titulo}
              </span>
            </>
          );
          return (
            <li
              key={p.titulo}
              className={cn("flex min-w-0 items-center gap-2 sm:gap-3", i < pasos.length - 1 && "flex-1")}
            >
              {hecho && p.href ? (
                <Link
                  href={p.href}
                  aria-label={`${p.titulo}, hecho. Cambiar`}
                  className="-mx-1.5 flex items-center gap-2 rounded-md px-1.5 py-1 transition-colors hover:bg-surface-2"
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
              {i < pasos.length - 1 && (
                <span
                  aria-hidden
                  className={cn("h-px min-w-3 flex-1", hecho ? "bg-primary/50" : "bg-border-strong/70")}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
