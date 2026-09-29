import {
  Building2,
  Cpu,
  ExternalLink,
  FileText,
  FlaskConical,
  Microscope,
  NotebookPen,
  School,
  Smartphone,
  Timer,
} from "lucide-react";

import { Barra } from "@/components/barra";
import { InfoTip } from "@/components/info-tip";
import { InterestForm } from "@/components/interest-form";
import { MapaTerritorio } from "@/components/mapa-territorio";
import { ORIGENES, OrigenDato, type Origen } from "@/components/origen-dato";
import { DIETS, DIET_BASE } from "@/lib/animals";
import { METHODOLOGY_SECTIONS } from "@/lib/content/methodology";
import { renderMarkdownBlock } from "@/lib/markdown";

export const metadata = {
  title: "Sobre GrillosIA",
  description:
    "Proyecto de investigación de la Universidad de los Llanos sobre la cría de grillos y la optimización de su dieta con inteligencia artificial. Convocatoria Minciencias 963 de 2025.",
};

/**
 * Sobre GrillosIA.
 *
 * Breve y visual: una ficha, el objetivo, el equipo, el territorio, la
 * metodologia en cinco pasos y como se distingue el origen de cada dato. El
 * detalle tecnico queda plegado al final, para quien lo quiera leer.
 */

const FICHA = [
  { icon: School, rotulo: "Institución", valor: "Universidad de los Llanos" },
  { icon: FileText, rotulo: "Financiación", valor: "Minciencias, convocatoria 963 de 2025" },
  { icon: NotebookPen, rotulo: "Contrato", valor: "207 de 2025" },
  { icon: Timer, rotulo: "Duración", valor: "18 meses" },
  { icon: Building2, rotulo: "Territorio", valor: "Piedemonte Llanero, Meta" },
];

const EQUIPO = [
  {
    nombre: "Dra. Mónica Paola Higuera-Díaz",
    papel: "Dirige la investigación: ensayos de cría, comidas en estudio y análisis de la harina.",
  },
  {
    nombre: "Catalina Clavijo Agudelo",
    papel: "Desarrolló la plataforma, el modelo de inteligencia artificial y el asistente.",
  },
];

const METODO = [
  {
    icon: FlaskConical,
    titulo: "Cría",
    texto: "Criamos grillos con tres comidas que solo cambian en su ingrediente principal.",
  },
  {
    icon: NotebookPen,
    titulo: "Registro",
    texto: "Anotamos 17 variables por lote: clima, alimento, crecimiento y supervivencia.",
  },
  {
    icon: Microscope,
    titulo: "Laboratorio",
    texto: "Al cosechar, un análisis bromatológico mide la proteína y la grasa de la harina.",
    termino: "analisisBromatologico" as const,
  },
  {
    icon: Cpu,
    titulo: "Modelo",
    texto: "Un modelo de inteligencia artificial aprende de esos datos y hace predicciones.",
    termino: "prediccion" as const,
  },
  {
    icon: Smartphone,
    titulo: "Plataforma",
    texto: "El productor consulta el resultado desde el celular, en palabras claras.",
  },
];

function Titulo({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="rotulo text-muted-foreground">{rotulo}</p>
      <h2 className="mt-2 font-display text-[1.9rem] font-normal leading-[1.12] lg:text-[2.3rem]">
        {children}
      </h2>
    </div>
  );
}

