import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { FotoGrillo } from "@/components/foto-grillo";

/**
 * Entrada de la portada, como en el diseno de referencia: titular en serif a
 * la izquierda, con su frase en cursiva, y una fotografia real de grillo a la
 * derecha.
 *
 * La foto va PEQUENA y dentro de un marco, a proposito: el grillo es el eje
 * del proyecto, pero no debe dominar la pagina. El texto y el espacio en
 * blanco llevan el peso; la foto acompana.
 */
export function PortadaHero() {
  return (
    <section className="border-b">
      <div className="mx-auto grid w-full max-w-[1240px] items-center gap-10 px-5 py-12 lg:grid-cols-[1.3fr_0.7fr] lg:gap-16 lg:px-8 lg:py-20">
        <div>
          <p className="rotulo text-muted-foreground">
            Universidad de los Llanos · Piedemonte Llanero
          </p>
          <h1 className="mt-4 font-display text-[2.6rem] font-normal leading-[1.04] tracking-[-0.01em] sm:text-[3.3rem] lg:text-[3.9rem]">
            Decisiones informadas
            <br />
            <span className="italic text-foreground/85">
              para una nutrición más sostenible
            </span>
          </h1>
          <p className="mt-6 max-w-[46ch] text-[17px] leading-relaxed text-foreground/80">
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
              className="inline-flex min-h-11 items-center gap-2 text-[15.5px] font-medium text-foreground/85 underline decoration-foreground/30 underline-offset-[6px] transition-colors hover:text-foreground"
            >
              Conozca cómo funciona
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>

        {/* Foto real, contenida. En celular aun mas pequena. */}
        <figure className="mx-auto w-full max-w-[280px] lg:max-w-[340px]">
          <FotoGrillo
            src="/grillos/grillo-2.webp"
            width={611}
            height={459}
            alt="Grillo adulto de los que cría el proyecto, visto de lado"
            priority
          />
          <figcaption className="mt-2 text-[12.5px] text-muted-foreground">
            Grillo criado en el proyecto.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
