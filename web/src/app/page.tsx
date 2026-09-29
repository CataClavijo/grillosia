import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Box, Bug } from "lucide-react";

import { Barra } from "@/components/barra";
import { BarraComposicion } from "@/components/barra-composicion";
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
import {
  CIFRAS,
  COMO_RESPONDE,
  CONSULTA_PASOS,
  PASOS_PORTADA,
  POR_QUE,
} from "@/lib/content/landing";
import { cn } from "@/lib/utils";

/**
 * Portada.
 *
 * Gira alrededor de la consulta, que es lo que le dice a cada productor que
 * comida conviene para su caso. El orden:
 *   1. Entrada con inicio rapido (Peces / Aves / Cerdos).
 *   2. La consulta en tres pasos, con su llamada.
 *   3. Para que animales: cada tarjeta abre la consulta de esa categoria.
 *   4. Las tres comidas que se comparan, con su composicion.
 *   5. El proyecto, en una banda de cifras.
 *   6. Los grillos y la guia de cria, como apoyo.
 *   7. El territorio, con el mapa como protagonista.
 *   8. Cierre: lo que hace GrillosIA y la llamada a la consulta.
 *
 * El ritmo cambia de seccion a seccion (bandas a todo el ancho, bloques
 * asimetricos, un cierre centrado) para que no se lea como una sucesion de
 * diapositivas con el mismo "titulo a la izquierda, imagen a la derecha".
 */

/**
 * Ajuste optico de cada grabado de animal: el pez y el cerdo son anchos y el
 * ave es alta; con la misma caja, el ave se veia mas pequena. Este relleno
 * iguala el tamano aparente sin deformar nada.
 */
