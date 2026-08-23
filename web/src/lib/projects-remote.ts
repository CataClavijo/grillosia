"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  ACTIVE_KEY,
  type ChatMessage,
  type Project,
  type ProjectSelection,
  type ProjectsApi,
} from "@/lib/projects-types";

/**
 * Almacén de consultas en la nube.
 *
 * Aplica cada cambio en pantalla antes de que el servidor conteste, para que
 * la aplicación no se sienta lenta con una conexión rural. Si la petición
 * falla, vuelve a pedir la lista al servidor y con eso el estado local se
 * corrige solo.
 */

/**
 * Marca de "ninguna consulta abierta, a propósito".
 *
 * Hay que separar dos situaciones que un simple null confunde: quien entra
 * desde otro teléfono nunca ha elegido consulta y espera encontrar la última
 * que hizo, mientras que quien acaba de pulsar "hacer una consulta nueva"
 * espera el asistente en blanco. La ausencia de la clave significa lo primero;
 * esta marca, lo segundo.
 */
const NINGUNA = "__ninguna__";

/** `undefined` = nunca se eligió · `null` = se soltó a propósito. */
function readActiveId(): string | null | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = window.localStorage.getItem(ACTIVE_KEY);
    if (raw === null) return undefined;
    return raw === NINGUNA ? null : raw;
  } catch {
    return undefined;
  }
}

function writeActiveId(id: string | null) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ACTIVE_KEY, id ?? NINGUNA);
  } catch {
    /* noop */
  }
}

/**
 * @param enabled Cierto solo cuando hay sesión abierta. Con la cuenta apagada
 * este hook igual se ejecuta —las reglas de los hooks no permiten saltárselo—
 * pero no toca la red.
 */
export function useRemoteProjects(enabled: boolean): ProjectsApi {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeId, setActiveIdState] = useState<string | null | undefined>(undefined);
  const [loading, setLoading] = useState(enabled);

  const refetch = useCallback(async () => {
    if (!enabled) return;
    try {
      const res = await fetch("/api/consultas");
      if (!res.ok) return;
      const data = (await res.json()) as { projects: Project[] };
      setProjects(data.projects ?? []);
    } catch {
      // Sin señal nos quedamos con lo último que se cargó.
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      setProjects([]);
      setLoading(false);
      return;
    }
    setActiveIdState(readActiveId());
    setLoading(true);
    void refetch().finally(() => setLoading(false));
  }, [enabled, refetch]);

  /**
   * Al entrar desde otro teléfono no hay ninguna consulta marcada como
   * abierta, porque esa marca vive en el dispositivo. Sin este respaldo el
   * asistente diría "primero haga su consulta" a alguien que tiene varias
   * guardadas: cuando nunca se eligió, se abre la más reciente, que es la
   * primera que devuelve el servidor. Si se soltó a propósito, se respeta.
   */
  const active = useMemo<Project | null>(() => {
    if (activeId === null) return null;
    if (projects.length === 0) return null;
    if (activeId === undefined) return projects[0];
    return projects.find((p) => p.id === activeId) ?? projects[0];
  }, [projects, activeId]);

  const setActive = useCallback((id: string | null) => {
    writeActiveId(id);
    setActiveIdState(id);
  }, []);

  const create = useCallback(
    async (name: string, selection: ProjectSelection = {}) => {
      const res = await fetch("/api/consultas", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: name.trim() || "Mi consulta", selection }),
      });

      if (!res.ok) throw new Error("No pudimos guardar la consulta.");

      const { project } = (await res.json()) as { project: Project };
      setProjects((prev) => [project, ...prev]);
      setActive(project.id);
      return project.id;
    },
    [setActive],
  );

  const rename = useCallback(
    async (id: string, name: string) => {
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, name: name.trim() } : p)),
      );
      const res = await fetch(`/api/consultas/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) await refetch();
    },
    [refetch],
  );

  const remove = useCallback(
    async (id: string) => {
      const previous = projects;
      const remaining = projects.filter((p) => p.id !== id);
      setProjects(remaining);
      if (activeId === id) setActive(remaining[0]?.id ?? null);

      const res = await fetch(`/api/consultas/${id}`, { method: "DELETE" });
      if (!res.ok) setProjects(previous);
    },
    [projects, activeId, setActive],
  );

  const updateSelection = useCallback(
    async (id: string, patch: Partial<ProjectSelection>) => {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, selection: { ...p.selection, ...patch }, updatedAt: Date.now() }
            : p,
        ),
      );
      const res = await fetch(`/api/consultas/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ selection: patch }),
      });
      if (!res.ok) await refetch();
    },
    [refetch],
  );

  const appendMessage = useCallback(
    async (id: string, message: Omit<ChatMessage, "id" | "createdAt">) => {
      const optimistic: ChatMessage = {
        ...message,
        id: `tmp_${Date.now().toString(36)}`,
        createdAt: Date.now(),
      };
      setProjects((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, chat: [...p.chat, optimistic], updatedAt: Date.now() }
            : p,
        ),
      );

      const res = await fetch(`/api/consultas/${id}/mensajes`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(message),
      });

      if (!res.ok) {
        await refetch();
        return;
      }

      // Cambiamos el mensaje provisional por el que devolvió el servidor, que
      // trae el identificador definitivo.
      const { message: saved } = (await res.json()) as { message: ChatMessage };
      setProjects((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                chat: p.chat.map((m) => (m.id === optimistic.id ? saved : m)),
              }
            : p,
        ),
      );
    },
    [refetch],
  );

  const clearChat = useCallback(
    async (id: string) => {
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, chat: [] } : p)),
      );
      const res = await fetch(`/api/consultas/${id}/mensajes`, {
        method: "DELETE",
      });
      if (!res.ok) await refetch();
    },
    [refetch],
  );

  return {
    projects,
    active,
    activeId: active?.id ?? null,
    loading,
    create,
    setActive,
    rename,
    remove,
    updateSelection,
    appendMessage,
    clearChat,
  };
}
