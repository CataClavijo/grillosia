import Image from "next/image";
import { Check, X } from "lucide-react";

import { EncabezadoSeccion } from "@/components/ds/encabezado-seccion";
import { AL_RECOGERLOS, FOTOS_SITIOS, METODOS_RECOLECCION } from "@/lib/content/catalog";
import { cn } from "@/lib/utils";

/**
 * ¿Donde encontrarlos?
 *
 * Primero los sitios reales donde el proyecto los busco (fotos de campo),
 * despues como se sacaron vivos: el metodo que funciono con su dibujo, y en
 * una linea lo que no funciono, porque las trampas son lo primero que a
 * cualquiera se le ocurre.
 */
export function DondeEncontrarlos() {
  const { tradicionales, ajustado } = METODOS_RECOLECCION;
  const noFunciono = tradicionales.metodos
    .map((m, i) => (i === 0 ? m : m.toLowerCase()))
    .join(", ")
    .replace(/, ([^,]+)$/, " y $1");

  return (
    <section aria-labelledby="donde-encontrarlos">
      <EncabezadoSeccion
        rotulo="En el Piedemonte Llanero"
        titulo={<span id="donde-encontrarlos">¿Dónde encontrarlos?</span>}
        entrada="El proyecto los buscó en Granada y Cubarral, en el Meta: bosque, cacaotales y plataneras, siempre con hojarasca en el suelo."
      />

      {/* En el celular la primera foto va a todo el ancho y las otras dos
          debajo, una al lado de la otra; en pantalla grande, las tres en fila. */}
      <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        {FOTOS_SITIOS.map((f, i) => (
          <li key={f.src} className={cn(i === 0 && "col-span-2 sm:col-span-1")}>
            <figure>
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                <Image
                  src={f.src}
                  alt={f.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="mt-2 text-[13px] text-subtle">{f.pie}</figcaption>
            </figure>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[12px] text-subtle">Fotos de los sitios de muestreo del proyecto.</p>

      <h3 className="mt-14 font-display text-[1.75rem] font-semibold leading-tight">Cómo sacarlos vivos</h3>
      <div className="mt-5 grid gap-5 lg:grid-cols-12 lg:gap-8">
        <article className="rounded-lg border border-vegetal/35 bg-surface p-5 lg:col-span-7 lg:p-6">
          <p className="inline-flex items-center gap-2 rounded-full bg-vegetal px-3 py-1 text-[13px] font-semibold text-background">
            <Check className="size-3.5" strokeWidth={3} aria-hidden />
            {ajustado.veredicto}
          </p>
          <h4 className="mt-3 text-[17px] font-semibold">
            {ajustado.metodo}, {ajustado.profundidad.toLowerCase()} de profundidad
          </h4>
          {/* El dibujo trae su propio fondo claro: va en un papel del mismo
              color para que no se vea el borde, tambien en modo oscuro. */}
          <div className="mt-4 overflow-hidden rounded-md bg-[#f6f9f6]">
            <Image
              src="/ilustraciones/excavacion-superficial.webp"
              alt="Corte del suelo: un grillo en su hueco a poca profundidad y una pala de jardín que excava de lado. Una marca indica máximo 30 cm."
              width={735}
              height={215}
              sizes="(max-width: 1024px) 100vw, 640px"
              className="h-auto w-full"
            />
          </div>
          <p className="t-small mt-4 text-foreground/85">{ajustado.texto}</p>
        </article>

        <div className="flex flex-col gap-5 lg:col-span-5">
          <article className="rounded-lg border border-border bg-surface p-5 lg:p-6">
            <p className="inline-flex items-center gap-2 rounded-full bg-destructive/10 px-3 py-1 text-[13px] font-semibold text-destructive">
              <X className="size-3.5" strokeWidth={3} aria-hidden />
              {tradicionales.veredicto}
            </p>
            <h4 className="mt-3 text-[17px] font-semibold">{noFunciono}</h4>
            <p className="t-small mt-2 text-foreground/85">{tradicionales.texto}</p>
          </article>
          <p className="t-small text-subtle">
            <span className="font-semibold text-foreground">Al recogerlos: </span>
            {AL_RECOGERLOS.join(" ")}
          </p>
        </div>
      </div>
    </section>
  );
}
