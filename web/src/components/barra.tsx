"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { SiteNav } from "@/components/site-nav";
import { BIBLIOTECA, CAMINO } from "@/lib/camino";
import { cn } from "@/lib/utils";

/**
 * Barra superior del sitio.
 *
 * SIN numeracion, a proposito. Los numeros de parada pertenecen al camino,
 * donde dicen cuanto falta; en una barra de navegacion no significan nada y
 * hacen que el sitio entero parezca un formulario.
 *
 * En escritorio despliega la navegacion completa en horizontal, como
 * cualquier pagina web. En celular se repliega al menu lateral, que es el que
 * ya existia. Es la misma informacion en dos formas, no dos navegaciones.
 * */
export function Barra({ transparente = false }: { transparente?: boolean }) {
  const pathname = usePathname();

  return (
    <header
      className={cn(
        "w-full",
        transparente
          ? "absolute inset-x-0 top-0 z-30"
          : "border-b bg-background",
      )}
    >
      <div className="mx-auto flex w-full max-w-[1180px] items-center justify-between gap-6 px-5 py-4 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <Image
            src="/logo.png"
            alt=""
            width={38}
            height={38}
            priority
            className={cn(transparente && "brightness-0 invert")}
          />
          <span
            className={cn(
              "font-display text-[19px] font-bold tracking-[-0.02em]",
              transparente && "text-[#F4F1E7]",
            )}
          >
            GrillosIA
          </span>
        </Link>

        {/* Escritorio */}
        <nav className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {CAMINO.map((p) => (
              <li key={p.n}>
                <Link
                  href={p.href}
                  className={cn(
                    "flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 text-[14.5px] font-semibold transition-colors xl:px-3.5 xl:text-[15px]",
                    transparente
                      ? "text-[#E4E0D2] hover:bg-white/10 hover:text-white"
                      : "text-foreground/80 hover:bg-muted hover:text-foreground",
                    pathname === p.href &&
                      (transparente ? "text-white" : "text-primary"),
                  )}
                >
                  {p.titulo}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          {/* Biblioteca, solo en escritorio: en celular vive en el menu */}
          <nav className="hidden lg:flex lg:items-center lg:gap-1">
            {BIBLIOTECA.map((b) => (
              <Link
                key={b.href}
                href={b.href}
                className={cn(
                  "rounded-full px-3 py-2 text-[14.5px] font-medium transition-colors",
                  transparente
                    ? "text-[#B9B5A6] hover:text-white"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {b.titulo}
              </Link>
            ))}
          </nav>
          <div className={cn("lg:hidden", transparente && "[&_button]:border-white/30 [&_button]:text-white")}>
            <SiteNav />
          </div>
        </div>
      </div>
    </header>
  );
}
