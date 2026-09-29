import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { FOTO_PORTADA } from "@/lib/content/landing";

/**
 * Entrada de la portada: una fotografia real a todo el ancho, con el titular
 * encima, en la linea editorial de campo que eligio Catalina.
 *
 * La foto NO es de los grillos del proyecto (su especie aun no esta
 * confirmada): es una foto con licencia libre de un grillo de campo, y el pie
 * lo dice con su nombre, su autor y su licencia. Nunca se presenta como un
 * ejemplar del proyecto.
 *
 * El degradado oscuro va de izquierda a derecha en escritorio y de abajo
 * hacia arriba en celular, para que el texto blanco se lea sobre cualquier
 * parte de la foto.
 */
export function PortadaHero() {
  const f = FOTO_PORTADA;
  return (
    <section className="relative isolate overflow-hidden bg-[#1a130d] text-white">
      {/* En celular la foto va arriba, entera, y el texto debajo sobre fondo
          oscuro: encima de la foto el texto tapaba el grillo. En escritorio
          la foto ocupa todo y el texto va encima, a la izquierda. */}
      <div className="relative h-[280px] sm:h-[360px] lg:absolute lg:inset-0 lg:-z-10 lg:h-auto">
        <Image
          src={f.src}
          alt={f.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: f.posicion }}
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-[#1a130d] via-transparent to-transparent lg:bg-gradient-to-r lg:from-[#140e08]/85 lg:via-[#140e08]/45 lg:to-transparent"
        />
      </div>

      <div className="mx-auto flex w-full max-w-[1240px] flex-col px-5 pt-2 pb-14 lg:min-h-[min(80vh,680px)] lg:justify-center lg:px-8 lg:py-20">
        <p className="rotulo text-white/75">
          Universidad de los Llanos · Piedemonte Llanero
        </p>
        <h1 className="mt-4 max-w-[17ch] font-display text-[2.7rem] leading-[0.95] sm:text-[3.6rem] lg:text-[4.4rem]">
          Decisiones informadas{" "}
          <span className="italic !text-[#F0B08C]">
            para una nutrición más sostenible
          </span>
        </h1>
        <p className="mt-5 max-w-[44ch] text-[17px] leading-relaxed text-white/85 lg:text-[18px]">
          GrillosIA compara tres comidas para grillos y le muestra cómo
          responden según su clima y el animal que usted alimenta.
        </p>
        <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-7">
          <Link
            href="/consulta"
            className="inline-flex min-h-12 items-center gap-2 rounded-md bg-primary px-6 text-[16px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Comenzar consulta
            <ArrowRight className="size-4" />
          </Link>
          <Link
            href="#como-funciona"
            className="inline-flex min-h-12 items-center gap-2 rounded-md border border-white/60 px-5 text-[15.5px] font-medium text-white transition-colors hover:bg-white/10"
          >
            Conozca cómo funciona
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>

      {/* Credito de la foto: obligatorio por su licencia. */}
      <p className="absolute right-3 bottom-3 max-w-[90%] text-right text-[11px] leading-snug text-white/55 lg:right-6 lg:bottom-4">
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
    </section>
  );
}
