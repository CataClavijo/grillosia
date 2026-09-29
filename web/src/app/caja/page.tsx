import Image from "next/image";
import Link from "next/link";
import {
  Apple,
  ArrowRight,
  Box,
  Brush,
  Egg,
  GlassWater,
  Grid3x3,
  Layers,
  Lightbulb,
  NotebookPen,
  Ribbon,
  Scissors,
  Thermometer,
  Wind,
  type LucideIcon,
} from "lucide-react";

import { Carrusel } from "@/components/ds/carrusel";
import { EncabezadoSeccion } from "@/components/ds/encabezado-seccion";
import { Revelar } from "@/components/ds/revelar";
import { DiagramaCaja } from "@/components/diagrama-caja";
import { Paso } from "@/components/paso";
import {
  CAJA_ARMADA,
  COST_NOTE,
  ENCLOSURE_DISCLAIMER,
  ENCLOSURE_INTRO,
  ENCLOSURE_STEPS,
  MATERIALS,
  NOTA_IMPORTANTE,
  RANGOS_OBJETIVO,
  type EnclosureStep,
  type IconoMaterial,
} from "@/lib/content/enclosure";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Arme su caja — GrillosIA",
  description:
    "Guía paso a paso para armar una caja de cría de grillos con materiales sencillos.",
};

const ICONO_MATERIAL: Record<IconoMaterial, LucideIcon> = {
  caja: Box,
  malla: Grid3x3,
  sustrato: Layers,
  hueveras: Egg,
  termohigrometro: Thermometer,
  bebedero: GlassWater,
  manzana: Apple,
  cinta: Ribbon,
  tijeras: Scissors,
};

/** Cuidados diarios, sin repetir lo que ya dicen los pasos. */
const CUIDADOS: { Icono: LucideIcon; titulo: string; texto: string }[] = [
  {
    Icono: Wind,
    titulo: "Ventilación",
    texto: "Si nota mal olor o mucha humedad, aumente la ventilación.",
  },
  {
    Icono: Brush,
    titulo: "Limpieza",
    texto: "Limpie el fondo cada semana y cambie el sustrato si está sucio.",
  },
  {
    Icono: NotebookPen,
    titulo: "Registro",
    texto: "Anote cada día la temperatura, la humedad y lo que observe.",
  },
];

const dos = (n: number) => String(n).padStart(2, "0");

/**
 * Parada 1: armar la caja.
 *
 * Cada seccion tiene una forma distinta, para que la pagina no se lea como
 * una fila de diapositivas iguales (titulo flotando a la izquierda, imagen a
 * la derecha):
 *
 *  1. Entrada: titulo y la caja terminada, con el texto apoyado en la base de
 *     la ilustracion y dos cifras que dicen el tamano de la tarea.
 *  2. Materiales: una banda a todo el ancho, lista en tres columnas.
 *  3. Pasos: el "mapa de la caja" (diagrama numerado, fijo al bajar) junto al
 *     carrusel de los ocho pasos. El numero de cada parte del mapa es el
 *     numero del paso que la explica, asi se leen juntos.
 *  4. Condiciones: una banda invertida, centrada, con las dos cifras grandes.
 *  5. Cuidados diarios en columnas, y el cierre hacia la consulta.
 */
