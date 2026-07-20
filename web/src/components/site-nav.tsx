"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Book,
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
    label: "Tutorial",
    icon: GraduationCap,
    description: "Recorrido guiado de 5 pasos.",
  },
  {
    href: "/catalogo",
    label: "Grillos",
    icon: Bug,
    description: "Grillos nativos del Piedemonte Llanero.",
  },
  {
    href: "/como-armar",
    label: "Cómo armar las cajas",
    icon: Package,
    description: "Guía paso a paso para el espacio de cría.",
  },
  {
    href: "/wizard",
    label: "Asistente guiado",
    icon: Sparkles,
    description: "Comparamos dietas según su caso.",
  },
  {
    href: "/chat",
    label: "Chat informativo",
    icon: MessageCircle,
    description: "Pregunte sobre el proyecto.",
  },
  {
    href: "/proyectos",
    label: "Mis proyectos",
    icon: FolderOpen,
    description: "Gestione sus proyectos de cría.",
  },
  {
    href: "/metodologia",
    label: "Metodología",
    icon: FlaskConical,
    description: "Cómo estudiamos y modelamos.",
  },
  {
    href: "/proyecto",
    label: "Sobre el proyecto",
    icon: School,
    description: "Universidad de los Llanos · Minciencias 963-2025.",
  },
];

export function SiteNav() {
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

  return (
    <div className="flex items-center gap-2">
      <ProjectSwitcher />
      <ThemeToggle />
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir menú"
        className="inline-flex size-9 items-center justify-center rounded-full border border-border bg-card/60 text-foreground/80 transition-colors hover:border-primary/40 hover:text-foreground"
      >
        <Menu className="h-4 w-4" strokeWidth={2} />
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
                  className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10"
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
                className="inline-flex size-9 items-center justify-center rounded-full text-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
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
                        className="flex items-start gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-muted"
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <Icon className="h-5 w-5" strokeWidth={1.75} />
                        </span>
                        <span className="flex flex-1 flex-col gap-0.5">
                          <span className="text-[15px] font-semibold text-foreground">
                            {item.label}
                          </span>
                          <span className="text-[12.5px] leading-snug text-foreground/60">
                            {item.description}
                          </span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
            <div className="border-t border-border p-4 text-[11.5px] text-foreground/55">
              <p className="font-semibold text-foreground/75">
                Versión demostrativa
              </p>
              <p className="mt-1 leading-relaxed">
                <Book className="mr-1 inline h-3 w-3 -translate-y-px" />
                Consulte el manual en el repositorio del proyecto.
              </p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
