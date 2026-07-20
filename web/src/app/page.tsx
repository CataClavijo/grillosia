"use client";

import Link from "next/link";
import {
  Beef,
  Bug,
  ChevronRight,
  Droplets,
  Egg,
  Fish,
  GraduationCap,
  Package,
  Sparkles,
  Thermometer,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { SiteNav } from "@/components/site-nav";
import { usePaso } from "@/lib/use-paso";

const guia = [
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
    title: "Qué comida usar",
    subtitle: "Le sugerimos cuál se acerca más.",
  },
];

const cifras = [
  {
    value: "60 a 70",
    unit: "%",
    label: "Meta interna de proteína en la harina, a confirmar en laboratorio",
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

export default function Home() {
  const { siguiente } = usePaso();

  return (
    <main className="mx-auto flex w-full max-w-[520px] flex-col gap-14 px-6 pb-16 pt-5">
      {/* Cabecera */}
      <header className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="inline-flex size-9 items-center justify-center rounded-lg bg-primary/10"
          >
            <span className="block size-2.5 rotate-45 bg-primary" />
          </span>
          <span className="text-lg font-bold tracking-tight">GrillIA</span>
        </Link>
        <SiteNav />
      </header>

      {/* Hero */}
      <section className="flex flex-col gap-6">
        <p className="inline-flex w-fit items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-[13px] font-medium text-foreground/85">
          <span className="inline-block size-1.5 rounded-full bg-accent" />
          Piedemonte Llanero · Minciencias 963 · 2025
        </p>

        <h1 className="text-[2.5rem] font-bold leading-[1.05] tracking-[-0.025em] sm:text-[2.85rem]">
          Aprenda a criar grillos
          <br />
          <span className="text-primary">y sepa qué darles</span>
          <br />
          de comer.
        </h1>

        <p className="text-[18px] leading-relaxed text-foreground/85">
          Le mostramos cómo armar la caja y le sugerimos qué comidas comparar
          para su tilapia, pollo o cerdo. Con grillos nativos del Piedemonte
          Llanero.
        </p>

        <div className="flex flex-col items-center gap-1">
          <Button
            asChild
            size="lg"
            className="h-[68px] w-full rounded-2xl text-[18px] font-bold"
          >
            <Link href={siguiente.href}>{siguiente.label}</Link>
          </Button>
          <Link
            href="/proyectos"
            className="flex min-h-14 items-center text-[16px] font-semibold text-foreground/85 underline underline-offset-4 hover:text-foreground"
          >
            Ver mis consultas guardadas
          </Link>
        </div>
      </section>

      {/* Recorra la guía en orden */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-[1.55rem] font-bold leading-tight tracking-[-0.015em]">
            Recorra la guía en orden
          </h2>
          <p className="text-[16px] text-muted-foreground">
            Cuatro pasos, en el orden que se lo recomendamos.
          </p>
        </div>
        <ol className="flex flex-col gap-3">
          {guia.map((step) => {
            const Icon = step.icon;
            return (
              <li key={step.href}>
                <Link
                  href={step.href}
                  className="flex min-h-20 items-center gap-4 rounded-2xl border bg-card p-4 transition-colors hover:border-primary/40"
                >
                  <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-[15px] font-extrabold tabular-nums text-primary-foreground">
                    {step.n}
                  </span>
                  <span className="flex-1">
                    <span className="flex items-center gap-2 text-[17px] font-bold leading-tight">
                      <Icon className="size-4 text-primary" strokeWidth={2} />
                      {step.title}
                    </span>
                    <span className="mt-1 block text-[14px] leading-snug text-muted-foreground">
                      {step.subtitle}
                    </span>
                  </span>
                  <ChevronRight
                    className="size-5 shrink-0 text-primary"
                    strokeWidth={2.5}
                  />
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Las cifras */}
      <section className="flex flex-col gap-4">
        <h2 className="text-[1.55rem] font-bold leading-tight tracking-[-0.015em]">
          Las cifras
        </h2>
        <div className="flex flex-col gap-3">
          {cifras.map((f) => (
            <div
              key={f.label}
              className="flex items-center gap-5 rounded-2xl border bg-card px-5 py-5"
            >
              <p className="flex shrink-0 items-baseline gap-1.5 whitespace-nowrap">
                <span className="text-[3rem] font-extrabold leading-none tracking-[-0.025em]">
                  {f.value}
                </span>
                {f.unit && (
                  <span className="text-2xl font-bold leading-none text-muted-foreground">
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
      </section>

      {/* Para qué animales sirve */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-[1.55rem] font-bold leading-tight tracking-[-0.015em]">
            Para qué animales sirve
          </h2>
          <p className="text-[16px] text-muted-foreground">
            Le adaptamos la sugerencia según su animal.
          </p>
        </div>
        <ul className="flex flex-col gap-3">
          {animals.map((a) => {
            const Icon = a.icon;
            return (
              <li
                key={a.name}
                className="flex items-center gap-4 rounded-2xl border bg-card p-4"
              >
                <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-7" strokeWidth={1.5} />
                </span>
                <div className="flex-1">
                  <p className="text-[19px] font-bold">{a.name}</p>
                  <p className="mt-0.5 text-[15px] font-semibold text-primary">
                    {a.range}
                  </p>
                  <p className="mt-1 text-[13.5px] text-muted-foreground">
                    {a.stages}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Clima */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-[1.55rem] font-bold leading-tight tracking-[-0.015em]">
            Con qué calor y humedad trabajamos
          </h2>
          <p className="text-[16px] text-muted-foreground">
            Rangos que buscamos en el estudio.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <ClimateTile icon={Thermometer} label="Calor" from="24" to="34" unit="°C" />
          <ClimateTile icon={Droplets} label="Humedad" from="50" to="80" unit="%" />
        </div>
        <p className="text-[15px] leading-relaxed text-foreground/85">
          Son los rangos que buscamos como objetivo del estudio, no medidas
          que ya tengamos anotadas.
        </p>
      </section>
    </main>
  );
}

function ClimateTile({
  icon: Icon,
  label,
  from,
  to,
  unit,
}: {
  icon: typeof Thermometer;
  label: string;
  from: string;
  to: string;
  unit: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border bg-card p-4">
      <div className="flex items-center gap-2 text-primary">
        <Icon className="size-5" strokeWidth={1.75} />
        <span className="text-[14px] font-semibold text-foreground/85">
          {label}
        </span>
      </div>
      <p className="flex items-baseline gap-1.5 text-[2rem] font-extrabold leading-none tracking-[-0.02em]">
        <span>{from}</span>
        <span className="text-[1.3rem] font-semibold text-muted-foreground">
          a
        </span>
        <span>{to}</span>
        <span className="ml-1 text-base font-bold text-muted-foreground">
          {unit}
        </span>
      </p>
    </div>
  );
}
