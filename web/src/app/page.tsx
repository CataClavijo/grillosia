import type { CSSProperties } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Beef,
  Bug,
  ChevronRight,
  Droplets,
  Egg,
  Fish,
  GraduationCap,
  MessageCircle,
  Package,
  Sparkles,
  Thermometer,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { SiteNav } from "@/components/site-nav";
import { InterestForm } from "@/components/interest-form";
import { FirstVisitPrompt } from "@/components/first-visit-prompt";

const journey = [
  {
    n: 1,
    href: "/tutorial",
    icon: GraduationCap,
    title: "Cómo empezar",
    subtitle: "Un recorrido corto para no perderse.",
  },
  {
    n: 2,
    href: "/catalogo",
    icon: Bug,
    title: "Los grillos de la tierra",
    subtitle: "Cuáles usamos y cómo se reconocen.",
  },
  {
    n: 3,
    href: "/como-armar",
    icon: Package,
    title: "Cómo armar sus cajas",
    subtitle: "Paso a paso con materiales baratos.",
  },
  {
    n: 4,
    href: "/wizard",
    icon: Sparkles,
    title: "Consulta paso a paso",
    subtitle: "Le sugerimos qué dieta usar.",
  },
];

const figures = [
  {
    value: "60 a 70",
    unit: "%",
    label:
      "Meta interna de proteína en la harina, a confirmar en laboratorio",
  },
  { value: "3", unit: "", label: "Comidas que estamos probando" },
  { value: "3", unit: "", label: "Animales para los que sirve la harina" },
];

const animals = [
  {
    icon: Fish,
    name: "Tilapia",
    range: "30 a 45 % de proteína",
    stages: "Alevines, crecimiento, engorde",
  },
  {
    icon: Egg,
    name: "Pollo",
    range: "18 a 23 % de proteína",
    stages: "Inicio, crecimiento, engorde",
  },
  {
    icon: Beef,
    name: "Cerdo",
    range: "14 a 20 % de proteína",
    stages: "Inicio, crecimiento, engorde",
  },
];

const d = (ms: number): CSSProperties =>
  ({ ["--delay" as string]: `${ms}ms` }) as CSSProperties;

