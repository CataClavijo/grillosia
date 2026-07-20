"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, RefreshCcw } from "lucide-react";

/**
 * Página de rescate.
 *
 * Se sirve con headers `Clear-Site-Data: "storage", "cache"` (definido en
 * vercel.json). Cuando el navegador la carga, el service worker viejo se
 * desregistra automáticamente y se borran caches + localStorage. Después de
 * ~3s redirige a /.
 *
 * Uso: quien tenga la app rota con "This page couldn't load" abre
 * https://grilliaa.vercel.app/reset una vez y queda limpio. La ruta también
 * llama activamente a unregister() como defensa en profundidad, por si el
 * header no fuera respetado.
 */
export default function ResetPage() {
  const [count, setCount] = useState(3);
  const [step, setStep] = useState<"cleaning" | "done">("cleaning");

  useEffect(() => {
    if (typeof window === "undefined") return;

    (async () => {
      try {
        if ("serviceWorker" in navigator) {
          const regs = await navigator.serviceWorker.getRegistrations();
          await Promise.all(regs.map((r) => r.unregister()));
        }
      } catch {
        /* noop */
      }
      try {
        if ("caches" in window) {
          const keys = await caches.keys();
          await Promise.all(keys.map((k) => caches.delete(k)));
        }
      } catch {
        /* noop */
      }
      setStep("done");
    })();

    const tick = setInterval(() => {
      setCount((c) => {
        if (c <= 1) {
          clearInterval(tick);
          window.location.replace("/");
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(tick);
  }, []);

  return (
    <main className="mx-auto flex min-h-[calc(100vh-96px)] w-full max-w-[520px] flex-col items-center justify-center px-6 pb-16 pt-5">
      <span
        aria-hidden
        className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary"
      >
        {step === "done" ? (
          <CheckCircle2 className="h-8 w-8" strokeWidth={2} />
        ) : (
          <RefreshCcw className="h-8 w-8 animate-spin" strokeWidth={2} />
        )}
      </span>

      <h1 className="mt-6 text-center text-[1.75rem] font-bold leading-tight tracking-[-0.02em]">
        {step === "done" ? "Listo, quedó limpio" : "Limpiando la aplicación…"}
      </h1>

      <p className="mt-3 max-w-[36ch] text-center text-[16px] leading-relaxed text-foreground/85">
        {step === "done"
          ? `Le llevamos al inicio en ${count}…`
          : "Estamos borrando datos antiguos del navegador. No cerramos la pestaña, ni recargue."}
      </p>

      {step === "done" && (
        <Link
          href="/"
          className="mt-8 inline-flex min-h-[52px] items-center justify-center rounded-2xl bg-primary px-6 py-3 text-[16px] font-bold text-primary-foreground"
        >
          Ir al inicio ahora
        </Link>
      )}

      <p className="mt-10 max-w-[36ch] text-center text-[12.5px] text-foreground/70">
        Esta página está pensada para casos raros en los que el navegador
        guardó una versión antigua y no la actualiza solo.
      </p>
    </main>
  );
}
