import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { IconoCategoria } from "@/components/icono-categoria";
import { CATEGORIAS } from "@/lib/animals";
import { FOTO_PORTADA } from "@/lib/content/landing";

/**
 * Entrada de la portada. Gira alrededor de la consulta: es lo que le dice a
 * cada productor que comida conviene para su caso.
 *
 * Una sola foto protagonista a todo el ancho, con el texto encima a la
 * izquierda (Catalina descarto la version partida en dos columnas). El
 * movimiento es lento y continuo: un acercamiento de 20 s de ida y vuelta,
 * mas la entrada escalonada del texto. Con "reducir movimiento" la foto se
 * queda quieta.
 *
 * En celular la foto va arriba y el texto debajo, sobre fondo oscuro, para no
 * tapar el grillo.
 *
 * El inicio rapido (Peces / Aves / Cerdos) abre la consulta con la categoria
 * ya elegida.
 */
export function PortadaHero() {
  const f = FOTO_PORTADA;
  const entrada =
    "animate-in fade-in-0 slide-in-from-bottom-3 fill-mode-backwards duration-[450ms] ease-[var(--ease-natural)]";

  return (
    <section
      aria-labelledby="portada-titulo"
      className="relative isolate overflow-hidden bg-[#17110c] text-white"
    >
      <div className="relative h-[300px] overflow-hidden sm:h-[400px] lg:absolute lg:inset-0 lg:-z-10 lg:h-auto">
        <Image
          src={f.src}
          alt={f.alt}
          fill
          priority
          sizes="100vw"
          className="foto-respira object-cover"
          style={{ objectPosition: f.posicion }}
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-[#17110c] via-[#17110c]/10 to-transparent lg:bg-gradient-to-r lg:from-[#17110c]/90 lg:via-[#17110c]/55 lg:to-transparent"
        />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 hidden h-40 bg-gradient-to-t from-[#17110c]/70 to-transparent lg:block"
        />
      </div>

      <div className="mx-auto w-full max-w-[1240px] px-5 pt-2 pb-14 sm:pb-16 lg:flex lg:min-h-[min(86vh,760px)] lg:items-center lg:px-8 lg:py-24">
        <div className="lg:max-w-[560px]">
          <p className={`t-eyebrow text-white/70 ${entrada} delay-[120ms]`}>
            Universidad de los Llanos · Piedemonte Llanero
          </p>
          <h1
            id="portada-titulo"
            className={`t-display mt-5 text-balance ${entrada} delay-[200ms]`}
          >
            Decisiones informadas{" "}
            <span className="text-[#efb28e]">para una nutrición más sostenible</span>
          </h1>
          <p className={`mt-5 max-w-[44ch] text-[17px] leading-relaxed text-white/85 lg:text-[18px] ${entrada} delay-[280ms]`}>
            Díganos qué animal alimenta y cómo es su clima: GrillosIA compara
            las tres comidas para grillos y le muestra cuál se acerca más a lo
            que su animal necesita.
          </p>

          {/* Inicio rapido de la consulta. */}
          <div className={`mt-9 ${entrada} delay-[360ms]`}>
            <p id="inicio-rapido" className="t-eyebrow text-white/70">
              Empiece su consulta
            </p>
            <ul aria-labelledby="inicio-rapido" className="mt-3 grid grid-cols-3 gap-2.5 sm:max-w-[460px]">
              {CATEGORIAS.map((c, i) => (
                <li
                  key={c.id}
                  className={entrada}
                  style={{ animationDelay: `${440 + i * 70}ms` }}
                >
                  <Link
                    href={`/consulta?categoria=${c.id}`}
                    className="group flex h-full min-h-[92px] flex-col justify-between gap-3 rounded-lg bg-[#17110c]/55 p-3.5 ring-1 ring-white/20 backdrop-blur-sm transition-[background-color,box-shadow,transform] duration-200 ease-[var(--ease-natural)] ring-inset hover:-translate-y-0.5 hover:bg-[#17110c]/75 hover:ring-white/40 sm:min-h-[100px] sm:p-4"
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
              className="mt-5 inline-flex min-h-10 items-center gap-1.5 text-[15px] font-medium text-white/80 underline decoration-white/30 underline-offset-4 transition-colors hover:text-white hover:decoration-white/70"
            >
              ¿Primera vez? Así funciona la consulta
            </Link>
          </div>
        </div>
      </div>

      {/* Credito de la foto: obligatorio por su licencia. */}
      <p className="absolute right-3 bottom-3 hidden max-w-[46%] text-right text-[11px] leading-snug text-white/60 lg:right-6 lg:bottom-4 lg:block">
        {f.pie}.{" "}
        <a
          href={f.url}
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-2 hover:text-white"
        >
          {f.credito}
        </a>
      </p>
      <p className="px-5 pb-6 text-[11px] leading-snug text-white/55 lg:hidden">
        Imagen de referencia, familia Gryllidae; no es un ejemplar del
        proyecto.{" "}
        <a href={f.url} target="_blank" rel="noreferrer" className="underline underline-offset-2">
          {f.credito}
        </a>
      </p>
    </section>
  );
}
