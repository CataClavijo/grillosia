"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { SiteNav } from "@/components/site-nav";
import { CAMINO } from "@/lib/camino";
import { cn } from "@/lib/utils";

/**
 * Barra superior del sitio, como en los disenos de referencia: marca con su
 * lema a la izquierda, las seis secciones en el centro y un unico boton
 * "Comenzar consulta" a la derecha.
 *
 * SIN numeracion, a proposito: los numeros de parada pertenecen al camino,
 * donde dicen cuanto falta. En una barra de navegacion no significan nada y
 * hacen que el sitio entero parezca un formulario.
 *
 * El logo va SIEMPRE en su color original. Un logo que cambia de color segun
 * el fondo deja de ser el logo.
 */
const SECCIONES = [
  { href: "/", titulo: "Inicio" },
  ...CAMINO.map((p) => ({ href: p.href, titulo: p.titulo })),
  { href: "/proyecto", titulo: "Sobre GrillosIA" },
];

export function Barra({
  className,
}: {
  /**
   * Va sobre la propia cabecera, no sobre un envoltorio.
   *
   * Envolverla en un `div` para esconderla en celular le quitaba el `sticky`:
   * un elemento pegajoso solo se mueve dentro de su padre, y ese `div` medía
   * lo mismo que la barra, asi que no tenia recorrido y se iba en cuanto se
   * bajaba un poco.
   */
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b border-border/70 bg-background/95 backdrop-blur",
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-[1240px] items-center justify-between gap-5 px-5 py-3 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <Image
            src="/logo.png"
            alt=""
            width={40}
            height={40}
            priority
            className="size-10"
          />
          <span className="flex flex-col leading-none">
            <span className="font-display text-[25px] font-medium tracking-[-0.01em]">
              GrillosIA
            </span>
            <span className="mt-1 hidden font-display text-[12.5px] text-foreground/70 sm:block">
              Inteligencia natural para decisiones reales
            </span>
          </span>
        </Link>

        <nav className="hidden lg:block" aria-label="Secciones">
          <ul className="flex items-center gap-0.5">
            {SECCIONES.map((p) => {
              const activa = pathname === p.href;
              return (
                <li key={p.href}>
                  <Link
                    href={p.href}
                    aria-current={activa ? "page" : undefined}
                    className={cn(
                      "relative flex items-center whitespace-nowrap px-2.5 py-2 text-[14.5px] font-medium text-foreground/80 transition-colors hover:text-foreground xl:px-3 xl:text-[15px]",
                      activa &&
                        "text-foreground after:absolute after:inset-x-2.5 after:-bottom-[13px] after:h-[2px] after:rounded-full after:bg-primary xl:after:inset-x-3",
                    )}
                  >
                    {p.titulo}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/consulta"
            className="hidden min-h-11 items-center gap-2 rounded-md bg-primary px-4 text-[14.5px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 lg:inline-flex"
          >
            Comenzar consulta
            <ArrowRight className="size-4" />
          </Link>
          <div className="lg:hidden">
            <SiteNav />
          </div>
        </div>
      </div>
    </header>
  );
}
