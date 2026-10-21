import Image from "next/image";
import { Check, CupSoda, Hand, Lightbulb, Shovel, X, type LucideIcon } from "lucide-react";

import { EncabezadoSeccion } from "@/components/ds/encabezado-seccion";
import {
  AL_RECOGERLOS,
  METODOS_RECOLECCION,
  MUNICIPIOS_MUESTREO,
} from "@/lib/content/catalog";
import { cn } from "@/lib/utils";

const ICONO_METODO: Record<string, LucideIcon> = {
  "Trampas de caída": CupSoda,
  "Trampas de luz": Lightbulb,
  "Búsqueda manual": Hand,
};

/**
 * ¿Donde encontrarlos?
 *
 * Dos partes: el ambiente (los sitios de muestreo del proyecto en Granada y
 * Cubarral) y como sacarlos vivos, con lo que no funciono al lado de lo que
 * si. Se muestra la comparacion y no solo el metodo bueno porque las trampas
 * son lo primero que a cualquiera se le ocurre, y conviene saber de una vez
 * que casi no dan grillos vivos para la cria.
 */
export function DondeEncontrarlos() {
  const sitios = MUNICIPIOS_MUESTREO.flatMap((m) => m.sitios);
  const conFotos = sitios.every((s) => s.foto);
  const { tradicionales, ajustado } = METODOS_RECOLECCION;

  return (
    <section aria-labelledby="donde-encontrarlos">
      <EncabezadoSeccion
        rotulo="En el Piedemonte Llanero"
        titulo={<span id="donde-encontrarlos">¿Dónde encontrarlos?</span>}
        entrada="El proyecto los recolectó en seis sitios de Granada y Cubarral, en el Meta: zonas con árboles, cultivos y hojarasca en el suelo."
      />

      {conFotos ? (
        <div className="mt-10 flex flex-col gap-8">
          {MUNICIPIOS_MUESTREO.map((m) => (
            <div key={m.nombre}>
              <h3 className="font-display text-[1.5rem] font-semibold">{m.nombre}</h3>
              <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
                {m.sitios.map((s) => (
                  <li key={s.codigo} className="overflow-hidden rounded-lg border border-border bg-surface">
                    <div className="relative aspect-[4/3]">
                      <Image
                        src={s.foto!}
                        alt={`Sitio de muestreo ${s.codigo} en ${m.nombre}.`}
                        fill
                        sizes="(max-width: 640px) 50vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                    <p className="px-3 py-2 text-[13.5px] text-subtle">
                      <span className="font-semibold text-foreground">{s.codigo}</span> · Sitio{" "}
                      {s.codigo.slice(1)}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        // Mientras llegan las fotos de los sitios: la acuarela del ambiente y
        // los codigos de cada sitio, sin cuadros vacios.
        <div className="mt-10 grid gap-6 lg:grid-cols-12 lg:items-center lg:gap-12">
          <figure className="lg:col-span-7">
            <div className="relative aspect-[960/544] w-full overflow-hidden rounded-lg">
              <Image
                src="/acuarelas/donde-buscar.webp"
                alt="Borde de una finca del Piedemonte Llanero: hojarasca de hojas anchas, guaduas y troncos podridos sobre tierra rojiza, con las lomas de la cordillera al fondo."
                fill
                sizes="(max-width: 1024px) 100vw, 700px"
                className="object-cover"
              />
            </div>
            <figcaption className="mt-2 text-[12px] text-subtle">
              Ilustración del ambiente donde se buscan.
            </figcaption>
          </figure>
          <dl className="flex flex-col gap-5 lg:col-span-5">
            {MUNICIPIOS_MUESTREO.map((m) => (
              <div key={m.nombre} className="flex items-baseline justify-between gap-4 border-b border-border pb-4">
                <dt className="font-display text-[1.5rem] font-semibold">{m.nombre}</dt>
                <dd className="flex gap-2">
                  {m.sitios.map((s) => (
                    <span key={s.codigo} className="rounded-sm bg-surface-2 px-2 py-0.5 font-mono text-[13px]">
                      {s.codigo}
                    </span>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      <h3 className="t-h2 mt-16">Cómo sacarlos vivos para la cría</h3>
      <div className="mt-6 grid gap-5 md:grid-cols-2 lg:gap-8">
        <article className="flex flex-col rounded-lg border border-border bg-surface p-5 lg:p-6">
          <Veredicto sirvio={false} texto={tradicionales.veredicto} />
          <h4 className="mt-4 font-display text-[1.6rem] font-semibold leading-tight">{tradicionales.titulo}</h4>
          <ul className="mt-4 grid grid-cols-3 gap-3">
            {tradicionales.metodos.map((m) => {
              const Icono = ICONO_METODO[m] ?? Hand;
              return (
                <li key={m} className="flex flex-col items-center gap-2 text-center">
                  <span className="relative flex size-12 items-center justify-center rounded-full bg-surface-2 text-subtle">
                    <Icono className="size-5" strokeWidth={1.5} aria-hidden />
                    <X
                      className="absolute -top-1 -right-1 size-5 rounded-full bg-destructive p-0.5 text-white"
                      strokeWidth={3}
                      aria-hidden
                    />
                  </span>
                  <span className="text-[13.5px] leading-tight">{m}</span>
                </li>
              );
            })}
          </ul>
          <div className="mt-auto pt-5">
            <p className="t-small border-t border-border pt-4 text-foreground/85">{tradicionales.texto}</p>
          </div>
        </article>

        <article className="flex flex-col rounded-lg border border-vegetal/40 bg-vegetal-soft/40 p-5 lg:p-6">
          <Veredicto sirvio texto={ajustado.veredicto} />
          <h4 className="mt-4 font-display text-[1.6rem] font-semibold leading-tight">{ajustado.titulo}</h4>
          <div className="mt-4 flex items-center gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-vegetal text-white">
              <Shovel className="size-5" strokeWidth={1.75} aria-hidden />
            </span>
            <p>
              <span className="block text-[16px] font-semibold">{ajustado.metodo}</span>
              <span className="t-small text-subtle">{ajustado.profundidad} de profundidad</span>
            </p>
          </div>
          <div className="mt-auto pt-5">
            <p className="t-small border-t border-vegetal/25 pt-4 text-foreground/85">{ajustado.texto}</p>
          </div>
        </article>
      </div>

      <div className="mt-8">
        <p className="t-eyebrow text-subtle">Al recogerlos</p>
        <ul className="mt-3 flex flex-col gap-2">
          {AL_RECOGERLOS.map((t) => (
            <li key={t} className="t-body flex gap-3 text-foreground/85">
              <span aria-hidden className="mt-[0.7em] size-1.5 shrink-0 rounded-full bg-primary" />
              {t}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Veredicto({ sirvio, texto }: { sirvio: boolean; texto: string }) {
  const Icono = sirvio ? Check : X;
  return (
    <p
      className={cn(
        "inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-[13.5px] font-semibold",
        sirvio ? "bg-vegetal text-white" : "bg-destructive/10 text-destructive",
      )}
    >
      <Icono className="size-4" strokeWidth={2.5} aria-hidden />
      {texto}
    </p>
  );
}
