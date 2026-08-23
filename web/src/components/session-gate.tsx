"use client";

import { createContext, useContext, type ReactNode } from "react";
import { SessionProvider, useSession } from "next-auth/react";

import { AUTH_ENABLED } from "@/lib/auth-flag";

/**
 * Estado de sesión propio de la aplicación.
 *
 * Existe para que ningún componente llame a `useSession` de Auth.js
 * directamente: ese hook exige estar dentro de su proveedor, y el proveedor
 * solo se monta cuando la cuenta en la nube está activada. Con este contexto
 * de por medio, el resto de la aplicación lee siempre un `useContext` normal
 * y funciona igual con la cuenta apagada.
 */

interface SessionState {
  signedIn: boolean;
  loading: boolean;
  name: string | null;
  email: string | null;
  image: string | null;
}

const APAGADA: SessionState = {
  signedIn: false,
  loading: false,
  name: null,
  email: null,
  image: null,
};

const Ctx = createContext<SessionState>(APAGADA);

export function useGrillosiaSession(): SessionState {
  return useContext(Ctx);
}

function DesdeAuthjs({ children }: { children: ReactNode }) {
  const { data, status } = useSession();
  const value: SessionState = {
    signedIn: Boolean(data?.user),
    loading: status === "loading",
    name: data?.user?.name ?? null,
    email: data?.user?.email ?? null,
    image: data?.user?.image ?? null,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function SessionGate({ children }: { children: ReactNode }) {
  if (!AUTH_ENABLED) {
    return <Ctx.Provider value={APAGADA}>{children}</Ctx.Provider>;
  }

  return (
    <SessionProvider>
      <DesdeAuthjs>{children}</DesdeAuthjs>
    </SessionProvider>
  );
}
