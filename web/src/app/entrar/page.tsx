"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { ChevronLeft, CloudUpload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AUTH_ENABLED } from "@/lib/auth-flag";

/**
 * Pantalla de inicio de sesión.
 *
 * Entrar es opcional a propósito: toda la aplicación funciona sin cuenta. Lo
 * que la cuenta añade es que las consultas dejen de vivir solo en un teléfono.
 * El texto lo explica en esos términos, no en los de la tecnología.
 */
export default function EntrarPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100dvh-42px)] w-full max-w-[520px] flex-col px-6 pb-16 pt-5">
      <header>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center gap-1 rounded-full px-3 py-2 text-[15px] font-semibold text-foreground/85 transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-5" />
          Inicio
        </Link>
      </header>

      <section className="mt-12 flex flex-col gap-4">
        <span
          aria-hidden
          className="inline-flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"
        >
          <CloudUpload className="size-7" strokeWidth={1.5} />
        </span>

        <h1 className="text-[1.85rem] font-bold leading-tight tracking-[-0.02em]">
          Guarde sus consultas en su cuenta
        </h1>

        <p className="text-[16px] leading-relaxed text-foreground/85">
          Hoy sus consultas se guardan solo en este teléfono. Si entra con su
          cuenta de Google, quedan guardadas para usted y las puede ver también
          desde otro dispositivo.
        </p>

        <p className="text-[15px] leading-relaxed text-muted-foreground">
          No es obligatorio. Puede seguir usando GrillosIA sin cuenta, como hasta
          ahora.
        </p>
      </section>

      <div className="mt-auto">
        {/* useSearchParams obliga a un límite de suspensión para que la página
            pueda seguir siendo estática. */}
        <Suspense fallback={<div className="h-[68px]" />}>
          <Entrada />
        </Suspense>
      </div>
    </main>
  );
}

function Entrada() {
  const params = useSearchParams();
  const [enviando, setEnviando] = useState(false);
  const huboError = Boolean(params.get("error"));

  if (!AUTH_ENABLED) {
    return (
      <div className="flex flex-col gap-3 rounded-2xl border border-demo-border bg-demo-bg p-4">
        <p className="text-[14px] font-bold text-demo-foreground">
          Todavía no está disponible
        </p>
        <p className="text-[13.5px] leading-relaxed text-demo-foreground">
          Estamos terminando de habilitar las cuentas. Mientras tanto sus
          consultas se guardan en este teléfono y no se pierden.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {huboError && (
        <p className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-[14px] leading-relaxed text-destructive">
          No pudimos entrar con esa cuenta. Intente de nuevo.
        </p>
      )}

      <Button
        size="lg"
        disabled={enviando}
        onClick={() => {
          setEnviando(true);
          void signIn("google", { callbackUrl: "/proyectos" });
        }}
        className="h-[68px] w-full rounded-2xl text-[18px] font-bold"
      >
        {enviando ? "Abriendo Google…" : "Entrar con Google"}
      </Button>

      <Link
        href="/"
        className="flex min-h-14 items-center justify-center text-[16px] font-semibold text-foreground/85 underline underline-offset-4 hover:text-foreground"
      >
        Seguir sin cuenta
      </Link>
    </div>
  );
}
