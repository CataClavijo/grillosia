"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Bot,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Send,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  STARTER_QUESTIONS,
  answerFor,
  type ContextoModelo,
  type KnowledgeLink,
} from "@/lib/chat-knowledge";
import { ANIMALS } from "@/lib/animals";
import type { ContextoConsulta } from "@/lib/system-prompt";
import { usePrediccion } from "@/lib/prediccion";
import {
  tieneResultado,
  useProjects,
  type ChatMessage as StoreMessage,
} from "@/lib/projects-store";
import { inlineMarkdown } from "@/lib/markdown";
import { StepFooter } from "@/components/step-footer";

interface DisplayMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  links?: KnowledgeLink[];
}

const DRAFT_KEY = "grillia-chat-draft";

function loadDraft(): DisplayMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.sessionStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as DisplayMessage[]) : [];
  } catch {
    return [];
  }
}

function saveDraft(messages: DisplayMessage[]) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(messages));
  } catch {
    /* noop */
  }
}

/**
 * Le pregunta al asistente. Devuelve `null` cuando no está disponible, para
 * que quien llama caiga a las respuestas guionadas en lugar de mostrar un
 * error.
 */
async function preguntarAlAsistente(
  mensajes: { role: "user" | "assistant"; text: string }[],
  contexto: ContextoConsulta | null,
): Promise<{ text: string; links?: KnowledgeLink[] } | null> {
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ mensajes, contexto }),
    });
    if (!res.ok) return null;

    const datos = (await res.json()) as { disponible?: boolean; text?: string };
    if (!datos.disponible || !datos.text?.trim()) return null;

    return { text: datos.text.trim() };
  } catch {
    return null;
  }
}

