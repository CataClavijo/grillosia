import Link from "next/link";
import {
  Bug,
  ChevronLeft,
  ChevronRight,
  Info,
  Moon,
  Package,
  Sun,
  Sunset,
} from "lucide-react";

import { CATALOG_INTRO, CATALOG_NOTE, CRICKETS } from "@/lib/content/catalog";
import { SiteNav } from "@/components/site-nav";
import { renderMarkdownBlock } from "@/lib/markdown";

const ACTIVITY_ICON = {
  Nocturno: Moon,
  Crepuscular: Sunset,
  Diurno: Sun,
} as const;

const ACTIVITY_LABEL: Record<string, string> = {
  Nocturno: "Sale de noche",
  Crepuscular: "Sale al amanecer y al atardecer",
  Diurno: "Sale de día",
};

export const metadata = {
  title: "Catálogo de grillos — GrillIA",
  description:
    "Grillos nativos del Piedemonte Llanero considerados en el proyecto GrillIA.",
};

export default function CatalogPage() {
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
          <Bug className="h-6 w-6" strokeWidth={1.5} />
        </span>
        <h1 className="mt-5 text-[2rem] font-bold leading-tight tracking-[-0.02em]">
          Los grillos de nuestra tierra
        </h1>
        <div className="mt-4 space-y-4">{renderMarkdownBlock(CATALOG_INTRO)}</div>

        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-demo-border bg-demo-bg p-3">
          <Info
            className="mt-0.5 h-4 w-4 shrink-0 text-demo-foreground"
            strokeWidth={2.25}
          />
          <p className="text-[12.5px] leading-relaxed text-demo-foreground">
            {CATALOG_NOTE}
          </p>
        </div>
      </section>

      <section className="mt-10 space-y-4">
        {CRICKETS.map((c) => {
          const ActivityIcon = ACTIVITY_ICON[c.activity];
          return (
            <article
              key={c.id}
              className="rounded-2xl border border-border/70 bg-card/70 p-5"
            >
              <header className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h2 className="text-[19px] font-bold leading-tight">
                    {c.common_name}
                  </h2>
                  <p className="mt-1 text-[13px] font-semibold text-primary">
                    {c.size_cm}
                    <span className="ml-2 font-normal text-foreground/60">
                      {c.habitat}
                    </span>
                  </p>
                </div>
                <span
                  className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1.5 text-[12px] font-semibold text-foreground/85"
                  aria-label={ACTIVITY_LABEL[c.activity] ?? c.activity}
                >
                  <ActivityIcon className="h-3.5 w-3.5" strokeWidth={2} />
                  {ACTIVITY_LABEL[c.activity] ?? c.activity}
                </span>
              </header>

              <dl className="mt-4 space-y-3 text-[14px]">
                <div>
                  <dt className="text-[11.5px] font-bold uppercase tracking-wider text-foreground/55">
                    Cómo reconocerlo
                  </dt>
                  <dd className="mt-1 leading-relaxed text-foreground/85">
                    {c.recognition}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11.5px] font-bold uppercase tracking-wider text-foreground/55">
                    Cómo capturarlo
                  </dt>
                  <dd className="mt-1 leading-relaxed text-foreground/85">
                    {c.capture_tip}
                  </dd>
                </div>
                <div className="rounded-xl bg-primary/5 px-3 py-2.5 text-[13px]">
                  <span className="font-semibold text-primary">
                    Aptitud:
                  </span>{" "}
                  <span className="text-foreground/80">{c.suitability}</span>
                </div>
              </dl>
            </article>
          );
        })}
      </section>

      {/* Puente al siguiente paso */}
      <section className="mt-10">
        <Link
          href="/como-armar"
          className="flex min-h-[80px] w-full items-center justify-between gap-3 rounded-2xl bg-primary px-5 py-4 text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <span className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary-foreground/15">
              <Package className="h-5 w-5" strokeWidth={2} />
            </span>
            <span>
              <span className="block text-[13px] font-semibold uppercase tracking-wider opacity-90">
                Paso 3
              </span>
              <span className="block text-[17px] font-bold leading-tight">
                Cómo armar mi caja
              </span>
            </span>
          </span>
          <ChevronRight className="h-5 w-5" strokeWidth={2.5} />
        </Link>
        <p className="mt-3 text-[13.5px] leading-relaxed text-foreground/70">
          ¿No está seguro de qué grillo tiene?{" "}
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
