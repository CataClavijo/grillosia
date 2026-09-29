import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { IconoCategoria } from "@/components/icono-categoria";
import { PortadaEscenas } from "@/components/portada-escenas";
import { CATEGORIAS } from "@/lib/animals";
import { ESCENAS_PORTADA } from "@/lib/content/landing";

/**
 * Entrada de la portada. Gira alrededor de la consulta: es lo que le dice a
 * cada productor que comida conviene para su caso.
 *
 * Composicion:
 *  - Escritorio: panel de texto oscuro a la izquierda y, a la derecha, el
 *    carrusel de escenas sangrando hasta el borde. El texto ya no flota
 *    sobre la foto: se lee siempre, y la imagen se ve entera.
 *  - Celular: las escenas arriba y el texto debajo.
 *
 * El inicio rapido (Peces / Aves / Cerdos) abre la consulta con la categoria
 * ya elegida: un toque menos para quien llega con una pregunta concreta.
 */
export function PortadaHero() {
  return (
    <section
      aria-labelledby="portada-titulo"
      className="relative isolate overflow-hidden bg-[#17110c] text-white"
    >
      <PortadaEscenas
        escenas={ESCENAS_PORTADA}
        className="h-[320px] sm:h-[420px] lg:absolute lg:inset-y-0 lg:right-0 lg:left-[50%] lg:h-auto xl:left-[48%]"
      />

      <div className="mx-auto w-full max-w-[1240px] px-5 pt-9 pb-14 sm:pt-12 sm:pb-16 lg:flex lg:min-h-[min(84vh,740px)] lg:items-center lg:px-8 lg:py-20">
        <div className="lg:w-[46%] lg:pr-10 xl:w-[44%]">
          <p className="t-eyebrow text-white/65 animate-in fade-in-0 slide-in-from-bottom-3 fill-mode-backwards duration-[350ms] ease-[var(--ease-natural)] delay-[120ms]">
            Universidad de los Llanos · Piedemonte Llanero
          </p>
          <h1
            id="portada-titulo"
            className="t-display mt-5 text-balance animate-in fade-in-0 slide-in-from-bottom-3 fill-mode-backwards duration-[350ms] ease-[var(--ease-natural)] delay-[180ms]"
          >
            Decisiones informadas{" "}
            <span className="text-[#efb28e]">para una nutrición más sostenible</span>
          </h1>
          <p className="mt-5 max-w-[44ch] text-[17px] leading-relaxed text-white/80 lg:text-[18px] animate-in fade-in-0 slide-in-from-bottom-3 fill-mode-backwards duration-[350ms] ease-[var(--ease-natural)] delay-[240ms]">
            Díganos qué animal alimenta y cómo es su clima: GrillosIA compara
            las tres comidas para grillos y le muestra cuál se acerca más a lo
            que su animal necesita.
          </p>

          {/* Inicio rapido de la consulta. */}
          <div className="mt-9 animate-in fade-in-0 slide-in-from-bottom-3 fill-mode-backwards duration-[350ms] ease-[var(--ease-natural)] delay-[300ms]">
            <p id="inicio-rapido" className="t-eyebrow text-white/65">
              Empiece su consulta
            </p>
            <ul aria-labelledby="inicio-rapido" className="mt-3 grid grid-cols-3 gap-2.5">
              {CATEGORIAS.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/consulta?categoria=${c.id}`}
                    className="group flex h-full min-h-[92px] flex-col justify-between gap-3 rounded-lg bg-white/[0.07] p-3.5 ring-1 ring-white/15 transition-[background-color,box-shadow,transform] duration-200 ease-[var(--ease-natural)] ring-inset hover:-translate-y-0.5 hover:bg-white/[0.12] hover:ring-white/30 sm:min-h-[104px] sm:p-4"
                  >
                    <IconoCategoria
                      categoria={c.id}
                      className="size-7 text-[#efb28e] transition-transform duration-200 group-hover:scale-105"
                    />
                    <span className="flex items-center justify-between gap-1 text-[16px] font-semibold sm:text-[17px]">
                      {c.name}
                      <ArrowRight className="size-4 shrink-0 text-white/60 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-white" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="#como-funciona"
              className="mt-5 inline-flex min-h-10 items-center gap-1.5 text-[15px] font-medium text-white/75 underline decoration-white/30 underline-offset-4 transition-colors hover:text-white hover:decoration-white/70"
            >
              ¿Primera vez? Así funciona la consulta
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
