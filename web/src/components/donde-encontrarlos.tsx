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
          {/* Acuarela del corte del suelo. La marca de profundidad va en texto
              encima del dibujo y no dentro de la imagen: asi se lee nitida en
              cualquier pantalla. Va de la superficie (40 % del alto del
              dibujo) al fondo del hueco (60 %). */}
          <div className="relative mt-5 pl-[4.25rem] sm:pl-[5.5rem]">
            <Image
              src="/acuarelas/excavacion.webp"
              alt="Corte del suelo: bajo el pasto y la hojarasca, un grillo en un hueco poco profundo; una pala de jardín sostenida con guante abre la tierra de lado."
              width={1200}
              height={551}
              sizes="(max-width: 1024px) 90vw, 600px"
              className="lamina h-auto w-full"
            />
            <div aria-hidden className="absolute top-[40%] left-0 flex h-[20%] items-center gap-2">
              <span className="text-right font-display text-[15px] font-semibold leading-[1.05] sm:text-[18px]">
                Máx.
                <br />
                30 cm
              </span>
              <span className="h-full w-2 border-y-[1.5px] border-l-[1.5px] border-foreground/70" />
            </div>
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
