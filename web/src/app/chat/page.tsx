"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bot, ChevronLeft, ChevronRight, Info, Send, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SiteNav } from "@/components/site-nav";
import {
  STARTER_QUESTIONS,
  WELCOME_MESSAGE,
  answerFor,
  type KnowledgeLink,
} from "@/lib/chat-knowledge";
import {
  useProjects,
  type ChatMessage as StoreMessage,
} from "@/lib/projects-store";
import { inlineMarkdown } from "@/lib/markdown";

interface DisplayMessage {
  id: string;
  role: "user" | "assistant" | "system";
  text: string;
  links?: KnowledgeLink[];
}

export default function ChatPage() {
  const { active, activeId, appendMessage, clearChat } = useProjects();
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [ephemeral, setEphemeral] = useState<DisplayMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const persistent: DisplayMessage[] = active
    ? active.chat.map((m: StoreMessage) => ({
        id: m.id,
        role: m.role,
        text: m.text,
        links: m.links,
      }))
    : [];

  const messages: DisplayMessage[] = active
    ? [
        { id: "sys-welcome", role: "system", text: WELCOME_MESSAGE },
        ...persistent,
      ]
    : [
        { id: "sys-welcome", role: "system", text: WELCOME_MESSAGE },
        ...ephemeral,
      ];

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.length, thinking]);

  const send = (text: string) => {
    const clean = text.trim();
    if (!clean || thinking) return;

    setInput("");
    const userMsg: DisplayMessage = {
      id: `local_${Date.now()}`,
      role: "user",
      text: clean,
    };
    if (activeId) {
      appendMessage(activeId, { role: "user", text: clean });
    } else {
      setEphemeral((prev) => [...prev, userMsg]);
    }
    setThinking(true);

    window.setTimeout(() => {
      const ans = answerFor(clean);
      if (activeId) {
        appendMessage(activeId, {
          role: "assistant",
          text: ans.text,
          links: ans.links,
        });
      } else {
        setEphemeral((prev) => [
          ...prev,
          {
            id: `local_${Date.now()}_a`,
            role: "assistant",
            text: ans.text,
            links: ans.links,
          },
        ]);
      }
      setThinking(false);
    }, 450);
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    send(input);
  };

  const hasUserAsked = messages.some((m) => m.role === "user");
  const conversationTitle = active
    ? active.name
    : "Consulta sin proyecto";

  return (
    <main className="relative mx-auto flex h-[calc(100vh-128px)] w-full max-w-[520px] flex-col px-6 pt-5">
      {/* Cabecera */}
      <header className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[14px] font-semibold text-foreground/70 transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-5 w-5" />
          Inicio
        </Link>
        <SiteNav />
      </header>

      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[15px] font-bold">{conversationTitle}</p>
          <p className="text-[12px] text-foreground/55">
            {active
              ? `${active.chat.filter((m) => m.role !== "system").length} mensajes guardados`
              : "Sus mensajes no se guardarán sin un proyecto activo."}
          </p>
        </div>
        {active && active.chat.length > 0 && (
          <button
            type="button"
            onClick={() => {
              if (
                window.confirm(
                  "¿Borrar toda la conversación de este proyecto?",
                )
              ) {
                clearChat(active.id);
              }
            }}
            className="text-[12px] font-semibold text-foreground/60 underline underline-offset-2 hover:text-foreground"
          >
            Borrar chat
          </button>
        )}
      </div>

      {!active && (
        <div className="mt-3 flex items-start gap-3 rounded-2xl border border-primary/25 bg-primary/5 p-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={2.25} />
          <p className="flex-1 text-[12.5px] leading-relaxed text-foreground/80">
            Sin proyecto activo. Sus mensajes se pierden al recargar. Le
            sugerimos crear un proyecto para guardarlos.
          </p>
          <Link
            href="/proyectos"
            className="shrink-0 rounded-full bg-primary px-3 py-1.5 text-[11.5px] font-bold text-primary-foreground"
          >
            Crear
          </Link>
        </div>
      )}

      <div className="mt-3 flex items-start gap-3 rounded-2xl border border-demo-border bg-demo-bg p-3">
        <Info
          className="mt-0.5 h-4 w-4 shrink-0 text-demo-foreground"
          strokeWidth={2.25}
        />
        <p className="text-[12.5px] leading-relaxed text-demo-foreground">
          Modo demostración. Las respuestas son informativas y no constituyen
          una recomendación definitiva.
        </p>
      </div>

      {/* Mensajes */}
      <div
        ref={scrollRef}
        className="mt-4 flex-1 space-y-4 overflow-y-auto pb-4"
        aria-live="polite"
      >
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
        {thinking && <TypingBubble />}

        {!hasUserAsked && !thinking && (
          <div className="mt-2">
            <p className="text-[11.5px] font-bold uppercase tracking-wider text-foreground/55">
              Preguntas para empezar
            </p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {STARTER_QUESTIONS.map((q) => (
                <li key={q}>
                  <button
                    type="button"
                    onClick={() => send(q)}
                    className="rounded-full border border-border bg-card/70 px-3.5 py-2 text-[13px] font-semibold text-foreground/85 transition-colors hover:border-primary/40 hover:bg-card"
                  >
                    {q}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Composer */}
      <form
        onSubmit={onSubmit}
        className="sticky bottom-0 -mx-6 border-t border-border/60 bg-background/95 px-6 py-4 backdrop-blur"
      >
        <div className="flex items-center gap-2 rounded-full border border-border bg-card pl-4 pr-1.5 py-1 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/15">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pregúntele al asistente…"
            aria-label="Escriba su pregunta"
            className="h-10 flex-1 bg-transparent text-[15px] outline-none placeholder:text-foreground/45"
            autoComplete="off"
          />
          <Button
            type="submit"
            size="icon"
            aria-label="Enviar"
            disabled={!input.trim() || thinking}
            className="size-10 shrink-0 rounded-full disabled:opacity-50"
          >
            <Send className="h-4 w-4" strokeWidth={2} />
          </Button>
        </div>
        <p className="mt-2 text-center text-[11px] text-foreground/55">
          El asistente responde con información del proyecto, no con
          predicciones definitivas.
        </p>
      </form>
    </main>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */

function MessageBubble({ message }: { message: DisplayMessage }) {
  if (message.role === "system") {
    return (
      <div className="flex justify-center">
        <div className="max-w-[92%] rounded-2xl bg-muted/70 px-4 py-3 text-center text-[13.5px] leading-relaxed text-foreground/80">
          {message.text}
        </div>
      </div>
    );
  }

  const isUser = message.role === "user";

  return (
    <div className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Bot className="h-4 w-4" strokeWidth={2} />
        </span>
      )}
      <div
        className={`max-w-[82%] rounded-2xl px-4 py-3 text-[14.5px] leading-relaxed ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "border border-border/70 bg-card/80 text-foreground"
        }`}
      >
        <p>{inlineMarkdown(message.text)}</p>
        {!isUser && message.links && message.links.length > 0 && (
          <ul className="mt-3 flex flex-col gap-2">
            {message.links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="inline-flex w-full items-center justify-between gap-2 rounded-xl border border-primary/25 bg-primary/5 px-3 py-2 text-[13px] font-semibold text-primary transition-colors hover:bg-primary/10"
                >
                  <span>{l.label}</span>
                  <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
      {isUser && (
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-foreground/10 text-foreground/80">
          <User className="h-4 w-4" strokeWidth={2} />
        </span>
      )}
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="flex gap-2.5">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Bot className="h-4 w-4" strokeWidth={2} />
      </span>
      <div className="rounded-2xl border border-border/70 bg-card/80 px-4 py-3">
        <span className="flex items-center gap-1.5" aria-label="Escribiendo">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground/40"
              style={{ animationDelay: `${i * 120}ms` }}
            />
          ))}
        </span>
      </div>
    </div>
  );
}
