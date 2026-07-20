"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bot, ChevronLeft, ChevronRight, Info, Save, Send, User, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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

function clearDraft() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    /* noop */
  }
}

export default function ChatPage() {
  const { active, activeId, create, setActive, appendMessage, clearChat } =
    useProjects();
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [ephemeral, setEphemeral] = useState<DisplayMessage[]>(() => loadDraft());
  const [dismissedSaveHint, setDismissedSaveHint] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveName, setSaveName] = useState("");
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

  // Persist draft when in ephemeral mode
  useEffect(() => {
    if (!activeId) saveDraft(ephemeral);
  }, [activeId, ephemeral]);

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

  const finishSave = () => {
    const trimmed = saveName.trim() || `Chat · ${new Date().toLocaleDateString("es-CO")}`;
    const id = create(trimmed);
    // Copiar ephemeral al proyecto recién creado
    for (const m of ephemeral) {
      if (m.role === "system") continue;
      appendMessage(id, { role: m.role, text: m.text, links: m.links });
    }
    setActive(id);
    setEphemeral([]);
    clearDraft();
    setSaveOpen(false);
  };

  const hasUserAsked = messages.some((m) => m.role === "user");
  const conversationTitle = active ? active.name : "Chat";
  const showSaveHint =
    !active && ephemeral.some((m) => m.role === "user") && !dismissedSaveHint;

  return (
    <main className="relative mx-auto flex h-[calc(100vh-96px)] w-full max-w-[520px] flex-col px-6 pt-5">
      {/* Cabecera */}
      <header className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex min-h-[44px] items-center gap-1 rounded-full px-3 py-2 text-[15px] font-semibold text-foreground/85 transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-5 w-5" />
          Inicio
        </Link>
        <SiteNav />
      </header>

      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[16px] font-bold">{conversationTitle}</p>
          <p className="text-[13px] text-foreground/70">
            {active
              ? `${active.chat.filter((m) => m.role !== "system").length} mensajes guardados`
              : "Escríbame lo que quiera preguntar."}
          </p>
        </div>
        {active && active.chat.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                className="h-11 text-[13px] font-semibold text-muted-foreground underline underline-offset-2 hover:text-foreground"
              >
                Borrar chat
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  ¿Borrar toda la conversación?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Se perderán todas las preguntas y respuestas guardadas en la
                  consulta &ldquo;{active.name}&rdquo;. No se puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="h-12 text-base">
                  No, dejarla
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => clearChat(active.id)}
                  className="h-12 bg-destructive text-base text-white hover:bg-destructive/90"
                >
                  Sí, borrarla
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Oferta suave de guardar tras el primer mensaje */}
      {showSaveHint && !saveOpen && (
        <div className="mt-3 flex items-start gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-3">
          <Save className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={2} />
          <p className="flex-1 text-[13.5px] leading-relaxed text-foreground/85">
            Si quiere, guardo esta conversación para que pueda volver después.
          </p>
          <button
            type="button"
            onClick={() => setSaveOpen(true)}
            className="shrink-0 rounded-full bg-primary px-3 py-2 text-[12.5px] font-bold text-primary-foreground"
          >
            Guardar
          </button>
          <button
            type="button"
            onClick={() => setDismissedSaveHint(true)}
            aria-label="Ahora no"
            className="shrink-0 rounded-full text-foreground/60 hover:text-foreground"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
      )}

      {/* Modal simple de guardar consulta */}
      {saveOpen && (
        <div className="mt-3 rounded-2xl border border-primary/40 bg-card p-4">
          <label
            htmlFor="chat-consulta-name"
            className="text-[12.5px] font-bold uppercase tracking-wider text-foreground/70"
          >
            Nombre para reconocerla después
          </label>
          <input
            id="chat-consulta-name"
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            placeholder={`Chat · ${new Date().toLocaleDateString("es-CO")}`}
            onKeyDown={(e) => {
              if (e.key === "Enter") finishSave();
            }}
            autoFocus
            className="mt-2 h-12 w-full rounded-xl border border-border bg-background px-3 text-[16px] outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
          />
          <div className="mt-3 flex gap-2">
            <Button
              onClick={finishSave}
              className="h-12 flex-1 rounded-xl text-[15px] font-bold"
            >
              Guardar
            </Button>
            <Button
              variant="outline"
              onClick={() => setSaveOpen(false)}
              className="h-12 rounded-xl border-border bg-card px-4 text-[14px] font-semibold"
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Aviso demo */}
      <div className="mt-3 flex items-start gap-3 rounded-2xl border border-demo-border bg-demo-bg p-3">
        <Info
          className="mt-0.5 h-4 w-4 shrink-0 text-demo-foreground"
          strokeWidth={2.25}
        />
        <p className="text-[13px] leading-relaxed text-demo-foreground">
          Estamos en pruebas. Lo que respondemos le sirve de guía, pero
          conviene confirmarlo con su experiencia.
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
            <p className="text-[12.5px] font-bold uppercase tracking-wider text-foreground/70">
              Preguntas para empezar
            </p>
            <ul className="mt-3 flex flex-col gap-2">
              {STARTER_QUESTIONS.map((q) => (
                <li key={q}>
                  <button
                    type="button"
                    onClick={() => send(q)}
                    className="flex min-h-[52px] w-full items-center rounded-2xl border border-border bg-card/70 px-4 py-3 text-left text-[15px] font-semibold text-foreground/90 transition-colors hover:border-primary/40 hover:bg-card"
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
        className="sticky bottom-0 -mx-6 border-t border-border/60 bg-background/95 px-6 pt-3 pb-[calc(env(safe-area-inset-bottom)+12px)] backdrop-blur"
      >
        <div className="flex items-center gap-2 rounded-full border border-border bg-card pl-4 pr-1.5 py-1 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/15">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escríbanos su pregunta"
            aria-label="Escriba su pregunta"
            className="h-12 flex-1 bg-transparent text-[16px] outline-none placeholder:text-foreground/55"
            autoComplete="off"
          />
          <Button
            type="submit"
            size="icon"
            aria-label="Enviar"
            disabled={!input.trim() || thinking}
            className="size-12 shrink-0 rounded-full disabled:opacity-50"
          >
            <Send className="h-4.5 w-4.5" strokeWidth={2} />
          </Button>
        </div>
        <p className="mt-2 text-center text-[12px] text-foreground/70">
          Respondemos con información del proyecto, no con respuestas
          definitivas.
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
        <div className="max-w-[92%] rounded-2xl bg-muted/70 px-4 py-3 text-center text-[14px] leading-relaxed text-foreground/85">
          {message.text}
        </div>
      </div>
    );
  }

  const isUser = message.role === "user";

  return (
    <div className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Bot className="h-4.5 w-4.5" strokeWidth={2} />
        </span>
      )}
      <div
        className={`max-w-[82%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "border border-border/70 bg-card/80 text-foreground"
        }`}
      >
        <p className="whitespace-pre-wrap">{inlineMarkdown(message.text)}</p>
        {!isUser && message.links && message.links.length > 0 && (
          <ul className="mt-3 flex flex-col gap-2">
            {message.links.map((l) => {
              const external = l.href.startsWith("http");
              const commonClass =
                "inline-flex min-h-[44px] w-full items-center justify-between gap-2 rounded-xl border border-primary/25 bg-primary/5 px-3 py-2 text-[14px] font-semibold text-primary transition-colors hover:bg-primary/10";
              return (
                <li key={l.href}>
                  {external ? (
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={commonClass}
                    >
                      <span>{l.label}</span>
                      <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
                    </a>
                  ) : (
                    <Link href={l.href} className={commonClass}>
                      <span>{l.label}</span>
                      <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
      {isUser && (
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-foreground/10 text-foreground/80">
          <User className="h-4.5 w-4.5" strokeWidth={2} />
        </span>
      )}
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="flex gap-2.5">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Bot className="h-4.5 w-4.5" strokeWidth={2} />
      </span>
      <div className="rounded-2xl border border-border/70 bg-card/80 px-4 py-3">
        <span className="flex items-center gap-1.5" aria-label="Escribiendo">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground/50"
              style={{ animationDelay: `${i * 120}ms` }}
            />
          ))}
        </span>
      </div>
    </div>
  );
}
