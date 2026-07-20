"use client";

import { useEffect } from "react";

/**
 * Registra el service worker que sirve el shell offline-first.
 * Solo en producción para no interferir con Turbopack en desarrollo.
 */
export default function SwRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return;

    const onLoad = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* silencio: no romper la app si el SW falla */
      });
    };

    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  return null;
}
