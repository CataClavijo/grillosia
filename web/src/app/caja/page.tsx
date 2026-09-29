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
const CUIDADOS: { Icono: LucideIcon; texto: string }[] = [
  { Icono: Wind, texto: "Si nota mal olor o mucha humedad, aumente la ventilación." },
  { Icono: Brush, texto: "Limpie el fondo cada semana y cambie el sustrato si está sucio." },
  { Icono: NotebookPen, texto: "Anote cada día la temperatura, la humedad y lo que observe." },
];

/**
 * Parada 1: armar la caja.
 *
 * Orden pensado para quien la va a armar:
 *  1. Que es y como se ve terminada: la caja armada es la imagen principal,
 *     grande, junto al titulo. Es lo que la persona tiene que reproducir.
 *  2. Que necesita conseguir: lista limpia en dos columnas, con icono
 *     lineal. Sin tarjeta flotante: la lista se lee igual sin caja.
 *  3. Como se arma: los ocho pasos en un carrusel (3, 2 o 1 a la vez segun
 *     la pantalla). Ocho tarjetas con ocho dibujos a la vez saturaban la
 *     pagina; asi se ve el paso en que va y se avanza a su ritmo.
 *  4. Como mantenerla: condiciones objetivo y cuidados en una sola franja.
 */
export default function PaginaCaja() {
  return (
    <Paso n={1} titulo="Arme su caja">
      {/* ── Cabeza: titulo y la caja armada ─────────────────────────── */}
      <section className="grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <EncabezadoSeccion
            as="h1"
            tamano="h1"
            rotulo="Guía de montaje"
            titulo="Arme su caja"
            entrada={ENCLOSURE_INTRO}
          />
          <p className="t-caption mt-5 max-w-[48ch]">{ENCLOSURE_DISCLAIMER}</p>
        </div>
        <figure className="lg:col-span-7">
          <div className="relative mx-auto aspect-[1100/681] w-full max-w-[680px]">
            <Image
              src={CAJA_ARMADA.src}
              alt={CAJA_ARMADA.alt}
              fill
              priority
              sizes="(max-width: 1024px) 92vw, 680px"
              className="lamina object-contain"
            />
          </div>
          <figcaption className="t-caption mt-3 text-center">
            La caja terminada: refugios, alimento, agua y tapa con ventilación.
          </figcaption>
        </figure>
      </section>

      {/* ── Materiales ──────────────────────────────────────────────── */}
      <Revelar as="section" className="mt-20 grid gap-8 lg:mt-28 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-4">
          <EncabezadoSeccion
            rotulo="Antes de empezar"
            titulo="Lo que necesita"
            entrada="Casi todo se consigue en la casa o de segunda."
          />
          <p className="t-caption mt-4 max-w-[40ch]">{COST_NOTE}</p>
        </div>
        <ul className="grid gap-x-10 gap-y-6 sm:grid-cols-2 lg:col-span-8">
          {MATERIALS.map((m) => {
            const Icono = ICONO_MATERIAL[m.id];
            return (
              <li key={m.id} className="flex items-start gap-3.5">
                <Icono
                  className="mt-[3px] size-5 shrink-0 text-primary"
                  strokeWidth={1.5}
                  aria-hidden
                />
                <span>
                  <span className="t-h4 block">{m.item}</span>
                  <span className="t-small block text-subtle">{m.detail}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </Revelar>

      {/* ── Paso a paso ─────────────────────────────────────────────── */}
      <Revelar as="section" className="mt-20 lg:mt-28">
        <EncabezadoSeccion
          rotulo="Paso a paso"
          titulo="Arme y cuide su caja en ocho pasos"
          entrada="Deslice para ver cada paso. Puede volver a cualquiera cuando lo necesite."
        />
        <Carrusel
          etiqueta="Pasos para armar la caja"
          className="mt-8"
          elementos={ENCLOSURE_STEPS.map((s) => (
            <TarjetaPaso key={s.number} paso={s} total={ENCLOSURE_STEPS.length} />
          ))}
        />
      </Revelar>

      {/* ── Condiciones y cuidados: una sola franja ─────────────────── */}
      <Revelar
        as="section"
        className="mt-20 grid gap-10 rounded-lg bg-surface-2 p-6 sm:p-8 lg:mt-28 lg:grid-cols-12 lg:gap-12 lg:p-10"
      >
        <div className="lg:col-span-5">
          <p className="t-eyebrow text-subtle">Condiciones objetivo</p>
          <dl className="mt-5 grid grid-cols-2 gap-6">
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
          <p className="t-caption mt-5 max-w-[44ch]">
            Son los rangos con los que el proyecto está aprendiendo, no valores
            ya medidos. Revíselos con el termómetro-higrómetro.
          </p>
        </div>
        <div className="lg:col-span-7">
          <p className="t-eyebrow text-subtle">Cuidados de todos los días</p>
          <ul className="mt-5 flex flex-col gap-4">
            {CUIDADOS.map(({ Icono, texto }) => (
              <li key={texto} className="flex items-start gap-3.5">
                <Icono className="mt-[3px] size-5 shrink-0 text-subtle" strokeWidth={1.5} aria-hidden />
                <span className="t-body">{texto}</span>
              </li>
            ))}
            <li className="flex items-start gap-3.5">
              <Lightbulb className="mt-[3px] size-5 shrink-0 text-primary" strokeWidth={1.5} aria-hidden />
              <span className="t-body">
                <span className="font-semibold">Importante: </span>
                {NOTA_IMPORTANTE}
              </span>
            </li>
          </ul>
        </div>
      </Revelar>

      <p className="t-small mt-12 text-subtle">
        ¿Ya tiene la caja y conoce sus grillos?{" "}
        <Link
          href="/consulta"
          className="inline-flex items-center gap-1 font-semibold text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
        >
          Vaya directo a la consulta
          <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      </p>
    </Paso>
  );
}

/** Un paso del carrusel: numero, dibujo en caja fija, titulo y texto. */
function TarjetaPaso({ paso: s, total }: { paso: EnclosureStep; total: number }) {
  const dos = (n: number) => String(n).padStart(2, "0");
  return (
    <article className="flex h-full flex-col rounded-lg bg-surface p-6 ring-1 ring-border">
      <p className="t-eyebrow text-primary">
        {dos(s.number)}
        <span className="text-faint"> / {dos(total)}</span>
      </p>
      {/* Caja fija para los ocho dibujos: mismo alto y misma base, sin
          importar la proporcion de cada uno. */}
      <div className="relative mt-5 h-40 w-full">
        <Image
          src={s.imagen}
          alt=""
          aria-hidden
          fill
          sizes="(max-width: 640px) 80vw, (max-width: 1024px) 45vw, 360px"
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

/** Rango con cifra grande y unidad aparte: "24–34 °C". */
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
      <dt className="t-small text-subtle">{etiqueta}</dt>
      <dd className="t-cifra mt-1 text-[2.5rem] text-foreground sm:text-[2.75rem]">
        {min}–{max}
        <span className="t-unidad">{unidad}</span>
      </dd>
    </div>
  );
}