export default function PaginaCaja() {
  return (
    <Paso n={1} titulo="Arme su caja">
      <div>
        {/* ── 1. Entrada ─────────────────────────────────────────────── */}
        <section className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="flex flex-col justify-between gap-10 lg:col-span-5 lg:py-4">
            <EncabezadoSeccion
              as="h1"
              tamano="h1"
              rotulo="Guía de montaje"
              titulo="Arme su caja"
              entrada={ENCLOSURE_INTRO}
            />
            <div>
              <dl className="grid grid-cols-2 gap-6 border-l-2 border-primary pl-5">
                <div>
                  <dt className="t-small text-subtle">Pasos</dt>
                  <dd className="t-cifra mt-1 text-[2.75rem]">{dos(ENCLOSURE_STEPS.length)}</dd>
                </div>
                <div>
                  <dt className="t-small text-subtle">Materiales</dt>
                  <dd className="t-cifra mt-1 text-[2.75rem]">{dos(MATERIALS.length)}</dd>
                </div>
              </dl>
              <p className="t-caption mt-5 max-w-[46ch]">{ENCLOSURE_DISCLAIMER}</p>
            </div>
          </div>
          <figure className="lg:col-span-7">
            <div className="relative aspect-[1100/681] w-full">
              <Image
                src={CAJA_ARMADA.src}
                alt={CAJA_ARMADA.alt}
                fill
                priority
                sizes="(max-width: 1024px) 92vw, 700px"
                className="lamina object-contain"
              />
            </div>
            <figcaption className="t-caption mt-3 text-right">
              La caja terminada: refugios, alimento, agua y tapa con ventilación.
            </figcaption>
          </figure>
        </section>

        {/* ── 2. Materiales: banda a todo el ancho ───────────────────── */}
        <Banda fondo="suave" className="mt-20 py-14 lg:mt-28 lg:py-20">
          <Revelar>
            <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-12">
              <EncabezadoSeccion
                className="lg:col-span-7"
                rotulo="Antes de empezar"
                titulo="Lo que necesita"
                entrada="Casi todo se consigue en la casa o de segunda."
              />
              <p className="t-small text-subtle lg:col-span-5 lg:pb-1">{COST_NOTE}</p>
            </div>
            <ul className="mt-10 grid gap-x-10 gap-y-7 sm:grid-cols-2 lg:mt-12 lg:grid-cols-3">
              {MATERIALS.map((m, i) => {
                const Icono = ICONO_MATERIAL[m.id];
                return (
                  <Revelar as="li" key={m.id} retraso={(i % 3) * 60} className="flex items-start gap-4">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-background text-primary">
                      <Icono className="size-5" strokeWidth={1.5} aria-hidden />
                    </span>
                    <span className="pt-0.5">
                      <span className="t-h4 block">{m.item}</span>
                      <span className="t-small mt-0.5 block text-subtle">{m.detail}</span>
                    </span>
                  </Revelar>
                );
              })}
            </ul>
          </Revelar>
        </Banda>

        {/* ── 3. Mapa de la caja + pasos ─────────────────────────────── */}
        <section className="mt-20 lg:mt-28">
          <Revelar>
            <EncabezadoSeccion
              rotulo="Paso a paso"
              titulo="Arme y cuide su caja en ocho pasos"
              entrada="Cada número del mapa es un paso. Deslice para verlos y vuelva a cualquiera cuando lo necesite."
            />
          </Revelar>
          <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-5">
              <div className="lg:sticky lg:top-28">
                <p className="t-eyebrow mb-4 text-subtle">Mapa de la caja, vista desde arriba</p>
                <DiagramaCaja leyenda={false} />
              </div>
            </div>
            <Revelar className="min-w-0 lg:col-span-7" retraso={80}>
              <Carrusel
                etiqueta="Pasos para armar la caja"
                claseElemento="basis-[86%] sm:basis-[calc(50%-10px)]"
                elementos={ENCLOSURE_STEPS.map((s) => (
                  <TarjetaPaso key={s.number} paso={s} total={ENCLOSURE_STEPS.length} />
                ))}
              />
            </Revelar>
          </div>
        </section>

        {/* ── 4. Condiciones objetivo: banda invertida y centrada ────── */}
        <Banda fondo="invertida" className="mt-20 py-16 lg:mt-28 lg:py-20">
          <Revelar className="flex flex-col items-center text-center">
            <p className="t-eyebrow text-background/65">Condiciones objetivo</p>
            <h2 className="t-h2 mt-3 max-w-[22ch] text-balance">
              El clima que buscamos dentro de la caja
            </h2>
            <dl className="mt-10 grid w-full max-w-[640px] grid-cols-2 gap-6 sm:gap-10">
              <Rango
                etiqueta="Temperatura"
                min={RANGOS_OBJETIVO.temperatura.min}
                max={RANGOS_OBJETIVO.temperatura.max}
                unidad={RANGOS_OBJETIVO.temperatura.unidad}
              />
              <Rango
                etiqueta="Humedad del aire"
                min={RANGOS_OBJETIVO.humedad.min}
                max={RANGOS_OBJETIVO.humedad.max}
                unidad={RANGOS_OBJETIVO.humedad.unidad}
              />
            </dl>
            <p className="t-small mt-8 max-w-[52ch] text-background/70">
              Son los rangos con los que el proyecto está aprendiendo, no
              valores ya medidos. Revíselos con el termómetro-higrómetro.
            </p>
          </Revelar>
        </Banda>

        {/* ── 5. Cuidados de todos los días ──────────────────────────── */}
        <section className="mt-20 lg:mt-28">
          <Revelar>
            <EncabezadoSeccion rotulo="Todos los días" titulo="Cómo mantenerla" />
          </Revelar>
          <ul className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {CUIDADOS.map(({ Icono, titulo, texto }, i) => (
              <Revelar as="li" key={titulo} retraso={i * 60}>
                <Icono className="size-6 text-primary" strokeWidth={1.5} aria-hidden />
                <h3 className="t-h3 mt-4">{titulo}</h3>
                <p className="t-small mt-1.5 text-subtle">{texto}</p>
              </Revelar>
            ))}
            <Revelar as="li" retraso={180} className="rounded-lg bg-primary-soft p-5 sm:col-span-2 lg:col-span-1">
              <Lightbulb className="size-6 text-primary" strokeWidth={1.5} aria-hidden />
              <h3 className="t-h3 mt-4">Importante</h3>
              <p className="t-small mt-1.5 text-foreground/80">{NOTA_IMPORTANTE}</p>
            </Revelar>
          </ul>
        </section>

        {/* ── Cierre ─────────────────────────────────────────────────── */}
        <Revelar as="section" className="mt-20 flex flex-col items-center text-center lg:mt-24">
          <p className="t-h3">¿Ya tiene su caja lista?</p>
          <p className="t-small mt-1.5 max-w-[48ch] text-subtle">
            Siga con sus grillos, o si ya los conoce, vaya directo a la consulta.
          </p>
          <Link
            href="/consulta"
            className="mt-4 inline-flex min-h-11 items-center gap-1.5 text-[15px] font-semibold text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
          >
            Ir a la consulta
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </Revelar>
      </div>
    </Paso>
  );
}

