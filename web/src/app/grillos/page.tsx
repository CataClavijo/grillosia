import Image from "next/image";

import { GrillosPestanas } from "@/components/grillos-pestanas";
import { Paso } from "@/components/paso";
import {
  CATALOG_INTRO,
  CREDITO_FOTOS,
  CRICKET_PHOTOS,
  FAMILIA,
} from "@/lib/content/catalog";

export const metadata = {
  title: "Conozca sus grillos — GrillosIA",
  description:
    "Fotografías y guía para reconocer los grillos del proyecto GrillosIA, familia Gryllidae, del Piedemonte Llanero.",
};

/**
 * Parada 2: conocer los grillos.
 *
 * Estructura del diseño de referencia (galería, pestañas, fichas), con dos
 * correcciones de Cata:
 *  - Las fotos son pequeñas y van en marcos iguales, sobre el mismo fondo:
 *    los originales tienen fondos de estudio casi blancos pero distintos;
 *    un leve aclarado los lleva a blanco y el `multiply` los funde con el
 *    color del marco.
 *  - No hay especies inventadas: la ficha muestra solo el nivel
 *    taxonómico confirmado (ver `lib/content/taxonomia.ts`).
 */
export default function PaginaGrillos() {
  return (
    <Paso n={2} titulo="Conozca sus grillos">
      <section className="grid gap-8 pt-4 lg:grid-cols-[1fr_minmax(0,420px)] lg:items-center lg:gap-14 lg:pt-6">
        <div className="flex flex-col gap-4">
          <h1 className="font-display text-[2.6rem] font-medium leading-[1.02] tracking-[-0.02em] lg:text-[3.6rem]">
            Conozca sus grillos
          </h1>
          <p className="font-display text-[1.35rem] italic leading-snug text-foreground/90 lg:text-[1.5rem]">
            Grillos nativos del Piedemonte Llanero
          </p>
          <p className="max-w-[48ch] text-[16.5px] leading-relaxed text-foreground/80">
            {CATALOG_INTRO}
          </p>
          <p className="w-fit rounded-full border bg-card px-3 py-1 text-[14px] font-semibold text-foreground/80">
            {FAMILIA} · especie por confirmar
          </p>
        </div>

        {/* Galería: marcos iguales, fotos pequeñas, fondo uniforme. */}
        <figure>
          <ul className="grid grid-cols-2 gap-3">
            {CRICKET_PHOTOS.map((photo, i) => (
              <li
                key={photo.id}
                className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg border bg-card"
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  title={photo.note}
                  width={320}
                  height={240}
                  sizes="(max-width: 1024px) 45vw, 230px"
                  priority={i === 0}
                  className="h-full w-full object-contain p-2 mix-blend-multiply brightness-[1.07] dark:mix-blend-normal dark:brightness-100"
                />
              </li>
            ))}
          </ul>
          <figcaption className="mt-2.5 text-[13px] text-muted-foreground">
            {CREDITO_FOTOS}
          </figcaption>
        </figure>
      </section>

      <section className="mt-12 lg:mt-14">
        <GrillosPestanas />
      </section>
    </Paso>
  );
}
