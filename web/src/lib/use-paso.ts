"use client";

import { useEffect, useState } from "react";

import {
  leerPaso,
  siguientePaso,
  type Paso,
  type SiguientePaso,
} from "@/lib/journey";

/**
 * Lee el puntero del recorrido después del montaje para no desajustar la
 * hidratación: el servidor no conoce el localStorage del usuario.
 *
 * `listo` permite renderizar el estado por defecto mientras tanto y evitar
 * que el botón parpadee cambiando de texto.
 */
export function usePaso(): {
  paso: Paso;
  listo: boolean;
  siguiente: SiguientePaso;
} {
  const [paso, setPaso] = useState<Paso>("inicio");
  const [listo, setListo] = useState(false);

  useEffect(() => {
    setPaso(leerPaso());
    setListo(true);

    const sync = () => setPaso(leerPaso());
    window.addEventListener("grillia:paso", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("grillia:paso", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return { paso, listo, siguiente: siguientePaso(paso) };
}
