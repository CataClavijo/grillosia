"use client";

import Image from "next/image";
import Link from "next/link";

import { SiteNav } from "@/components/site-nav";
import { CAMINO } from "@/lib/camino";
import { usePaso } from "@/lib/use-paso";

/**
 * Inicio.
 *
 * Antes ofrecia nueve salidas: nueve decisiones antes de hacer nada. Ahora
 * ofrece una, mas el menu.
 *
 * Las cuatro paradas se listan debajo para que se vea el camino completo de
 * una ojeada —cuanto falta, adonde lleva— pero no compiten con el boton: son
 * texto con numero, no botones.
 */
export default function Inicio() {
  const { siguiente } = usePaso();

  // Quien ya crio grillos no tiene por que pasar por la guia de la caja. El
  // atajo existe, pero discreto: nunca al lado del boton grande.
  const empezando = siguiente.href === CAMINO[0].href;

  return (
    <main className="mx-auto flex w-full max-w-[560px] flex-col">
      <header className="flex items-center justify-between px-5 pt-4">
        <span className="flex items-center gap-2">
          <Image src="/logo.png" alt="" width={38} height={38} priority />
          <span className="font-display text-[19px] font-bold tracking-[-0.02em]">
            GrillosIA
          </span>
        </span>
        <SiteNav />
      </header>

      {/* Hero. La lamina va abajo del todo, como suelo, y el texto encima. */}
      <section className="relative overflow-hidden px-5 pt-7">
        <p className="rotulo text-muted-foreground">Piedemonte Llanero</p>

        <h1 className="mt-3 font-display text-[2.1rem] font-extrabold leading-[1.05] tracking-[-0.03em]">
          Críe grillos y sepa
          <br />
          <em className="font-serif not-italic italic font-normal text-primary">
            qué darles de comer.
          </em>
        </h1>

        <p className="mt-3.5 text-[16.5px] leading-relaxed text-foreground/85">
          Le acompañamos en cuatro pasos, desde armar la caja hasta saber qué
          comida le conviene a su tilapia, pollo o cerdo.
        </p>

        <Link
          href={siguiente.href}
          className="relative z-10 mt-6 flex min-h-14 w-full items-center justify-center rounded-full bg-primary px-6 text-[17px] font-bold text-primary-foreground transition-opacity hover:opacity-92"
        >
          {empezando ? "Empezar por el paso 1" : `Seguir en el paso ${siguiente.n}`}
        </Link>

        <div className="pointer-events-none relative mt-6 h-[128px]">
          <Image
            src="/arte/llanura.webp"
            alt=""
            width={1000}
            height={547}
            aria-hidden
            className="lamina absolute -left-[4%] bottom-0 w-[108%] max-w-none"
          />
          <span
            aria-hidden
            className="absolute inset-0 bg-gradient-to-b from-background via-background/55 to-transparent"
          />
        </div>
      </section>

      {/* El camino completo, para verlo de una ojeada. No son botones. */}
      <section className="mt-2 px-5 pb-10">
        <p className="rotulo text-muted-foreground">El camino</p>
        <ol className="mt-3 flex flex-col">
          {CAMINO.map((p) => (
            <li key={p.n} className="flex gap-3.5 border-t py-3.5">
              <span className="rotulo mt-1 w-7 shrink-0 text-primary">
                0{p.n}
              </span>
              <span>
                <span className="block font-display text-[16.5px] font-bold tracking-[-0.015em]">
                  {p.titulo}
                </span>
                <span className="mt-0.5 block text-[14px] leading-relaxed text-muted-foreground">
                  {p.resumen}
                </span>
              </span>
            </li>
          ))}
        </ol>

        {empezando && (
          <p className="mt-5 text-center text-[14.5px] text-muted-foreground">
            ¿Ya tiene sus grillos criados?{" "}
            <Link
              href="/consulta"
              className="font-semibold text-primary underline underline-offset-2"
            >
              Vaya directo a la consulta
            </Link>
          </p>
        )}
      </section>
    </main>
  );
}
