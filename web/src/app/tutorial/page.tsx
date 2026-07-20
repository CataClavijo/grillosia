"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, ChevronLeft, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TutorialIcon } from "@/components/tutorial-icon";
import { renderMarkdownBlock } from "@/lib/markdown";
import { useTutorialSeen } from "@/lib/projects-store";
import { TUTORIAL_STEPS } from "@/lib/content/tutorial";

export default function TutorialPage() {
  const router = useRouter();
  const { markSeen } = useTutorialSeen();
  const [index, setIndex] = useState(0);

  const total = TUTORIAL_STEPS.length;
  const step = useMemo(() => TUTORIAL_STEPS[index], [index]);
  const progress = ((index + 1) / total) * 100;

  const advance = useCallback(() => {
    if (index === total - 1) {
      markSeen();
      router.push("/");
    } else {
      setIndex((i) => i + 1);
    }
  }, [index, total, markSeen, router]);

  const skip = useCallback(() => {
    markSeen();
    router.push("/");
  }, [markSeen, router]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [index]);

  return (
    <main className="relative mx-auto flex min-h-[calc(100vh-128px)] w-full max-w-[520px] flex-col px-6 pb-16 pt-5">
      {/* Cabecera */}
      <header className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[14px] font-semibold text-foreground/70 transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-5 w-5" />
          Inicio
        </Link>
        <button
          type="button"
          onClick={skip}
          aria-label="Saltar tutorial"
          className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[12.5px] font-semibold text-foreground/60 transition-colors hover:bg-muted hover:text-foreground"
        >
          Saltar <X className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
      </header>

      {/* Barra de progreso */}
      <div className="mt-6">
        <p className="text-[11.5px] font-semibold uppercase tracking-wider text-foreground/55">
          Paso {index + 1} de {total}
        </p>
        <div
          className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted"
          aria-hidden
        >
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Contenido del paso */}
      <section
        className="reveal mt-10 flex-1"
        style={{ animationDelay: "0ms" } as React.CSSProperties}
        key={step.id}
      >
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <TutorialIcon name={step.icon} className="h-7 w-7" strokeWidth={1.5} />
        </span>

        <h1 className="mt-6 text-[2rem] font-bold leading-tight tracking-[-0.02em]">
          {step.title}
        </h1>
        <p className="mt-2 text-[16px] leading-relaxed text-foreground/65">
          {step.subtitle}
        </p>

        <div className="mt-6 space-y-4">{renderMarkdownBlock(step.body)}</div>

        {/* Indicadores de pasos (jump) */}
        <ol className="mt-10 flex items-center justify-center gap-2" aria-label="Pasos del tutorial">
          {TUTORIAL_STEPS.map((s, i) => {
            const active = i === index;
            const done = i < index;
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Ir al paso ${i + 1}: ${s.title}`}
                  aria-current={active ? "step" : undefined}
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-bold transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : done
                        ? "bg-primary/25 text-primary"
                        : "bg-muted text-foreground/50 hover:bg-muted/70"
                  }`}
                >
                  {done ? (
                    <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                  ) : (
                    i + 1
                  )}
                </button>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Navegación */}
      <div className="mt-10 flex flex-col gap-3">
        <Button
          size="lg"
          onClick={advance}
          className="h-auto justify-between rounded-2xl px-5 py-5 text-[16px] font-semibold"
        >
          <span className="flex items-center gap-2">
            {step.cta_next}
          </span>
          <ArrowRight className="h-5 w-5" strokeWidth={2} />
        </Button>
        {index > 0 && (
          <Button
            variant="outline"
            size="lg"
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            className="h-auto justify-center gap-2 rounded-2xl border-border bg-card/60 px-5 py-4 text-[15px] font-semibold"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2} />
            Atrás
          </Button>
        )}
      </div>
    </main>
  );
}
