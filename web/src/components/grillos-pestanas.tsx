"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Bug,
  Egg,
  Hand,
  Leaf,
  Package,
  RefreshCw,
  Sprout,
  Sunset,
  type LucideIcon,
} from "lucide-react";

import { Estado } from "@/components/ds/estado";
import { Pestanas } from "@/components/ds/pestanas";
import { InfoTip } from "@/components/info-tip";
import {
  COMO_CAPTURAR,
  CRECIMIENTO,
  CRECIMIENTO_NOTA,
  GRILLO_O_SALTAMONTES,
  GRILLO_O_SALTAMONTES_CLAVE,
  IMPORTANCIA,
  MACHO_HEMBRA,
} from "@/lib/content/catalog";
import { cn } from "@/lib/utils";

/**
 * Temas de "Conozca sus grillos", en pestanas discretas.
 *
 * "Como reconocerlo" ya no vive aqui: es la lamina anotada, a la vista,
 * justo encima. Las pestanas quedan para lo que se consulta despues, y cada
 * una tiene una forma propia segun lo que explica:
 *
 *  - Grillo o saltamontes: comparacion rasgo por rasgo, lado a lado.
 *  - Macho y hembra: lo mismo, con la lamina que muestra el ovipositor.
 *  - Crecimiento: una linea de tiempo que se dibuja al entrar.
 *  - Importancia y captura: la cifra de la meta y los pasos para buscarlos.
 */
export function GrillosPestanas() {
  return (
    <Pestanas
      etiqueta="Temas sobre los grillos"
      pestanas={[
        {
          id: "saltamontes",
          titulo: "Grillo o saltamontes",
          contenido: (
            <Comparacion
              titulo="¿Grillo o saltamontes?"
              entrada={GRILLO_O_SALTAMONTES_CLAVE}
              columnas={["Grillo", "Saltamontes"]}
              filas={GRILLO_O_SALTAMONTES.map((f) => ({
                rasgo: f.rasgo,
                a: f.grillo,
                b: f.saltamontes,
              }))}
              lamina={{
                src: "/acuarelas/identificar.webp",
                alt: "Un grillo, de antenas largas, arriba, y un saltamontes, de antenas cortas, abajo.",
                pie: "Arriba, un grillo; abajo, un saltamontes.",
              }}
            />
          ),
        },
        {
          id: "macho-hembra",
          titulo: "Macho y hembra",
          contenido: (
            <Comparacion
              titulo="¿Cuál es hembra y cuál es macho?"
              entrada="Mire el final del cuerpo: la hembra lleva una aguja que el macho no tiene."
              columnas={["Hembra", "Macho"]}
              filas={MACHO_HEMBRA.map((f) => ({ rasgo: f.rasgo, a: f.hembra, b: f.macho }))}
              lamina={{
                src: "/acuarelas/macho-hembra.webp",
                alt: "Una hembra, arriba, con una aguja larga y recta al final del cuerpo, y un macho, abajo, sin ella.",
                pie: "Arriba, la hembra con su ovipositor; abajo, el macho.",
              }}
            />
          ),
        },
        {
          id: "crecimiento",
          titulo: "Crecimiento",
          contenido: <Crecimiento />,
        },
        {
          id: "importancia",
          titulo: "Importancia y captura",
          contenido: <ImportanciaCaptura />,
        },
      ]}
    />
  );
}

/** Aparece una sola vez al entrar en pantalla. */
function useVisible<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

/**
 * Dos columnas con los rasgos alineados fila por fila: se compara de un
 * vistazo, sin leer parrafos. La primera columna (la que se busca, el grillo
 * o la hembra) va en tinta firme; la segunda, en gris.
 */
