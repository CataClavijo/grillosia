"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { LogIn, LogOut } from "lucide-react";

import { useGrillosiaSession } from "@/components/session-gate";
import { AUTH_ENABLED } from "@/lib/auth-flag";

/**
 * Estado de la cuenta dentro del menú.
 *
 * Con las cuentas apagadas no se muestra nada: un botón de entrar que no lleva
 * a ningún sitio confunde más de lo que informa.
 */
export function SessionBlock({ onNavigate }: { onNavigate?: () => void }) {
  const { signedIn, loading, name, email } = useGrillosiaSession();

  if (!AUTH_ENABLED || loading) return null;

  if (!signedIn) {
    return (
      <Link
        href="/entrar"
        onClick={onNavigate}
        className="flex min-h-14 items-center gap-3 rounded-xl px-4 text-[16px] font-semibold text-primary transition-colors hover:bg-muted"
      >
        <LogIn className="size-4" strokeWidth={2} />
        Entrar con Google
      </Link>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="px-4 py-2">
        <p className="truncate text-[15px] font-semibold">
          {name ?? "Su cuenta"}
        </p>
        {email && (
          <p className="truncate text-[13px] text-muted-foreground">{email}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => void signOut({ callbackUrl: "/" })}
        className="flex min-h-14 items-center gap-3 rounded-xl px-4 text-left text-[15px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <LogOut className="size-4" strokeWidth={2} />
        Cerrar sesión
      </button>
    </div>
  );
}
