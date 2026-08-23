"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { BIBLIOTECA, CAMINO } from "@/lib/camino";

/**
 * Pie del sitio.
 *
 * Antes era una linea con tres enlaces sueltos —metodologia, contacto y
 * /reset— repetidos en diez de las once pantallas, compitiendo con la tarea.
 * Ahora es un pie de verdad: el mapa del sitio, la atribucion institucional y
 * el aviso de que esto es una investigacion en curso.
 *
 * /reset no aparece. Es la herramienta de emergencia para reparar la
 * aplicacion; sigue funcionando escribiendo la direccion, que es lo que
 * necesita quien da soporte, no el productor.
 *
 * No se dibuja en las pantallas del camino: alli el pie estorba, porque la
 * accion hacia adelante vive fija abajo.
 */
const SIN_PIE = ["/chat", "/reset", "/consulta", "/caja", "/grillos", "/resultado"];

export function SiteFooter() {
  const pathname = usePathname();
  if (SIN_PIE.some((r) => pathname?.startsWith(r))) return null;

  return (
    <footer className="mt-auto border-t bg-card/40">
      {/* Vineta de cierre: el cul-de-lampe con que los libros naturalistas
          rematan capitulo. */}
      <div className="flex justify-center pt-6">
        <Image
          src="/arte/vineta.webp"
          alt=""
          width={420}
          height={140}
          aria-hidden
          className="lamina h-auto w-full max-w-[260px]"
        />
      </div>

      <div className="mx-auto grid w-full max-w-[560px] grid-cols-2 gap-x-6 gap-y-7 px-5 pb-8 pt-4">
        <nav>
          <p className="rotulo text-muted-foreground">El camino</p>
          <ul className="mt-2.5 flex flex-col gap-2">
            {CAMINO.map((p) => (
              <li key={p.n}>
                <Link
                  href={p.href}
                  className="text-[14.5px] text-foreground/85 hover:text-foreground hover:underline underline-offset-2"
                >
                  {p.titulo}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav>
          <p className="rotulo text-muted-foreground">Más</p>
          <ul className="mt-2.5 flex flex-col gap-2">
            {BIBLIOTECA.map((b) => (
              <li key={b.href}>
                <Link
                  href={b.href}
                  className="text-[14.5px] text-foreground/85 hover:text-foreground hover:underline underline-offset-2"
                >
                  {b.titulo}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/entrar"
                className="text-[14.5px] text-foreground/85 hover:text-foreground hover:underline underline-offset-2"
              >
                Entrar
              </Link>
            </li>
          </ul>
        </nav>

        <div className="col-span-2 border-t pt-6">
          <p className="text-[14px] leading-relaxed text-foreground/85">
            GrillosIA es una investigación de la{" "}
            <span className="font-semibold">Universidad de los Llanos</span>{" "}
            sobre la cría de grillos y la optimización de su dieta mediante
            inteligencia artificial.
          </p>
          <p className="mt-3 text-[13.5px] leading-relaxed text-muted-foreground">
            Financiada por Minciencias, convocatoria 963 de 2025, contrato
            207-2025. Investigadora principal: Dra. Mónica Paola Higuera-Díaz.
          </p>
          <p className="mt-4 text-[13px] leading-relaxed text-muted-foreground">
            Los resultados de este proyecto están en construcción. Lo que la
            aplicación le sugiere es orientativo y se irá afinando con los
            análisis de laboratorio.
          </p>
          <p className="rotulo mt-4 text-muted-foreground">
            Villavicencio, Meta · {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
}
