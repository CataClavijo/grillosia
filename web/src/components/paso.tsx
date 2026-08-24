import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { Barra } from "@/components/barra";
import { SiteNav } from "@/components/site-nav";
import { CAMINO, TOTAL_PARADAS, siguienteParada } from "@/lib/camino";
import { cn } from "@/lib/utils";

/**
 * Armazon de una parada del camino.
 *
 * Hace tres cosas, y las tres son la razon de que exista:
 *  1. Dice en que parada va y cuantas faltan, arriba, siempre.
 *  2. Deja UNA sola accion hacia adelante, al final.
 *  3. Ofrece volver, que no es lo mismo que ir al inicio.
 *
 * Ninguna parada dibuja su propia navegacion. Si hiciera falta un segundo
 * boton hacia adelante en alguna, la respuesta correcta es partir esa parada
 * en dos, no agregar el boton.
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
      {/* UNA sola cabecera pegada, con la barra del sitio dentro.
          Antes la barra iba en un `div` de su misma altura: `sticky` solo se
          mueve dentro de su padre, asi que no tenia recorrido y se iba en
          cuanto se bajaba. La barra del paso se quedaba pegada a 68 px del
          borde y por esa franja se colaba el contenido. */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur">
        <div className="hidden lg:block">
          <Barra />
        </div>
        <div className="mx-auto w-full max-w-[760px]">
          <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-3 lg:px-8">
            <Link
              href={anterior}
              className="inline-flex min-h-11 items-center gap-1 -ml-2 rounded-full px-2 text-[15px] font-semibold text-foreground/80 transition-colors hover:text-foreground"
            >
              <ChevronLeft className="size-5" />
              Atrás
            </Link>
            {/* El menu, solo en celular: en escritorio la barra de arriba ya
                lleva la navegacion entera, y dos menus a la vez confunden. */}
            <div className="lg:hidden">
              <SiteNav />
            </div>
          </div>
          <p className="rotulo px-5 pb-2 text-muted-foreground lg:px-8">
            Paso {n} de {TOTAL_PARADAS} · {titulo}
          </p>
          {/* Cuatro tramos, uno por parada. */}
          <div className="flex gap-1 px-5 pb-3 lg:px-8" aria-hidden>
            {Array.from({ length: TOTAL_PARADAS }, (_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 flex-1 rounded-full",
                  i < n ? "bg-primary" : "bg-muted",
                )}
              />
            ))}
          </div>
        </div>
      </div>
    <main className={cn("mx-auto flex w-full max-w-[760px] flex-col", className)}>

      <div className="px-5 pb-4 lg:px-8 lg:pb-8">{children}</div>

      {/* La unica accion hacia adelante. */}
      {href && (
        <div className="sticky bottom-0 z-20 border-t bg-background/95 px-5 pt-3 pb-[calc(env(safe-area-inset-bottom)+14px)] backdrop-blur lg:px-8">
          <Link
            href={href}
            className="mx-auto flex min-h-14 w-full items-center justify-center rounded-full bg-primary px-6 text-[17px] font-bold text-primary-foreground transition-opacity hover:opacity-92 lg:w-fit lg:min-w-[280px] lg:px-10"
          >
            {texto}
          </Link>
        </div>
      )}
    </main>
    </>
  );
}
