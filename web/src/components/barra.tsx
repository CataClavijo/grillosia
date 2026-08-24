"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { SiteNav } from "@/components/site-nav";
import { BIBLIOTECA, CAMINO } from "@/lib/camino";
import { cn } from "@/lib/utils";

/**
 * Barra superior del sitio.
 *
 * SIN numeracion, a proposito: los numeros de parada pertenecen al camino,
 * donde dicen cuanto falta. En una barra de navegacion no significan nada y
 * hacen que el sitio entero parezca un formulario.
 *
 * Sobre la portada empieza transparente, montada sobre el heroe, y al bajar
 * se vuelve solida. Asi la navegacion nunca se pierde de vista pero tampoco
 * tapa la imagen de entrada.
 *
 * El logo va SIEMPRE en su color original, dentro de un disco claro. Antes se
 * invertia a blanco sobre el heroe, y un logo que cambia de color segun el
 * fondo deja de ser el logo. El disco resuelve el contraste sin tocar la
 * marca.
 */
export function Barra({ sobreHeroe = false }: { sobreHeroe?: boolean }) {
  const pathname = usePathname();
  const [bajado, setBajado] = useState(false);

  useEffect(() => {
    if (!sobreHeroe) return;
    // Umbral generoso: cambiar de color en los primeros pixeles produce un
    // parpadeo cada vez que alguien mueve el dedo.
    const alMover = () => setBajado(window.scrollY > 120);
    alMover();
    window.addEventListener("scroll", alMover, { passive: true });
    return () => window.removeEventListener("scroll", alMover);
  }, [sobreHeroe]);

  // Transparente solo mientras se esta arriba del todo en la portada.
  const claro = sobreHeroe && !bajado;

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-colors duration-300",
        claro
          ? "bg-transparent"
          : "border-b border-border/70 bg-background/95 backdrop-blur",
      )}
    >
      <div className="mx-auto flex w-full max-w-[1180px] items-center justify-between gap-6 px-5 py-3 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <span
            className={cn(
              "flex size-10 items-center justify-center rounded-full transition-colors",
              claro ? "bg-[#F4F1E7]" : "bg-transparent",
            )}
          >
            <Image
              src="/logo.png"
              alt=""
              width={36}
              height={36}
              priority
              className={cn("size-9", claro && "size-8")}
            />
          </span>
          <span
            className={cn(
              "font-display text-[19px] font-bold tracking-[-0.02em] transition-colors",
              claro && "text-[#F4F1E7]",
            )}
          >
            GrillosIA
          </span>
        </Link>

        <nav className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {CAMINO.map((p) => (
              <li key={p.n}>
                <Link
                  href={p.href}
                  className={cn(
                    "flex items-center whitespace-nowrap rounded-full px-3 py-2 text-[14.5px] font-semibold transition-colors xl:px-3.5 xl:text-[15px]",
                    claro
                      ? "text-[#E4E0D2] hover:bg-white/10 hover:text-white"
                      : "text-foreground/80 hover:bg-muted hover:text-foreground",
                    pathname === p.href && !claro && "text-primary",
                  )}
                >
                  {p.titulo}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <nav className="hidden lg:flex lg:items-center lg:gap-1">
            {BIBLIOTECA.map((b) => (
              <Link
                key={b.href}
                href={b.href}
                className={cn(
                  "whitespace-nowrap rounded-full px-3 py-2 text-[14.5px] font-medium transition-colors",
                  claro
                    ? "text-[#B9B5A6] hover:text-white"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {b.titulo}
              </Link>
            ))}
          </nav>
          <div
            className={cn(
              "lg:hidden",
              // El boton del menu trae fondo claro propio; sobre el heroe
              // hay que apagarlo tambien, o el icono blanco queda invisible
              // sobre su propio fondo.
              claro &&
                "[&_button]:border-white/45 [&_button]:bg-transparent [&_button]:text-white [&_button:hover]:bg-white/10 [&_button:hover]:text-white",
            )}
          >
            <SiteNav />
          </div>
        </div>
      </div>
    </header>
  );
}
