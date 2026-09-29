"use client";

import { useSyncExternalStore, useCallback } from "react";
import { Sun, Moon } from "lucide-react";

import { Button } from "@/components/ui/button";

const STORAGE_KEY = "grillia-theme";

function subscribe(cb: () => void) {
  const observer = new MutationObserver(cb);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

function getSnapshot() {
  return document.documentElement.classList.contains("dark");
}

function getServerSnapshot() {
  return false;
}

/**
 * Si la aplicacion esta en oscuro ahora mismo.
 *
 * Lo usa el menu para rotular la fila con lo que va a pasar al pulsar, en
 * lugar de con el estado actual: "Modo oscuro" estando ya en oscuro se lee
 * como una etiqueta, no como un boton.
 */
export function useTemaOscuro(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function ThemeToggle() {
  const dark = useTemaOscuro();

  const toggle = useCallback(() => {
    const next = !dark;
    const raiz = document.documentElement;
    raiz.classList.add("cambiando-tema");
    raiz.classList.toggle("dark", next);
    window.setTimeout(() => raiz.classList.remove("cambiando-tema"), 350);
    try {
      localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
    } catch {
      /* ignore */
    }
  }, [dark]);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label={dark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      title={dark ? "Modo claro" : "Modo oscuro"}
      className="size-10 rounded-md text-foreground/75 hover:text-foreground [&_svg]:transition-transform [&_svg]:duration-300 hover:[&_svg]:rotate-[20deg]"
    >
      {dark ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
    </Button>
  );
}

/**
 * Cambio de tema con texto, para el pie: "Modo oscuro" / "Modo claro".
 * Es un enlace sobrio, no un icono suelto en la cabecera.
 */
export function CambioTema({ className = "" }: { className?: string }) {
  const dark = useTemaOscuro();
  const toggle = useCallback(() => {
    const next = !dark;
    const raiz = document.documentElement;
    raiz.classList.add("cambiando-tema");
    raiz.classList.toggle("dark", next);
    window.setTimeout(() => raiz.classList.remove("cambiando-tema"), 350);
    try {
      localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
    } catch {
      /* ignore */
    }
  }, [dark]);
  return (
    <button
      type="button"
      onClick={toggle}
      className={`inline-flex min-h-10 items-center gap-2 rounded-md text-[14px] font-medium text-subtle transition-colors hover:text-foreground ${className}`}
    >
      {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
      {dark ? "Modo claro" : "Modo oscuro"}
    </button>
  );
}
