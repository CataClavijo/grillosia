"use client";

import Image from "next/image";
import Link from "next/link";

import { Barra } from "@/components/barra";
import { PortadaHero } from "@/components/portada-hero";
import { ANIMALS } from "@/lib/animals";
import { CAMINO } from "@/lib/camino";
import { CIFRAS, OBJETIVOS, POR_QUE } from "@/lib/content/landing";
import { usePaso } from "@/lib/use-paso";

/**
 * Portada.
 *
 * Pensada para las dos anchuras: una columna en celular, rejilla en
 * escritorio. Antes era una pantalla de celular estirada, que en un monitor
 * se veia como una tira de texto en el centro.
 *
 * El orden sigue el de Campus MAS Agro, que resuelve bien el problema de un
 * visitante que no sabe nada: que es, por que existe, que se propone, para
 * quien, y quien responde por ello.
 */
export default function Inicio() {
  const { siguiente } = usePaso();
  const empezando = siguiente.n === 1;

  return (
    <>
      <Barra sobreHeroe />
      <PortadaHero
        href={siguiente.href}
        cta={empezando ? "Empezar por el paso 1" : `Seguir en el paso ${siguiente.n}`}
      />

      <main className="mx-auto w-full max-w-[1180px] px-5 lg:px-8">
        {/* ── Qué es ─────────────────────────────────────────── */}
        <section className="grid gap-7 border-b py-11 lg:grid-cols-[1fr_1.1fr] lg:gap-14 lg:py-14">
          <div>
            <p className="rotulo text-muted-foreground">Qué es</p>
            <h2 className="mt-3 font-display text-[1.75rem] font-extrabold leading-[1.12] tracking-[-0.028em] lg:text-[2.25rem]">
              Una herramienta para decidir qué darles de comer
            </h2>
          </div>
          <div className="flex flex-col gap-4 text-[16.5px] leading-relaxed text-foreground/85 lg:text-[17px]">
            <p>
              Estamos comparando tres comidas para grillos y midiendo qué harina
              da cada una. Con eso, la aplicación le sugiere cuál se acerca más a
              lo que su animal necesita, según su clima y su etapa de cría.
            </p>
            <p>
              Es una investigación de la Universidad de los Llanos, abierta para
              que usted la use mientras aprendemos.
            </p>
          </div>
        </section>

        {/* ── Por qué surge ──────────────────────────────────── */}
        <section className="grid gap-7 border-b py-11 lg:grid-cols-[1fr_1.1fr] lg:gap-14 lg:py-14">
          <div>
            <p className="rotulo text-muted-foreground">Por qué surge</p>
            <h2 className="mt-3 font-display text-[1.75rem] font-extrabold leading-[1.12] tracking-[-0.028em] lg:text-[2.25rem]">
              La proteína del campo, criada en el campo
            </h2>
          </div>
          <div className="flex flex-col gap-4 text-[16.5px] leading-relaxed text-foreground/85 lg:text-[17px]">
            {POR_QUE.map((t, i) => (
              <p key={i}>{t}</p>
            ))}
            <Image
              src="/arte/harina.webp"
              alt=""
              width={620}
              height={520}
              aria-hidden
              className="lamina mx-auto mt-2 h-auto w-full max-w-[240px] lg:mx-0 lg:max-w-[280px]"
            />
          </div>
        </section>

        {/* ── Objetivos ──────────────────────────────────────── */}
        <section className="border-b py-11 lg:py-14">
          <p className="rotulo text-muted-foreground">Qué nos proponemos</p>
          <h2 className="mt-3 max-w-[18ch] font-display text-[1.75rem] font-extrabold leading-[1.12] tracking-[-0.028em] lg:text-[2.25rem]">
            Cuatro objetivos
          </h2>
          <ul className="mt-6 grid gap-x-12 gap-y-8 border-t pt-8 sm:grid-cols-2">
            {OBJETIVOS.map((o) => (
              <li key={o.n}>
                <span className="rotulo text-primary">{o.n}</span>
                <h3 className="mt-2 font-display text-[17.5px] font-bold tracking-[-0.015em]">
                  {o.titulo}
                </h3>
                <p className="mt-1.5 text-[15px] leading-relaxed text-muted-foreground">
                  {o.cuerpo}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* ── El camino ──────────────────────────────────────── */}
        <section className="border-b py-11 lg:py-14">
          <p className="rotulo text-muted-foreground">Cómo se usa</p>
          <h2 className="mt-3 font-display text-[1.75rem] font-extrabold leading-[1.12] tracking-[-0.028em] lg:text-[2.25rem]">
            Cuatro pasos, en orden
          </h2>
          <ol className="mt-6 grid gap-x-10 gap-y-8 border-t pt-8 sm:grid-cols-2 lg:grid-cols-4">
            {CAMINO.map((p) => (
              <li key={p.n}>
                <span className="rotulo text-primary">0{p.n}</span>
                <Link
                  href={p.href}
                  className="mt-2 block font-display text-[17.5px] font-bold tracking-[-0.015em] hover:text-primary"
                >
                  {p.titulo}
                </Link>
                <p className="mt-1.5 text-[15px] leading-relaxed text-muted-foreground">
                  {p.resumen}
                </p>
              </li>
            ))}
          </ol>
          {empezando && (
            <p className="mt-8 text-[15px] text-muted-foreground">
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

        {/* ── Para qué animales ──────────────────────────────── */}
        <section className="grid gap-7 border-b py-11 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-14 lg:py-14">
          <div>
            <p className="rotulo text-muted-foreground">Para qué animales</p>
            <h2 className="mt-3 font-display text-[1.75rem] font-extrabold leading-[1.12] tracking-[-0.028em] lg:text-[2.25rem]">
              Tilapia, pollo y cerdo
            </h2>
            <ul className="mt-6 flex flex-col gap-2.5">
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
          </div>
          <Image
            src="/arte/animales.webp"
            alt=""
            width={900}
            height={300}
            aria-hidden
            className="lamina h-auto w-full"
          />
        </section>

        {/* ── Cifras ─────────────────────────────────────────── */}
        <section className="border-b py-11 lg:py-14">
          <p className="rotulo text-muted-foreground">El proyecto en números</p>
          <dl className="mt-6 grid grid-cols-2 gap-x-8 gap-y-8 border-t pt-8 lg:grid-cols-4">
            {CIFRAS.map((c) => (
              <div key={c.rotulo}>
                <dt className="font-display text-[2.6rem] font-extrabold leading-none tracking-[-0.035em] text-primary lg:text-[3.2rem]">
                  {c.valor}
                </dt>
                <dd className="mt-2 text-[14.5px] leading-snug text-muted-foreground">
                  {c.rotulo}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ── Quién lo hace ──────────────────────────────────── */}
        <section className="grid gap-8 py-11 lg:grid-cols-[1fr_1.1fr] lg:gap-14 lg:py-14">
          <div>
            <p className="rotulo text-muted-foreground">Quién lo hace</p>
            <h2 className="mt-3 font-display text-[1.75rem] font-extrabold leading-[1.12] tracking-[-0.028em] lg:text-[2.25rem]">
              Universidad de los Llanos
            </h2>
          </div>
          <div className="flex flex-col gap-4 text-[16.5px] leading-relaxed text-foreground/85 lg:text-[17px]">
            <p>
              Con financiación de Minciencias, convocatoria 963 de 2025. Lo
              hacemos dos personas: la Dra. Mónica Paola Higuera-Díaz dirige la
              investigación, y Catalina Clavijo Agudelo creó esta página.
            </p>
            <p>
              Los ensayos se hacen en Villavicencio, con grillos nativos del
              Piedemonte Llanero.
            </p>
            <Link
              href="/proyecto"
              className="mt-1 inline-flex min-h-12 w-fit items-center rounded-full border-2 border-primary px-5 text-[15.5px] font-bold text-primary transition-colors hover:bg-primary/5"
            >
              Conozca el proyecto
            </Link>
          </div>
        </section>
      </main>

    </>
  );
}
