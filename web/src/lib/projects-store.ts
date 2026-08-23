"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";

import { useGrillosiaSession } from "@/components/session-gate";
import { useLocalProjects } from "@/lib/projects-local";
import { useRemoteProjects } from "@/lib/projects-remote";
import type { ProjectsApi } from "@/lib/projects-types";

export type {
  ChatMessage,
  Project,
  ProjectSelection,
  ProjectsApi,
} from "@/lib/projects-types";
export { tieneResultado } from "@/lib/projects-types";

/**
 * Punto único de acceso a las consultas del usuario.
 *
 * Con sesión abierta lee y escribe en la nube; sin sesión, en el navegador.
 * Los dos almacenes se instancian siempre —las reglas de los hooks no
 * permiten llamar a uno u otro según el caso— pero el remoto no toca la red
 * mientras no haya sesión.
 */
export function useProjects(): ProjectsApi {
  const { signedIn } = useGrillosiaSession();
  const local = useLocalProjects();
  const remote = useRemoteProjects(signedIn);
  return signedIn ? remote : local;
}

/**
 * Hook para las pantallas que exigen una consulta abierta.
 */
export function useActiveProject() {
  const { active } = useProjects();
  return active;
}

/* ── recorrido de bienvenida ─────────────────────────────────────────────── */

const TUTORIAL_KEY = "grillia-tutorial-seen";

function subscribeTutorial(cb: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === TUTORIAL_KEY) cb();
  };
  window.addEventListener("storage", onStorage);
  return () => window.removeEventListener("storage", onStorage);
}

function readTutorialSeen(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(TUTORIAL_KEY) === "1";
  } catch {
    return true;
  }
}

function serverTutorialSnapshot() {
  return true;
}

export function useTutorialSeen(): {
  seen: boolean;
  markSeen: () => void;
  reset: () => void;
} {
  const seen = useSyncExternalStore(
    subscribeTutorial,
    readTutorialSeen,
    serverTutorialSnapshot,
  );

  const markSeen = useCallback(() => {
    try {
      window.localStorage.setItem(TUTORIAL_KEY, "1");
    } catch {
      /* noop */
    }
  }, []);

  const reset = useCallback(() => {
    try {
      window.localStorage.removeItem(TUTORIAL_KEY);
    } catch {
      /* noop */
    }
  }, []);

  useEffect(() => {}, [seen]);

  return { seen, markSeen, reset };
}
