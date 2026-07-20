import Link from "next/link";
import {
  Building2,
  ChevronLeft,
  ExternalLink,
  FileText,
  FlaskConical,
  School,
  ScrollText,
  Sparkles,
  Users,
} from "lucide-react";

import { SiteNav } from "@/components/site-nav";

export const metadata = {
  title: "Sobre el proyecto — GrillIA",
  description:
    "Universidad de los Llanos · Convocatoria Minciencias 963 de 2025 · Contrato 207 de 2025.",
};

const FACTS = [
  {
    icon: School,
    label: "Ejecutor",
    value: "Universidad de los Llanos",
  },
  {
    icon: FileText,
    label: "Convocatoria",
    value: "Minciencias 963 de 2025",
  },
  {
    icon: ScrollText,
    label: "Contrato",
    value: "207 de 2025",
  },
  {
    icon: Building2,
    label: "Territorio",
    value: "Piedemonte Llanero",
  },
];

const LINES = [
  {
    icon: FlaskConical,
    title: "Cría experimental",
    body: "Ensayos controlados con tres dietas en estudio (D1 bore, D2 botón de oro, D3 salvado de trigo) sobre grillos nativos del Piedemonte Llanero.",
  },
  {
    icon: Sparkles,
    title: "Modelo predictivo",
    body: "Random Forest multi-salida para relacionar dieta y condiciones de cría con la composición nutricional esperada de la harina.",
  },
  {
    icon: Users,
    title: "Transferencia al productor",
    body: "Plataforma web accesible desde el celular, con lenguaje claro para pequeños productores de tilapia, pollo y cerdo.",
  },
];

export default function ProjectPage() {
  return (
    <main className="relative mx-auto flex w-full max-w-[560px] flex-col px-6 pb-16 pt-5">
      <header className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[14px] font-semibold text-foreground/70 transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-5 w-5" />
          Inicio
        </Link>
        <SiteNav />
      </header>

      <section className="mt-8">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <School className="h-6 w-6" strokeWidth={1.5} />
        </span>
        <p className="eyebrow mt-5 text-primary">Sobre el proyecto</p>
        <h1 className="mt-2 text-[2rem] font-bold leading-tight tracking-[-0.02em]">
          Un proyecto de la Universidad de los Llanos.
        </h1>
        <p className="mt-4 text-[16px] leading-relaxed text-foreground/75">
          GrillIA es una iniciativa de investigación aplicada financiada por
          <strong> Minciencias</strong> en el marco de la Convocatoria 963 de
          2025. Estudiamos cómo optimizar la cría de grillos nativos del
          Piedemonte Llanero para producir harina proteica destinada a la
          alimentación animal en Colombia.
        </p>
      </section>

      {/* Ficha del proyecto */}
      <section className="mt-10">
        <h2 className="text-[18px] font-bold tracking-tight">
          Ficha del proyecto
        </h2>
        <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {FACTS.map((f) => {
            const Icon = f.icon;
            return (
              <li
                key={f.label}
                className="flex items-start gap-3 rounded-2xl border border-border/70 bg-card/60 p-4"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-4.5 w-4.5" strokeWidth={1.75} />
                </span>
                <div>
                  <p className="text-[11.5px] font-bold uppercase tracking-wider text-foreground/55">
                    {f.label}
                  </p>
                  <p className="mt-1 text-[14.5px] font-semibold text-foreground">
                    {f.value}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Líneas */}
      <section className="mt-12">
        <h2 className="text-[18px] font-bold tracking-tight">
          Líneas de trabajo
        </h2>
        <ul className="mt-5 space-y-3">
          {LINES.map((l) => {
            const Icon = l.icon;
            return (
              <li
                key={l.title}
                className="flex items-start gap-4 rounded-2xl border border-border/70 bg-card/60 p-4"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <div>
                  <p className="text-[16px] font-bold">{l.title}</p>
                  <p className="mt-1 text-[14px] leading-relaxed text-foreground/75">
                    {l.body}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Estado */}
      <section className="mt-12 rounded-2xl border border-demo-border bg-demo-bg p-5">
        <p className="text-[13px] font-bold uppercase tracking-wider text-demo-foreground">
          Fase actual
        </p>
        <p className="mt-2 text-[15px] leading-relaxed text-demo-foreground">
          El proyecto se encuentra en fase demostrativa. El modelo de IA sigue
          en entrenamiento y los ensayos experimentales están en curso. Todo
          lo que ve en la plataforma es orientativo hasta que los datos
          bromatológicos finales estén disponibles.
        </p>
      </section>

      {/* Enlaces */}
      <section className="mt-10 rounded-2xl border border-border/70 bg-card/60 p-5">
        <h2 className="text-[15px] font-bold">Recursos y contacto</h2>
        <ul className="mt-4 space-y-3 text-[14px]">
          <li>
            <Link
              href="/metodologia"
              className="inline-flex items-center gap-2 font-semibold text-primary hover:underline"
            >
              <FlaskConical className="h-4 w-4" strokeWidth={2} /> Ver la
              metodología completa
            </Link>
          </li>
          <li>
            <a
              href="https://github.com/CataClavijo/grillia"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-semibold text-primary hover:underline"
            >
              <ExternalLink className="h-4 w-4" strokeWidth={2} /> Repositorio
              del proyecto en GitHub
            </a>
          </li>
          <li>
            <a
              href="https://www.unillanos.edu.co"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-semibold text-primary hover:underline"
            >
              <ExternalLink className="h-4 w-4" strokeWidth={2} /> Universidad
              de los Llanos
            </a>
          </li>
          <li>
            <a
              href="https://minciencias.gov.co"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-semibold text-primary hover:underline"
            >
              <ExternalLink className="h-4 w-4" strokeWidth={2} /> Ministerio de
              Ciencia, Tecnología e Innovación
            </a>
          </li>
        </ul>
      </section>
    </main>
  );
}
