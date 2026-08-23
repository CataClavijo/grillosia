"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { BIBLIOTECA, CAMINO } from "@/lib/camino";

/**
 * Pie del sitio.
 *
 * Sin ilustracion: las laminas son para las secciones, donde acompanan a un
 * contenido. En el pie no acompanan nada y solo estorban.
 *
 * Lleva el mapa del sitio, la marca y la atribucion institucional. /reset no
 * aparece: es la herramienta de emergencia para reparar la aplicacion, sigue
 * funcionando escribiendo la direccion y eso es lo que necesita quien da
 * soporte, no el productor.
 *
 * No se dibuja en las pantallas del camino: alli la accion hacia adelante
 * vive fija abajo y el pie la estorbaria.
 */
const SIN_PIE = ["/chat", "/reset", "/consulta", "/caja", "/grillos", "/resultado"];

export function SiteFooter() {
  const pathname = usePathname();
  if (SIN_PIE.some((r) => pathname?.startsWith(r))) return null;

  return (
    <footer className="mt-auto border-t">
      <div className="mx-auto w-full max-w-[560px] px-5 pb-9 pt-8">
        <div className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="" width={34} height={34} />
          <span className="font-display text-[17px] font-bold tracking-[-0.02em]">
            GrillosIA
          </span>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-2">
          <nav>
            <ul className="flex flex-col gap-2">
              {CAMINO.map((p) => (
                <li key={p.n}>
                  <Link
                    href={p.href}
                    className="text-[14.5px] text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                  >
                    {p.titulo}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav>
            <ul className="flex flex-col gap-2">
              {BIBLIOTECA.map((b) => (
                <li key={b.href}>
                  <Link
                    href={b.href}
                    className="text-[14.5px] text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                  >
                    {b.titulo}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/entrar"
                  className="text-[14.5px] text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                >
                  Entrar
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <p className="mt-7 border-t pt-5 text-[13.5px] leading-relaxed text-muted-foreground">
          Universidad de los Llanos · Minciencias 963 de 2025, contrato
          207-2025. Investigación: Dra. Mónica Paola Higuera-Díaz. Creación de
          la página: Catalina Clavijo Agudelo.
        </p>
        <p className="rotulo mt-3 text-muted-foreground">
          Villavicencio, Meta · {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
