import Link from "next/link";
import {
  Bot,
  ChevronLeft,
  ChevronRight,
  Info,
  Lightbulb,
  Package,
} from "lucide-react";

import { SiteNav } from "@/components/site-nav";
import {
  COST_NOTE,
  ENCLOSURE_INTRO,
  ENCLOSURE_STEPS,
  MAINTENANCE,
  MATERIALS,
} from "@/lib/content/enclosure";
import { renderMarkdownBlock } from "@/lib/markdown";

export const metadata = {
  title: "Cómo armar sus cajas — GrillIA",
  description:
    "Guía paso a paso para armar cajas de cría de grillos con materiales sencillos.",
};

export default function HowToBuildPage() {
  return (
    <main className="relative mx-auto flex w-full max-w-[520px] flex-col px-6 pb-16 pt-5">
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

      <section className="mt-8">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Package className="h-6 w-6" strokeWidth={1.5} />
        </span>
        <h1 className="mt-5 text-[2rem] font-bold leading-tight tracking-[-0.02em]">
          Arme sus cajas de cría
        </h1>
        <div className="mt-4 space-y-4">{renderMarkdownBlock(ENCLOSURE_INTRO)}</div>
      </section>

      {/* Materiales */}
      <section className="mt-10">
        <h2 className="text-[18px] font-bold tracking-tight">
          Materiales que va a necesitar
        </h2>
        <ul className="mt-5 grid grid-cols-1 gap-3">
          {MATERIALS.map((m) => (
            <li
              key={m.item}
              className="flex items-start gap-3 rounded-xl border border-border/70 bg-card/60 p-3.5"
            >
              <span
                aria-hidden
                className="mt-1 inline-block h-2 w-2 shrink-0 rotate-45 bg-primary"
              />
              <div>
                <p className="text-[14.5px] font-semibold leading-tight">
                  {m.item}
                </p>
                <p className="mt-1 text-[13px] text-foreground/70">
                  {m.detail}
                </p>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-primary/25 bg-primary/5 p-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={2} />
          <p className="text-[13px] leading-relaxed text-foreground/80">
            {COST_NOTE}
          </p>
        </div>
      </section>

      {/* Pasos */}
      <section className="mt-12">
        <h2 className="text-[18px] font-bold tracking-tight">
          Paso a paso
        </h2>
        <ol className="mt-6 space-y-6">
          {ENCLOSURE_STEPS.map((s) => (
            <li
              key={s.number}
              className="rounded-2xl border border-border/70 bg-card/70 p-5"
            >
              <div className="flex items-baseline gap-3">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-[15px] font-extrabold tabular-nums">
                  {s.number}
                </span>
                <h3 className="text-[17px] font-bold leading-tight">
                  {s.title}
                </h3>
              </div>
              <p className="mt-3 text-[15px] leading-relaxed text-foreground/85">
                {s.body}
              </p>
              {s.tip && (
                <div className="mt-3 flex items-start gap-2 rounded-xl bg-muted p-3">
                  <Lightbulb
                    className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                    strokeWidth={2}
                  />
                  <p className="text-[13px] leading-relaxed text-foreground/80">
                    {s.tip}
                  </p>
                </div>
              )}
            </li>
          ))}
        </ol>
      </section>

      {/* Mantenimiento */}
      <section className="mt-12">
        <h2 className="text-[18px] font-bold tracking-tight">
          Mantenimiento diario
        </h2>
        <ul className="mt-5 space-y-3">
          {MAINTENANCE.map((m, i) => (
            <li
              key={i}
              className="flex items-start gap-3 rounded-xl border border-border/60 bg-card/50 p-3"
            >
              <span
                aria-hidden
                className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[12px] font-bold text-primary tabular-nums"
              >
                {i + 1}
              </span>
              <p className="text-[14.5px] leading-relaxed text-foreground/85">
                {m}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <Link
          href="/wizard"
          className="flex min-h-[80px] w-full items-center justify-between gap-3 rounded-2xl bg-primary px-5 py-4 text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <span className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary-foreground/15">
              <Bot className="h-5 w-5" strokeWidth={2} />
            </span>
            <span>
              <span className="block text-[13px] font-semibold uppercase tracking-wider opacity-90">
                Paso 4
              </span>
              <span className="block text-[17px] font-bold leading-tight">
                Ya tengo mi caja: ver qué dieta usar
              </span>
            </span>
          </span>
          <ChevronRight className="h-5 w-5" strokeWidth={2.5} />
        </Link>
        <p className="mt-3 text-[13.5px] leading-relaxed text-foreground/70">
          ¿Tiene otra duda?{" "}
          <Link
            href="/chat"
            className="font-semibold text-primary underline underline-offset-2"
          >
            Pregúntele al asistente
          </Link>
          .
        </p>
      </section>
    </main>
  );
}
