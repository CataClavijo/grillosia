"use client";

import Link from "next/link";
import { RotateCcw } from "lucide-react";

import { Estado } from "@/components/ds/estado";
import { Button } from "@/components/ui/button";

/**
 * Error de una pagina. Explica en palabras simples que paso y que hacer,
 * sin mostrar nada tecnico.
 */
export default function AppError({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-[560px] flex-col justify-center px-5 py-16">
      <Estado
        tipo="error"
        titulo="No pudimos mostrar esta página"
        accion={
          <Button onClick={reset}>
            <RotateCcw />
            Intentar de nuevo
          </Button>
        }
      >
        Sus consultas siguen guardadas. Si le vuelve a pasar, puede{" "}
        <Link
          href="/reset"
          className="font-semibold text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
        >
          restablecer la aplicación
        </Link>
        .
      </Estado>
    </main>
  );
}
