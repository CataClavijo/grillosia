"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

import type {
  ChatMessage,
  Project,
  ProjectSelection,
  ProjectsApi,
} from "@/lib/projects-types";

/**
 * Almacén de consultas en el navegador.
 *
 * Es el modo por defecto: sin cuenta, sin servidor, todo en el dispositivo.
 * Las funciones son asíncronas aunque no lo necesiten, para cumplir el mismo
 * contrato que el almacén de la nube.
 */

interface ProjectsState {
  version: 1;
  projects: Project[];
  activeId: string | null;
}

const STORAGE_KEY = "grillia-projects";
const EMPTY: ProjectsState = { version: 1, projects: [], activeId: null };

/* ── lectura y escritura ─────────────────────────────────────────────────── */

/**
 * useSyncExternalStore exige que la instantánea conserve la misma referencia
 * mientras el estado no cambie. Sin este caché, cada lectura haría un
 * JSON.parse nuevo y React entraría en un bucle de renderizados.
 */
let cachedRaw: string | null | undefined;
let cachedState: ProjectsState = EMPTY;

export function readLocal(): ProjectsState {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === cachedRaw) return cachedState;
    cachedRaw = raw;
    if (!raw) {
      cachedState = EMPTY;
      return cachedState;
    }
    const parsed = JSON.parse(raw) as ProjectsState;
    cachedState =
      parsed?.version === 1 && Array.isArray(parsed.projects) ? parsed : EMPTY;
    return cachedState;
  } catch {
    cachedState = EMPTY;
    return cachedState;
  }
}

function write(next: ProjectsState) {
  if (typeof window === "undefined") return;
  try {
    const serialized = JSON.stringify(next);
    window.localStorage.setItem(STORAGE_KEY, serialized);
    cachedRaw = serialized;
    cachedState = next;
    window.dispatchEvent(new Event("grillia:projects"));
  } catch {
    // El almacenamiento puede estar lleno o deshabilitado.
  }
}

/** Vacía el almacén local. Se usa tras subir las consultas a la cuenta. */
export function clearLocal() {
  write(EMPTY);
}

function uid(): string {
  return (
    "p_" +
    Math.random().toString(36).slice(2, 9) +
    Math.random().toString(36).slice(2, 5)
  );
}

/* ── suscripción ─────────────────────────────────────────────────────────── */

function subscribe(cb: () => void) {
  const onCustom = () => cb();
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) cb();
  };
  window.addEventListener("grillia:projects", onCustom);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener("grillia:projects", onCustom);
    window.removeEventListener("storage", onStorage);
  };
}

function serverSnapshot(): ProjectsState {
  return EMPTY;
}

/* ── hook ────────────────────────────────────────────────────────────────── */

export function useLocalProjects(): ProjectsApi {
  const state = useSyncExternalStore(subscribe, readLocal, serverSnapshot);

  const active = useMemo<Project | null>(() => {
    if (!state.activeId) return null;
    return state.projects.find((p) => p.id === state.activeId) ?? null;
  }, [state]);

  const create = useCallback(
    async (name: string, selection: ProjectSelection = {}) => {
      const now = Date.now();
      const id = uid();
      const project: Project = {
        id,
        name: name.trim() || "Mi consulta",
        createdAt: now,
        updatedAt: now,
        selection,
        chat: [],
      };
      const current = readLocal();
      write({
        ...current,
        projects: [...current.projects, project],
        activeId: id,
      });
      return id;
    },
    [],
  );

  const setActive = useCallback((id: string | null) => {
    const current = readLocal();
    write({ ...current, activeId: id });
  }, []);

  const rename = useCallback(async (id: string, name: string) => {
    const current = readLocal();
    write({
      ...current,
      projects: current.projects.map((p) =>
        p.id === id ? { ...p, name: name.trim(), updatedAt: Date.now() } : p,
      ),
    });
  }, []);

  const remove = useCallback(async (id: string) => {
    const current = readLocal();
    const remaining = current.projects.filter((p) => p.id !== id);
    write({
      ...current,
      projects: remaining,
      activeId:
        current.activeId === id ? (remaining[0]?.id ?? null) : current.activeId,
    });
  }, []);

  const updateSelection = useCallback(
    async (id: string, patch: Partial<ProjectSelection>) => {
      const current = readLocal();
      write({
        ...current,
        projects: current.projects.map((p) =>
          p.id === id
            ? {
                ...p,
                selection: { ...p.selection, ...patch },
                updatedAt: Date.now(),
              }
            : p,
        ),
      });
    },
    [],
  );

  const appendMessage = useCallback(
    async (id: string, message: Omit<ChatMessage, "id" | "createdAt">) => {
      const current = readLocal();
      const msg: ChatMessage = {
        ...message,
        id: `m_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
        createdAt: Date.now(),
      };
      write({
        ...current,
        projects: current.projects.map((p) =>
          p.id === id
            ? { ...p, chat: [...p.chat, msg], updatedAt: Date.now() }
            : p,
        ),
      });
    },
    [],
  );

  const clearChat = useCallback(async (id: string) => {
    const current = readLocal();
    write({
      ...current,
      projects: current.projects.map((p) =>
        p.id === id ? { ...p, chat: [], updatedAt: Date.now() } : p,
      ),
    });
  }, []);

  return {
    projects: state.projects,
    active,
    activeId: state.activeId,
    loading: false,
    create,
    setActive,
    rename,
    remove,
    updateSelection,
    appendMessage,
    clearChat,
  };
}
