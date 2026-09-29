import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Box,
  Bug,
  ClipboardList,
  type LucideIcon,
} from "lucide-react";

import { Barra } from "@/components/barra";
import { DatoPendiente } from "@/components/dato-pendiente";
import { FotoGrillo } from "@/components/foto-grillo";
import { FuenteCientifica } from "@/components/fuente-cientifica";
import { InfoTip } from "@/components/info-tip";
import { MapaTerritorio } from "@/components/mapa-territorio";
import { PortadaHero } from "@/components/portada-hero";
import {
  ANIMALS,
  CATEGORIAS,
  animalesDe,
  formatoProteina,
  rangoAnimal,
} from "@/lib/animals";
import { CAMINO } from "@/lib/camino";
import {
  CIFRAS,
  FOTO_PAISAJE,
  OBJETIVOS,
  PASOS_PORTADA,
  POR_QUE,
} from "@/lib/content/landing";

/**
 * Portada.
 *
 * Sigue el diseno de referencia de GrillosIA: titular en serif, las cuatro
 * etapas numeradas justo debajo y luego secciones cortas con mucho aire.
 * Una columna en celular, rejilla en escritorio.
 *
 * Imagenes pocas y pequenas: una foto de grillo en la entrada, otra en la
 * seccion de los grillos, una lamina a lapiz y el mapa. El espacio en blanco
 * tambien es parte del diseno; no se rellena con decoracion.
 */

const ICONOS_PASO: Record<number, LucideIcon> = {
  1: Box,
  2: Bug,
  3: ClipboardList,
  4: BarChart3,
};

function Encabezado({
  rotulo,
  titulo,
  className,
}: {
  rotulo: string;
  titulo: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="rotulo text-muted-foreground">{rotulo}</p>
      <h2 className="mt-2 font-display text-[2rem] font-normal leading-[1.1] tracking-[-0.01em] lg:text-[2.5rem]">
        {titulo}
      </h2>
    </div>
  );
}

