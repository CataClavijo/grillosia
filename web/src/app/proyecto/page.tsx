import { ChevronDown, ExternalLink } from "lucide-react";

import { Barra } from "@/components/barra";
import { EncabezadoSeccion } from "@/components/ds/encabezado-seccion";
import { Revelar } from "@/components/ds/revelar";
import { InfoTip } from "@/components/info-tip";
import { InterestForm } from "@/components/interest-form";
import { MapaTerritorio } from "@/components/mapa-territorio";
import { ORIGENES, OrigenDato, type Origen } from "@/components/origen-dato";
import { DIETS, DIET_BASE } from "@/lib/animals";
import { OBJETIVOS } from "@/lib/content/landing";
import { METHODOLOGY_SECTIONS } from "@/lib/content/methodology";
import { renderMarkdownBlock } from "@/lib/markdown";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Sobre GrillosIA",
  description:
    "Proyecto de investigación de la Universidad de los Llanos sobre la cría de grillos y la optimización de su dieta con inteligencia artificial. Convocatoria Minciencias 963 de 2025.",
};

/**
 * Sobre GrillosIA.
 *
 * Editorial, con un ritmo distinto en cada seccion para que no se lea como
 * una fila de diapositivas iguales: entrada con la ficha del proyecto en una
 * franja, el objetivo como una frase centrada, el equipo con la institucion,
 * el territorio en una banda con el mapa, la metodologia como un proceso de
 * cinco estaciones, el respaldo cientifico y el contacto centrado.
 */

const FICHA = [
  { rotulo: "Institución", valor: "Universidad de los Llanos" },
  { rotulo: "Financiación", valor: "Minciencias, convocatoria 963 de 2025" },
  { rotulo: "Contrato", valor: "207 de 2025" },
  { rotulo: "Duración", valor: "18 meses" },
  { rotulo: "Territorio", valor: "Cubarral y Granada, Meta" },
];

const EQUIPO = [
  {
    iniciales: "MH",
    nombre: "Dra. Mónica Paola Higuera-Díaz",
    papel: "Investigadora principal",
    detalle: "Dirige los ensayos de cría, las comidas en estudio y el análisis de la harina.",
  },
  {
    iniciales: "CC",
    nombre: "Catalina Clavijo Agudelo",
    papel: "Plataforma e inteligencia artificial",
    detalle: "Desarrolló la plataforma, el modelo de inteligencia artificial y el asistente.",
  },
];

const METODO = [
  {
    titulo: "Cría",
    texto: "Criamos grillos con tres comidas que solo cambian en su ingrediente principal.",
  },
  {
    titulo: "Registro",
    texto: "Anotamos 17 variables por lote: clima, alimento, crecimiento y supervivencia.",
  },
  {
    titulo: "Laboratorio",
    texto: "Al cosechar, un análisis de laboratorio mide la proteína y la grasa de la harina.",
    termino: "analisisBromatologico" as const,
  },
  {
    titulo: "Modelo",
    texto: "Un modelo de inteligencia artificial aprende de esos datos y hace predicciones.",
    termino: "prediccion" as const,
  },
  {
    titulo: "Plataforma",
    texto: "El productor consulta el resultado desde el celular, en palabras claras.",
  },
];

/** Colores de la composicion: principal, maiz y avena. Siempre los mismos. */
const COLOR_PARTE = ["bg-primary", "bg-vegetal", "bg-chart-3"] as const;

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