export default function PaginaProyecto() {
  const base = DIET_BASE.base.map((b) => `${b.pct} % de ${b.name.toLowerCase()}`).join(" y ");

  return (
    <>
      <Barra />
      <main className="mx-auto w-full max-w-[1240px] px-5 lg:px-8">
        {/* ── Entrada ──────────────────────────────────────── */}
        <section className="grid gap-10 py-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16 lg:py-16">
          <div>
            <p className="rotulo text-muted-foreground">Sobre GrillosIA</p>
            <h1 className="mt-3 font-display text-[2.5rem] font-normal leading-[1.06] lg:text-[3.3rem]">
              Un proyecto de investigación
              <br />
              <span className="italic text-foreground/85">
                del Piedemonte Llanero
              </span>
            </h1>
            <p className="mt-6 max-w-[54ch] text-[17px] leading-relaxed text-foreground/80">
              GrillosIA surge de un proyecto de investigación sobre la cría de
              grillos y la optimización de su dieta mediante inteligencia
              artificial. Lo desarrolla la Universidad de los Llanos, con
              financiación de Minciencias.
            </p>
          </div>
          <ul className="flex flex-col divide-y rounded-lg border bg-card/60">
            {FICHA.map(({ icon: Icono, rotulo, valor }) => (
              <li key={rotulo} className="flex items-center gap-4 px-5 py-3.5">
                <Icono className="size-5 shrink-0 text-foreground/60" strokeWidth={1.5} aria-hidden />
                <div>
                  <p className="text-[12.5px] text-muted-foreground">{rotulo}</p>
                  <p className="text-[15.5px] font-medium">{valor}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Objetivo ─────────────────────────────────────── */}
        <section className="border-t py-12 lg:py-16">
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <Titulo rotulo="Objetivo">Qué busca el proyecto</Titulo>
            <p className="max-w-[58ch] text-[17px] leading-relaxed text-foreground/80">
              Saber qué comida y qué condiciones de cría dan una harina de
              grillo con la proteína que necesita cada animal, y poner esa
              información al alcance del productor. La harina de grillo es una
              alternativa a la harina de pescado importada.
            </p>
          </div>
        </section>

        {/* ── Equipo ───────────────────────────────────────── */}
        <section className="border-t py-12 lg:py-16">
          <Titulo rotulo="Equipo">Quiénes lo hacemos</Titulo>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {EQUIPO.map((p) => (
              <li key={p.nombre} className="rounded-lg border bg-card/60 p-5">
                <p className="font-display text-[1.35rem] font-normal">{p.nombre}</p>
                <p className="mt-1.5 text-[15px] leading-relaxed text-foreground/75">
                  {p.papel}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Territorio ───────────────────────────────────── */}
        <section className="grid items-center gap-10 border-t py-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:py-16">
          <div>
            <Titulo rotulo="Territorio">Cubarral y Granada, Meta</Titulo>
            <p className="mt-4 max-w-[46ch] text-[16.5px] leading-relaxed text-foreground/80">
              Las actividades del proyecto se desarrollan en estos dos
              municipios del Piedemonte Llanero, donde la cordillera baja a la
              llanura.
            </p>
          </div>
          <MapaTerritorio className="mx-auto max-w-[520px]" />
        </section>

        {/* ── Metodología ──────────────────────────────────── */}
        <section className="border-t py-12 lg:py-16">
          <Titulo rotulo="Metodología">Cómo lo hacemos</Titulo>
          <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {METODO.map(({ icon: Icono, titulo, texto, termino }, i) => (
              <li key={titulo} className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <Icono className="size-6 text-foreground/65" strokeWidth={1.4} aria-hidden />
                  <span className="text-[13px] text-muted-foreground">0{i + 1}</span>
                </div>
                <h3 className="flex items-center gap-1 font-display text-[1.3rem] font-normal">
                  {titulo}
                  {termino && <InfoTip termino={termino} />}
                </h3>
                <p className="text-[15px] leading-relaxed text-foreground/75">{texto}</p>
              </li>
            ))}
          </ol>

          {/* Las tres comidas: se nombran una vez con su formula real. */}
          <div className="mt-10 rounded-lg border bg-card/60 p-5 lg:p-6">
            <h3 className="font-display text-[1.35rem] font-normal">
              Las tres comidas en estudio
            </h3>
            <ul className="mt-4 grid gap-3 sm:grid-cols-3">
              {DIETS.map((d) => (
                <li key={d.id} className="rounded-md border bg-background px-4 py-3">
                  <p className="text-[13px] font-semibold text-primary">{d.id}</p>
                  <p className="text-[15.5px] font-medium">
                    {d.main} {DIET_BASE.mainPct} %
                  </p>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[14.5px] leading-relaxed text-muted-foreground">
              Las tres llevan la misma base: {base}. Lo que cambia es el{" "}
              {DIET_BASE.mainPct} % principal.
            </p>
          </div>

          <details className="mt-6 rounded-lg border p-4 [&_summary]:cursor-pointer">
            <summary className="text-[15.5px] font-semibold">
              Ver la metodología en detalle
            </summary>
            <div className="mt-4 flex flex-col gap-3">
              {METHODOLOGY_SECTIONS.map((s) => (
                <details
                  key={s.id}
                  className="rounded-md border bg-card/60 p-4 [&_summary]:cursor-pointer"
                >
                  <summary className="text-[15.5px] font-semibold">{s.title}</summary>
                  <div className="mt-2 flex flex-col gap-2 text-[15px] leading-relaxed text-foreground/85">
                    {renderMarkdownBlock(s.body_markdown)}
                  </div>
                </details>
              ))}
            </div>
          </details>
        </section>

        {/* ── Respaldo científico ──────────────────────────── */}
        <section className="grid gap-8 border-t py-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:py-16">
          <div>
            <Titulo rotulo="Respaldo científico">De dónde sale cada dato</Titulo>
            <p className="mt-4 max-w-[46ch] text-[16px] leading-relaxed text-foreground/80">
              Cada número de la plataforma dice su origen. No mezclamos lo
              medido con lo calculado, y cuando un dato todavía no existe, lo
              decimos en vez de rellenarlo.
            </p>
          </div>
          {/* Rejilla propia y no la leyenda en fila: con etiquetas de largo
              distinto, la fila partia cada explicacion en un sitio distinto. */}
          <ul className="grid gap-4 self-center sm:grid-cols-2">
            {(Object.keys(ORIGENES) as Origen[]).map((o) => (
              <li key={o} className="rounded-lg border bg-card/60 p-4">
                <OrigenDato origen={o} />
                <p className="mt-2 text-[14.5px] leading-relaxed text-foreground/75">
                  {ORIGENES[o].explicacion}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Contacto ─────────────────────────────────────── */}
        <section className="grid gap-8 border-t py-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:py-16">
          <div>
            <Titulo rotulo="Contacto">Déjenos sus datos</Titulo>
            <p className="mt-4 max-w-[44ch] text-[16px] leading-relaxed text-foreground/80">
              Si quiere que alguien del equipo le escriba, o si está criando
              grillos y quiere contarnos cómo le va.
            </p>
          </div>
          <InterestForm />
        </section>

        {/* ── Créditos y enlaces ───────────────────────────── */}
        <section className="grid gap-6 border-t py-10 text-[14px] leading-relaxed text-muted-foreground sm:grid-cols-2">
          <div>
            <h2 className="text-[14.5px] font-semibold text-foreground">Créditos</h2>
            <p className="mt-2">
              Las fotografías de los grillos fueron tomadas por Catalina
              Clavijo-Agudelo y Sebastián Berrío, sobre ejemplares del propio
              proyecto. Límites del mapa: DANE, Marco Geoestadístico Nacional
              2025 (CC BY 4.0).
            </p>
          </div>
          <div>
            <h2 className="text-[14.5px] font-semibold text-foreground">Enlaces</h2>
            <ul className="mt-2 flex flex-col gap-2">
              <li>
                <a
                  href="https://www.unillanos.edu.co"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline"
                >
                  Universidad de los Llanos
                  <ExternalLink className="size-3.5" aria-hidden />
                </a>
              </li>
              <li>
                <a
                  href="https://minciencias.gov.co"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline"
                >
                  Ministerio de Ciencia, Tecnología e Innovación
                  <ExternalLink className="size-3.5" aria-hidden />
                </a>
              </li>
            </ul>
          </div>
        </section>
      </main>
    </>
  );
}
