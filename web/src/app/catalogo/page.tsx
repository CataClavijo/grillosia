import Link from "next/link";
import { Bug, ChevronLeft, Info, Moon, Sun, Sunset } from "lucide-react";

import { CATALOG_INTRO, CATALOG_NOTE, CRICKETS } from "@/lib/content/catalog";
import { SiteNav } from "@/components/site-nav";
import { renderMarkdownBlock } from "@/lib/markdown";

const ACTIVITY_ICON = {
  Nocturno: Moon,
  Crepuscular: Sunset,
  Diurno: Sun,
} as const;

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
          Grillos del Piedemonte Llanero
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
                  className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11.5px] font-bold uppercase tracking-wider text-foreground/70"
                  aria-label={`Actividad ${c.activity.toLowerCase()}`}
                >
                  <ActivityIcon className="h-3.5 w-3.5" strokeWidth={2} />
                  {c.activity}
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

      <section className="mt-10 rounded-2xl border border-border/60 bg-card/50 p-4 text-[13px] leading-relaxed text-foreground/70">
        ¿No está seguro de qué grillo tiene? Pregúntele al{" "}
        <Link
          href="/chat"
          className="font-semibold text-primary underline underline-offset-2"
        >
          asistente
        </Link>{" "}
        o consulte la guía para armar sus cajas antes de empezar.
      </section>
    </main>
  );
}