export default function Home() {
  return (
    <main className="relative mx-auto flex w-full max-w-[520px] flex-col px-6 pb-16 pt-5">
      {/* Cabecera */}
      <header className="reveal flex items-center justify-between" style={d(0)}>
        <Link href="/" className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10"
          >
            <span className="block h-2.5 w-2.5 rotate-45 bg-primary" />
          </span>
          <span className="text-lg font-bold tracking-tight">GrillIA</span>
        </Link>
        <SiteNav />
      </header>

      {/* Aviso primera visita → tutorial */}
      <FirstVisitPrompt />

      {/* Hero */}
      <section className="mt-10">
        <p
          className="reveal inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1.5 text-[13px] font-medium text-foreground/85"
          style={d(80)}
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
          Piedemonte Llanero · Minciencias 963 · 2025
        </p>

        <h1
          className="reveal mt-6 text-[2.5rem] font-bold leading-[1.05] tracking-[-0.025em] sm:text-[2.85rem]"
          style={d(160)}
        >
          Le ayudamos a
          <br />
          <span className="text-primary">criar sus grillos</span>
          <br />
          nativos.
        </h1>

        <p
          className="reveal mt-6 text-[18px] leading-relaxed text-foreground/85"
          style={d(280)}
        >
          Le enseñamos cómo armar las cajas, qué darles de comer y qué harina
          esperar. Los grillos son nativos del Piedemonte Llanero, para
          alimentar tilapia, pollo y cerdo.
        </p>

        {/* Un solo CTA primario grande. Todo lo demás es secundario. */}
        <div className="reveal mt-8" style={d(420)}>
          <Button
            asChild
            size="lg"
            className="h-16 w-full justify-between rounded-2xl px-6 text-[18px] font-bold"
          >
            <Link href="/tutorial" aria-label="Comenzar el recorrido">
              <span className="flex items-center gap-3">
                <GraduationCap className="h-6 w-6" strokeWidth={2} />
                Comience aquí
              </span>
              <ArrowRight className="h-5 w-5" strokeWidth={2.5} />
            </Link>
          </Button>
          <Link
            href="/chat"
            className="mt-4 block text-center text-[15px] font-semibold text-foreground/85 underline underline-offset-4 hover:text-foreground"
          >
            Ya conozco, quiero preguntar algo
          </Link>
        </div>
      </section>

      <Divider delay={620} />

      {/* Recorra la guía — numerado */}
      <section>
        <h2 className="text-[1.55rem] font-bold leading-tight tracking-[-0.015em]">
          Recorra la guía en orden
        </h2>
        <p className="mt-2 text-[16px] text-foreground/75">
          Cuatro pasos, en el orden que se lo recomendamos.
        </p>
        <ol className="mt-6 space-y-3">
          {journey.map((step) => {
            const Icon = step.icon;
            return (
              <li key={step.href}>
                <Link
                  href={step.href}
                  className="flex min-h-[80px] items-center gap-4 rounded-2xl border border-border/70 bg-card/70 p-4 transition-colors hover:border-primary/40 hover:bg-card"
                >
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-[15px] font-extrabold tabular-nums">
                    {step.n}
                  </span>
                  <div className="flex-1">
                    <p className="text-[17px] font-bold leading-tight">
                      {step.title}
                    </p>
                    <p className="mt-1 text-[14px] leading-snug text-foreground/75">
                      {step.subtitle}
                    </p>
                  </div>
                  <ChevronRight
                    className="h-5 w-5 shrink-0 text-primary"
                    strokeWidth={2.5}
                  />
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      <Divider />

      {/* Cifras clave — copy más llano */}
      <Section title="Las cifras" subtitle="Resumen del proyecto.">
        <div className="mt-8 grid grid-cols-1 gap-4">
          {figures.map((f, i) => (
            <div
              key={f.label}
              className="reveal flex items-center gap-5 rounded-2xl border border-border/70 bg-card/60 px-5 py-5"
              style={d(120 + i * 90)}
            >
              <p className="flex shrink-0 items-baseline gap-1.5 whitespace-nowrap">
                <span className="text-[3rem] font-extrabold leading-none tracking-[-0.025em]">
                  {f.value}
                </span>
                {f.unit && (
                  <span className="text-2xl font-bold leading-none text-foreground/70">
                    {f.unit}
                  </span>
                )}
              </p>
              <p className="flex-1 text-[15.5px] font-semibold leading-snug text-foreground/85">
                {f.label}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Divider />

      {/* Animales */}
      <Section
        title="Para qué animales sirve"
        subtitle="Le adaptamos la sugerencia según su animal."
      >
        <ul className="mt-8 space-y-4">
          {animals.map((a, i) => {
            const Icon = a.icon;
            return (
              <li
                key={a.name}
                className="reveal flex items-center gap-4 rounded-2xl border border-border/70 bg-card/70 p-4"
                style={d(120 + i * 90)}
              >
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-7 w-7" strokeWidth={1.5} />
                </span>
                <div className="flex-1">
                  <p className="text-[19px] font-bold">{a.name}</p>
                  <p className="mt-0.5 text-[15px] font-semibold text-primary">
                    {a.range}
                  </p>
                  <p className="mt-1 text-[13.5px] text-foreground/75">
                    {a.stages}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </Section>

      <Divider />

      {/* Condiciones */}
      <Section
        title="Con qué calor y humedad trabajamos"
        subtitle="Rangos que buscamos en el estudio."
      >
        <div className="mt-8 grid grid-cols-2 gap-4">
          <ClimateTile
            icon={Thermometer}
            label="Calor"
            from="24"
            to="34"
            unit="°C"
            delayMs={120}
          />
          <ClimateTile
            icon={Droplets}
            label="Humedad"
            from="50"
            to="80"
            unit="%"
            delayMs={210}
          />
        </div>
        <p
          className="reveal mt-6 text-[15.5px] leading-relaxed text-foreground/85"
          style={d(320)}
        >
          Son los rangos que buscamos como objetivo del estudio, no medidas
          que ya tengamos anotadas.
        </p>
      </Section>

      <Divider />

      {/* CTA final grande */}
      <section>
        <h2 className="text-[1.7rem] font-bold leading-[1.15] tracking-[-0.015em]">
          ¿Listo para empezar?
        </h2>
        <p className="mt-2 text-[16px] leading-relaxed text-foreground/85">
          Le tomará solo unos minutos.
        </p>
        <div className="reveal mt-6" style={d(160)}>
          <Button
            asChild
            size="lg"
            className="h-16 w-full justify-between rounded-2xl px-6 text-[18px] font-bold"
          >
            <Link href="/tutorial">
              <span className="flex items-center gap-3">
                <GraduationCap className="h-6 w-6" strokeWidth={2} />
                Comience aquí
              </span>
              <ArrowRight className="h-5 w-5" strokeWidth={2.5} />
            </Link>
          </Button>
          <Link
            href="/chat"
            className="mt-4 flex items-center justify-center gap-2 rounded-2xl border border-border bg-card/60 py-3 text-[15px] font-semibold text-foreground/85"
          >
            <MessageCircle className="h-4 w-4 text-primary" strokeWidth={2} />
            Preguntar algo primero
          </Link>
        </div>
      </section>

      <Divider />

      {/* Interés — al final, no compitiendo con los CTAs */}
      <Section
        title="Estemos en contacto"
        subtitle="Le avisamos cuando el modelo esté validado."
      >
        <div className="mt-6">
          <InterestForm />
        </div>
      </Section>
    </main>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="reveal" style={d(0)}>
        <h2 className="text-[1.55rem] font-bold leading-tight tracking-[-0.015em]">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-2 text-[16px] text-foreground/75">{subtitle}</p>
        )}
      </div>
      {children}
    </section>
  );
}

function Divider({ delay = 0 }: { delay?: number }) {
  return (
    <div
      className="reveal my-14 flex items-center justify-center gap-2"
      style={d(delay)}
      aria-hidden
    >
      <span className="h-px w-12 bg-border" />
      <span className="inline-block h-1.5 w-1.5 rotate-45 bg-primary/50" />
      <span className="h-px w-12 bg-border" />
    </div>
  );
}

function ClimateTile({
  icon: Icon,
  label,
  from,
  to,
  unit,
  delayMs,
}: {
  icon: typeof Thermometer;
  label: string;
  from: string;
  to: string;
  unit: string;
  delayMs: number;
}) {
  return (
    <div
      className="reveal flex flex-col gap-3 rounded-2xl border border-border/70 bg-card/70 p-4"
      style={d(delayMs)}
    >
      <div className="flex items-center gap-2 text-primary">
        <Icon className="h-5 w-5" strokeWidth={1.75} />
        <span className="text-[14px] font-semibold text-foreground/85">
          {label}
        </span>
      </div>
      <p className="flex items-baseline gap-1.5 text-[2rem] font-extrabold leading-none tracking-[-0.02em]">
        <span>{from}</span>
        <span className="text-[1.3rem] font-semibold text-foreground/50">a</span>
        <span>{to}</span>
        <span className="ml-1 text-base font-bold text-foreground/70">
          {unit}
        </span>
      </p>
    </div>
  );
}
