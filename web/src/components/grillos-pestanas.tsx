"use client";

import Image from "next/image";

import { Estado } from "@/components/ds/estado";
import { Pestanas } from "@/components/ds/pestanas";
import { InfoTip } from "@/components/info-tip";
import {
  COMO_CAPTURAR,
  COMO_RECONOCER,
  CRECIMIENTO,
  GRILLO_O_SALTAMONTES,
  IMPORTANCIA,
  MACHO_HEMBRA,
} from "@/lib/content/catalog";

/**
 * Temas de "Conozca sus grillos", en pestanas discretas.
 *
 * Eran seis; ahora son cuatro. "Identificacion" salio de las pestanas porque
 * la ficha del ejemplar ya esta arriba, a la vista; e "Importancia" y "Como
 * capturarlos" van juntas porque las dos responden "¿para que y de donde?".
 * Menos opciones, cada una con contenido suficiente.
 *
 * Cada pestana: texto a la izquierda (65 caracteres de ancho como maximo) y
 * una lamina en grabado a la derecha, en una caja de tamano fijo para que
 * las cuatro pesen lo mismo.
 */
export function GrillosPestanas() {
  return (
    <Pestanas
      etiqueta="Temas sobre los grillos"
      pestanas={[
        {
          id: "reconocer",
          titulo: "Cómo reconocerlos",
          contenido: (
            <TextoConLamina
              titulo="¿Cómo reconocer un grillo?"
              lamina="/ilustraciones/identificar.webp"
              laminaAlt="Grabado que compara un grillo, de antenas largas, con un saltamontes, de antenas cortas."
              pie="Arriba, un grillo; abajo, un saltamontes."
            >
              <ul className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
                {COMO_RECONOCER.map((c, i) => (
                  <li key={c.titulo}>
                    <p className="t-eyebrow text-primary">0{i + 1}</p>
                    <p className="t-h4 mt-1.5">{c.titulo}</p>
                    <p className="t-small mt-1 text-subtle">{c.texto}</p>
                  </li>
                ))}
              </ul>
              <h4 className="t-h3 mt-10">¿Grillo o saltamontes?</h4>
              {GRILLO_O_SALTAMONTES.map((t) => (
                <p key={t} className="t-body mt-2 text-foreground/85">
                  {t}
                </p>
              ))}
            </TextoConLamina>
          ),
        },
        {
          id: "macho-hembra",
          titulo: "Macho y hembra",
          contenido: (
            <TextoConLamina
              titulo="¿Cuál es hembra y cuál es macho?"
              lamina="/ilustraciones/macho-hembra.webp"
              laminaAlt="Grabado de una hembra, arriba, con una aguja larga y recta al final del cuerpo, y de un macho, abajo, sin ella."
              pie="Arriba, la hembra con su ovipositor; abajo, el macho."
            >
              {MACHO_HEMBRA.map((t) => (
                <p key={t} className="t-body mt-3 text-foreground/85 first:mt-0">
                  {t}
                </p>
              ))}
            </TextoConLamina>
          ),
        },
        {
          id: "crecimiento",
          titulo: "Crecimiento",
          contenido: (
            <TextoConLamina
              titulo="Cómo crecen"
              lamina="/ilustraciones/ciclo.webp"
              laminaAlt="Grabado del ciclo de vida del grillo: huevo, ninfa sin alas y adulto con alas."
              pie="Huevo, ninfa y adulto."
            >
              <ol className="flex flex-col gap-4">
                {CRECIMIENTO.map((t, i) => (
                  <li key={t} className="grid grid-cols-[28px_1fr] gap-2">
                    <span className="t-eyebrow pt-[5px] text-primary">0{i + 1}</span>
                    <span className="t-body text-foreground/85">{t}</span>
                  </li>
                ))}
              </ol>
              <Estado
                tipo="pendiente"
                compacto
                titulo="¿Cuántos días tardan en crecer?"
                className="mt-8"
              >
                Dato aún no disponible. Es parte de lo que se está midiendo en
                los ensayos de cría.
              </Estado>
            </TextoConLamina>
          ),
        },
        {
          id: "importancia",
          titulo: "Importancia y captura",
          contenido: (
            <TextoConLamina
              titulo="¿Por qué son importantes?"
              lamina="/ilustraciones/donde-buscar.webp"
              laminaAlt="Grabado de hojarasca, leña vieja y piedras, donde se esconden los grillos."
              pie="Hojarasca, leña y piedras: donde se esconden."
            >
              <ul className="flex flex-col gap-3">
                {IMPORTANCIA.map((t, i) => (
                  <li key={t} className="t-body text-foreground/85">
                    {t}
                    {i === IMPORTANCIA.length - 1 && (
                      <span className="ml-1 inline-flex">
                        <InfoTip termino="materiaSeca" />
                        <InfoTip termino="analisisBromatologico" />
                      </span>
                    )}
                  </li>
                ))}
              </ul>
              <h4 className="t-h3 mt-10">Dónde buscarlos y cómo capturarlos</h4>
              <ul className="mt-3 flex flex-col gap-2.5">
                {COMO_CAPTURAR.map((t) => (
                  <li key={t} className="flex gap-3 t-body text-foreground/85">
                    <span aria-hidden className="mt-[11px] size-1 shrink-0 rounded-full bg-primary" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </TextoConLamina>
          ),
        },
      ]}
    />
  );
}

/** Texto a la izquierda y una lamina en caja fija a la derecha. */
function TextoConLamina({
  titulo,
  lamina,
  laminaAlt,
  pie,
  children,
}: {
  titulo: string;
  lamina: string;
  laminaAlt: string;
  pie: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
      <div className="max-w-[65ch] lg:col-span-7">
        <h3 className="t-h2 mb-6">{titulo}</h3>
        {children}
      </div>
      <figure className="lg:col-span-5">
        <div className="relative mx-auto h-56 w-full max-w-[420px] sm:h-64">
          <Image
            src={lamina}
            alt={laminaAlt}
            fill
            sizes="(max-width: 1024px) 90vw, 420px"
            className="lamina object-contain"
          />
        </div>
        <figcaption className="t-caption mt-3 text-center">{pie}</figcaption>
      </figure>
    </div>
  );
}
