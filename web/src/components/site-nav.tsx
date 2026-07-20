"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bug,
  FlaskConical,
  FolderOpen,
  GraduationCap,
  Home,
  Menu,
  MessageCircle,
  Package,
  School,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { ProjectSwitcher } from "@/components/project-switcher";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  description: string;
}

const ITEMS: NavItem[] = [
  {
    href: "/",
    label: "Inicio",
    icon: Home,
    description: "Volver a la página principal.",
  },
  {
    href: "/tutorial",
    label: "Cómo empezar",
    icon: GraduationCap,
    description: "Recorrido guiado en pocos pasos.",
  },
  {
    href: "/catalogo",
    label: "Grillos que estudiamos",
    icon: Bug,
    description: "Fichas de los grillos del Piedemonte Llanero.",
  },
  {
    href: "/como-armar",
    label: "Cómo armar sus cajas",
    icon: Package,
    description: "Guía paso a paso para el espacio de cría.",
  },
  {
    href: "/wizard",
    label: "Consulta paso a paso",
    icon: Sparkles,
    description: "Le sugerimos una dieta según su caso.",
  },
  {
    href: "/chat",
    label: "Preguntas al equipo",
    icon: MessageCircle,
    description: "Pregunte sobre el proyecto.",
  },
  {
    href: "/proyectos",
    label: "Mis consultas",
    icon: FolderOpen,
    description: "Sus consultas guardadas para volver después.",
  },
  {
    href: "/proyecto",
    label: "Quiénes somos",
    icon: School,
    description: "Universidad de los Llanos · Minciencias.",
  },
];

/**
 * Navegación principal. La página /metodologia queda fuera de esta lista a
 * propósito: es contenido académico que intimida al productor. Vive en el
 * pie del panel y en el footer del sitio, bajo "Para investigadores".
 */
export function SiteNav({ variant = "full" }: { variant?: "full" | "focused" }) {
  const [open, setOpen] = useState(false);

  // Variante enfocada: durante un flujo guiado no mostramos nada que
  // distraiga o permita salirse sin querer.
  if (variant === "focused") {
    return <ThemeToggle />;
  }

  return (
    <div className="flex items-center gap-2">
      <ProjectSwitcher />
      <ThemeToggle />

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

        <SheetContent side="right" className="w-full gap-0 sm:max-w-[380px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 text-base">
              <span
                aria-hidden
                className="inline-flex size-8 items-center justify-center rounded-lg bg-primary/10"
              >
                <span className="block size-2 rotate-45 bg-primary" />
              </span>
              GrillIA
            </SheetTitle>
            <SheetDescription className="sr-only">
              Navegación principal de la aplicación
            </SheetDescription>
          </SheetHeader>

          <Separator />

          <nav className="flex-1 overflow-y-auto p-3">
            <ul className="flex flex-col gap-1">
              {ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <SheetClose asChild>
                      <Link
                        href={item.href}
                        className="flex min-h-16 items-start gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
                      >
                        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <Icon className="size-5" strokeWidth={1.75} />
                        </span>
                        <span className="flex flex-1 flex-col gap-0.5">
                          <span className="text-base font-semibold text-foreground">
                            {item.label}
                          </span>
                          <span className="text-[13px] leading-snug text-muted-foreground">
                            {item.description}
                          </span>
                        </span>
                      </Link>
                    </SheetClose>
                  </li>
                );
              })}
            </ul>
          </nav>

          <SheetFooter className="gap-2 border-t">
            <SheetClose asChild>
              <Link
                href="/metodologia"
                className="flex min-h-11 items-center gap-2 rounded-lg px-2 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <FlaskConical className="size-4" strokeWidth={2} />
                Para investigadores: metodología técnica
              </Link>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
