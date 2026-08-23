"use client";

import Image from "next/image";
import Link from "next/link";

import { Banda } from "@/components/banda";
import { SiteNav } from "@/components/site-nav";
import { ANIMALS } from "@/lib/animals";
import { CAMINO } from "@/lib/camino";
import { usePaso } from "@/lib/use-paso";

/**
 * Inicio.
 *
 * Antes ofrecia nueve salidas: nueve decisiones antes de hacer nada. Ahora
 * ofrece una accion, y debajo el contexto que un visitante nuevo necesita
 * para confiar antes de empezar: que es esto, por que existe, para que sirve
 * y quien lo hace.
 *
 * Las cuatro paradas se listan para que se vea el camino de una ojeada, pero
 * no compiten con el boton: son texto numerado, no botones.
 */
export default function Inicio() {
  const { siguiente } = usePaso();
  const empezando = siguiente.n === 1;

  return (
    <main className="mx-auto flex w-full max-w-[560px] flex-col px-5 pb-4">
      <header className="flex items-center justify-between pt-4">
        <span className="flex items-center gap-2">
          <Image src="/logo.png" alt="" width={38} height={38} priority />
          <span className="font-display text-[19px] font-bold tracking-[-0.02em]">
            GrillosIA
          </span>
        </span>
        <SiteNav />
      </header>

      {/* ── Portada ─────────────────────────────────────────── */}
      <section className="pt-7">
        <p className="rotulo text-muted-foreground">Piedemonte Llanero</p>
        <h1 className="mt-3 font-display text-[2.15rem] font-extrabold leading-[1.05] tracking-[-0.03em]">
          Críe grillos y sepa
          <br />
          <span className="font-serif text-primary italic font-normal">
            qué darles de comer.
          </span>
        </h1>
        <p className="mt-3.5 text-[16.5px] leading-relaxed text-foreground/85">
          Le acompañamos en cuatro pasos, desde armar la caja hasta saber qué
          comida le conviene a su tilapia, pollo o cerdo.
        </p>
        <Link
          href={siguiente.href}
          className="mt-6 flex min-h-14 w-full items-center justify-center rounded-full bg-primary px-6 text-[17px] font-bold text-primary-foreground transition-opacity hover:opacity-90"
        >
          {empezando ? "Empezar por el paso 1" : `Seguir en el paso ${siguiente.n}`}
        </Link>
      </section>

      {/* La lamina va DESPUES del boton, como banda separadora: asi el boton
          respira y la ilustracion no compite con la accion. */}
      <Banda src="/arte/llanura.webp" alto="h-[168px]" className="mt-7" />

      {/* ── Qué es ──────────────────────────────────────────── */}
      <section className="pt-8">
        <p className="rotulo text-muted-foreground">Qué es</p>
        <h2 className="mt-2 font-display text-[1.5rem] font-extrabold leading-[1.15] tracking-[-0.025em]">
          Una herramienta para decidir qué darles de comer
        </h2>
        <p className="mt-3 text-[16px] leading-relaxed text-foreground/85">
          Estamos comparando tres comidas para grillos y midiendo qué harina da
          cada una. Con eso, la aplicación le sugiere cuál se acerca más a lo
          que su animal necesita, según su clima y su etapa de cría.
        </p>
        <p className="mt-3 text-[16px] leading-relaxed text-foreground/85">
          Es un proyecto de investigación de la Universidad de los Llanos, y
          está abierto para que usted lo use mientras aprendemos.
        </p>
      </section>

      {/* ── Por qué ─────────────────────────────────────────── */}
      <section className="pt-9">
        <p className="rotulo text-muted-foreground">Por qué</p>
        <h2 className="mt-2 font-display text-[1.5rem] font-extrabold leading-[1.15] tracking-[-0.025em]">
          La proteína del campo, criada en el campo
        </h2>
        <p className="mt-3 text-[16px] leading-relaxed text-foreground/85">
          Buena parte de la harina que alimenta a los peces y las aves del país
          viene de afuera y cuesta cara. El grillo se cría en poco espacio, come
          poco y da una harina rica en proteína.
        </p>
        <p className="mt-3 text-[16px] leading-relaxed text-foreground/85">
          Lo que falta es saber, con números, qué comida conviene darle a los
          grillos para cada caso. En eso estamos.
        </p>
      </section>

      <div className="flex justify-center pt-6">
        <Image
          src="/arte/harina.webp"
          alt=""
          width={620}
          height={520}
          aria-hidden
          className="lamina h-auto w-full max-w-[250px]"
        />
      </div>

      <div className="flex justify-center pt-8">
        <Image
          src="/arte/grillo.webp"
          alt=""
          width={620}
          height={430}
          aria-hidden
          className="lamina h-auto w-full max-w-[340px]"
        />
      </div>

      {/* ── El camino ───────────────────────────────────────── */}
      <section className="pt-4">
        <p className="rotulo text-muted-foreground">El camino</p>
        <h2 className="mt-2 font-display text-[1.5rem] font-extrabold leading-[1.15] tracking-[-0.025em]">
          Cuatro pasos, en orden
        </h2>
        <ol className="mt-4 flex flex-col">
          {CAMINO.map((p) => (
            <li key={p.n} className="flex gap-3.5 border-t py-4">
              <span className="rotulo mt-1 w-7 shrink-0 text-primary">
                0{p.n}
              </span>
              <span>
                <span className="block font-display text-[16.5px] font-bold tracking-[-0.015em]">
                  {p.titulo}
                </span>
                <span className="mt-0.5 block text-[14.5px] leading-relaxed text-muted-foreground">
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

      {/* ── Para qué animales ───────────────────────────────── */}
      <section className="pt-9">
        <p className="rotulo text-muted-foreground">Para qué animales</p>
        <h2 className="mt-2 font-display text-[1.5rem] font-extrabold leading-[1.15] tracking-[-0.025em]">
          Tilapia, pollo y cerdo
        </h2>
        <Image
          src="/arte/animales.webp"
          alt=""
          width={900}
          height={300}
          aria-hidden
          className="lamina mt-4 h-auto w-full"
        />
        <ul className="mt-4 flex flex-col gap-2.5">
          {ANIMALS.map((a) => {
            const min = Math.min(...a.stages.map((e) => e.proteinMin));
            const max = Math.max(...a.stages.map((e) => e.proteinMax));
            return (
              <li
                key={a.id}
                className="flex items-baseline justify-between gap-3 rounded-2xl border bg-card px-4 py-3.5"
              >
                <span className="font-display text-[16.5px] font-bold tracking-[-0.015em]">
                  {a.name}
                </span>
                <span className="rotulo text-muted-foreground">
                  {min}–{max} % proteína
                </span>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
          Los requerimientos vienen de las tablas de referencia NRC para
          alimentación animal.
        </p>
      </section>

      {/* ── Quién lo hace ───────────────────────────────────── */}
      <section className="pt-9 pb-2">
        <p className="rotulo text-muted-foreground">Quién lo hace</p>
        <h2 className="mt-2 font-display text-[1.5rem] font-extrabold leading-[1.15] tracking-[-0.025em]">
          Universidad de los Llanos
        </h2>
        <p className="mt-3 text-[16px] leading-relaxed text-foreground/85">
          Con financiación de Minciencias, convocatoria 963 de 2025. La
          investigación la dirige la Dra. Mónica Paola Higuera-Díaz.
        </p>
        <Link
          href="/proyecto"
          className="mt-4 inline-flex min-h-12 items-center rounded-full border-2 border-primary px-5 text-[15.5px] font-bold text-primary transition-colors hover:bg-primary/5"
        >
          Conozca el proyecto
        </Link>
      </section>
    </main>
  );
}
