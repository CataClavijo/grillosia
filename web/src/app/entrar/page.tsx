"use client";

import { Suspense, useState } from "react";
import Link from "next/link";

import { Barra } from "@/components/barra";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EncabezadoSeccion } from "@/components/ds/encabezado-seccion";
import { Estado } from "@/components/ds/estado";
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
    <>
      <Barra />
      <main className="mx-auto flex w-full max-w-[600px] flex-col px-5 pt-14 pb-24 lg:pt-24">
        <EncabezadoSeccion
          as="h1"
          tamano="h1"
          rotulo="Cuenta"
          titulo="Guarde sus consultas en su cuenta"
          entrada="Hoy sus consultas se guardan solo en este teléfono. Si entra con su cuenta de Google, quedan guardadas para usted y las puede ver también desde otro dispositivo."
        />
        <p className="t-small mt-4 text-subtle">
          No es obligatorio. Puede seguir usando GrillosIA sin cuenta, como
          hasta ahora.
        </p>

        <div className="mt-10">
          {/* useSearchParams obliga a un límite de suspensión para que la
              página pueda seguir siendo estática. */}
          <Suspense fallback={<div className="h-[52px]" />}>
            <Entrada />
          </Suspense>
        </div>
      </main>
    </>
  );
}

function Entrada() {
  const params = useSearchParams();
  const [enviando, setEnviando] = useState(false);
  const huboError = Boolean(params.get("error"));

  if (!AUTH_ENABLED) {
    return (
      <Estado
        tipo="pendiente"
        titulo="Todavía no está disponible"
        accion={
          <Link
            href="/"
            className="text-[15px] font-semibold text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
          >
            Volver al inicio
          </Link>
        }
      >
        Estamos terminando de habilitar las cuentas. Mientras tanto sus
        consultas se guardan en este teléfono y no se pierden.
      </Estado>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {huboError && (
        <Estado tipo="error" titulo="No pudimos entrar con esa cuenta" compacto>
          Intente de nuevo. Sus consultas siguen guardadas en este teléfono.
        </Estado>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button
          size="lg"
          disabled={enviando}
          onClick={() => {
            setEnviando(true);
            void signIn("google", { callbackUrl: "/consultas" });
          }}
        >
          {enviando && <Loader2 className="animate-spin" />}
          {enviando ? "Abriendo Google…" : "Entrar con Google"}
        </Button>
        <Button asChild variant="ghost" size="lg">
          <Link href="/">Seguir sin cuenta</Link>
        </Button>
      </div>
    </div>
  );
}