export default function Inicio() {
  // Todas las referencias de proteina que hay cargadas, para un solo enlace
  // "¿De donde sale este valor?" en la seccion de animales.
  const refsProteina = [
    ...new Set(
      ANIMALS.flatMap((a) => a.stages.flatMap((e) => e.protein?.refs ?? [])),
    ),
  ];

  return (
    <>
      <Barra />
      <PortadaHero />

      <main className="mx-auto w-full max-w-[1240px] px-5 lg:px-8">
        {/* ── Las cuatro etapas ─────────────────────────────── */}
        <section id="como-funciona" className="scroll-mt-24 py-12 lg:py-16">
          <ol className="grid overflow-hidden rounded-lg border sm:grid-cols-2 lg:grid-cols-4">
            {CAMINO.map((p) => {
              const Icono = ICONOS_PASO[p.n];
              return (
                <li
                  key={p.n}
                  className="border-b last:border-b-0 sm:[&:nth-child(odd)]:border-r lg:border-b-0 lg:border-r lg:last:border-r-0"
                >
                  <Link
                    href={p.href}
                    className="group flex h-full flex-col gap-3 p-6 transition-colors hover:bg-card lg:p-7"
                  >
                    <div className="flex items-start gap-4">
                      <Icono
                        className="mt-1 size-7 shrink-0 text-foreground/70"
                        strokeWidth={1.25}
                        aria-hidden
                      />
                      <div>
                        <span className="text-[13px] text-muted-foreground">
                          0{p.n}
                        </span>
                        <h3 className="font-display text-[1.45rem] font-normal leading-tight">
                          {p.titulo}
                        </h3>
                      </div>
                    </div>
                    <p className="text-[15px] leading-relaxed text-foreground/75">
                      {PASOS_PORTADA[p.n]}
                    </p>
                    <ArrowRight
                      className="mt-auto size-4 text-foreground/60 transition-transform group-hover:translate-x-1"
                      aria-hidden
                    />
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>

        {/* ── Conozca sus grillos ──────────────────────────── */}
        <section className="grid items-center gap-8 border-t py-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16 lg:py-16">
          <FotoGrillo
            src="/grillos/grillo-3.webp"
            width={611}
            height={459}
            alt="Grillo de los que cría el proyecto, sobre fondo claro"
            className="mx-auto w-full max-w-[300px] lg:max-w-[340px]"
          />
          <div>
            <Encabezado rotulo="Los grillos" titulo="Conozca sus grillos" />
            <p className="mt-4 max-w-[52ch] text-[16.5px] leading-relaxed text-foreground/80">
              Trabajamos con grillos del Piedemonte Llanero. Su identificación
              se está confirmando en el laboratorio; por eso, por ahora, se
              nombran por su familia, Gryllidae, y no por una especie.
            </p>
            <Link
              href="/grillos"
              className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-md border border-primary/60 px-5 text-[15px] font-semibold text-primary transition-colors hover:bg-primary/5"
            >
              Explorar la guía
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>

        {/* ── Qué es y por qué surge ───────────────────────── */}
        <section className="grid gap-10 border-t py-12 lg:grid-cols-2 lg:gap-16 lg:py-16">
          <div>
            <Encabezado rotulo="Qué es" titulo="Una herramienta para decidir con datos" />
            <div className="mt-4 flex flex-col gap-3 text-[16.5px] leading-relaxed text-foreground/80">
              <p>
                Comparamos tres comidas para grillos y medimos qué harina da
                cada una. Con eso, la plataforma le muestra cuál se acerca más
                a lo que su animal necesita.
              </p>
              <p>
                Es una investigación de la Universidad de los Llanos, abierta
                para que usted la use mientras aprendemos.
              </p>
            </div>
          </div>
          <div>
            <Encabezado rotulo="Por qué surge" titulo="Proteína producida en la región" />
            <ul className="mt-4 flex flex-col gap-3">
              {POR_QUE.map((t, i) => (
                <li
                  key={i}
                  className="flex gap-3 text-[16px] leading-relaxed text-foreground/80"
                >
                  <span className="mt-[11px] size-1.5 shrink-0 rounded-full bg-primary" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Objetivos ────────────────────────────────────── */}
        <section className="border-t py-12 lg:py-16">
          <Encabezado rotulo="Qué nos proponemos" titulo="Cuatro objetivos" />
          <ul className="mt-8 grid gap-x-12 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {OBJETIVOS.map((o) => (
              <li key={o.n}>
                <span className="text-[13px] text-muted-foreground">{o.n}</span>
                <h3 className="mt-1 font-display text-[1.3rem] font-normal leading-snug">
                  {o.titulo}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-foreground/75">
                  {o.cuerpo}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Para qué animales ────────────────────────────── */}
        <section className="border-t py-12 lg:py-16">
          <Encabezado rotulo="Para qué animales" titulo="Peces, aves y cerdos" />
          <p className="mt-3 flex max-w-[60ch] items-center gap-1 text-[15.5px] leading-relaxed text-foreground/75">
            Cada animal necesita una cantidad distinta de proteína según su
            etapa productiva.
            <InfoTip termino="requerimientoProteina" />
          </p>
          <ul className="mt-8 grid gap-4 md:grid-cols-3">
            {CATEGORIAS.map((c) => {
              const animales = animalesDe(c.id);
              const rangos = animales
                .map(rangoAnimal)
                .filter((r) => r !== null);
              const rango =
                rangos.length > 0
                  ? {
                      min: Math.min(...rangos.map((r) => r.min)),
                      max: Math.max(...rangos.map((r) => r.max)),
                    }
                  : null;
              return (
                <li
                  key={c.id}
                  className="flex flex-col rounded-lg border bg-card/60 p-5"
                >
                  <Image
                    src={c.image}
                    alt=""
                    width={280}
                    height={200}
                    aria-hidden
                    className="lamina h-20 w-auto self-start object-contain"
                  />
                  <h3 className="mt-3 font-display text-[1.5rem] font-normal">
                    {c.name}
                  </h3>
                  <p className="mt-1 text-[14.5px] leading-snug text-foreground/75">
                    {animales.map((a) => a.name).join(" · ")}
                  </p>
                  <div className="mt-4 border-t pt-3 text-[14.5px]">
                    {rango ? (
                      <p>
                        <span className="text-muted-foreground">
                          Proteína en el alimento, según especie y etapa:{" "}
                        </span>
                        <span className="font-semibold">
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
                </li>
              );
            })}
          </ul>
          {refsProteina.length > 0 && (
            <FuenteCientifica ids={refsProteina} className="mt-4" />
          )}
        </section>

        {/* ── Territorio ───────────────────────────────────── */}
        <section className="grid items-center gap-10 border-t py-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16 lg:py-16">
          <div>
            <Encabezado rotulo="Territorio" titulo="Piedemonte Llanero, Meta" />
            <p className="mt-4 max-w-[48ch] text-[16.5px] leading-relaxed text-foreground/80">
              Las actividades del proyecto se desarrollan en los municipios de
              Cubarral y Granada, en el departamento del Meta.
            </p>
            {FOTO_PAISAJE && (
              <figure className="mt-6 max-w-[460px]">
                <Image
                  src={FOTO_PAISAJE.src}
                  alt={FOTO_PAISAJE.alt}
                  width={FOTO_PAISAJE.width}
                  height={FOTO_PAISAJE.height}
                  className="h-auto w-full rounded-lg"
                />
                <figcaption className="mt-1.5 text-[12px] text-muted-foreground">
                  {FOTO_PAISAJE.url ? (
                    <a
                      href={FOTO_PAISAJE.url}
                      target="_blank"
                      rel="noreferrer"
                      className="underline underline-offset-2"
                    >
                      {FOTO_PAISAJE.credito}
                    </a>
                  ) : (
                    FOTO_PAISAJE.credito
                  )}
                </figcaption>
              </figure>
            )}
          </div>
          <MapaTerritorio className="mx-auto max-w-[520px]" />
        </section>

        {/* ── Cifras ───────────────────────────────────────── */}
        <section className="border-t py-12 lg:py-16">
          <p className="rotulo text-muted-foreground">El proyecto en números</p>
          <dl className="mt-6 grid grid-cols-2 gap-x-8 gap-y-8 lg:grid-cols-4">
            {CIFRAS.map((c) => (
              <div key={c.rotulo}>
                <dt className="font-display text-[3rem] font-normal leading-none text-primary lg:text-[3.6rem]">
                  {c.valor}
                </dt>
                <dd className="mt-2 max-w-[22ch] text-[14.5px] leading-snug text-muted-foreground">
                  {c.rotulo}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ── Quién lo hace ────────────────────────────────── */}
        <section className="grid gap-8 border-t py-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16 lg:py-16">
          <Encabezado rotulo="Quién lo hace" titulo="Universidad de los Llanos" />
          <div className="flex flex-col gap-4 text-[16.5px] leading-relaxed text-foreground/80">
            <p>
              Con financiación de Minciencias, convocatoria 963 de 2025. La
              Dra. Mónica Paola Higuera-Díaz dirige la investigación y
              Catalina Clavijo Agudelo desarrolló la plataforma.
            </p>
            <Link
              href="/proyecto"
              className="inline-flex min-h-11 w-fit items-center gap-2 rounded-md border border-primary/60 px-5 text-[15px] font-semibold text-primary transition-colors hover:bg-primary/5"
            >
              Sobre GrillosIA
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
