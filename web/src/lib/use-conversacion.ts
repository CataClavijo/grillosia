"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  answerFor,
  type ContextoModelo,
  type KnowledgeLink,
  esGenerica,
  SIN_SERVICIO,
  DEMASIADAS,
} from "@/lib/chat-knowledge";
import { animalPorId, etapaPorId } from "@/lib/animals";
import { referencia } from "@/lib/content/referencias";
import type { ContextoConsulta } from "@/lib/system-prompt";
import { usePrediccion } from "@/lib/prediccion";
import {
  tieneResultado,
  useProjects,
  type ChatMessage as StoreMessage,
} from "@/lib/projects-store";

/**
 * La conversacion con el asistente, sin interfaz.
 *
 * La usan la pagina /chat y el panel lateral del asistente, asi que las dos
 * comparten el mismo historial: con una consulta activa, los mensajes se
 * guardan en ella; sin consulta, en un borrador de la sesion del navegador.
 *
 * Primero pregunta al asistente de la API. Si no esta disponible (sin llave,
 * sin senal, tope de uso) contesta con las respuestas guionadas de
 * `chat-knowledge`, y si esas tampoco saben, dice que pasa de verdad. El
 * productor nunca se queda sin respuesta.
 */

export interface MensajeConversacion {
  id: string;
  role: "user" | "assistant";
  text: string;
  links?: KnowledgeLink[];
}

const DRAFT_KEY = "grillia-chat-draft";
/** Avisa a las otras instancias (pagina y panel) que el borrador cambio. */
const EVENTO_BORRADOR = "grillia:chat-draft";

function loadDraft(): MensajeConversacion[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.sessionStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as MensajeConversacion[]) : [];
  } catch {
    return [];
  }
}

function saveDraft(messages: MensajeConversacion[]) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(messages));
    window.dispatchEvent(new Event(EVENTO_BORRADOR));
  } catch {
    /* noop */
  }
}

/**
 * Le pregunta al asistente. Devuelve el motivo cuando no esta disponible,
 * para que quien llama caiga a las respuestas guionadas en lugar de mostrar
 * un error.
 */
async function preguntarAlAsistente(
  mensajes: { role: "user" | "assistant"; text: string }[],
  contexto: ContextoConsulta | null,
): Promise<{
  text?: string;
  links?: KnowledgeLink[];
  motivo?: "tope" | "otro";
}> {
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ mensajes, contexto }),
    });
    if (!res.ok) return { motivo: "otro" };

    const datos = (await res.json()) as {
      disponible?: boolean;
      text?: string;
      motivo?: string;
    };
    if (!datos.disponible || !datos.text?.trim())
      return { motivo: datos.motivo === "tope" ? "tope" : "otro" };

    return { text: datos.text.trim() };
  } catch {
    return { motivo: "otro" };
  }
}

/**
 * La fuente del requerimiento de proteina, en corto: "National Research
 * Council (1994)" en vez de la cita entera. El asistente la nombra al dar el
 * numero ("segun ...").
 */
function fuenteCorta(refs: string[] | undefined): string | undefined {
  if (!refs?.length) return undefined;
  const cortas = refs.flatMap((id) => {
    const cita = referencia(id)?.cita;
    if (!cita) return [];
    const conAno = cita.match(/^(.*?\(\d{4}\))/);
    return [conAno ? conAno[1] : cita.split(". ")[0]];
  });
  return cortas.length ? cortas.join("; ") : undefined;
}

