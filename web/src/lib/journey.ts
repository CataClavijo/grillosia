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

/**
 * El puntero guarda en que parada del camino va, con los mismos numeros que
 * ve el productor en pantalla. Los valores viejos del tutorial se mapean a la
 * parada 1 para no perder el progreso de quien ya venia usando la aplicacion.
 */
export type Paso = "inicio" | "1" | "2" | "3" | "listo";

export interface SiguientePaso {
  label: string;
  href: string;
  /** Numero de parada, para que la landing lo diga en el boton. */
  n: number;
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

/** Unico lugar que decide que boton ve el productor en el inicio. */
export function siguientePaso(p: Paso): SiguientePaso {
  // Punteros del esquema anterior: se traen a la parada 1 para no perder el
  // progreso de quien ya venia usando la aplicacion.
  const crudo = String(p);
  if (crudo.startsWith("tutorial")) {
    return { label: "Arme su caja", href: "/caja", n: 1 };
  }
  if (crudo === "wizard") {
    return { label: "Haga su consulta", href: "/consulta", n: 3 };
  }

  switch (p) {
    case "1":
      return { label: "Arme su caja", href: "/caja", n: 1 };
    case "2":
      return { label: "Conozca sus grillos", href: "/grillos", n: 2 };
    case "3":
    case "listo":
      return { label: "Haga su consulta", href: "/consulta", n: 3 };
    default:
      return { label: "Arme su caja", href: "/caja", n: 1 };
  }
}
