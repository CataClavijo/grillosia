import { EncabezadoSeccion } from "@/components/ds/encabezado-seccion";
import { Revelar } from "@/components/ds/revelar";
import { FichaEjemplar } from "@/components/ficha-ejemplar";
import { GrillosPestanas } from "@/components/grillos-pestanas";
import { LaminaEjemplar } from "@/components/lamina-ejemplar";
import { Paso } from "@/components/paso";
import { CATALOG_INTRO } from "@/lib/content/catalog";
import { TAXONOMIA } from "@/lib/content/taxonomia";

export const metadata = {
  title: "Conozca sus grillos — GrillosIA",
  description:
    "Fotografías y guía para reconocer los grillos del proyecto GrillosIA, familia Gryllidae, del Piedemonte Llanero.",
};

/**
 * Parada 2: conocer los grillos.
 *
 * Arriba, la lamina del ejemplar (una foto grande, recortada e integrada al
 * fondo) junto a su ficha cientifica. Abajo, los temas en pestanas.
 *
 * Regla de rigor: la ficha dice solo lo confirmado (familia Gryllidae). El
 * genero y la especie quedan pendientes hasta que haya una identificacion
 * con fuente (ver `lib/content/taxonomia.ts`).
 */
export default function PaginaGrillos() {
  const ejemplar = TAXONOMIA[0];

  return (
    <Paso n={2} titulo="Conozca sus grillos">
      {/* En celular: titulo, foto y ficha, en ese orden (la foto antes que la
          ficha: primero se ve el animal, luego sus datos). En escritorio: el
          titulo y la ficha a la izquierda, la lamina a la derecha. */}
      <section className="grid items-start gap-10 lg:grid-cols-12 lg:gap-x-14 lg:gap-y-10">
        <div className="lg:col-span-5 lg:col-start-1 lg:row-start-1 lg:pt-2">
          <EncabezadoSeccion
            as="h1"
            tamano="h1"
            rotulo="Los grillos del proyecto"
            titulo="Conozca sus grillos"
            entrada={CATALOG_INTRO}
          />
        </div>
        <LaminaEjemplar className="lg:col-span-7 lg:col-start-6 lg:row-span-2 lg:row-start-1" />
        {ejemplar && (
          <FichaEjemplar
            registro={ejemplar}
            className="lg:col-span-5 lg:col-start-1 lg:row-start-2"
          />
        )}
      </section>

      <Revelar as="section" className="mt-20 lg:mt-28">
        <GrillosPestanas />
      </Revelar>
    </Paso>
  );
}