export function useConversacion() {
  const { active, activeId, appendMessage, clearChat, loading } = useProjects();
  const [thinking, setThinking] = useState(false);
  // Vacio en el primer pintado y se lee despues: el servidor no tiene
  // sessionStorage, y leerlo al iniciar hacia que el HTML no coincidiera.
  const [ephemeral, setEphemeral] = useState<MensajeConversacion[]>([]);

  // El borrador sin consulta se comparte entre la pagina y el panel.
  useEffect(() => {
    const recargar = () => setEphemeral(loadDraft());
    recargar();
    window.addEventListener(EVENTO_BORRADOR, recargar);
    return () => window.removeEventListener(EVENTO_BORRADOR, recargar);
  }, []);

  // El asistente conversa sobre un resultado, asi que pide al modelo el mismo
  // resultado que el productor esta viendo. Si no hay modelo detras, la
  // prediccion queda en "sin servicio" y la conversacion sigue con las
  // respuestas guionadas.
  const seleccion = active?.selection;
  const prediccion = usePrediccion(
    seleccion?.temp !== undefined && seleccion?.humidity !== undefined
      ? { temperatura: seleccion.temp, humedad: seleccion.humidity }
      : null,
  );

  const contextoConsulta: ContextoConsulta | null = useMemo(() => {
    if (!seleccion) return null;
    const animal = animalPorId(seleccion.animalId);
    const etapa = etapaPorId(animal, seleccion.stageId);
    if (!animal || !etapa) return null;
    if (seleccion.temp === undefined || seleccion.humidity === undefined) {
      return null;
    }
    return {
      animal: animal.name,
      etapa: etapa.name,
      proteinaMin: etapa.protein?.min ?? null,
      proteinaMax: etapa.protein?.max ?? null,
      fuenteProteina: fuenteCorta(etapa.protein?.refs),
      notaProteina: etapa.protein?.nota,
      temperatura: seleccion.temp,
      humedad: seleccion.humidity,
    };
  }, [seleccion]);

  const contextoModelo: ContextoModelo | null = useMemo(() => {
    if (prediccion.estado !== "listo" || !seleccion) return null;
    const animal = animalPorId(seleccion.animalId);
    const etapa = etapaPorId(animal, seleccion.stageId);
    if (!animal || !etapa) return null;

    return {
      animal: animal.name,
      etapa: etapa.name,
      proteinaMin: etapa.protein?.min ?? null,
      proteinaMax: etapa.protein?.max ?? null,
      fuenteProteina: fuenteCorta(etapa.protein?.refs),
      temperatura: seleccion.temp as number,
      humedad: seleccion.humidity as number,
      resultados: prediccion.resultados,
      datosSimulados: prediccion.modelo.datos_simulados,
    };
  }, [prediccion, seleccion]);

  const messages: MensajeConversacion[] = useMemo(
    () =>
      active
        ? active.chat
            .filter((m: StoreMessage) => m.role !== "system")
            .map((m: StoreMessage) => ({
              id: m.id,
              role: m.role as "user" | "assistant",
              text: m.text,
              links: m.links,
            }))
        : ephemeral,
    [active, ephemeral],
  );

  // La ultima lista, para leerla dentro de funciones asincronas sin
  // recrearlas en cada mensaje.
  const ultimos = useRef(messages);
  ultimos.current = messages;

  const agregar = useCallback(
    async (m: Omit<MensajeConversacion, "id">) => {
      if (activeId) {
        await appendMessage(activeId, {
          role: m.role,
          text: m.text,
          links: m.links,
        });
      } else {
        const nuevo = {
          ...m,
          id: `local_${Date.now()}_${m.role === "user" ? "u" : "a"}`,
        };
        const siguiente = [...loadDraft(), nuevo];
        saveDraft(siguiente);
        setEphemeral(siguiente);
      }
    },
    [activeId, appendMessage],
  );

  /** Envia una pregunta y devuelve el texto de la respuesta. */
  const preguntar = useCallback(
    async (texto: string): Promise<string> => {
      const clean = texto.trim();
      if (!clean) return "";

      const historia = [
        ...ultimos.current.map((m) => ({ role: m.role, text: m.text })),
        { role: "user" as const, text: clean },
      ];
      await agregar({ role: "user", text: clean });
      setThinking(true);

      try {
        const delAsistente = await preguntarAlAsistente(historia, contextoConsulta);
        let respuesta: { text: string; links?: KnowledgeLink[] };
        if (delAsistente.text) {
          respuesta = { text: delAsistente.text, links: delAsistente.links };
        } else {
          const guionada = answerFor(clean, contextoModelo);
          // Si lo guionado sabe contestar, contesta. Si no, se dice lo que
          // pasa de verdad en vez de un "no se".
          respuesta = !esGenerica(guionada)
            ? guionada
            : delAsistente.motivo === "tope"
              ? DEMASIADAS
              : SIN_SERVICIO;
        }
        await agregar({ role: "assistant", ...respuesta });
        return respuesta.text;
      } finally {
        setThinking(false);
      }
    },
    [agregar, contextoConsulta, contextoModelo],
  );

  const borrar = useCallback(async () => {
    if (active) await clearChat(active.id);
    else {
      saveDraft([]);
      setEphemeral([]);
    }
  }, [active, clearChat]);

  return {
    messages,
    thinking,
    loading,
    active,
    activeId,
    /** Hay una consulta terminada sobre la cual conversar. */
    consultaLista: active ? tieneResultado(active) : false,
    /** Datos del modelo son de prueba (se avisa en la conversacion). */
    datosSimulados:
      prediccion.estado === "listo" ? prediccion.modelo.datos_simulados : false,
    preguntar,
    borrar,
  };
}

export type Conversacion = ReturnType<typeof useConversacion>;
