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
    document.documentElement.classList.toggle("dark", next);
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
      aria-label="Cambiar tema"
      className="size-9 rounded-full border-foreground/10 text-foreground/70 hover:text-foreground"
    >
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}
