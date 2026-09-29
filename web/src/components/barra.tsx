"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

import { Logo } from "@/components/logo";
import { SiteNav } from "@/components/site-nav";
import { Progreso } from "@/components/ds/progreso";
import { TOTAL_PARADAS } from "@/lib/camino";
import { cn } from "@/lib/utils";

/**
 * Cabecera del sitio. La misma en todas las paginas.
 *
 * Esta ordenada alrededor de lo principal: HACER LA CONSULTA, que es la que
 * le dice al productor que comida conviene. Por eso:
 *  - a la derecha, siempre visible, el boton "Hacer mi consulta" (en celular
 *    tambien, compacto, al lado del menu);
 *  - a la izquierda, separado, lo que se aprende: la guia de cria (caja y
 *    grillos) y "Sobre GrillosIA";
 *  - "Mis consultas" junto al boton, porque es volver a lo mismo.
 * "Inicio" no va (el logo lleva al inicio) y "Vea su resultado" tampoco:
 * el resultado se alcanza haciendo o abriendo una consulta.
 *
 * En el camino guiado (modo `camino`) la cabecera no cambia de forma: solo
 * aparece la barra fina de progreso abajo, y en las paradas 3 y 4 el boton
 * da paso a "Paso 3 de 4 · Consulta", porque la persona ya esta en ella.
 *
 * El cambio de tema (claro/oscuro) esta en el menu y en el pie.
 */
const APRENDER = [
  { href: "/caja", titulo: "Arme su caja" },
  { href: "/grillos", titulo: "Conozca sus grillos" },
];
const PROYECTO = { href: "/proyecto", titulo: "Sobre GrillosIA" };

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

  const enCamino = modo === "camino" && !!paso;
  const enConsulta = enCamino && paso! >= 3;
  const etiqueta = enCamino
    ? `Paso ${paso} de ${TOTAL_PARADAS} · ${CORTO[paso!] ?? ""}`
    : "";

  const enlace = (href: string, titulo: string) => {
    const activa = pathname === href;
    return (
      <Link
        href={href}
        aria-current={activa ? "page" : undefined}
        className={cn(
          "relative flex h-9 items-center whitespace-nowrap rounded-md px-3 text-[14.5px] font-medium transition-colors duration-150",
          activa ? "text-foreground" : "text-subtle hover:text-foreground",
        )}
      >
        {titulo}
        {activa && (
          <span
            aria-hidden
            className="absolute inset-x-3 -bottom-px h-[2px] rounded-full bg-primary"
          />
        )}
      </Link>
    );
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full bg-background/90 backdrop-blur-md",
        !enCamino && "border-b transition-[border-color] duration-[var(--dur-media)]",
        !enCamino && (bajado ? "border-border" : "border-transparent"),
        className,
      )}
    >
      <div
        className={cn(
          "mx-auto flex w-full max-w-[1240px] items-center gap-4 px-5 transition-[height] duration-[var(--dur-media)] ease-[var(--ease-natural)] lg:gap-8 lg:px-8",
          bajado ? "h-[60px]" : "h-[64px] lg:h-[72px]",
        )}
      >
        <Link href="/" aria-label="GrillosIA, ir al inicio" className="shrink-0">
          <Logo variante={bajado ? "compacto" : "completo"} prioridad className="hidden lg:inline-flex" />
          <Logo variante="compacto" prioridad className="lg:hidden" />
        </Link>

        {/* Lo que se aprende: a la izquierda, junto a la marca. */}
        <nav className="hidden lg:block" aria-label="Guía y proyecto">
          <ul className="flex items-center">
            <li className="t-eyebrow mr-1 text-faint" aria-hidden>
              Guía
            </li>
            {APRENDER.map((a) => (
              <li key={a.href}>{enlace(a.href, a.titulo)}</li>
            ))}
            <li aria-hidden className="mx-2 h-4 w-px bg-border-strong" />
            <li>{enlace(PROYECTO.href, PROYECTO.titulo)}</li>
          </ul>
        </nav>

        {/* Lo principal: la consulta, a la derecha. */}
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <Link
            href="/consultas"
            className={cn(
              "hidden h-10 items-center rounded-md px-3 text-[14.5px] font-medium transition-colors lg:inline-flex",
              pathname === "/consultas"
                ? "text-foreground"
                : "text-subtle hover:text-foreground",
            )}
          >
            Mis consultas
          </Link>
          {enConsulta ? (
            <p className="t-eyebrow whitespace-nowrap text-subtle">
              Paso {paso} de {TOTAL_PARADAS}
              <span className="hidden sm:inline"> · {CORTO[paso!] ?? ""}</span>
            </p>
          ) : (
            <Link
              href="/consulta"
              className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3.5 text-[14px] font-semibold text-primary-foreground transition-colors duration-150 hover:bg-primary-hover lg:h-10 lg:px-4 lg:text-[14.5px]"
            >
              <span className="lg:hidden">Consultar</span>
              <span className="hidden lg:inline">Hacer mi consulta</span>
              <ArrowRight className="size-4" />
            </Link>
          )}
          <div className="lg:hidden">
            <SiteNav />
          </div>
        </div>
      </div>
      {enCamino && <Progreso valor={paso!} total={TOTAL_PARADAS} etiqueta={etiqueta} />}
    </header>
  );
}
