"use client";

import Link from "next/link";
import { Beef, Egg, Fish } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SiteNav } from "@/components/site-nav";
import { usePaso } from "@/lib/use-paso";

const animals = [
  { icon: Fish, name: "Tilapia", range: "30 a 45 % de proteína" },
  { icon: Egg, name: "Pollo", range: "18 a 23 % de proteína" },
  { icon: Beef, name: "Cerdo", range: "14 a 20 % de proteína" },
];

export default function Home() {
  const { siguiente } = usePaso();

  return (
    <main className="mx-auto flex w-full max-w-[520px] flex-col gap-16 px-6 pb-16 pt-5">
      {/* Cabecera: logo + menú. Nada más. */}
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

      {/* Lo único importante de la pantalla */}
      <section className="flex flex-col gap-6">
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
            href="/chat"
            className="flex min-h-14 items-center text-[16px] font-semibold text-foreground/85 underline underline-offset-4 hover:text-foreground"
          >
            Ya conozco, quiero preguntar algo
          </Link>
        </div>
      </section>

      {/* Para qué animales sirve — informativo, sin bordes ni círculos */}
      <section className="flex flex-col gap-4">
        <h2 className="text-[1.4rem] font-bold tracking-[-0.015em]">
          Para qué animales sirve
        </h2>
        <ul className="flex flex-col gap-2">
          {animals.map((a) => {
            const Icon = a.icon;
            return (
              <li
                key={a.name}
                className="flex items-center gap-4 rounded-xl bg-card px-4 py-3.5"
              >
                <Icon className="size-6 shrink-0 text-primary" strokeWidth={1.5} />
                <span className="flex-1 text-[17px] font-semibold">
                  {a.name}
                </span>
                <span className="text-[14px] font-medium text-muted-foreground">
                  {a.range}
                </span>
              </li>
            );
          })}
        </ul>
        <p className="text-[15px] leading-relaxed text-foreground/85">
          Buscamos una harina con 60 a 70 % de proteína.{" "}
          <span className="text-muted-foreground">
            Es una meta interna del proyecto, todavía en estudio.
          </span>
        </p>
      </section>
    </main>
  );
}
