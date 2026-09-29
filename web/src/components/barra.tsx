"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

import { Logo } from "@/components/logo";
import { SiteNav } from "@/components/site-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { Progreso } from "@/components/ds/progreso";
import { CAMINO, TOTAL_PARADAS } from "@/lib/camino";
import { cn } from "@/lib/utils";

/**
 * Cabecera del sitio. Dos modos:
 *
 *  - `sitio` (portada, Sobre GrillosIA, biblioteca): marca, las seis
 *    secciones y "Comenzar consulta". Al bajar se reduce de 76 a 60 px, el
 *    lema se oculta y aparece una linea fina: al leer, la navegacion
 *    estorba menos.
 *
 *  - `camino` (las cuatro paradas): la navegacion pasa a segundo plano para
 *    que la persona se concentre en la tarea. Solo marca compacta, "Paso 3
 *    de 4 · Consulta" y el menu. La barra fina de abajo es el progreso: una
 *    sola senal, en vez de rotulo + circulos + lineas diciendo lo mismo.
 *
 * SIN numeracion en la navegacion del modo `sitio`: los numeros pertenecen al
 * camino, donde dicen cuanto falta.
 */
const SECCIONES = [
  { href: "/", titulo: "Inicio" },
  ...CAMINO.map((p) => ({ href: p.href, titulo: p.titulo })),
  { href: "/proyecto", titulo: "Sobre GrillosIA" },
];

/** Nombre corto de cada parada para la cabecera del camino. */
const CORTO: Record<number, string> = {
  1: "Caja",
  2: "Grillos",
  3: "Consulta",
  4: "Resultado",
};

export function Barra({
  modo = "sitio",
  paso,
  className,
}: {
  modo?: "sitio" | "camino";
  /** Numero de la parada, en modo `camino`. */
  paso?: number;
  className?: string;
}) {
  const pathname = usePathname();
  const [bajado, setBajado] = useState(false);

  useEffect(() => {
    const alMover = () => setBajado(window.scrollY > 24);
    alMover();
    window.addEventListener("scroll", alMover, { passive: true });
    return () => window.removeEventListener("scroll", alMover);
  }, []);

  if (modo === "camino" && paso) {
    const etiqueta = `Paso ${paso} de ${TOTAL_PARADAS} · ${CORTO[paso] ?? ""}`;
    return (
      <header
        className={cn(
          "sticky top-0 z-40 w-full bg-background/90 backdrop-blur-md",
          className,
        )}
      >
        <div className="mx-auto flex h-14 w-full max-w-[1240px] items-center justify-between gap-4 px-5 lg:h-16 lg:px-8">
          <Link href="/" aria-label="GrillosIA, ir al inicio" className="shrink-0">
            <Logo variante="compacto" />
          </Link>
          <p className="t-eyebrow truncate text-subtle">
            Paso {paso} de {TOTAL_PARADAS}
            <span className="hidden sm:inline"> · {CORTO[paso] ?? ""}</span>
          </p>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <SiteNav />
          </div>
        </div>
        <Progreso valor={paso} total={TOTAL_PARADAS} etiqueta={etiqueta} />
      </header>
    );
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b bg-background/90 backdrop-blur-md transition-[border-color] duration-[var(--dur-media)]",
        bajado ? "border-border" : "border-transparent",
        className,
      )}
    >
      <div
        className={cn(
          "mx-auto flex w-full max-w-[1240px] items-center justify-between gap-6 px-5 transition-[height] duration-[var(--dur-media)] ease-[var(--ease-natural)] lg:px-8",
          bajado ? "h-[60px]" : "h-[68px] lg:h-[76px]",
        )}
      >
        <Link href="/" aria-label="GrillosIA, ir al inicio" className="shrink-0">
          <Logo variante={bajado ? "compacto" : "completo"} prioridad className="hidden lg:inline-flex" />
          <Logo variante="compacto" prioridad className="lg:hidden" />
        </Link>

        <nav className="hidden lg:block" aria-label="Secciones">
          <ul className="flex items-center gap-1 xl:gap-2">
            {SECCIONES.map((p) => {
              const activa = pathname === p.href;
              return (
                <li key={p.href}>
                  <Link
                    href={p.href}
                    aria-current={activa ? "page" : undefined}
                    className={cn(
                      "relative flex h-9 items-center whitespace-nowrap rounded-md px-2.5 text-[14.5px] font-medium transition-colors duration-150",
                      activa
                        ? "text-foreground"
                        : "text-subtle hover:text-foreground",
                    )}
                  >
                    {p.titulo}
                    {activa && (
                      <span
                        aria-hidden
                        className="absolute inset-x-2.5 -bottom-px h-[2px] rounded-full bg-primary"
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex shrink-0 items-center gap-1.5">
          <ThemeToggle />
          <Link
            href="/consulta"
            className="hidden h-10 items-center gap-2 rounded-md bg-primary px-4 text-[14.5px] font-semibold text-primary-foreground transition-colors duration-150 hover:bg-primary-hover lg:inline-flex"
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
