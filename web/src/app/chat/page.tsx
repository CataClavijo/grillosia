"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bot, ChevronLeft, Info, Send, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  STARTER_QUESTIONS,
  WELCOME_MESSAGE,
  answerFor,
} from "@/lib/chat-knowledge";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  text: string;
}

let nextId = 0;
function id(): string {
  nextId += 1;
  return `m-${nextId}`;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(() => [
    { id: id(), role: "system", text: WELCOME_MESSAGE },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, thinking]);

  const send = (text: string) => {
    const clean = text.trim();
    if (!clean || thinking) return;

    setInput("");
    setMessages((prev) => [
      ...prev,
      { id: id(), role: "user", text: clean },
    ]);
    setThinking(true);

    // Simulamos un pequeño retraso para que la respuesta no se sienta brusca.
    window.setTimeout(() => {
      const answer = answerFor(clean);
      setMessages((prev) => [
        ...prev,
        { id: id(), role: "assistant", text: answer },
      ]);
      setThinking(false);
    }, 450);
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    send(input);
  };

  const hasUserAsked = messages.some((m) => m.role === "user");

  return (
    <main className="relative mx-auto flex h-[calc(100vh-128px)] w-full max-w-[480px] flex-col px-6 pt-5">
      {/* Cabecera */}
      <header className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[14px] font-semibold text-foreground/70 transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-5 w-5" />
          Inicio
        </Link>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
            Asistente
          </span>
          <ThemeToggle />
        </div>
      </header>

      {/* Aviso "Modo demostración" */}
      <div className="mt-4 flex items-start gap-3 rounded-2xl border border-demo-border bg-demo-bg p-3">
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

        {/* Sugerencias iniciales */}
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

function MessageBubble({ message }: { message: Message }) {
  if (message.role === "system") {
    return (
      <div className="flex justify-center">
        <div className="max-w-[90%] rounded-2xl bg-muted/70 px-4 py-3 text-center text-[13.5px] leading-relaxed text-foreground/80">
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
        className={`max-w-[78%] rounded-2xl px-4 py-3 text-[14.5px] leading-relaxed ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "border border-border/70 bg-card/80 text-foreground"
        }`}
      >
        <Formatted text={message.text} />
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

/**
 * Render muy ligero de **negritas** y *cursivas* dentro de un mensaje, sin
 * tirar de react-markdown (mantiene el bundle pequeño).
 */
function Formatted({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith("*") && part.endsWith("*")) {
          return <em key={i}>{part.slice(1, -1)}</em>;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}
