import Link from "next/link";
import { ChevronLeft, FlaskConical } from "lucide-react";

import { SiteNav } from "@/components/site-nav";
import { MethodologyIcon } from "@/components/methodology-icon";
import { renderMarkdownBlock } from "@/lib/markdown";
import {
  HERO_SUBTITLE,
  HERO_TITLE,
  METHODOLOGY_SECTIONS,
  REFERENCES,
} from "@/lib/content/methodology";

export const metadata = {
  title: "Metodología — GrillIA",
  description: HERO_SUBTITLE,
};

export default function MethodologyPage() {
  return (
    <main className="relative mx-auto flex w-full max-w-[560px] flex-col px-6 pb-16 pt-5">
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
          <FlaskConical className="h-6 w-6" strokeWidth={1.5} />
        </span>
        <p className="eyebrow mt-5 text-primary">Metodología del proyecto</p>
        <h1 className="mt-2 text-[2rem] font-bold leading-tight tracking-[-0.02em]">
          {HERO_TITLE}
        </h1>
        <p className="mt-3 text-[16px] leading-relaxed text-foreground/70">
          {HERO_SUBTITLE}
        </p>
      </section>

      <nav
        aria-label="Índice"
        className="mt-8 rounded-2xl border border-border/60 bg-card/50 p-4"
      >
        <p className="text-[11.5px] font-bold uppercase tracking-wider text-foreground/55">
          Contenido
        </p>
        <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {METHODOLOGY_SECTIONS.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[13.5px] font-semibold text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
              >
                <MethodologyIcon
                  name={s.icon}
                  className="h-4 w-4 text-primary"
                  strokeWidth={2}
                />
                {s.title}
              </a>
            </li>
          ))}
          <li>
            <a
              href="#referencias"
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[13.5px] font-semibold text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
            >
              <MethodologyIcon
                name="book-open"
                className="h-4 w-4 text-primary"
                strokeWidth={2}
              />
              Referencias
            </a>
          </li>
        </ul>
      </nav>

      <div className="mt-10 space-y-12">
        {METHODOLOGY_SECTIONS.map((s) => (
          <section key={s.id} id={s.id} className="scroll-mt-24">
            <header className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <MethodologyIcon
                  name={s.icon}
                  className="h-5 w-5"
                  strokeWidth={1.75}
                />
              </span>
              <h2 className="text-[1.4rem] font-bold leading-tight tracking-[-0.015em]">
                {s.title}
              </h2>
            </header>
            <div className="mt-5 space-y-4">
              {renderMarkdownBlock(s.body_markdown)}
            </div>
          </section>
        ))}

        <section id="referencias" className="scroll-mt-24">
          <header className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <MethodologyIcon
                name="book-open"
                className="h-5 w-5"
                strokeWidth={1.75}
              />
            </span>
            <h2 className="text-[1.4rem] font-bold leading-tight tracking-[-0.015em]">
              Referencias
            </h2>
          </header>
          <ul className="mt-6 space-y-4">
            {REFERENCES.map((r, i) => (
              <li
                key={i}
                className="rounded-2xl border border-border/70 bg-card/60 p-4"
              >
                <p className="text-[14px] leading-relaxed text-foreground/85">
                  {r.citation}
                </p>
                <p className="mt-2 text-[12.5px] italic leading-relaxed text-foreground/60">
                  {r.note}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
