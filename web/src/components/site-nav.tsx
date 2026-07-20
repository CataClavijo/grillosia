"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Book,
  Bug,
  FolderOpen,
  GraduationCap,
  Home,
  Menu,
  MessageCircle,
  Package,
  School,
  Sparkles,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

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
 * Nav lateral con menú hamburguesa. La página /metodologia queda fuera del
 * menú principal — está disponible en el footer bajo "Para investigadores"
 * para no intimidar al productor con jerga académica en la navegación.
 */
export function SiteNav({ variant = "full" }: { variant?: "full" | "focused" }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  // Variante "focused": para flujos guiados (wizard, tutorial), no mostramos
  // nada distractor — el back arriba a la izquierda ya es suficiente.
  if (variant === "focused") {
    return (
      <div className="flex items-center gap-2">
        <ThemeToggle />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <ProjectSwitcher />
      <ThemeToggle />
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir menú"
        className="inline-flex size-11 items-center justify-center rounded-full border border-border bg-card/60 text-foreground/85 transition-colors hover:border-primary/40 hover:text-foreground"
      >
        <Menu className="h-5 w-5" strokeWidth={2} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-foreground/40 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}
        >
          <aside
            onClick={(e) => e.stopPropagation()}
            className="flex h-full w-full max-w-[380px] flex-col bg-background shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2">
                <span
                  aria-hidden
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10"
                >
                  <span className="block h-2 w-2 rotate-45 bg-primary" />
                </span>
                <span className="text-base font-bold tracking-tight">
                  GrillIA
                </span>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar menú"
                className="inline-flex size-11 items-center justify-center rounded-full text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-3">
              <ul className="flex flex-col gap-1">
                {ITEMS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className="flex min-h-[64px] items-start gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-muted"
                      >
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <Icon className="h-5 w-5" strokeWidth={1.75} />
                        </span>
                        <span className="flex flex-1 flex-col gap-0.5">
                          <span className="text-[16px] font-semibold text-foreground">
                            {item.label}
                          </span>
                          <span className="text-[13px] leading-snug text-foreground/70">
                            {item.description}
                          </span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
            <div className="border-t border-border p-4 text-[12px] text-foreground/70">
              <p className="font-semibold text-foreground/90">En pruebas</p>
              <p className="mt-1 leading-relaxed">
                <Book className="mr-1 inline h-3 w-3 -translate-y-px" />
                <Link
                  href="/metodologia"
                  onClick={() => setOpen(false)}
                  className="underline underline-offset-2"
                >
                  Metodología técnica (para investigadores)
                </Link>
              </p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