const AJUSTE_ANIMAL: Record<CategoriaId, string> = {
  peces: "px-8 pb-6",
  aves: "px-12 pb-4",
  cerdos: "px-7 pb-5",
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

/** Llamada principal a la consulta, igual en todas las secciones. */
function BotonConsulta({ texto = "Hacer mi consulta", className }: { texto?: string; className?: string }) {
  return (
    <Link
      href="/consulta"
      className={cn(
        "inline-flex h-[52px] items-center justify-center gap-2 rounded-md bg-primary px-6 text-base font-semibold text-primary-foreground transition-colors duration-150 hover:bg-primary-hover",
        className,
      )}
    >
      {texto}
      <ArrowRight className="size-4" />
    </Link>
  );
}

export default function Inicio() {
  // Todas las referencias de proteina cargadas, para un solo enlace
  // "¿De donde sale este valor?" en la seccion de animales.
  const refsProteina = [
    ...new Set(ANIMALS.flatMap((a) => a.stages.flatMap((e) => e.protein?.refs ?? []))),
  ];
  const base = DIET_BASE.base
    .map((b) => `${b.pct} % de ${b.name.toLowerCase()}`)
    .join(" y ");

  return (
    <>
      <Barra />
      <PortadaHero />

      <main>
        {/* ── 2. La consulta, en tres pasos ───────────────────────── */}
        <section id="como-funciona" className="scroll-mt-20 py-16 lg:py-24">
          <Contenedor className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <Revelar className="lg:sticky lg:top-28 lg:self-start">
              <EncabezadoSeccion
                rotulo="La consulta"
                titulo="Tres preguntas y sabrá qué comida le conviene"
                entrada="Es el centro de GrillosIA: compara las tres comidas para grillos con lo que su animal necesita."
              />
              <BotonConsulta className="mt-8" />
            </Revelar>
            <ol className="relative flex flex-col">
              {CONSULTA_PASOS.map((p, i) => (
                <Revelar
                  as="li"
                  key={p.titulo}
                  retraso={i * 80}
                  className="relative grid grid-cols-[56px_1fr] gap-x-5 pb-10 last:pb-0 sm:grid-cols-[72px_1fr]"
                >
                  {/* Linea que une los pasos: dice que es un recorrido. */}
                  {i < CONSULTA_PASOS.length - 1 && (
                    <span
                      aria-hidden
                      className="absolute top-14 bottom-2 left-[27px] w-px bg-border-strong sm:top-16 sm:left-[35px]"
                    />
                  )}
                  <span className="t-cifra flex size-14 items-center justify-center rounded-full bg-primary-soft text-[1.6rem] text-primary sm:size-[72px] sm:text-[2rem]">
                    {i + 1}
                  </span>
                  <div className="pt-2.5 sm:pt-4">
                    <h3 className="t-h3">{p.titulo}</h3>
                    <p className="t-body mt-1.5 text-subtle">{p.cuerpo}</p>
                  </div>
                </Revelar>
              ))}
            </ol>
          </Contenedor>
        </section>

        {/* ── 3. Para qué animales: cada tarjeta abre la consulta ─── */}
        <section className="pb-16 lg:pb-24">
          <Contenedor>
            <Revelar className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <EncabezadoSeccion rotulo="Para qué animales" titulo="Peces, aves y cerdos">
                <p className="t-lead">
                  Cada animal necesita una cantidad distinta de proteína según
                  su etapa productiva.{" "}
                  <InfoTip termino="requerimientoProteina" className="-mt-0.5" />
                </p>
              </EncabezadoSeccion>
              {refsProteina.length > 0 && (
                <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2 lg:pb-1">
                  <OrigenDato origen="literatura" />
                  <FuenteCientifica ids={refsProteina} />
                </div>
              )}
            </Revelar>
            <ul className="mt-10 grid gap-5 sm:grid-cols-3 lg:mt-12 lg:gap-6">
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
                  <Revelar as="li" key={c.id} retraso={i * 70}>
                    <Link
                      href={`/consulta?categoria=${c.id}`}
                      className="elevar group flex h-full flex-col rounded-lg bg-surface-2 transition-colors duration-200 hover:bg-accent"
                    >
                      {/* Misma caja, misma altura y misma linea de apoyo para
                          los tres: el dibujo se ajusta dentro, apoyado abajo. */}
                      <div className={cn("h-32 px-6 pt-6 lg:h-40", AJUSTE_ANIMAL[c.id])}>
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
                      <div className="flex flex-1 flex-col px-5 pt-5 pb-5 lg:px-6 lg:pb-6">
                        <h3 className="font-display text-[2.25rem] font-semibold leading-none lg:text-[2.5rem]">{c.name}</h3>
                        <p className="t-body mt-2 text-subtle">
                          {animales.map((a) => a.name).join(" · ")}
                        </p>
                        <div className="mt-5 flex-1">
                          {rango ? (
                            <p className="flex flex-col gap-1">
                              <span className="t-caption">
                                Proteína en el alimento, según especie y etapa
                              </span>
                              <span className="t-cifra text-[2.25rem]">
                                {formatoProteina(rango)}
                              </span>
                            </p>
                          ) : (
                            <DatoPendiente
                              compacto
                              motivo="Estamos verificando las fuentes científicas."
                            />
                          )}
                        </div>
                        <span className="mt-6 inline-flex items-center gap-1.5 text-[15px] font-semibold text-primary">
                          Consultar para {c.name.toLowerCase()}
                          <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
                        </span>
                      </div>
                    </Link>
                  </Revelar>
                );
              })}
            </ul>
          </Contenedor>
        </section>

        {/* ── 4. Las tres comidas ──────────────────────────────────── */}
        <section className="pb-16 lg:pb-24">
          <Contenedor className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <Revelar>
              <EncabezadoSeccion
                rotulo="Lo que se compara"
                titulo="Tres comidas, una sola diferencia"
                entrada={`Las tres llevan la misma base: ${base}. Solo cambia el ingrediente principal, que es el ${DIET_BASE.mainPct} %.`}
              />
            </Revelar>
            <ul className="flex flex-col gap-9 lg:pt-3">
              {DIETS.map((d, i) => (
                <Revelar as="li" key={d.id} retraso={i * 90} className="grid grid-cols-[4.25rem_1fr] gap-x-5 sm:grid-cols-[5rem_1fr]">
                  <span className="t-cifra text-[2.5rem] leading-none text-primary sm:text-[3rem]">
                    {d.id}
                  </span>
                  <div className="min-w-0">
                    <p className="font-display text-[1.75rem] font-semibold leading-tight sm:text-[2rem]">
                      {d.main}
                    </p>
                    <p className="t-body mt-1 text-subtle">
                      {DIET_BASE.mainPct} % del ingrediente principal más la base común.
                    </p>
                    <BarraComposicion
                      principal={d.main}
                      base={DIET_BASE.base}
                      mainPct={DIET_BASE.mainPct}
                      className="mt-4"
                    />
                  </div>
                </Revelar>
              ))}
            </ul>
          </Contenedor>
        </section>

        {/* ── 5. El proyecto, en una banda ─────────────────────────── */}
        <section className="bg-[#17110c] py-16 text-white lg:py-20 dark:bg-surface">
          <Contenedor>
            <Revelar>
              <dl className="grid grid-cols-2 gap-x-8 gap-y-10 lg:grid-cols-4">
                {CIFRAS.map((c) => (
                  <div key={c.rotulo} className="flex flex-col gap-2">
                    <dt className="t-small order-2 max-w-[24ch] text-white/65">{c.rotulo}</dt>
                    <dd className="t-cifra order-1 text-[3.25rem] text-[#efb28e] lg:text-[4.25rem]">
                      {c.valor}
                    </dd>
                  </div>
                ))}
              </dl>
            </Revelar>
            <div className="mt-14 grid gap-8 border-t border-white/15 pt-10 lg:mt-16 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
              <Revelar>
                <p className="t-eyebrow text-white/60">Por qué existe</p>
                <h2 className="t-h2 mt-3 text-balance">
                  Proteína para el campo, producida en la región
                </h2>
              </Revelar>
              <ol className="grid gap-6 sm:grid-cols-3 sm:gap-8">
                {POR_QUE.map((t, i) => (
                  <Revelar as="li" key={i} retraso={i * 70} className="flex flex-col gap-2">
                    <span className="t-eyebrow text-[#efb28e]">0{i + 1}</span>
                    <p className="t-small leading-relaxed text-white/80">{t}</p>
                  </Revelar>
                ))}
              </ol>
            </div>
          </Contenedor>
        </section>

        {/* ── 6. Los grillos y la guía de cría (apoyo) ─────────────── */}
        <section className="py-16 lg:py-24">
          <Contenedor className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <Revelar className="order-2 lg:order-1">
              {/* Foto real de un ejemplar del proyecto, recortada sobre el
                  fondo: nada de marco blanco pegado encima de la pagina. */}
              {/* En oscuro, el grillo cafe oscuro desaparecia sobre el
                  carbon: va sobre la misma hoja de papel que las acuarelas. */}
              <figure className="rounded-lg bg-surface-2 px-6 pt-10 pb-6 sm:px-10 dark:bg-[#efe9dc]">
                <Image
                  src="/grillos/recorte-3.webp"
                  alt="Grillo del proyecto, de la familia Gryllidae, visto de lado."
                  width={611}
                  height={379}
                  sizes="(min-width: 1024px) 600px, 90vw"
                  className="mx-auto h-auto w-full max-w-[480px]"
                />
                <figcaption className="t-caption mt-5 text-center dark:text-[#5f594e]">
                  Ejemplar del proyecto, familia Gryllidae. Foto: Sebastián Berrío.
                </figcaption>
              </figure>
            </Revelar>
            <Revelar retraso={80} className="order-1 lg:order-2">
              <EncabezadoSeccion
                rotulo="Guía de cría"
                titulo="Grillos nativos del Piedemonte Llanero"
                entrada="Su identificación está en curso. Por eso los mostramos solo hasta el nivel confirmado."
              />
              {/* Ficha taxonomica resumida: lo confirmado y lo pendiente. */}
              <dl className="mt-7 grid max-w-[420px] grid-cols-[88px_1fr] items-baseline gap-y-3 text-[15px]">
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
              {/* La guia de cria: apoyo, no protagonista. */}
              <ul className="mt-9 grid gap-3 sm:grid-cols-2">
                {[
                  { href: "/caja", titulo: "Arme su caja", texto: PASOS_PORTADA[1], Icono: Box },
                  { href: "/grillos", titulo: "Conozca sus grillos", texto: PASOS_PORTADA[2], Icono: Bug },
                ].map(({ href, titulo, texto, Icono }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="group flex h-full gap-3 rounded-lg p-4 ring-1 ring-border ring-inset transition-colors duration-200 hover:bg-surface-2 hover:ring-border-strong"
                    >
                      <Icono className="mt-0.5 size-5 shrink-0 text-primary" strokeWidth={1.5} aria-hidden />
                      <span className="flex flex-col gap-1">
                        <span className="t-h4 flex items-center gap-1.5 group-hover:text-primary">
                          {titulo}
                          <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                        </span>
                        <span className="t-small text-subtle">{texto}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Revelar>
          </Contenedor>
        </section>

        {/* ── 7. Territorio: el mapa manda ─────────────────────────── */}
        <section className="bg-surface-2 py-16 lg:py-24">
          <Contenedor className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-16">
            {/* El texto se alinea arriba con el mapa y lo acompana al bajar:
                centrado, flotaba en medio de la columna alta del mapa. */}
            <Revelar className="lg:sticky lg:top-28 lg:pt-6">
              <EncabezadoSeccion
                rotulo="Territorio"
                titulo="Cubarral y Granada, Meta"
                entrada="Las actividades del proyecto se desarrollan en estos dos municipios del Piedemonte Llanero, donde la cordillera baja a la llanura."
              />
              <Link
                href="/proyecto"
                className="mt-7 inline-flex items-center gap-1.5 text-[15px] font-semibold text-primary underline decoration-primary/35 underline-offset-4 transition-colors hover:decoration-primary"
              >
                Sobre GrillosIA
                <ArrowRight className="size-4" />
              </Link>
            </Revelar>
            <Revelar retraso={80}>
              <MapaTerritorio className="mx-auto w-full max-w-[640px]" />
            </Revelar>
          </Contenedor>
        </section>

        {/* ── 8. Cierre: lo que hace GrillosIA y la consulta ───────── */}
        <section className="py-20 lg:py-28">
          <Contenedor>
            <Revelar className="mx-auto flex max-w-[760px] flex-col items-center text-center">
              <p className="t-eyebrow text-subtle">Cómo responde</p>
              <h2 className="t-h1 mt-4 text-balance">
                ¿Qué comida le conviene a sus grillos?
              </h2>
              <p className="t-lead mx-auto mt-5">
                Hágale la consulta a GrillosIA. Si un dato todavía no existe,
                se lo decimos: preferimos un espacio pendiente a un número
                inventado.
              </p>
              <BotonConsulta className="mt-9" />
            </Revelar>
            <ol className="mx-auto mt-16 grid max-w-[1000px] gap-8 text-left sm:grid-cols-3 lg:mt-20 lg:gap-12">
              {COMO_RESPONDE.map((c, i) => (
                <Revelar as="li" key={c.titulo} retraso={i * 70}>
                  <span className="t-eyebrow text-primary">0{i + 1}</span>
                  <h3 className="t-h3 mt-3">{c.titulo}</h3>
                  <p className="t-small mt-1.5 text-subtle">{c.cuerpo}</p>
                </Revelar>
              ))}
            </ol>
          </Contenedor>
        </section>
      </main>
    </>
  );
}