function Comparacion({
  titulo,
  entrada,
  columnas,
  filas,
  lamina,
}: {
  titulo: string;
  entrada: string;
  columnas: [string, string];
  filas: { rasgo: string; a: string; b: string }[];
  lamina: { src: string; alt: string; pie: string };
}) {
  const { ref, visible } = useVisible<HTMLDivElement>();
  return (
    <div ref={ref} className="grid gap-10 lg:grid-cols-12 lg:gap-14">
      <div className="lg:col-span-7">
        <h3 className="t-h2">{titulo}</h3>
        <p className="t-lead mt-3">{entrada}</p>

        <div className="mt-8" role="table" aria-label={titulo}>
          <div
            role="row"
            className="grid grid-cols-[minmax(84px,0.8fr)_1fr_1fr] gap-x-4 border-b border-border-strong pb-2 sm:gap-x-6"
          >
            <span role="columnheader" className="t-eyebrow text-faint">
              Rasgo
            </span>
            <span role="columnheader" className="t-eyebrow text-primary">
              {columnas[0]}
            </span>
            <span role="columnheader" className="t-eyebrow text-subtle">
              {columnas[1]}
            </span>
          </div>
          {filas.map((f, i) => (
            <div
              key={f.rasgo}
              role="row"
              className={cn(
                "grid grid-cols-[minmax(84px,0.8fr)_1fr_1fr] gap-x-4 border-b border-border py-4 transition-[opacity,transform] duration-500 ease-[var(--ease-natural)] sm:gap-x-6",
                visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
              )}
              style={{ transitionDelay: `${i * 90}ms` }}
            >
              <span role="rowheader" className="t-h4">
                {f.rasgo}
              </span>
              <span role="cell" className="t-small text-foreground">
                {f.a}
              </span>
              <span role="cell" className="t-small text-subtle">
                {f.b}
              </span>
            </div>
          ))}
        </div>
      </div>

      <figure className="lg:col-span-5 lg:pt-4">
        <div className="relative mx-auto h-52 w-full max-w-[380px] sm:h-60">
          <Image
            src={lamina.src}
            alt={lamina.alt}
            fill
            sizes="(max-width: 1024px) 90vw, 420px"
            className="lamina object-contain"
          />
        </div>
        <figcaption className="t-caption mt-3 text-center">{lamina.pie}</figcaption>
      </figure>
    </div>
  );
}

const ICONO_ETAPA: LucideIcon[] = [Egg, Sprout, RefreshCw, Bug];

/**
 * Linea de tiempo del crecimiento: horizontal en pantallas anchas y vertical
 * en celular. La linea se dibuja de izquierda a derecha al entrar y cada
 * etapa aparece a su paso.
 *
 * No lleva duraciones: todavia no estan medidas en los ensayos.
 */
function Crecimiento() {
  const { ref, visible } = useVisible<HTMLDivElement>();
  return (
    <div ref={ref}>
      <div className="grid items-end gap-8 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-7">
          <h3 className="t-h2">Cómo crecen</h3>
          <p className="t-lead mt-3">{CRECIMIENTO_NOTA}</p>
        </div>
        <figure className="lg:col-span-5">
          <div className="relative mx-auto h-32 w-full max-w-[420px] sm:h-40">
            <Image
              src="/acuarelas/ciclo.webp"
              alt="El ciclo de vida del grillo: huevo, ninfa sin alas y adulto con alas."
              fill
              sizes="(max-width: 1024px) 90vw, 420px"
              className="lamina object-contain"
            />
          </div>
        </figure>
      </div>

      <ol className="relative mt-12 grid gap-8 md:grid-cols-4 md:gap-6">
        {/* La linea que une las etapas: se dibuja al entrar. */}
        <span
          aria-hidden
          className="absolute top-5 left-5 hidden h-px bg-border-strong md:block"
          style={{ right: "calc(25% - 20px)" }}
        >
          <span
            className="block h-full origin-left bg-primary transition-transform duration-[1400ms] ease-[var(--ease-natural)]"
            style={{ transform: visible ? "scaleX(1)" : "scaleX(0)" }}
          />
        </span>
        <span
          aria-hidden
          className="absolute top-5 bottom-5 left-5 w-px bg-border-strong md:hidden"
        />
        {CRECIMIENTO.map((e, i) => {
          const Icono = ICONO_ETAPA[i] ?? Bug;
          return (
            <li
              key={e.etapa}
              className={cn(
                "relative grid grid-cols-[40px_1fr] gap-4 transition-[opacity,transform] duration-500 ease-[var(--ease-natural)] md:grid-cols-1 md:gap-3",
                visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
              )}
              style={{ transitionDelay: `${150 + i * 260}ms` }}
            >
              <span className="relative z-10 flex size-10 items-center justify-center rounded-full border border-primary bg-background text-primary">
                <Icono className="size-[18px]" strokeWidth={1.75} aria-hidden />
              </span>
              <span className="md:pt-1">
                <span className="t-eyebrow block text-faint">0{i + 1}</span>
                <span className="t-h3 mt-1 block">{e.etapa}</span>
                <span className="t-small mt-1 block text-subtle">{e.texto}</span>
              </span>
            </li>
          );
        })}
      </ol>

      <Estado
        tipo="pendiente"
        compacto
        titulo="¿Cuántos días tarda cada etapa?"
        className="mt-12 max-w-[560px]"
      >
        Dato aún no disponible. Es parte de lo que se está midiendo en los
        ensayos de cría.
      </Estado>
    </div>
  );
}

