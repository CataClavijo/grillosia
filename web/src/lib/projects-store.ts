/**
 * Store de mini-proyectos de cría.
 *
 * Cada proyecto guarda: nombre, animal destino, etapa, condiciones climáticas
 * indicadas por el usuario y el hilo de mensajes del chat asociado. El usuario
 * puede tener varios en paralelo (p. ej. uno para tilapia y otro para pollo)
 * y cambiar entre ellos.
 *
 * Persistencia: localStorage por ahora. En una rama futura este mismo hook
 * se reemplaza por uno que consulte Postgres vía Auth.js (feature flag
 * NEXT_PUBLIC_ENABLE_AUTH). El resto de la app no se entera del cambio.
 */
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  text: string;
  /** Milisegundos desde epoch. */
  createdAt: number;
  /** Enlaces opcionales que el chat sugiere (p. ej. ir al tutorial). */
  links?: Array<{ label: string; href: string }>;
}

export interface ProjectSelection {
  animalId?: string;
  stageId?: string;
  temp?: number;
  humidity?: number;
}

export interface Project {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  selection: ProjectSelection;
  chat: ChatMessage[];
}

interface ProjectsState {
  version: 1;
  projects: Project[];
  /** id del proyecto activo. */
  activeId: string | null;
}

const STORAGE_KEY = "grillia-projects";
const EMPTY: ProjectsState = { version: 1, projects: [], activeId: null };

/* ── storage helpers ────────────────────────────────────────────────────── */

function read(): ProjectsState {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as ProjectsState;
    if (parsed?.version !== 1 || !Array.isArray(parsed.projects)) return EMPTY;
    return parsed;
  } catch {
    return EMPTY;
  }
}

function write(next: ProjectsState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    // Notifica a las otras pestañas y a nuestros suscriptores locales.
    window.dispatchEvent(new Event("grillia:projects"));
  } catch {
    // silencio: storage lleno o deshabilitado.
  }
}

function uid(): string {
  return (
    "p_" +
    Math.random().toString(36).slice(2, 9) +
    Math.random().toString(36).slice(2, 5)
  );
}

/* ── suscripción para useSyncExternalStore ──────────────────────────────── */

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

/* ── API pública ────────────────────────────────────────────────────────── */

export function useProjects() {
  const state = useSyncExternalStore(subscribe, read, serverSnapshot);

  const active = useMemo<Project | null>(() => {
    if (!state.activeId) return null;
    return state.projects.find((p) => p.id === state.activeId) ?? null;
  }, [state]);

  const create = useCallback((name: string): string => {
    const now = Date.now();
    const id = uid();
    const project: Project = {
      id,
      name: name.trim() || "Mi proyecto",
      createdAt: now,
      updatedAt: now,
      selection: {},
      chat: [],
    };
    const current = read();
    write({
      ...current,
      projects: [...current.projects, project],
      activeId: id,
    });
    return id;
  }, []);

  const setActive = useCallback((id: string | null) => {
    const current = read();
    write({ ...current, activeId: id });
  }, []);

  const rename = useCallback((id: string, name: string) => {
    const current = read();
    write({
      ...current,
      projects: current.projects.map((p) =>
        p.id === id ? { ...p, name: name.trim(), updatedAt: Date.now() } : p,
      ),
    });
  }, []);

  const remove = useCallback((id: string) => {
    const current = read();
    const remaining = current.projects.filter((p) => p.id !== id);
    write({
      ...current,
      projects: remaining,
      activeId:
        current.activeId === id
          ? (remaining[0]?.id ?? null)
          : current.activeId,
    });
  }, []);

  const updateSelection = useCallback(
    (id: string, patch: Partial<ProjectSelection>) => {
      const current = read();
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
    (id: string, message: Omit<ChatMessage, "id" | "createdAt">) => {
      const current = read();
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
      return msg;
    },
    [],
  );

  const clearChat = useCallback((id: string) => {
    const current = read();
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
    create,
    setActive,
    rename,
    remove,
    updateSelection,
    appendMessage,
    clearChat,
  };
}

/**
 * Hook usado por rutas que EXIGEN un proyecto activo. Si no hay ninguno,
 * el componente puede pedirle al usuario que cree uno.
 */
export function useActiveProject(): Project | null {
  const { active } = useProjects();
  return active;
}

/**
 * Hook para marcar el estado de haber visto el tutorial de bienvenida.
 * Es independiente del store de proyectos para no acoplarlo con la sesión.
 */
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

  // Cierra el warning de "unused variable" en Server Components hidratados.
  useEffect(() => {}, [seen]);

  return { seen, markSeen, reset };
}
