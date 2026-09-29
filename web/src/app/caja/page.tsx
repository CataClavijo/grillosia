import Image from "next/image";
import Link from "next/link";
import {
  Apple,
  ArrowRight,
  Box,
  Brush,
  Droplets,
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

import { Paso } from "@/components/paso";
import {
  CAJA_ARMADA,
  CONSEJOS,
  COST_NOTE,
  ENCLOSURE_DISCLAIMER,
  ENCLOSURE_INTRO,
  ENCLOSURE_STEPS,
  MATERIALS,
  NOTA_IMPORTANTE,
  type Consejo,
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

const ICONO_CONSEJO: Record<Consejo["id"], LucideIcon> = {
  temperatura: Thermometer,
  humedad: Droplets,
  ventilacion: Wind,
  limpieza: Brush,
  registro: NotebookPen,
};

/**
 * Parada 1: armar la caja.
 *
 * Sigue el diseno de referencia de Cata: titulo grande, materiales a la
 * derecha, pasos en tarjetas numeradas, consejos y una nota importante.
 * El paisaje con palmas del diseno se quito a proposito: aqui la protagonista
 * es la caja, y la informacion practica manda sobre la decoracion.
 */
export default function PaginaCaja() {
  return (
    <Paso n={1} titulo="Arme su caja">
      {/* ── Titulo, caja armada y materiales ─────────────────────────── */}
      <section className="grid gap-8 pt-4 lg:grid-cols-[1fr_1fr_360px] lg:items-start lg:gap-10 lg:pt-6">
        <div className="flex flex-col gap-4">
          <h1 className="font-display text-[2.6rem] font-medium leading-[1.02] tracking-[-0.02em] lg:text-[3.6rem]">
            Arme su caja
          </h1>
          <p className="font-display text-[1.3rem] leading-snug text-foreground/90 lg:text-[1.45rem]">
            Un espacio adecuado para criar sus grillos
          </p>
          <p className="max-w-[46ch] text-[16.5px] leading-relaxed text-foreground/80">
            {ENCLOSURE_INTRO}
          </p>
          <p className="max-w-[46ch] text-[14px] leading-relaxed text-muted-foreground">
            {ENCLOSURE_DISCLAIMER}
          </p>
        </div>

        <Image
          src={CAJA_ARMADA.src}
          alt={CAJA_ARMADA.alt}
          width={CAJA_ARMADA.width}
          height={CAJA_ARMADA.height}
          priority
          sizes="(max-width: 1024px) 80vw, 380px"
          className="lamina mx-auto h-auto w-full max-w-[380px] self-center"
        />

        <aside className="rounded-xl border bg-card p-5 lg:p-6">
          <h2 className="font-display text-[1.45rem] font-medium leading-tight">
            Materiales recomendados
          </h2>
          <ul className="mt-4 flex flex-col gap-3.5">
            {MATERIALS.map((m) => {
              const Icono = ICONO_MATERIAL[m.id];
              return (
                <li key={m.id} className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border bg-background text-foreground/70">
                    <Icono className="size-4" strokeWidth={1.6} aria-hidden />
                  </span>
                  <span className="text-[14.5px] leading-snug">
                    <span className="block font-semibold">{m.item}</span>
                    <span className="block text-muted-foreground">
                      {m.detail}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="mt-5 border-t pt-4 text-[13.5px] leading-relaxed text-muted-foreground">
            {COST_NOTE}
          </p>
        </aside>
      </section>

      {/* ── Paso a paso ───────────────────────────────────────────────── */}
      <section className="mt-12 lg:mt-14">
        <h2 className="font-display text-[1.75rem] font-medium leading-tight lg:text-[2rem]">
          Paso a paso: arme y cuide su caja
        </h2>
        <ol className="mt-6 grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 lg:grid-cols-4">
          {ENCLOSURE_STEPS.map((s) => (
            // En celular la tarjeta va en horizontal (dibujo a la izquierda):
            // ocho tarjetas verticales hacian la pagina interminable.
            <li
              key={s.number}
              className="grid grid-cols-[84px_1fr] items-start gap-x-4 rounded-xl border bg-card p-4 min-[480px]:flex min-[480px]:flex-col"
            >
              <div className="flex flex-col items-center gap-2 min-[480px]:self-stretch">
                <span className="flex size-7 items-center justify-center rounded-full bg-primary text-[13px] font-semibold text-primary-foreground">
                  {s.number}
                </span>
                <div className="flex h-[72px] w-full items-center justify-center min-[480px]:h-[104px]">
                  <Image
                    src={s.imagen}
                    alt=""
                    aria-hidden
                    width={180}
                    height={120}
                    className="lamina h-auto max-h-full w-auto max-w-full object-contain"
                  />
                </div>
              </div>
              <div className="flex min-w-0 flex-col min-[480px]:mt-3 min-[480px]:flex-1">
                <h3 className="font-display text-[1.15rem] font-medium leading-tight">
                  {s.title}
                </h3>
                <p className="mt-1.5 text-[14px] leading-snug text-foreground/80">
                  {s.body}
                </p>
                {s.tip && (
                  <p className="mt-2 text-[13px] leading-snug text-muted-foreground min-[480px]:mt-auto min-[480px]:pt-3">
                    {s.tip}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ── Consejos y nota importante ────────────────────────────────── */}
      <section className="mt-12 grid gap-4 lg:mt-14 lg:grid-cols-[1fr_320px]">
        <div className="rounded-xl border bg-card p-5 lg:p-6">
          <h2 className="font-display text-[1.45rem] font-medium leading-tight">
            Consejos útiles
          </h2>
          <p className="mt-1 text-[13.5px] text-muted-foreground">
            La temperatura y la humedad son las condiciones objetivo del
            proyecto: los rangos con los que estamos aprendiendo.
          </p>
          <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:gap-0 lg:divide-x">
            {CONSEJOS.map((c) => {
              const Icono = ICONO_CONSEJO[c.id];
              return (
                <li
                  key={c.id}
                  className="flex items-start gap-3 lg:flex-col lg:gap-2 lg:px-4 lg:first:pl-0 lg:last:pr-0"
                >
                  <Icono
                    className="size-6 shrink-0 text-foreground/70"
                    strokeWidth={1.4}
                    aria-hidden
                  />
                  <span className="text-[14px] leading-snug text-foreground/85">
                    {c.texto}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <aside className="flex items-start gap-3 rounded-xl border bg-background p-5 lg:p-6">
          <Lightbulb
            className="mt-0.5 size-6 shrink-0 text-foreground/70"
            strokeWidth={1.4}
            aria-hidden
          />
          <div>
            <h2 className="font-display text-[1.25rem] font-medium leading-tight">
              Nota importante
            </h2>
            <p className="mt-1.5 text-[14.5px] leading-relaxed text-foreground/85">
              {NOTA_IMPORTANTE}
            </p>
          </div>
        </aside>
      </section>

      {/* ── Hacia la consulta ─────────────────────────────────────────── */}
      <section className="mt-12 flex flex-col gap-4 rounded-xl border bg-card p-5 sm:flex-row sm:items-center sm:justify-between lg:mt-14 lg:p-6">
        <div>
          <h2 className="font-display text-[1.45rem] font-medium leading-tight">
            ¿Ya tiene su caja lista?
          </h2>
          <p className="mt-1 text-[15px] leading-relaxed text-foreground/80">
            Siga con el paso 2 para reconocer sus grillos. Si ya los conoce,
            puede ir directo a la consulta.
          </p>
        </div>
        <Link
          href="/consulta"
          className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-md border border-primary px-5 text-[15px] font-semibold text-primary transition-colors hover:bg-primary/5"
        >
          Ir a la consulta
          <ArrowRight className="size-4" />
        </Link>
      </section>
    </Paso>
  );
}
