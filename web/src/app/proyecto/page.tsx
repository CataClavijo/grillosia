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
 * Editorial y breve: quien lo hace, que busca, como trabaja y de donde sale
 * cada dato. Una ficha en texto (sin iconos ni cajas), el territorio con el
 * mapa, la metodologia en cinco pasos numerados y el detalle tecnico plegado
 * al final para quien lo quiera leer. Secciones separadas por espacio.
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
    nombre: "Dra. Mónica Paola Higuera-Díaz",
    papel: "Investigadora principal",
    detalle: "Dirige los ensayos de cría, las comidas en estudio y el análisis de la harina.",
  },
  {
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
  const base = DIET_BASE.base.map((b) => `${b.pct}\u00a0% de ${b.name.toLowerCase()}`).join(" y ");

  return (
    <>
      <Barra />
      <main>
        {/* ── Entrada ──────────────────────────────────────────────── */}
        <section className="pt-14 pb-16 lg:pt-24 lg:pb-24">
          <Contenedor className="grid gap-12 lg:grid-cols-[1.25fr_0.75fr] lg:gap-20">
            <Revelar>
              <EncabezadoSeccion
                as="h1"
                tamano="h1"
                rotulo="Sobre GrillosIA"
                titulo="Un proyecto de investigación del Piedemonte Llanero"
                entrada="GrillosIA surge de una investigación sobre la cría de grillos y la optimización de su dieta con inteligencia artificial. La desarrolla la Universidad de los Llanos, con financiación de Minciencias."
              />
            </Revelar>
            <Revelar retraso={80}>
              <dl className="flex flex-col gap-4 lg:pt-12">
                {FICHA.map(({ rotulo, valor }) => (
                  <div key={rotulo} className="grid grid-cols-[112px_1fr] gap-4">
                    <dt className="t-eyebrow pt-[3px] text-faint">{rotulo}</dt>
                    <dd className="text-[15.5px] font-medium">{valor}</dd>
                  </div>
                ))}
              </dl>
            </Revelar>
          </Contenedor>
        </section>

        {/* ── Objetivo ─────────────────────────────────────────────── */}
        <section className="pb-16 lg:pb-24">
          <Contenedor>
            <Revelar>
              <EncabezadoSeccion
                rotulo="Objetivo"
                titulo="Qué busca el proyecto"
                entrada="Saber qué comida y qué condiciones de cría dan una harina de grillo con la proteína que necesita cada animal, y poner esa información al alcance del productor. La harina de grillo es una alternativa a la harina de pescado importada."
              />
            </Revelar>
            <ol className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              {OBJETIVOS.map((o, i) => (
                <Revelar as="li" key={o.n} retraso={i * 60}>
                  <span className="t-eyebrow text-primary">{o.n}</span>
                  <h3 className="t-h3 mt-3">{o.titulo}</h3>
                  <p className="t-small mt-2 text-subtle">{o.cuerpo}</p>
                </Revelar>
              ))}
            </ol>
          </Contenedor>
        </section>

        {/* ── Equipo ───────────────────────────────────────────────── */}
        <section className="pb-16 lg:pb-24">
          <Contenedor className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <Revelar>
              <EncabezadoSeccion rotulo="Equipo" titulo="Quiénes lo hacemos" />
            </Revelar>
            <ul className="grid gap-10 sm:grid-cols-2">
              {EQUIPO.map((p, i) => (
                <Revelar as="li" key={p.nombre} retraso={i * 60}>
                  <p className="t-eyebrow text-faint">{p.papel}</p>
                  <p className="t-h3 mt-3">{p.nombre}</p>
                  <p className="t-small mt-2 text-subtle">{p.detalle}</p>
                </Revelar>
              ))}
            </ul>
          </Contenedor>
        </section>

        {/* ── Territorio ───────────────────────────────────────────── */}
        <section className="bg-surface-2 py-16 lg:py-24">
          <Contenedor className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
            <Revelar>
              <EncabezadoSeccion
                rotulo="Territorio"
                titulo="Cubarral y Granada, Meta"
                entrada="Las actividades del proyecto se desarrollan en estos dos municipios del Piedemonte Llanero, donde la cordillera baja a la llanura."
              />
            </Revelar>
            <Revelar retraso={80}>
              <MapaTerritorio className="mx-auto max-w-[560px]" />
            </Revelar>
          </Contenedor>
        </section>

        {/* ── Metodología ──────────────────────────────────────────── */}
        <section className="py-16 lg:py-24">
          <Contenedor>
            <Revelar>
              <EncabezadoSeccion
                rotulo="Metodología"
                titulo="Cómo lo hacemos"
                entrada="Cinco pasos, del lote de cría al celular del productor."
              />
            </Revelar>
            <ol className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-5">
              {METODO.map(({ titulo, texto, termino }, i) => (
                <Revelar as="li" key={titulo} retraso={i * 50}>
                  <span className="t-eyebrow text-primary">0{i + 1}</span>
                  <h3 className="t-h3 mt-3 flex items-center gap-1">
                    {titulo}
                    {termino && <InfoTip termino={termino} />}
                  </h3>
                  <p className="t-small mt-2 text-subtle">{texto}</p>
                </Revelar>
              ))}
            </ol>

            {/* Las tres comidas: se nombran una vez con su formula real. */}
            <Revelar className="mt-16">
              <h3 className="t-h3">Las tres comidas en estudio</h3>
              <ul className="mt-5 grid gap-x-10 gap-y-5 sm:grid-cols-3">
                {DIETS.map((d) => (
                  <li key={d.id} className="flex flex-col gap-1">
                    <span className="t-eyebrow text-primary">{d.id}</span>
                    <span className="text-[16px] font-medium">
                      {d.main} {DIET_BASE.mainPct}{"\u00a0"}%
                    </span>
                  </li>
                ))}
              </ul>
              <p className="t-small mt-5 max-w-[65ch] text-subtle">
                Las tres llevan la misma base: {base}. Lo que cambia es el{" "}
                {DIET_BASE.mainPct}{"\u00a0"}% principal.
              </p>
            </Revelar>

            {/* Detalle tecnico plegado: para quien lo quiera leer. */}
            <details className="group mt-12 max-w-[820px]">
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

        {/* ── Respaldo científico ──────────────────────────────────── */}
        <section className="pb-16 lg:pb-24">
          <Contenedor className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <Revelar>
              <EncabezadoSeccion
                rotulo="Respaldo científico"
                titulo="De dónde sale cada dato"
                entrada="Cada número de la plataforma dice su origen. No mezclamos lo medido con lo calculado, y cuando un dato todavía no existe, lo decimos en vez de rellenarlo."
              />
            </Revelar>
            <ul className="grid gap-x-10 gap-y-8 self-center sm:grid-cols-2">
              {(Object.keys(ORIGENES) as Origen[]).map((o, i) => (
                <Revelar as="li" key={o} retraso={i * 50}>
                  <OrigenDato origen={o} />
                  <p className="t-small mt-3 text-subtle">{ORIGENES[o].explicacion}</p>
                </Revelar>
              ))}
            </ul>
          </Contenedor>
        </section>

        {/* ── Contacto ─────────────────────────────────────────────── */}
        <section className="pb-16 lg:pb-24">
          <Contenedor className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <Revelar>
              <EncabezadoSeccion
                rotulo="Contacto"
                titulo="Le avisamos cuando el modelo esté validado"
                entrada="Si quiere que alguien del equipo le escriba, o si está criando grillos y quiere contarnos cómo le va."
              />
            </Revelar>
            <Revelar retraso={80} className="lg:pt-10">
              <InterestForm />
            </Revelar>
          </Contenedor>
        </section>

        {/* ── Créditos y enlaces ───────────────────────────────────── */}
        <section className="pb-20 lg:pb-24">
          <Contenedor className="grid gap-8 sm:grid-cols-2 lg:gap-20">
            <div>
              <h2 className="t-eyebrow text-faint">Créditos</h2>
              <p className="t-small mt-3 max-w-[60ch] text-subtle">
                Fotografías de los grillos del proyecto: Catalina
                Clavijo-Agudelo y Sebastián Berrío. La foto de la portada es
                una imagen de referencia de Wikimedia Commons y no corresponde
                a los ejemplares del proyecto. Ilustraciones en grabado
                hechas para GrillosIA. Límites del mapa: DANE, Marco
                Geoestadístico Nacional 2025 (CC BY 4.0).
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
