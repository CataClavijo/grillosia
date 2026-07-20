"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TutorialIcon } from "@/components/tutorial-icon";
import { renderMarkdownBlock } from "@/lib/markdown";
import { useTutorialSeen } from "@/lib/projects-store";
import { indiceTutorialGuardado, leerPaso, marcarPaso } from "@/lib/journey";
import { TUTORIAL_STEPS } from "@/lib/content/tutorial";

export default function TutorialPage() {
  const router = useRouter();
  const { markSeen } = useTutorialSeen();
  const [index, setIndex] = useState(0);
  const [retomado, setRetomado] = useState(false);

  const total = TUTORIAL_STEPS.length;
  const step = useMemo(() => TUTORIAL_STEPS[index], [index]);

  // Retomar donde quedó la vez pasada.
  useEffect(() => {
    const guardado = indiceTutorialGuardado();
    if (guardado > 0 && guardado < total) {
      setIndex(guardado);
      setRetomado(true);
    }
  }, [total]);

  // Anotar el avance para que la landing sepa qué botón mostrar. Si el
  // usuario ya terminó el recorrido y vuelve a repasarlo, no lo retrocedemos:
  // su botón de la portada debe seguir llevándolo al asistente.
  useEffect(() => {
    if (leerPaso() === "listo") return;
    marcarPaso(`tutorial:${index + 1}` as never);
  }, [index]);

  const advance = useCallback(() => {
    if (index === total - 1) {
      markSeen();
      marcarPaso("wizard");
      router.push("/wizard");
    } else {
      setIndex((i) => i + 1);
      setRetomado(false);
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
          className="inline-flex min-h-11 items-center gap-1 rounded-full px-3 py-2 text-[15px] font-semibold text-foreground/85 transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-5" />
          Inicio
        </Link>
        {index === 0 && (
          <button
            type="button"
            onClick={skip}
            className="inline-flex min-h-11 items-center rounded-full px-3 py-2 text-[14px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Saltar por ahora
          </button>
        )}
      </header>

      {/* Progreso: flecha atrás + texto normal + barra pasiva */}
      <div className="mt-6 flex items-center gap-3">
        {index > 0 ? (
          <button
            type="button"
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            aria-label="Paso anterior"
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-full text-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="size-5" />
          </button>
        ) : (
          <span className="size-11 shrink-0" aria-hidden />
        )}
        <div className="flex-1">
          <p className="text-[16px] font-semibold text-foreground/85">
            Paso {index + 1} de {total}
          </p>
          <div
            className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted"
            aria-hidden
          >
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${((index + 1) / total) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {retomado && (
        <p className="mt-4 text-[14px] text-muted-foreground">
          Siga donde se quedó.
        </p>
      )}

      {/* Contenido del paso */}
      <section className="mt-10 flex-1" key={step.id}>
        <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <TutorialIcon name={step.icon} className="size-7" strokeWidth={1.5} />
        </span>

        <h1 className="mt-6 text-[2rem] font-bold leading-tight tracking-[-0.02em]">
          {step.title}
        </h1>
        <p className="mt-2 text-[16px] leading-relaxed text-muted-foreground">
          {step.subtitle}
        </p>

        <div className="mt-6 flex flex-col gap-4">
          {renderMarkdownBlock(step.body)}
        </div>

        {step.inlineLink && (
          <Link
            href={step.inlineLink.href}
            className="mt-6 inline-flex min-h-14 items-center gap-2 text-[16px] font-semibold text-primary underline underline-offset-4"
          >
            {step.inlineLink.label}
            <ChevronRight className="size-4" strokeWidth={2.5} />
          </Link>
        )}
      </section>

      {/* Un solo botón */}
      <Button
        size="lg"
        onClick={advance}
        className="mt-10 h-[68px] w-full rounded-2xl text-[18px] font-bold"
      >
        {step.cta_next}
      </Button>
    </main>
  );
}
