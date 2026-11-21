"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

import { LogoGoogle } from "@/components/logo-google";
import { useGrillosiaSession } from "@/components/session-gate";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AUTH_ENABLED } from "@/lib/auth-flag";

/**
 * La cuenta en la cabecera de escritorio (en el celular vive en el menu).
 *
 * No va en todas las paginas: en la guia de cria (caja, grillos, donde
 * buscarlos) la persona esta aprendiendo y un "Entrar" la distrae; tampoco
 * en /entrar, que ya es la pantalla de entrar. Sale donde tiene sentido
 * guardar algo: el inicio, Mis consultas, el resultado y El proyecto.
 */
const SIN_CUENTA = ["/caja", "/grillos", "/recoleccion", "/entrar"];

export function CuentaCabecera() {
  const pathname = usePathname() ?? "";
  const { signedIn, loading, name, email, image } = useGrillosiaSession();

  if (!AUTH_ENABLED || loading) return null;
  if (SIN_CUENTA.some((r) => pathname.startsWith(r))) return null;

  if (!signedIn) {
    return (
      <Link
        href="/entrar"
        className="inline-flex h-9 items-center gap-2 rounded-md px-3 text-[14.5px] font-medium text-subtle transition-colors hover:bg-foreground/[0.04] hover:text-foreground"
      >
        <LogoGoogle className="size-4" />
        Entrar
      </Link>
    );
  }

  const inicial = (name ?? email ?? "?").trim().charAt(0).toUpperCase();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Su cuenta"
        className="flex size-9 items-center justify-center overflow-hidden rounded-full bg-primary-soft font-display text-[15px] font-semibold text-primary ring-1 ring-border transition-shadow hover:ring-border-strong"
      >
        {image ? (
          // Foto de la cuenta de Google: viene de otro dominio, sin optimizar.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" referrerPolicy="no-referrer" className="size-full object-cover" />
        ) : (
          inicial
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex flex-col gap-0.5 py-2">
          <span className="truncate text-[14.5px] font-semibold text-foreground">{name ?? "Su cuenta"}</span>
          {email && <span className="truncate text-[12.5px] font-normal text-subtle">{email}</span>}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/consultas">Mis consultas</Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => void signOut({ callbackUrl: "/" })}>
          <LogOut className="size-4" />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
