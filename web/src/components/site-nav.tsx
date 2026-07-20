"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";

/** El camino principal. Sin descripciones: la etiqueta ya lo dice. */
const CAMINO = [
  { href: "/", label: "Inicio" },
  { href: "/tutorial", label: "La guía" },
  { href: "/catalogo", label: "Los tres grillos" },
  { href: "/como-armar", label: "Armar la caja" },
  { href: "/wizard", label: "Qué comida usar" },
  { href: "/proyectos", label: "Mis consultas" },
];

/**
 * Fuera del camino: se consultan, no se recorren.
 *
 * El asistente no aparece aquí a propósito. Conversa sobre el resultado de
 * una consulta, así que se llega a él desde el resultado del asistente
 * guiado, no como destino suelto.
 */
const SECUNDARIO = [{ href: "/proyecto", label: "Quiénes somos" }];

export function SiteNav({ variant = "full" }: { variant?: "full" | "focused" }) {
  const [open, setOpen] = useState(false);

  // Durante un flujo guiado no mostramos nada: la flecha de atrás basta.
  if (variant === "focused") return null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label="Abrir menú"
          className="size-11 rounded-full"
        >
          <Menu />
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full gap-0 sm:max-w-[340px]">
        <SheetHeader>
          <SheetTitle className="text-base">GrillIA</SheetTitle>
          <SheetDescription className="sr-only">
            Navegación principal
          </SheetDescription>
        </SheetHeader>

        <Separator />

        <nav className="flex-1 overflow-y-auto p-2">
          <ul className="flex flex-col">
            {CAMINO.map((item) => (
              <li key={item.href}>
                <SheetClose asChild>
                  <Link
                    href={item.href}
                    className="flex min-h-14 items-center rounded-xl px-4 text-[17px] font-semibold transition-colors hover:bg-muted"
                  >
                    {item.label}
                  </Link>
                </SheetClose>
              </li>
            ))}
          </ul>

          <Separator className="my-2" />

          <ul className="flex flex-col">
            {SECUNDARIO.map((item) => (
              <li key={item.href}>
                <SheetClose asChild>
                  <Link
                    href={item.href}
                    className="flex min-h-14 items-center rounded-xl px-4 text-[16px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                </SheetClose>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex min-h-16 items-center justify-between border-t px-4">
          <span className="text-[16px] font-medium">Modo oscuro</span>
          <ThemeToggle />
        </div>
      </SheetContent>
    </Sheet>
  );
}
