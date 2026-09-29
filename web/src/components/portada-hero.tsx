import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { PortadaFoto } from "@/components/portada-foto";
import { FOTO_PORTADA } from "@/lib/content/landing";

/**
 * Entrada de la portada: una sola fotografia protagonista, a todo el ancho,
 * con el titular encima. Nada mas alrededor: una buena imagen vale mas que
 * cuatro decorativas.
 *
 * Composicion:
 *  - Escritorio: el texto ocupa la columna izquierda (hasta ~46 % del ancho)
 *    y el grillo respira a la derecha. El velo oscuro va de izquierda a
 *    derecha y se apaga antes de llegar al grillo, para no ensuciarlo.
 *  - Celular: la foto va arriba, entera, y el texto debajo sobre fondo
 *    oscuro: encima de la foto el texto tapaba el grillo.
 *
 * La foto NO es de los grillos del proyecto (su especie aun no esta
 * confirmada). El pie lo dice siempre, con autor y licencia.
 */
export function PortadaHero() {
  const f = FOTO_PORTADA;
  return (
    <section
      aria-labelledby="portada-titulo"
      className="relative isolate overflow-hidden bg-[#17110c] text-white"
    >
      <div className="relative h-[300px] overflow-hidden sm:h-[400px] lg:absolute lg:inset-0 lg:-z-10 lg:h-auto">
        <PortadaFoto src={f.src} alt={f.alt} posicion={f.posicion} />
        {/* Celular: fundido hacia el panel de texto. */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-[#17110c] via-[#17110c]/10 to-transparent lg:hidden"
        />
        {/* Escritorio: velo lateral para el texto y un toque abajo para el pie. */}
        <div
          aria-hidden
          className="absolute inset-0 hidden bg-[linear-gradient(90deg,rgb(23_17_12/0.88)_0%,rgb(23_17_12/0.72)_30%,rgb(23_17_12/0.25)_55%,transparent_72%)] lg:block"
        />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 hidden h-40 bg-gradient-to-t from-[#17110c]/80 via-[#17110c]/35 to-transparent lg:block"
        />
      </div>

      <div className="mx-auto flex w-full max-w-[1240px] flex-col px-5 pt-3 pb-16 sm:pb-20 lg:min-h-[min(86vh,760px)] lg:justify-center lg:px-8 lg:py-28">
        <div className="max-w-[560px] xl:max-w-[600px]">
          <p className="t-eyebrow text-white/70 animate-in fade-in-0 slide-in-from-bottom-3 fill-mode-backwards duration-[350ms] ease-[var(--ease-natural)] delay-[150ms]">
            Universidad de los Llanos · Piedemonte Llanero
          </p>
          <h1 id="portada-titulo" className="t-display mt-5 text-balance animate-in fade-in-0 slide-in-from-bottom-3 fill-mode-backwards duration-[350ms] ease-[var(--ease-natural)] delay-[210ms]">
            Decisiones informadas{" "}
            <span className="text-[#efb28e]">para una nutrición más sostenible</span>
          </h1>
          <p className="mt-6 max-w-[44ch] text-[17px] leading-relaxed text-white/80 lg:text-[18px] animate-in fade-in-0 slide-in-from-bottom-3 fill-mode-backwards duration-[350ms] ease-[var(--ease-natural)] delay-[270ms]">
            GrillosIA compara tres comidas para grillos y le muestra cómo
            responden según su clima y el animal que usted alimenta.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center animate-in fade-in-0 slide-in-from-bottom-3 fill-mode-backwards duration-[350ms] ease-[var(--ease-natural)] delay-[330ms]">
            <Link
              href="/consulta"
              className="inline-flex h-[52px] items-center justify-center gap-2 rounded-md bg-primary px-6 text-base font-semibold text-primary-foreground transition-colors duration-150 hover:bg-primary-hover"
            >
              Comenzar consulta
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="#como-funciona"
              className="inline-flex h-[52px] items-center justify-center gap-2 rounded-md px-5 text-base font-medium text-white/90 ring-1 ring-white/35 transition-colors duration-150 ring-inset hover:bg-white/10 hover:text-white"
            >
              Conozca cómo funciona
            </Link>
          </div>
        </div>
      </div>

      {/* Credito de la foto: obligatorio por su licencia, y aclara que es una
          imagen de referencia. */}
      <p className="px-5 pb-5 text-[12px] leading-snug text-white/70 lg:absolute lg:right-8 lg:bottom-5 lg:max-w-[460px] lg:p-0 lg:text-right">
        {f.pie}.{" "}
        <a
          href={f.url}
          target="_blank"
          rel="noreferrer"
          className="underline decoration-white/40 underline-offset-2 hover:text-white"
        >
          {f.credito}
        </a>
      </p>
    </section>
  );
}
