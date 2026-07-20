"use client";

import { useEffect } from "react";

/**
 * Rescate de usuarios con un service worker viejo instalado.
 *
 * El navegador solo descarga una versión nueva de /sw.js cuando ocurre una
 * navegación de nivel superior o cuando alguien llama registration.update().
 * Un usuario cuya home está rota nunca completa una navegación, así que el
 * kill-switch nunca le llega por sí solo. Este componente cierra ese hueco:
 * en cada carga fuerza el update y el unregister de cualquier registro
 * existente, y recarga una única vez cuando el kill-switch avisa.
 *
 * Es idempotente y pesa unos cientos de bytes. Debe permanecer al menos
 * doce meses para alcanzar a los usuarios que vuelven con poca frecuencia.
 */
export function SwKillBoot() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    const RELOAD_KEY = "grillia-sw-killed-reloaded";

    const onMessage = (event: MessageEvent) => {
      if (event.data?.type !== "SW_KILLED") return;
      try {
        if (window.sessionStorage.getItem(RELOAD_KEY) === "1") return;
        window.sessionStorage.setItem(RELOAD_KEY, "1");
      } catch {
        // Si sessionStorage falla, preferimos no recargar en bucle.
        return;
      }
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener("message", onMessage);

    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => {
        for (const registration of registrations) {
          registration.update().catch(() => {});
          registration.unregister().catch(() => {});
        }
      })
      .catch(() => {});

    return () => {
      navigator.serviceWorker.removeEventListener("message", onMessage);
    };
  }, []);

  return null;
}
