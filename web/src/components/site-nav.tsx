"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu } from "lucide-react";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Logo } from "@/components/logo";
import { SessionBlock } from "@/components/session-block";
import { ThemeToggle, useTemaOscuro } from "@/components/theme-toggle";
import { CAMINO } from "@/lib/camino";
import { cn } from "@/lib/utils";

/**
 * Menu de celular (y del camino guiado en escritorio).
 *
 * No es el menu de escritorio encogido: esta pensado para el pulgar. Arriba,
 * lo principal: hacer la consulta (y volver a las guardadas). Debajo, la guia
 * de cria y lo demas. Filas de 48 a 56 px.
 */
const OTRAS = [
  { href: "/proyecto", titulo: "Sobre GrillosIA" },
  { href: "/", titulo: "Inicio" },
];

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const oscuro = useTemaOscuro();
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Abrir menú"
          className="inline-flex h-10 items-center gap-2 rounded-md px-3 text-[14.5px] font-medium text-foreground/85 transition-colors hover:bg-surface-2 hover:text-foreground"
        >
          <Menu className="size-[18px]" />
          <span className="hidden sm:inline">Menú</span>
        </button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full gap-0 border-l bg-background data-[side=right]:w-full sm:max-w-[400px] data-[side=right]:sm:max-w-[400px]">
        <SheetHeader className="px-5 pt-5 pb-2">
          <SheetTitle asChild>
            <div>
              <Logo variante="compacto" />
            </div>
          </SheetTitle>
          <SheetDescription className="sr-only">Navegación principal</SheetDescription>
        </SheetHeader>

        <nav className="flex-1 overflow-y-auto px-3 pb-4" aria-label="Menú">
          {/* Lo principal primero: la consulta. */}
          <div className="mx-2 mt-4 rounded-lg bg-surface-2 p-4">
            <p className="t-h4">¿Qué comida les conviene a sus grillos?</p>
            <p className="mt-1 text-[14px] leading-snug text-subtle">
              Cuéntenos su animal y su clima, y comparamos las tres comidas en
              estudio para su caso.
            </p>
            <SheetClose asChild>
              <Link
                href="/consulta"
                className="mt-3 flex h-12 items-center justify-center gap-2 rounded-md bg-primary text-[16px] font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
              >
                Hacer mi consulta
                <ArrowRight className="size-4" />
              </Link>
            </SheetClose>
            <SheetClose asChild>
              <Link
                href="/consultas"
                className="mt-1 flex h-11 items-center justify-center text-[15px] font-medium text-foreground/85 hover:text-foreground"
              >
                Mis consultas guardadas
              </Link>
            </SheetClose>
          </div>

          <p className="t-eyebrow px-2 pt-6 pb-2 text-faint">Guía de cría</p>
          <ul className="flex flex-col">
            {CAMINO.filter((p) => p.n <= 2).map((p) => {
              const activa = pathname === p.href;
              return (
                <li key={p.href}>
                  <SheetClose asChild>
                    <Link
                      href={p.href}
                      aria-current={activa ? "page" : undefined}
                      className={cn(
                        "flex min-h-14 items-start gap-4 rounded-md px-2 py-3 transition-colors hover:bg-surface-2",
                        activa && "bg-surface-2",
                      )}
                    >
                      <span className="flex flex-col">
                        <span className="text-[16px] font-semibold leading-snug">{p.titulo}</span>
                        <span className="text-[14px] leading-snug text-subtle">{p.resumen}</span>
                      </span>
                    </Link>
                  </SheetClose>
                </li>
              );
            })}
          </ul>

          <p className="t-eyebrow px-2 pt-6 pb-2 text-faint">Más</p>
          <ul className="flex flex-col">
            {OTRAS.map((o) => (
              <li key={o.href}>
                <SheetClose asChild>
                  <Link
                    href={o.href}
                    aria-current={pathname === o.href ? "page" : undefined}
                    className="flex min-h-12 items-center rounded-md px-2 text-[16px] font-medium text-foreground/85 transition-colors hover:bg-surface-2 hover:text-foreground"
                  >
                    {o.titulo}
                  </Link>
                </SheetClose>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex flex-col gap-1 border-t px-5 pt-4 pb-[calc(env(safe-area-inset-bottom)+16px)]">
          <SessionBlock onNavigate={() => setOpen(false)} />
          <div className="flex min-h-12 items-center justify-between">
            <span className="text-[15px] text-subtle">
              {oscuro ? "Modo claro" : "Modo oscuro"}
            </span>
            <ThemeToggle />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