export default function PaginaProyecto() {
  const base = DIET_BASE.base
    .map((b) => `${b.pct} % de ${b.name.toLowerCase()}`)
    .join(" y ");

  return (
    <>
      <Barra />
      <main>
        {/* ── 1. Entrada, con la ficha en una franja ───────────────── */}
        <section className="pt-14 pb-16 lg:pt-24 lg:pb-24">
          <Contenedor>
            <Revelar>
              <p className="t-eyebrow text-subtle">Sobre GrillosIA</p>
              <h1 className="t-h1 mt-4 max-w-[20ch] text-balance lg:text-[3.5rem]">
                Un proyecto de investigación del Piedemonte Llanero
              </h1>
            </Revelar>
            <Revelar retraso={80} className="mt-8 grid gap-6 lg:grid-cols-12 lg:gap-12">
              <p className="t-lead lg:col-span-7">
                GrillosIA surge de una investigación sobre la cría de grillos y
                la optimización de su dieta con inteligencia artificial. La
                desarrolla la Universidad de los Llanos, con financiación de
                Minciencias.
              </p>
              <p className="t-small text-subtle lg:col-span-5 lg:pt-1.5">
                La harina de grillo puede reemplazar parte de la harina de
                pescado importada que se usa para alimentar peces, aves y
                cerdos.
              </p>
            </Revelar>
            <Revelar retraso={140}>
              <dl className="mt-12 grid gap-x-8 gap-y-6 rounded-lg bg-surface-2 p-6 sm:grid-cols-2 lg:mt-16 lg:grid-cols-5 lg:p-8">
                {FICHA.map(({ rotulo, valor }) => (
                  <div key={rotulo} className="flex flex-col gap-1.5">
                    <dt className="t-eyebrow text-faint">{rotulo}</dt>
                    <dd className="t-h4">{valor}</dd>
                  </div>
                ))}
              </dl>
            </Revelar>
          </Contenedor>
        </section>

        {/* ── 2. Objetivo: una frase centrada y cuatro metas ───────── */}
        <section className="pb-16 lg:pb-28">
          <Contenedor>
            <Revelar className="mx-auto flex max-w-[880px] flex-col items-center text-center">
              <p className="t-eyebrow text-subtle">Objetivo</p>
              <p className="t-h2 mt-4 text-balance lg:text-[2.75rem] lg:leading-[1.08]">
                Saber qué comida y qué condiciones de cría dan una harina con la
                proteína que necesita cada animal, y ponerlo al alcance del
                productor.
              </p>
            </Revelar>
            <ol className="mt-14 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4">
              {OBJETIVOS.map((o, i) => (
                <Revelar as="li" key={o.n} retraso={i * 60}>
                  <span className="t-cifra text-[2.5rem] text-primary">{o.n}</span>
                  <h3 className="t-h3 mt-3">{o.titulo}</h3>
                  <p className="t-small mt-2 text-subtle">{o.cuerpo}</p>
                </Revelar>
              ))}
            </ol>
          </Contenedor>
        </section>

        {/* ── 3. Equipo e institucion ──────────────────────────────── */}
        <section className="pb-16 lg:pb-28">
          <Contenedor className="grid gap-10 lg:grid-cols-12 lg:gap-12">
            <Revelar className="lg:col-span-5">
              <EncabezadoSeccion
                rotulo="Equipo"
                titulo="Quiénes lo hacemos"
                entrada="Un equipo pequeño de la Universidad de los Llanos: una investigadora a cargo de la ciencia y una desarrolladora a cargo de la plataforma."
              />
            </Revelar>
            <ul className="grid gap-5 sm:grid-cols-2 lg:col-span-7">
              {EQUIPO.map((p, i) => (
                <Revelar
                  as="li"
                  key={p.nombre}
                  retraso={i * 80}
                  className="flex flex-col rounded-lg bg-surface p-6 ring-1 ring-border lg:p-7"
                >
                  <span
                    aria-hidden
                    className="flex size-14 items-center justify-center rounded-full bg-primary-soft font-display text-[1.4rem] font-semibold text-primary"
                  >
                    {p.iniciales}
                  </span>
                  <p className="t-eyebrow mt-6 text-faint">{p.papel}</p>
                  <p className="t-h3 mt-2">{p.nombre}</p>
                  <p className="t-small mt-2 text-subtle">{p.detalle}</p>
                </Revelar>
              ))}
            </ul>
          </Contenedor>
        </section>

        {/* ── 4. Territorio: banda con el mapa ─────────────────────── */}
        <section className="bg-surface-2 py-16 lg:py-24">
          <Contenedor className="grid gap-12 lg:grid-cols-12 lg:gap-12">
            <Revelar className="lg:col-span-4">
              <EncabezadoSeccion
                rotulo="Territorio"
                titulo="Cubarral y Granada, Meta"
                entrada="Las actividades del proyecto se desarrollan en estos dos municipios del Piedemonte Llanero, donde la cordillera baja a la llanura."
              />
            </Revelar>
            <Revelar retraso={80} className="lg:col-span-8">
              <MapaTerritorio />
            </Revelar>
          </Contenedor>
        </section>

        {/* ── 5. Metodologia: un proceso de cinco estaciones ───────── */}
        <section className="py-16 lg:py-28">
          <Contenedor>
            <Revelar>
              <EncabezadoSeccion
                rotulo="Metodología"
                titulo="Cómo lo hacemos"
                entrada="Del lote de cría al celular del productor."
              />
            </Revelar>
            <ol className="relative mt-12 grid gap-8 lg:mt-16 lg:grid-cols-5 lg:gap-6">
              {/* La linea que une las estaciones: vertical en celular,
                  horizontal en escritorio. */}
              <span
                aria-hidden
                className="absolute top-2 bottom-2 left-[15px] w-px bg-border-strong lg:top-[15px] lg:right-[10%] lg:bottom-auto lg:left-[10%] lg:h-px lg:w-auto"
              />
              {METODO.map(({ titulo, texto, termino }, i) => (
                <Revelar
                  as="li"
                  key={titulo}
                  retraso={i * 70}
                  className="relative grid grid-cols-[32px_1fr] gap-4 lg:flex lg:flex-col lg:items-center lg:text-center"
                >
                  <span className="relative z-10 flex size-8 items-center justify-center rounded-full bg-primary font-mono text-[13px] font-semibold text-primary-foreground ring-4 ring-background">
                    {i + 1}
                  </span>
                  <div className="lg:mt-5">
                    <h3 className="t-h3 flex items-center gap-1 lg:justify-center">
                      {titulo}
                      {termino && <InfoTip termino={termino} />}
                    </h3>
                    <p className="t-small mt-1.5 text-subtle lg:mx-auto lg:max-w-[24ch]">
                      {texto}
                    </p>
                  </div>
                </Revelar>
              ))}
            </ol>

            {/* Las tres comidas: la formula real, con su composicion. */}
            <div className="mt-20 grid gap-10 lg:mt-28 lg:grid-cols-12 lg:gap-12">
              <Revelar className="lg:col-span-4">
                <h3 className="t-h2">Las tres comidas en estudio</h3>
                <p className="t-small mt-3 max-w-[40ch] text-subtle">
                  Las tres llevan la misma base: {base}. Lo que cambia es el{" "}
                  {DIET_BASE.mainPct}{" "}% principal.
                </p>
              </Revelar>
              <ul className="grid gap-8 sm:grid-cols-3 lg:col-span-8">
                {DIETS.map((d, i) => {
                  const partes = [
                    { nombre: d.main, pct: DIET_BASE.mainPct },
                    ...DIET_BASE.base.map((b) => ({ nombre: b.name, pct: b.pct })),
                  ];
                  return (
                    <Revelar as="li" key={d.id} retraso={i * 80}>
                      <span className="t-cifra text-[2.5rem] leading-none text-primary">{d.id}</span>
                      <p className="mt-2 font-display text-[1.6rem] font-semibold leading-tight">{d.main}</p>
                      <div
                        className="mt-4 flex h-3 w-full gap-[3px] overflow-hidden rounded-full"
                        role="img"
                        aria-label={partes.map((p) => `${p.pct} % ${p.nombre}`).join(", ")}
                      >
                        {partes.map((p, j) => (
                          <span
                            key={p.nombre}
                            className={cn("barra-crece h-full", COLOR_PARTE[j])}
                            style={
                              {
                                width: `${p.pct}%`,
                                "--d": `${200 + i * 80 + j * 90}ms`,
                              } as React.CSSProperties
                            }
                          />
                        ))}
                      </div>
                      <ul className="mt-3 flex flex-col gap-1">
                        {partes.map((p, j) => (
                          <li key={p.nombre} className="t-small flex items-center gap-2 text-subtle">
                            <span aria-hidden className={cn("size-2 rounded-full", COLOR_PARTE[j])} />
                            <span className="font-mono tabular-nums text-foreground/80">
                              {p.pct}
                              {" "}%
                            </span>
                            {p.nombre}
                          </li>
                        ))}
                      </ul>
                    </Revelar>
                  );
                })}
              </ul>
            </div>

            {/* Detalle tecnico plegado: para quien lo quiera leer. */}
            <details className="group mt-16 max-w-[820px]">
              <summary className="inline-flex min-h-11 list-none items-center gap-2 rounded-md text-[15px] font-semibold text-foreground/85 transition-colors hover:text-foreground [&::-webkit-details-marker]:hidden">
                Ver la metodología técnica en detalle
                <ChevronDown
                  className="size-4 transition-transform duration-200 group-open:rotate-180"
                  aria-hidden
                />
              </summary>
              <div className="mt-4 flex flex-col">
                {METHODOLOGY_SECTIONS.map((s) => (
                  <details key={s.id} className="group/sub border-t border-border py-1 last:border-b">
                    <summary className="flex min-h-12 list-none items-center justify-between gap-4 text-[15.5px] font-medium [&::-webkit-details-marker]:hidden">
                      {s.title}
                      <ChevronDown
                        className="size-4 shrink-0 text-subtle transition-transform duration-200 group-open/sub:rotate-180"
                        aria-hidden
                      />
                    </summary>
                    <div className="t-small flex max-w-[70ch] flex-col gap-2 pb-5 text-foreground/85">
                      {renderMarkdownBlock(s.body_markdown)}
                    </div>
                  </details>
                ))}
              </div>
            </details>
          </Contenedor>
        </section>

        {/* ── 6. Respaldo cientifico ───────────────────────────────── */}
        <section className="pb-16 lg:pb-28">
          <Contenedor className="grid gap-10 lg:grid-cols-12 lg:gap-12">
            <Revelar className="lg:col-span-5">
              <EncabezadoSeccion
                rotulo="Respaldo científico"
                titulo="De dónde sale cada dato"
                entrada="Cada número de la plataforma dice su origen. No mezclamos lo medido con lo calculado, y cuando un dato todavía no existe, lo decimos en vez de rellenarlo."
              />
            </Revelar>
            <ul className="grid gap-4 sm:grid-cols-2 lg:col-span-7">
              {(Object.keys(ORIGENES) as Origen[]).map((o, i) => (
                <Revelar
                  as="li"
                  key={o}
                  retraso={i * 50}
                  className="rounded-lg bg-surface-2 p-5"
                >
                  <OrigenDato origen={o} />
                  <p className="t-small mt-3 text-subtle">{ORIGENES[o].explicacion}</p>
                </Revelar>
              ))}
            </ul>
          </Contenedor>
        </section>

        {/* ── 7. Contacto, centrado ────────────────────────────────── */}
        <section className="bg-surface-2 py-16 lg:py-24">
          <Contenedor>
            <Revelar className="mx-auto flex max-w-[600px] flex-col items-center text-center">
              <EncabezadoSeccion
                alineacion="centro"
                rotulo="Contacto"
                titulo="Le avisamos cuando el modelo esté validado"
                entrada="Si quiere que alguien del equipo le escriba, o si está criando grillos y quiere contarnos cómo le va."
              />
            </Revelar>
            <Revelar retraso={80} className="mx-auto mt-10 max-w-[560px] text-left">
              <InterestForm />
            </Revelar>
          </Contenedor>
        </section>

        {/* ── Créditos y enlaces ───────────────────────────────────── */}
        <section className="py-14 lg:py-16">
          <Contenedor className="grid gap-8 sm:grid-cols-2 lg:gap-12">
            <div>
              <h2 className="t-eyebrow text-faint">Créditos</h2>
              <p className="t-small mt-3 max-w-[60ch] text-subtle">
                Fotografías de los grillos del proyecto: Catalina
                Clavijo-Agudelo y Sebastián Berrío. La foto de la portada es
                una imagen de referencia de Wikimedia Commons y no corresponde
                a los ejemplares del proyecto. Ilustraciones hechas para
                GrillosIA. Límites del mapa: DANE, Marco Geoestadístico
                Nacional 2025 (CC BY 4.0).
              </p>
            </div>
            <div>
              <h2 className="t-eyebrow text-faint">Enlaces</h2>
              <ul className="mt-3 flex flex-col gap-1">
                {[
                  { href: "https://www.unillanos.edu.co", texto: "Universidad de los Llanos" },
                  {
                    href: "https://minciencias.gov.co",
                    texto: "Ministerio de Ciencia, Tecnología e Innovación",
                  },
                ].map((l) => (
                  <li key={l.href}>
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-9 items-center gap-1.5 text-[15px] font-medium text-foreground/85 underline decoration-border-strong underline-offset-4 transition-colors hover:text-foreground hover:decoration-foreground/50"
                    >
                      {l.texto}
                      <ExternalLink className="size-3.5 text-subtle" aria-hidden />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </Contenedor>
        </section>
      </main>
    </>
  );
}
