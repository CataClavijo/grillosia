import { CualesSirven } from "@/components/cuales-sirven";
import { EncabezadoSeccion } from "@/components/ds/encabezado-seccion";
import { Revelar } from "@/components/ds/revelar";
import { FichaEjemplar } from "@/components/ficha-ejemplar";
import { GrillosPestanas } from "@/components/grillos-pestanas";
import { LaminaAnotada } from "@/components/lamina-anotada";
import { Paso } from "@/components/paso";
import {
  CATALOG_INTRO,
  COMO_RECONOCER,
  FOTO_REFERENCIA_LATERAL,
} from "@/lib/content/catalog";
import { TAXONOMIA } from "@/lib/content/taxonomia";

export const metadata = {
  title: "Conozca sus grillos — GrillosIA",
  description:
    "Guía visual para reconocer los grillos del proyecto GrillosIA, familia Gryllidae, del Piedemonte Llanero.",
};

/**
 * Parada 2: conocer los grillos.
 *
 * Tres tiempos, cada uno con su forma, para que la pagina no se lea como una
 * sucesion de diapositivas iguales:
 *  1. Quien es: titulo y ficha cientifica, alineados por abajo.
 *  2. Como reconocerlo: la lamina anotada sobre la foto real, en una banda
 *     propia. Es lo que mas ayuda en el campo, por eso va a la vista y no
 *     escondida en una pestana.
 *  3. Lo demas se consulta en pestanas: grillo o saltamontes, macho y
 *     hembra, crecimiento, importancia y captura.
 *
 * Regla de rigor: la ficha dice solo lo confirmado (familia Gryllidae). El
 * genero y la especie quedan pendientes hasta que haya una identificacion
 * con fuente (ver `lib/content/taxonomia.ts`).
 */
export default function PaginaGrillos() {
  const ejemplar = TAXONOMIA[0];

  return (
    <Paso n={2} titulo="Conozca sus grillos">
      {/* Titulo y ficha en un solo bloque: la ficha va debajo del titulo como
          una etiqueta de coleccion a todo el ancho, en vez de una columna
          suelta junto a un titulo que quedaba flotando. */}
      <section className="flex flex-col gap-10">
        <Revelar className="max-w-[760px]">
          <EncabezadoSeccion
            as="h1"
            tamano="h1"
            rotulo="Los grillos del proyecto"
            titulo="Conozca sus grillos"
            entrada={CATALOG_INTRO}
          />
        </Revelar>
        {ejemplar && (
          <Revelar retraso={120}>
            <FichaEjemplar registro={ejemplar} />
          </Revelar>
        )}
      </section>

      <Revelar
        as="section"
        className="-mx-5 mt-14 bg-surface-2 px-5 py-12 sm:mx-0 sm:rounded-2xl sm:px-8 lg:mt-20 lg:px-12 lg:py-16"
      >
        <EncabezadoSeccion
          rotulo="Guía de campo"
          titulo="¿Cómo reconocer un grillo?"
          entrada="Cuatro señas que sirven para toda la familia Gryllidae, vistas en una foto de referencia. Toque cada número."
        />
        <LaminaAnotada
          className="mt-10"
          foto={FOTO_REFERENCIA_LATERAL}
          rasgos={COMO_RECONOCER}
        />
      </Revelar>

      {/* A la vista y no en una pestana: es lo que el productor necesita
          saber antes de salir a recolectar. */}
      <Revelar className="mt-20 lg:mt-28">
        <CualesSirven />
      </Revelar>

      <Revelar as="section" className="mt-20 lg:mt-28">
        <GrillosPestanas />
      </Revelar>
    </Paso>
  );
}
