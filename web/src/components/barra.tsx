"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

import { Logo } from "@/components/logo";
import { SiteNav } from "@/components/site-nav";
import { Progreso } from "@/components/ds/progreso";
import { CAMINO, TOTAL_PARADAS } from "@/lib/camino";
import { cn } from "@/lib/utils";

/**
 * Cabecera del sitio. Es la MISMA en todas las paginas, con dos pesos:
 *
 *  - `sitio` (portada, Sobre GrillosIA, biblioteca): marca, las seis
 *    secciones y "Comenzar consulta". Al bajar se reduce de 76 a 60 px y
 *    aparece una linea fina.
 *
 *  - `camino` (las cuatro paradas): la navegacion sigue en su sitio pero
 *    pasa a segundo plano (enlaces atenuados), el boton da paso a "Paso 3
 *    de 4 · Consulta" y la barra fina del borde inferior marca el progreso.
 *    Antes la barra se cambiaba entera por una version minima y el menu
 *    parecia desaparecer de la nada.
 *
 * El cambio de tema (claro/oscuro) no vive aqui: esta en el menu y en el pie.
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

  // Una sola cabecera para todo el sitio: la navegacion NO desaparece al
  // entrar al camino (eso se sentia como si el menu se esfumara). En el
  // camino solo cambia de peso: los enlaces se atenuan, el boton de
  // "Comenzar consulta" deja su lugar a "Paso 3 de 4 · Consulta" y aparece
  // la barra fina de progreso en el borde inferior.
  const enCamino = modo === "camino" && !!paso;
  const etiqueta = enCamino
    ? `Paso ${paso} de ${TOTAL_PARADAS} · ${CORTO[paso!] ?? ""}`
    : "";

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
                      "relative flex h-9 items-center whitespace-nowrap rounded-md px-2.5 font-medium transition-[color,font-size] duration-[var(--dur-media)]",
                      enCamino ? "text-[14px]" : "text-[14.5px]",
                      activa
                        ? "text-foreground"
                        : enCamino
                          ? "text-faint hover:text-foreground"
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

        <div className="flex shrink-0 items-center gap-2">
          {enCamino ? (
            <p className="t-eyebrow whitespace-nowrap text-subtle">
              Paso {paso} de {TOTAL_PARADAS}
              <span className="hidden sm:inline"> · {CORTO[paso!] ?? ""}</span>
            </p>
          ) : (
            <Link
              href="/consulta"
              className="hidden h-10 items-center gap-2 rounded-md bg-primary px-4 text-[14.5px] font-semibold text-primary-foreground transition-colors duration-150 hover:bg-primary-hover lg:inline-flex"
            >
              Comenzar consulta
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