export default function ChatPage() {
  const { active, activeId, appendMessage, clearChat, loading } = useProjects();
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [ephemeral, setEphemeral] = useState<DisplayMessage[]>(() => loadDraft());
  const [confirmarBorrado, setConfirmarBorrado] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // El asistente conversa sobre un resultado, así que pide al modelo el mismo
  // resultado que el productor está viendo. Si no hay modelo detrás, la
  // predicción queda en "sin servicio" y el chat sigue funcionando con las
  // respuestas guionadas.
  const seleccion = active?.selection;
  const prediccion = usePrediccion(
    seleccion?.temp !== undefined && seleccion?.humidity !== undefined
      ? { temperatura: seleccion.temp, humedad: seleccion.humidity }
      : null,
  );

  const contextoConsulta: ContextoConsulta | null = useMemo(() => {
    if (!seleccion) return null;
    const animal = ANIMALS.find((a) => a.id === seleccion.animalId);
    const etapa = animal?.stages.find((e) => e.id === seleccion.stageId);
    if (!animal || !etapa) return null;
    if (seleccion.temp === undefined || seleccion.humidity === undefined) {
      return null;
    }
    return {
      animal: animal.name,
      etapa: etapa.name,
      proteinaMin: etapa.proteinMin,
      proteinaMax: etapa.proteinMax,
      temperatura: seleccion.temp,
      humedad: seleccion.humidity,
    };
  }, [seleccion]);

  const contextoModelo: ContextoModelo | null = useMemo(() => {
    if (prediccion.estado !== "listo" || !seleccion) return null;
    const animal = ANIMALS.find((a) => a.id === seleccion.animalId);
    const etapa = animal?.stages.find((e) => e.id === seleccion.stageId);
    if (!animal || !etapa) return null;

    return {
      animal: animal.name,
      etapa: etapa.name,
      proteinaMin: etapa.proteinMin,
      proteinaMax: etapa.proteinMax,
      temperatura: seleccion.temp as number,
      humedad: seleccion.humidity as number,
      resultados: prediccion.resultados,
      datosSimulados: prediccion.modelo.datos_simulados,
    };
  }, [prediccion, seleccion]);

  const messages: DisplayMessage[] = active
    ? active.chat
        .filter((m: StoreMessage) => m.role !== "system")
        .map((m: StoreMessage) => ({
          id: m.id,
          role: m.role as "user" | "assistant",
          text: m.text,
          links: m.links,
        }))
    : ephemeral;

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.length, thinking]);

  useEffect(() => {
    if (!activeId) saveDraft(ephemeral);
  }, [activeId, ephemeral]);

  const send = (text: string) => {
    const clean = text.trim();
    if (!clean || thinking) return;

    setInput("");
    if (activeId) {
      void appendMessage(activeId, { role: "user", text: clean });
    } else {
      setEphemeral((prev) => [
        ...prev,
        { id: `local_${Date.now()}`, role: "user", text: clean },
      ]);
    }
    setThinking(true);

    void (async () => {
      const historia = [
        ...messages.map((m) => ({ role: m.role, text: m.text })),
        { role: "user" as const, text: clean },
      ];

      // El asistente primero. Si no está disponible —sin llave, sin señal,
      // OpenAI caído— se contesta con las respuestas guionadas, que es como
      // funcionaba antes. El productor nunca se queda sin respuesta.
      let respuesta = await preguntarAlAsistente(historia, contextoConsulta);
      if (!respuesta) respuesta = answerFor(clean, contextoModelo);

      if (activeId) {
        await appendMessage(activeId, {
          role: "assistant",
          text: respuesta.text,
          links: respuesta.links,
        });
      } else {
        setEphemeral((prev) => [
          ...prev,
          {
            id: `local_${Date.now()}_a`,
            role: "assistant",
            text: respuesta.text,
            links: respuesta.links,
          },
        ]);
      }
      setThinking(false);
    })();
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    send(input);
  };

  const hayMensajes = messages.length > 0;

  // El asistente conversa sobre un resultado. Sin una consulta terminada no
  // hay de qué hablar, así que en vez de un chat vacío mostramos el camino.
  const consultaLista = active ? tieneResultado(active) : false;

  // Mientras llegan las consultas de la cuenta no sabemos todavía si hay una
  // terminada; anunciar "primero haga su consulta" a alguien que sí la tiene
  // sería un parpadeo desconcertante.
  if (loading) {
    return (
      <main className="mx-auto flex min-h-[calc(100dvh-42px)] w-full max-w-[520px] flex-col px-6 pb-16 pt-5">
        <header className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-1 rounded-full px-3 py-2 text-[15px] font-semibold text-foreground/85 transition-colors hover:text-foreground"
          >
            <ChevronLeft className="size-5" />
            Inicio
          </Link>
        </header>
        <p className="mt-14 text-[16px] text-muted-foreground">
          Cargando sus consultas...
        </p>
      </main>
    );
  }

  if (!consultaLista) {
    return (
      <main className="mx-auto flex min-h-[calc(100dvh-42px)] w-full max-w-[520px] flex-col px-6 pb-16 pt-5">
        <header className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-1 rounded-full px-3 py-2 text-[15px] font-semibold text-foreground/85 transition-colors hover:text-foreground"
          >
            <ChevronLeft className="size-5" />
            Inicio
          </Link>
        </header>

        <section className="mt-14 flex flex-col gap-4">
          <span
            aria-hidden
            className="inline-flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"
          >
            <Bot className="size-7" strokeWidth={1.5} />
          </span>
          <h1 className="text-[1.85rem] font-bold leading-tight tracking-[-0.02em]">
            Primero hagamos su consulta
          </h1>
          <p className="text-[16px] leading-relaxed text-foreground/85">
            El asistente conversa sobre el resultado de su consulta: qué
            comida le conviene a su animal y por qué. Conteste las cuatro
            preguntas y aquí lo esperamos.
          </p>
        </section>

        <div className="mt-auto">
          <StepFooter
            primary={{ label: "Hacer mi consulta", href: "/wizard" }}
            secondary={{ label: "Ver la guía", href: "/tutorial" }}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex h-[calc(100dvh-42px)] w-full max-w-[520px] flex-col px-6 pt-5">
      {/* Cabecera mínima: atrás · título · tres puntos */}
      <header className="flex items-center justify-between">
        <Link
          href="/"
          aria-label="Volver"
          className="inline-flex size-11 items-center justify-center rounded-full text-foreground/85 transition-colors hover:bg-muted"
        >
          <ChevronLeft className="size-5" />
        </Link>
        <h1 className="text-[17px] font-bold">Asistente</h1>
        {hayMensajes && active ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Más opciones"
                className="size-11 rounded-full"
              >
                <MoreVertical />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onSelect={(e: Event) => {
                  e.preventDefault();
                  setConfirmarBorrado(true);
                }}
                className="min-h-11 text-destructive"
              >
                Borrar conversación
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <span className="size-11" aria-hidden />
        )}
      </header>

      {/* Hilo */}
      <div
        ref={scrollRef}
        className="mt-6 flex flex-1 flex-col gap-4 overflow-y-auto pb-4"
        aria-live="polite"
      >
        {!hayMensajes && !thinking && (
          <div className="flex flex-col gap-3">
            <p className="text-[16px] leading-relaxed text-foreground/85">
              {active
                ? `Puede preguntarme sobre su consulta de ${active.name.split(" · ")[0].toLowerCase()} o sobre la cría en general.`
                : "Pregúnteme lo que quiera sobre la cría de grillos."}
            </p>
            <ul className="flex flex-col gap-2">
              {STARTER_QUESTIONS.slice(0, 3).map((q) => (
                <li key={q}>
                  <button
                    type="button"
                    onClick={() => send(q)}
                    className="flex min-h-14 w-full items-center rounded-2xl bg-card px-4 py-3 text-left text-[16px] font-medium transition-colors hover:bg-muted"
                  >
                    {q}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
        {thinking && <TypingBubble />}
      </div>

      {/* Composer */}
      <form
        onSubmit={onSubmit}
        className="sticky bottom-0 -mx-6 border-t bg-background/95 px-6 pt-3 pb-[calc(env(safe-area-inset-bottom)+12px)] backdrop-blur"
      >
        <div className="flex items-center gap-2 rounded-full border bg-card py-1 pl-4 pr-1.5 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/15">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escríbanos su pregunta"
            aria-label="Escriba su pregunta"
            className="h-12 flex-1 bg-transparent text-[16px] outline-none placeholder:text-muted-foreground"
            autoComplete="off"
          />
          <Button
            type="submit"
            size="icon"
            aria-label="Enviar"
            disabled={!input.trim() || thinking}
            className="size-12 shrink-0 rounded-full disabled:opacity-50"
          >
            <Send />
          </Button>
        </div>
      </form>

      <AlertDialog open={confirmarBorrado} onOpenChange={setConfirmarBorrado}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Borrar toda la conversación?</AlertDialogTitle>
            <AlertDialogDescription>
              Se perderán todas las preguntas y respuestas. No se puede
              deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-12 text-base">
              No, dejarla
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => active && void clearChat(active.id)}
              className="h-12 bg-destructive text-base text-white hover:bg-destructive/90"
            >
              Sí, borrarla
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */

function MessageBubble({ message }: { message: DisplayMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Bot className="size-4" strokeWidth={2} />
        </span>
      )}
      <div
        className={`max-w-[82%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-card text-foreground"
        }`}
      >
        <p className="whitespace-pre-wrap">{inlineMarkdown(message.text)}</p>
        {!isUser && message.links && message.links.length > 0 && (
          <ul className="mt-3 flex flex-col gap-2">
            {message.links.map((l) => {
              const external = l.href.startsWith("http");
              const cls =
                "inline-flex min-h-11 w-full items-center justify-between gap-2 rounded-xl bg-primary/10 px-3 py-2 text-[14px] font-semibold text-primary transition-colors hover:bg-primary/15";
              return (
                <li key={l.href}>
                  {external ? (
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cls}
                    >
                      <span>{l.label}</span>
                      <ChevronRight className="size-4" strokeWidth={2.5} />
                    </a>
                  ) : (
                    <Link href={l.href} className={cls}>
                      <span>{l.label}</span>
                      <ChevronRight className="size-4" strokeWidth={2.5} />
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
      {isUser && (
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-foreground/10 text-foreground/80">
          <User className="size-4" strokeWidth={2} />
        </span>
      )}
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="flex gap-2.5">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Bot className="size-4" strokeWidth={2} />
      </span>
      <div className="rounded-2xl bg-card px-4 py-3">
        <span className="flex items-center gap-1.5" aria-label="Escribiendo">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="size-1.5 animate-bounce rounded-full bg-foreground/50"
              style={{ animationDelay: `${i * 120}ms` }}
            />
          ))}
        </span>
      </div>
    </div>
  );
}
