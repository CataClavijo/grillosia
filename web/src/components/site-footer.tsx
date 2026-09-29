"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Logo } from "@/components/logo";
import { CambioTema } from "@/components/theme-toggle";
import { BIBLIOTECA, CAMINO } from "@/lib/camino";

/**
 * Pie del sitio: marca, mapa del sitio y atribucion institucional. Sobrio:
 * sin ilustraciones, sin cajas; se separa del contenido por un cambio de
 * fondo, no por una linea.
 *
 * /reset no aparece: es la herramienta de emergencia para reparar la
 * aplicacion, sigue funcionando escribiendo la direccion y eso es lo que
 * necesita quien da soporte, no el productor.
 *
 * No se dibuja en las pantallas del camino: alli la accion hacia adelante
 * vive fija abajo y el pie la estorbaria.
 */
const SIN_PIE = ["/chat", "/reset", "/consulta", "/caja", "/grillos", "/resultado"];

const claseEnlace =
  "inline-flex min-h-8 items-center text-[14.5px] text-subtle transition-colors duration-150 hover:text-foreground";

export function SiteFooter() {
  const pathname = usePathname();
  if (SIN_PIE.some((r) => pathname?.startsWith(r))) return null;

  return (
    <footer className="mt-auto bg-surface-2">
      <div className="mx-auto grid w-full max-w-[1240px] gap-12 px-5 pt-14 pb-10 lg:grid-cols-[1.4fr_1fr_1fr] lg:gap-16 lg:px-8 lg:pt-16">
        <div className="flex flex-col gap-5">
          <Link href="/" aria-label="GrillosIA, ir al inicio" className="w-fit">
            <Logo variante="completo" />
          </Link>
          <p className="t-small max-w-[42ch] text-subtle">
            Proyecto de investigación de la Universidad de los Llanos sobre la
            cría de grillos y la optimización de su dieta con inteligencia
            artificial.
          </p>
        </div>

        <nav aria-label="El recorrido">
          <p className="t-eyebrow text-faint">El recorrido</p>
          <ul className="mt-4 flex flex-col gap-1">
            {CAMINO.map((p) => (
              <li key={p.n}>
                <Link href={p.href} className={claseEnlace}>
                  {p.titulo}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Más">
          <p className="t-eyebrow text-faint">Más</p>
          <ul className="mt-4 flex flex-col gap-1">
            {BIBLIOTECA.map((b) => (
              <li key={b.href}>
                <Link href={b.href} className={claseEnlace}>
                  {b.titulo}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/entrar" className={claseEnlace}>
                Entrar
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-2 px-5 pb-[calc(env(safe-area-inset-bottom)+32px)] lg:flex-row lg:items-baseline lg:justify-between lg:gap-8 lg:px-8">
        <p className="t-caption max-w-[80ch]">
          Universidad de los Llanos · Minciencias, convocatoria 963 de 2025,
          contrato 207-2025. Investigación: Dra. Mónica Paola Higuera-Díaz.
          Desarrollo de la plataforma: Catalina Clavijo Agudelo.
        </p>
        <div className="flex shrink-0 flex-wrap items-center gap-x-5 gap-y-1 [&>button]:whitespace-nowrap">
          <CambioTema />
          <p className="t-eyebrow text-faint">
            Piedemonte Llanero, Meta · {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
}