/**
 * Banda a todo el ancho de la pantalla, con el contenido alineado a la
 * rejilla del sitio. El fondo se extiende con una sombra solida de 100vmax
 * recortada arriba y abajo (`clip-path`): no cambia el ancho del documento,
 * asi que no aparece desplazamiento horizontal aunque haya barra del sistema.
 */
const FONDO_BANDA = {
  suave: "bg-surface-2 shadow-[0_0_0_100vmax_var(--surface-2)]",
  invertida: "bg-foreground text-background shadow-[0_0_0_100vmax_var(--foreground)]",
} as const;

function Banda({
  children,
  fondo,
  className,
}: {
  children: React.ReactNode;
  fondo: keyof typeof FONDO_BANDA;
  className?: string;
}) {
  return (
    <section className={cn("[clip-path:inset(0_-100vmax)]", FONDO_BANDA[fondo], className)}>
      {children}
    </section>
  );
}

/** Un paso del carrusel: numero, dibujo en caja fija, titulo y texto. */
function TarjetaPaso({ paso: s, total }: { paso: EnclosureStep; total: number }) {
  return (
    <article className="flex h-full flex-col rounded-lg bg-surface p-6 ring-1 ring-border">
      <div className="flex items-center justify-between">
        <span className="flex size-7 items-center justify-center rounded-full bg-primary font-mono text-[12.5px] font-semibold text-primary-foreground">
          {s.number}
        </span>
        <span className="t-eyebrow text-faint">
          {dos(s.number)} / {dos(total)}
        </span>
      </div>
      {/* Caja fija para los ocho dibujos: mismo alto y misma base, sin
          importar la proporcion de cada uno. */}
      <div className="relative mt-5 h-36 w-full">
        <Image
          src={s.imagen}
          alt=""
          aria-hidden
          fill
          sizes="(max-width: 640px) 80vw, (max-width: 1024px) 45vw, 340px"
          className="lamina object-contain object-bottom"
        />
      </div>
      <h3 className="t-h3 mt-6">{s.title}</h3>
      <p className="t-small mt-2 text-subtle">{s.body}</p>
      {s.tip && (
        <p className="t-caption mt-auto pt-5">
          <span className="font-semibold text-foreground/80">Consejo: </span>
          {s.tip}
        </p>
      )}
    </article>
  );
}

/** Rango con cifra grande y unidad aparte: "24–34 °C". Pensado para la banda invertida. */
function Rango({
  etiqueta,
  min,
  max,
  unidad,
}: {
  etiqueta: string;
  min: number;
  max: number;
  unidad: string;
}) {
  return (
    <div>
      <dt className="t-small text-background/65">{etiqueta}</dt>
      <dd className="t-cifra mt-2 whitespace-nowrap text-[2.25rem] sm:text-[4.25rem]">
        {min}–{max}
        <span className="t-unidad text-background/70">{" "}{unidad}</span>
      </dd>
    </div>
  );
}
