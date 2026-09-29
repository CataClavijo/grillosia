import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BarChart3, Box, Bug, ClipboardList, type LucideIcon } from "lucide-react";

import { Barra } from "@/components/barra";
import { DatoPendiente } from "@/components/dato-pendiente";
import { EncabezadoSeccion } from "@/components/ds/encabezado-seccion";
import { Revelar } from "@/components/ds/revelar";
import { FuenteCientifica } from "@/components/fuente-cientifica";
import { InfoTip } from "@/components/info-tip";
import { MapaTerritorio } from "@/components/mapa-territorio";
import { OrigenDato } from "@/components/origen-dato";
import { PortadaHero } from "@/components/portada-hero";
import {
  ANIMALS,
  CATEGORIAS,
  DIETS,
  DIET_BASE,
  animalesDe,
  formatoProteina,
  rangoAnimal,
  type CategoriaId,
} from "@/lib/animals";
import { CAMINO } from "@/lib/camino";
import { CIFRAS, COMO_RESPONDE, PASOS_PORTADA, POR_QUE } from "@/lib/content/landing";
import { cn } from "@/lib/utils";

/**
 * Portada.
 *
 * Cuenta una historia en orden, y cada seccion responde una pregunta:
 *   1. ¿Que es esto?          -> entrada con la foto protagonista
 *   2. ¿Como se usa?          -> los cuatro pasos
 *   3. ¿Por que existe?       -> el proyecto, con sus cifras
 *   4. ¿Que son los grillos?  -> la ficha: familia confirmada, lo demas pendiente
 *   5. ¿Que comen?            -> las tres comidas en estudio
 *   6. ¿Para que animal?      -> peces, aves y cerdos, con su proteina
 *   7. ¿Que hace GrillosIA?   -> procesa, interpreta y responde
 *   8. ¿Donde?                -> el territorio
 *
 * Las secciones se separan con espacio, no con lineas. Una sola banda de
 * fondo distinto (los grillos) marca el paso de "el proyecto" a "la cria".
 * Imagenes: la foto de la entrada, un grabado del grillo, tres grabados de
 * animales y el mapa. Nada decorativo.
 */

const ICONOS_PASO: Record<number, LucideIcon> = {
  1: Box,
  2: Bug,
  3: ClipboardList,
  4: BarChart3,
};

/**
 * Ajuste optico de cada grabado de animal: el pez y el cerdo son anchos y el
 * ave es alta; con la misma caja, el ave se veia mas pequena. Este relleno
 * iguala el tamano aparente sin deformar nada.
 */
const AJUSTE_ANIMAL: Record<CategoriaId, string> = {
  peces: "px-8 pb-7",
  aves: "px-10 pb-5",
  cerdos: "px-7 pb-6",
};

function Contenedor({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-[1240px] px-5 lg:px-8", className)}>
      {children}
    </div>
  );
}