const ICONO_CAPTURA: LucideIcon[] = [Sunset, Leaf, Package, Hand];

/**
 * Por que importan (con la meta interna como cifra, dicha como meta y no
 * como resultado) y como buscarlos, en cuatro pasos con icono.
 */
function ImportanciaCaptura() {
  const { ref, visible } = useVisible<HTMLDivElement>();
  const razones = IMPORTANCIA.slice(0, -1);
  return (
    <div ref={ref} className="flex flex-col gap-16">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-7">
          <h3 className="t-h2">¿Por qué son importantes?</h3>
          <ul className="mt-5 flex flex-col gap-3">
            {razones.map((t) => (
              <li key={t} className="t-body text-foreground/85">
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="self-start rounded-lg bg-surface-2 p-6 lg:col-span-5 lg:p-7">
          <p className="t-eyebrow text-subtle">Meta interna del proyecto</p>
          <p className="t-cifra mt-3 text-[3.25rem] text-primary">
            60–70<span className="t-unidad">%</span>
          </p>
          <p className="t-small mt-2 flex flex-wrap items-center gap-1 text-subtle">
            de proteína en la harina, en base seca
            <InfoTip termino="materiaSeca" />
          </p>
          <p className="t-small mt-4 text-foreground/80">
            Todavía no es un dato conseguido: se confirma con el análisis de
            laboratorio de cada prueba.
            <InfoTip termino="analisisBromatologico" className="ml-1" />
          </p>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-4">
          <h3 className="t-h2">Dónde buscarlos</h3>
          <div className="relative mt-6 h-44 w-full max-w-[360px]">
            <Image
              src="/acuarelas/donde-buscar.webp"
              alt="Hojarasca, leña vieja y piedras, donde se esconden los grillos."
              fill
              sizes="360px"
              className="lamina object-contain object-left"
            />
          </div>
        </div>
        <ol className="grid content-start gap-6 sm:grid-cols-2 lg:col-span-8 lg:gap-x-10">
          {COMO_CAPTURAR.map((t, i) => {
            const Icono = ICONO_CAPTURA[i] ?? Leaf;
            return (
              <li
                key={t}
                className={cn(
                  "grid grid-cols-[40px_1fr] gap-4 transition-[opacity,transform] duration-500 ease-[var(--ease-natural)]",
                  visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
                )}
                style={{ transitionDelay: `${i * 90}ms` }}
              >
                <span className="flex size-10 items-center justify-center rounded-full bg-primary-soft text-primary">
                  <Icono className="size-[18px]" strokeWidth={1.75} aria-hidden />
                </span>
                <span>
                  <span className="t-eyebrow text-faint">0{i + 1}</span>
                  <span className="t-body mt-1 block text-foreground/85">{t}</span>
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
