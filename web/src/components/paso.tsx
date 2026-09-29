import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { Barra } from "@/components/barra";
import { CAMINO, TOTAL_PARADAS, siguienteParada } from "@/lib/camino";
import { cn } from "@/lib/utils";

/**
 * Armazon de una parada del camino.
 *
 * Hace tres cosas, y las tres son la razon de que exista:
 *  1. Dice en que parada va y cuantas faltan ("Paso 3 de 4" y los cuatro
 *     puntos numerados, como en los disenos de referencia).
 *  2. Deja UNA sola accion hacia adelante, al final.
 *  3. Ofrece volver, que no es lo mismo que ir al inicio.
 *
 * Ninguna parada dibuja su propia navegacion. Si hiciera falta un segundo
 * boton hacia adelante en alguna, la respuesta correcta es partir esa parada
 * en dos, no agregar el boton.
 *
 * El ancho es el del sitio (1240 px): las paradas usan rejillas de dos o tres
 * columnas en escritorio y una sola en celular.
 */
export function Paso({
  n,
  titulo,
  children,
  accion,
  className,
}: {
  n: number;
  titulo: string;
  children: React.ReactNode;
  /** Sobrescribe el texto del boton. Por defecto, el de la parada. */
  accion?: { texto?: string; href?: string };
  className?: string;
}) {
  // El texto sale de ESTA parada —describe lo que el productor esta a punto
  // de hacer— y la direccion de la siguiente. Leer los dos de la misma
  // parada pone en el boton de la 1 el texto de la 2.
  const actual = CAMINO.find((x) => x.n === n);
  const sigue = siguienteParada(n);
  const href = accion?.href ?? sigue?.href;
  const texto = accion?.texto ?? actual?.siguiente ?? "Seguir";
  const anterior = n > 1 ? `/${["", "caja", "grillos", "consulta"][n - 1]}` : "/";

  return (
    <>
      <Barra />
      <main
        className={cn(
          "mx-auto flex w-full max-w-[1240px] flex-col px-5 lg:px-8",
          className,
        )}
      >
        {/* Donde va: "Paso 3 de 4" y los cuatro puntos. */}
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

        <div className="pb-6 lg:pb-10">{children}</div>

        {/* La unica accion hacia adelante, con "Atras" a la izquierda. */}
        <div className="sticky bottom-0 z-20 -mx-5 flex items-center gap-3 border-t bg-background/95 px-5 pt-3 pb-[calc(env(safe-area-inset-bottom)+14px)] backdrop-blur lg:-mx-8 lg:px-8">
          <Link
            href={anterior}
            className="inline-flex min-h-12 shrink-0 items-center gap-2 rounded-md border px-4 text-[15px] font-semibold text-foreground/85 transition-colors hover:bg-muted"
          >
            <ArrowLeft className="size-4" />
            Atrás
          </Link>
          {href && (
            <Link
              href={href}
              className="mx-auto flex min-h-12 flex-1 items-center justify-center gap-2 rounded-md bg-primary px-6 text-[16.5px] font-semibold text-primary-foreground transition-opacity hover:opacity-92 sm:max-w-[420px]"
            >
              {texto}
              <ArrowRight className="size-4" />
            </Link>
          )}
          {/* Contrapeso del boton "Atras" para que el principal quede centrado. */}
          <span className="hidden w-[104px] shrink-0 sm:block" aria-hidden />
        </div>
      </main>
    </>
  );
}
