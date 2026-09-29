import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

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
 * Un solo boton principal, "Hacer mi consulta". Debajo, los atajos Peces /
 * Aves / Cerdos como texto (sin tarjetas ni iconos, que se veian de juguete)
 * abren la consulta con la categoria ya elegida.
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

          {/* La accion principal: un solo boton firme. Debajo, sin cajas ni
              iconos, los atajos por categoria como texto, para quien ya sabe
              que animal consulta. */}
          <div className={`mt-9 ${entrada} delay-[360ms]`}>
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
              <Link
                href="/consulta"
                className="inline-flex h-[52px] items-center gap-2.5 rounded-md bg-primary px-7 text-[16.5px] font-semibold text-primary-foreground transition-colors duration-150 hover:bg-primary-hover"
              >
                Hacer mi consulta
                <ArrowRight className="size-[18px]" />
              </Link>
              <Link
                href="#como-funciona"
                className="inline-flex min-h-11 items-center text-[15px] font-medium text-white/80 underline decoration-white/30 underline-offset-[6px] transition-colors hover:text-white hover:decoration-white/70"
              >
                ¿Cómo funciona?
              </Link>
            </div>

            <nav aria-label="Empezar por categoría" className="mt-8 flex flex-wrap items-baseline gap-x-5 gap-y-2 border-t border-white/15 pt-5">
              <span className="t-eyebrow text-white/55">O vaya directo a</span>
              {CATEGORIAS.map((c, i) => (
                <Link
                  key={c.id}
                  href={`/consulta?categoria=${c.id}`}
                  className={`group inline-flex items-center gap-1.5 font-display text-[22px] font-semibold tracking-[0.01em] text-white/90 transition-colors hover:text-[#efb28e] ${entrada}`}
                  style={{ animationDelay: `${460 + i * 70}ms` }}
                >
                  {c.name}
                  <ArrowRight className="size-4 -translate-x-1 opacity-0 transition-[opacity,transform] duration-200 group-hover:translate-x-0 group-hover:opacity-100" />
                </Link>
              ))}
            </nav>
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