export default function Inicio() {
  // Todas las referencias de proteina cargadas, para un solo enlace
  // "¿De donde sale este valor?" en la seccion de animales.
  const refsProteina = [
    ...new Set(ANIMALS.flatMap((a) => a.stages.flatMap((e) => e.protein?.refs ?? []))),
  ];
  const base = DIET_BASE.base.map((b) => `${b.pct}\u00a0% de ${b.name.toLowerCase()}`).join(" y ");

  return (
    <>
      <Barra />
      <PortadaHero />

      <main>
        {/* ── 2. Cómo funciona ─────────────────────────────────────── */}
        <section id="como-funciona" className="scroll-mt-20 py-16 lg:py-24">
          <Contenedor>
            <Revelar>
              <EncabezadoSeccion
                rotulo="Cómo funciona"
                titulo="Del grillo a la decisión, en cuatro pasos"
                entrada="Puede empezar por cualquiera. Si ya cría grillos, vaya directo a la consulta."
              />
            </Revelar>
            <ol className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4">
              {CAMINO.map((p, i) => {
                const Icono = ICONOS_PASO[p.n];
                return (
                  <Revelar as="li" key={p.n} retraso={i * 60}>
                    <Link href={p.href} className="elevar group flex h-full flex-col">
                      <span className="flex items-center gap-3">
                        <Icono className="size-6 text-primary" strokeWidth={1.5} aria-hidden />
                        <span className="t-eyebrow text-faint">0{p.n}</span>
                      </span>
                      <h3 className="t-h3 mt-5 transition-colors duration-150 group-hover:text-primary">
                        {p.titulo}
                      </h3>
                      <p className="t-small mt-2 text-subtle">{PASOS_PORTADA[p.n]}</p>
                      <span className="mt-4 inline-flex items-center gap-1.5 text-[14px] font-semibold text-foreground/80 transition-colors duration-150 group-hover:text-primary">
                        Ir al paso
                        <ArrowRight
                          className="size-4 transition-transform duration-200 ease-[var(--ease-natural)] group-hover:translate-x-0.5"
                          aria-hidden
                        />
                      </span>
                    </Link>
                  </Revelar>
                );
              })}
            </ol>
          </Contenedor>
        </section>

        {/* ── 3. El proyecto ───────────────────────────────────────── */}
        <section className="pb-16 lg:pb-24">
          <Contenedor className="grid gap-10 lg:grid-cols-2 lg:gap-20">
            <Revelar>
              <EncabezadoSeccion
                rotulo="El proyecto"
                titulo="Proteína para el campo, producida en la región"
                entrada="GrillosIA es una investigación de la Universidad de los Llanos, abierta para que usted la use mientras aprendemos."
              />
            </Revelar>
            <Revelar retraso={80}>
              <ol className="flex flex-col gap-6 lg:pt-10">
                {POR_QUE.map((t, i) => (
                  <li key={i} className="flex gap-5">
                    <span className="t-eyebrow mt-1 w-6 shrink-0 text-primary">0{i + 1}</span>
                    <p className="t-body text-foreground/85">{t}</p>
                  </li>
                ))}
              </ol>
            </Revelar>
          </Contenedor>

          <Contenedor>
            <Revelar>
              <dl className="mt-16 grid grid-cols-2 gap-x-8 gap-y-10 lg:mt-20 lg:grid-cols-4">
                {CIFRAS.map((c) => (
                  <div key={c.rotulo} className="flex flex-col gap-2">
                    <dt className="t-small order-2 max-w-[22ch] text-subtle">{c.rotulo}</dt>
                    <dd className="t-cifra order-1 text-[3rem] text-foreground lg:text-[3.75rem]">
                      {c.valor}
                    </dd>
                  </div>
                ))}
              </dl>
            </Revelar>
          </Contenedor>
        </section>

        {/* ── 4. Los grillos ───────────────────────────────────────── */}
        <section className="bg-surface-2 py-16 lg:py-24">
          <Contenedor className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
            <Revelar>
              <EncabezadoSeccion
                rotulo="Los grillos"
                titulo="Grillos nativos del Piedemonte Llanero"
                entrada="Su identificación está en curso. Por eso los mostramos solo hasta el nivel confirmado, la familia, y no con un nombre de especie."
              />
              {/* Ficha taxonomica resumida: lo confirmado y lo pendiente. */}
              <dl className="mt-8 grid max-w-[440px] grid-cols-[88px_1fr] items-baseline gap-y-3 text-[15px]">
                <dt className="text-subtle">Familia</dt>
                <dd className="font-semibold">Gryllidae</dd>
                <dt className="text-subtle">Género</dt>
                <dd>
                  <DatoPendiente compacto />
                </dd>
                <dt className="text-subtle">Especie</dt>
                <dd>
                  <DatoPendiente compacto />
                </dd>
              </dl>
              <Link
                href="/grillos"
                className="mt-9 inline-flex h-11 items-center gap-2 rounded-md px-5 text-[15px] font-semibold text-foreground ring-1 ring-border-strong transition-colors duration-150 ring-inset hover:bg-background"
              >
                Conozca sus grillos
                <ArrowRight className="size-4" />
              </Link>
            </Revelar>
            <Revelar retraso={80}>
              {/* Foto real de un ejemplar del proyecto, recortada sobre el
                  fondo: nada de marco blanco pegado encima de la pagina. */}
              <figure>
                <Image
                  src="/grillos/recorte-3.webp"
                  alt="Grillo del proyecto, de la familia Gryllidae, visto de lado."
                  width={611}
                  height={379}
                  sizes="(min-width: 1024px) 520px, 90vw"
                  className="mx-auto h-auto w-full max-w-[460px]"
                />
                <figcaption className="t-caption mt-4 text-center">
                  Ejemplar del proyecto, familia Gryllidae. Foto: Sebastián Berrío.
                </figcaption>
              </figure>
            </Revelar>
          </Contenedor>
        </section>

        {/* ── 5. Las tres comidas ──────────────────────────────────── */}
        <section className="py-16 lg:py-24">
          <Contenedor>
            <Revelar>
              <EncabezadoSeccion
                rotulo="Las comidas en estudio"
                titulo="Tres comidas, una sola diferencia"
                entrada={`Las tres llevan la misma base: ${base}. Solo cambia el ingrediente principal, que es el ${DIET_BASE.mainPct}\u00a0%.`}
              />
            </Revelar>
            <ul className="mt-12 grid gap-x-10 gap-y-8 sm:grid-cols-3">
              {DIETS.map((d, i) => (
                <Revelar as="li" key={d.id} retraso={i * 60} className="flex flex-col gap-1.5">
                  <span className="t-eyebrow text-primary">{d.id}</span>
                  <p className="t-h3">{d.main}</p>
                  <p className="t-small text-subtle">
                    Ingrediente principal, {DIET_BASE.mainPct}{"\u00a0"}% de la mezcla
                  </p>
                </Revelar>
              ))}
            </ul>
          </Contenedor>
        </section>

        {/* ── 6. Para qué animales ─────────────────────────────────── */}
        <section className="pb-16 lg:pb-24">
          <Contenedor>
            <Revelar>
              <EncabezadoSeccion rotulo="Para qué animales" titulo="Peces, aves y cerdos">
                <p className="t-lead">
                  Cada animal necesita una cantidad distinta de proteína según
                  su etapa productiva.{" "}
                  <InfoTip termino="requerimientoProteina" className="-mt-0.5" />
                </p>
              </EncabezadoSeccion>
            </Revelar>
            <ul className="mt-12 grid gap-12 sm:grid-cols-3 sm:gap-8 lg:gap-12">
              {CATEGORIAS.map((c, i) => {
                const animales = animalesDe(c.id);
                const rangos = animales.map(rangoAnimal).filter((r) => r !== null);
                const rango =
                  rangos.length > 0
                    ? {
                        min: Math.min(...rangos.map((r) => r.min)),
                        max: Math.max(...rangos.map((r) => r.max)),
                      }
                    : null;
                return (
                  <Revelar as="li" key={c.id} retraso={i * 60} className="flex flex-col">
                    {/* Misma caja, misma altura y misma linea de apoyo para
                        los tres: el dibujo se ajusta dentro, apoyado abajo. */}
                    <div
                      className={cn(
                        "h-48 rounded-lg bg-surface-2 pt-6 lg:h-56",
                        AJUSTE_ANIMAL[c.id],
                      )}
                    >
                      <div className="relative h-full w-full">
                        <Image
                          src={c.image}
                          alt=""
                          fill
                          sizes="(min-width: 640px) 360px, 90vw"
                          aria-hidden
                          className="lamina object-contain object-bottom"
                        />
                      </div>
                    </div>
                    <h3 className="t-h2 mt-6">{c.name}</h3>
                    <p className="t-small mt-2 text-subtle">
                      {animales.map((a) => a.name).join(" · ")}
                    </p>
                    <div className="mt-5">
                      {rango ? (
                        <p className="flex flex-col gap-1">
                          <span className="t-caption">
                            Proteína en el alimento, según especie y etapa
                          </span>
                          <span className="t-cifra text-[1.875rem]">{formatoProteina(rango)}</span>
                        </p>
                      ) : (
                        <DatoPendiente compacto motivo="Estamos verificando las fuentes científicas." />
                      )}
                    </div>
                  </Revelar>
                );
              })}
            </ul>
            {refsProteina.length > 0 && (
              <div className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-2">
                <OrigenDato origen="literatura" />
                <FuenteCientifica ids={refsProteina} />
              </div>
            )}
          </Contenedor>
        </section>

        {/* ── 7. Qué hace GrillosIA ────────────────────────────────── */}
        <section className="pb-16 lg:pb-24">
          <Contenedor className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
            <Revelar>
              <EncabezadoSeccion
                rotulo="Cómo responde"
                titulo="Datos que se explican, no cifras sueltas"
                entrada="Si un dato todavía no existe, se lo decimos. Preferimos un espacio pendiente a un número inventado."
              />
              <Link
                href="/consulta"
                className="mt-9 inline-flex h-11 items-center gap-2 rounded-md bg-primary px-5 text-[15px] font-semibold text-primary-foreground transition-colors duration-150 hover:bg-primary-hover"
              >
                Comenzar consulta
                <ArrowRight className="size-4" />
              </Link>
            </Revelar>
            <ol className="flex flex-col gap-8 lg:pt-10">
              {COMO_RESPONDE.map((c, i) => (
                <Revelar as="li" key={c.titulo} retraso={i * 60} className="flex gap-5">
                  <span className="t-eyebrow mt-1 w-6 shrink-0 text-primary">0{i + 1}</span>
                  <div>
                    <h3 className="t-h3">{c.titulo}</h3>
                    <p className="t-body mt-1.5 text-subtle">{c.cuerpo}</p>
                  </div>
                </Revelar>
              ))}
            </ol>
          </Contenedor>
        </section>

        {/* ── 8. Territorio ────────────────────────────────────────── */}
        <section className="pb-20 lg:pb-28">
          <Contenedor className="grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
            <Revelar>
              <EncabezadoSeccion
                rotulo="Territorio"
                titulo="Piedemonte Llanero, Meta"
                entrada="Las actividades del proyecto se desarrollan en los municipios de Cubarral y Granada, donde la cordillera baja a la llanura."
              />
              <p className="t-small mt-8 max-w-[52ch] text-subtle">
                Con financiación de Minciencias, convocatoria 963 de 2025. La
                Dra. Mónica Paola Higuera-Díaz dirige la investigación y
                Catalina Clavijo Agudelo desarrolló la plataforma.
              </p>
              <Link
                href="/proyecto"
                className="mt-6 inline-flex items-center gap-1.5 text-[15px] font-semibold text-primary underline decoration-primary/35 underline-offset-4 transition-colors hover:decoration-primary"
              >
                Sobre GrillosIA
                <ArrowRight className="size-4" />
              </Link>
            </Revelar>
            <Revelar retraso={80}>
              <MapaTerritorio className="mx-auto max-w-[560px]" />
            </Revelar>
          </Contenedor>
        </section>
      </main>
    </>
  );
}
