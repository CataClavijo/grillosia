"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import Image from "next/image";

import { Estado } from "@/components/ds/estado";
import { Pestanas } from "@/components/ds/pestanas";
import { InfoTip } from "@/components/info-tip";
import {
  CRECIMIENTO,
  CRECIMIENTO_MUDAS,
  CRECIMIENTO_NOTA,
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
 *  - Macho y hembra: lo mismo, con la lamina que muestra el ovipositor.
 *  - Crecimiento: una linea de tiempo que se dibuja al entrar.
 *  - Importancia: la cifra de la meta.
 */
export function GrillosPestanas() {
  return (
    <Pestanas
      etiqueta="Temas sobre los grillos"
      pestanas={[
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
          titulo: "Importancia",
          contenido: <Importancia />,
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

/**
 * Como crecen: huevo, ninfa y adulto en fila, cada uno con su dibujo y a su
 * tamano relativo (el huevo es diminuto), sobre una misma linea de suelo.
 * Las mudas no son una etapa sino lo que pasa entre la ninfa y el adulto,
 * asi que van escritas sobre la flecha que las une. En el celular la
 * secuencia baja en columna.
 */
function Crecimiento() {
  const { ref, visible } = useVisible<HTMLDivElement>();
  return (
    <div ref={ref}>
      <h3 className="t-h2">Cómo crecen</h3>
      <p className="t-lead mt-3 max-w-[640px]">{CRECIMIENTO_NOTA}</p>

      <ol className="mt-12 grid gap-4 md:grid-cols-[1fr_auto_1.3fr_auto_1.6fr] md:items-start md:gap-4 lg:gap-6">
        {CRECIMIENTO.map((e, i) => (
          <Fragment key={e.etapa}>
            {i > 0 && (
              // Las flechas van a la altura de la base de los dibujos (h-40),
              // todas a la misma altura; en el celular, bajo la columna de
              // los dibujos.
              <li
                aria-hidden
                className="grid grid-cols-[112px_1fr] items-center gap-5 md:flex md:w-32 md:flex-col md:gap-2 md:pt-[8.6rem]"
              >
                <span className="flex justify-center">
                  <Flecha />
                </span>
                {i === 2 && (
                  <span className="t-small text-subtle md:text-center">{CRECIMIENTO_MUDAS}</span>
                )}
              </li>
            )}
            <li
              className={cn(
                "grid grid-cols-[112px_1fr] items-center gap-5 transition-[opacity,transform] duration-500 ease-[var(--ease-natural)] md:grid-cols-1 md:items-stretch md:gap-4",
                visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
              )}
              style={{ transitionDelay: `${150 + i * 260}ms` }}
            >
              {/* Todos los dibujos apoyados en la misma base. */}
              <div className="flex h-24 items-end justify-center md:h-40 md:justify-start">
                <Image
                  src={e.imagen}
                  alt={e.alt}
                  width={600}
                  height={310}
                  sizes="(max-width: 768px) 112px, 320px"
                  className="h-auto max-h-full object-contain"
                  style={{ width: `${e.escala * 100}%` }}
                />
              </div>
              <div className="md:border-t md:border-border md:pt-4">
                <span className="t-eyebrow block text-faint">0{i + 1}</span>
                <span className="t-h3 mt-1 block">{e.etapa}</span>
                <span className="t-small mt-1 block text-subtle">{e.texto}</span>
              </div>
            </li>
          </Fragment>
        ))}
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

/** Flecha fina: horizontal en pantalla grande, hacia abajo en el celular. */
function Flecha() {
  return (
    <svg
      viewBox="0 0 48 12"
      className="h-3 w-12 shrink-0 rotate-90 text-primary md:rotate-0"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 6h45M40 1l6 5-6 5" />
    </svg>
  );
}

/**
 * Por que importan, con la meta interna como cifra, dicha como meta y no
 * como resultado. Donde y como encontrarlos tiene ahora su propia seccion,
 * a la vista (ver `donde-encontrarlos.tsx`).
 */
function Importancia() {
  const razones = IMPORTANCIA.slice(0, -1);
  return (
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
  );
}
