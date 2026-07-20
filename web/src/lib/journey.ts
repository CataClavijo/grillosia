/**
 * Puntero del recorrido del usuario.
 *
 * Un solo valor en localStorage dice en qué punto del camino va. La landing
 * lo lee para decidir qué dice su único botón, así el usuario nunca tiene que
 * acordarse de dónde quedó ni elegir entre varias opciones.
 *
 * No hay barra flotante global a propósito: en un recorrido de tres pantallas
 * encadenadas, el camino lo llevan los botones de cada pantalla.
 */

const KEY = "grillia:paso";
const STAMP_KEY = "grillia:paso:fecha";

/** Caduca el puntero a los 60 días: nadie recuerda en qué paso iba. */
const CADUCIDAD_MS = 60 * 24 * 60 * 60 * 1000;

export type Paso =
  | "inicio"
  | "tutorial:1"
  | "tutorial:2"
  | "tutorial:3"
  | "wizard"
  | "listo";

export interface SiguientePaso {
  label: string;
  href: string;
}

export function leerPaso(): Paso {
  if (typeof window === "undefined") return "inicio";
  try {
    const stamp = Number(window.localStorage.getItem(STAMP_KEY) ?? "0");
    if (stamp && Date.now() - stamp > CADUCIDAD_MS) return "inicio";
    return (window.localStorage.getItem(KEY) as Paso) ?? "inicio";
  } catch {
    return "inicio";
  }
}

export function marcarPaso(p: Paso) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, p);
    window.localStorage.setItem(STAMP_KEY, String(Date.now()));
    window.dispatchEvent(new Event("grillia:paso"));
  } catch {
    /* noop */
  }
}

/** Único lugar que decide qué botón ve el usuario en la landing. */
export function siguientePaso(p: Paso): SiguientePaso {
  if (p === "inicio") {
    return { label: "Comience aquí", href: "/tutorial" };
  }
  if (p.startsWith("tutorial")) {
    return { label: "Siga donde quedó", href: "/tutorial" };
  }
  return { label: "Ver qué comida le conviene", href: "/wizard" };
}

/** Índice del paso del tutorial guardado (0-based), para retomarlo. */
export function indiceTutorialGuardado(): number {
  const p = leerPaso();
  if (!p.startsWith("tutorial:")) return 0;
  const n = Number(p.split(":")[1]);
  return Number.isFinite(n) ? Math.max(0, n - 1) : 0;
}
