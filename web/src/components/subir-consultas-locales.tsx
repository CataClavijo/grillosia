"use client";

import { useEffect, useRef } from "react";

import { useGrillosiaSession } from "@/components/session-gate";
import { clearLocal, readLocal } from "@/lib/projects-local";

const HECHO_KEY = "grillia-consultas-subidas";

/**
 * Sube a la cuenta las consultas que el productor tenía en el dispositivo
 * antes de iniciar sesión.
 *
 * Alguien puede usar la aplicación un buen rato sin cuenta y crear varias
 * consultas; si al iniciar sesión desaparecieran, la cuenta se sentiría como
 * un castigo. Corre una sola vez por dispositivo: el servidor además rechaza
 * la subida si la cuenta ya tiene consultas, de modo que entrar desde un
 * segundo teléfono no duplica nada.
 */
export function SubirConsultasLocales() {
  const { signedIn } = useGrillosiaSession();
  const enCurso = useRef(false);

  useEffect(() => {
    if (!signedIn || enCurso.current) return;

    try {
      if (window.localStorage.getItem(HECHO_KEY) === "1") return;
    } catch {
      return;
    }

    const locales = readLocal().projects;
    if (locales.length === 0) {
      try {
        window.localStorage.setItem(HECHO_KEY, "1");
      } catch {
        /* noop */
      }
      return;
    }

    enCurso.current = true;

    void (async () => {
      try {
        const res = await fetch("/api/consultas/importar", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ projects: locales }),
        });
        if (!res.ok) return;

        window.localStorage.setItem(HECHO_KEY, "1");
        // Solo se borra lo local cuando el servidor confirmó que las tiene.
        clearLocal();
      } catch {
        // Sin señal lo intentamos en la próxima visita.
      } finally {
        enCurso.current = false;
      }
    })();
  }, [signedIn]);

  return null;
}
