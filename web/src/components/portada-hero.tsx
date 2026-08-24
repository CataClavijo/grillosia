import Image from "next/image";
import Link from "next/link";

import { Barra } from "@/components/barra";

/**
 * Portada a sangre, con la barra encima.
 *
 * De Ballerina Farm: la imagen ocupa toda la portada y el titular va sobre
 * ella, con la navegacion superpuesta en transparente. La barra vive DENTRO
 * del heroe justamente para que no haya un escalon de fondo entre las dos:
 * antes la cabecera clara chocaba de golpe contra la banda oscura.
 *
 * La lamina va invertida —grabado blanco sobre negro— por lectura, no por
 * gusto: texto sobre un grabado claro se pelea con el trazo. Blanco sobre
 * oscuro da el contraste mas alto, que es lo que necesita alguien mayor
 * mirando el celular a pleno sol.
 */
export function PortadaHero({ href, cta }: { href: string; cta: string }) {
  return (
    <section className="relative isolate overflow-hidden bg-[#12180F]">
      <Image
        src="/arte/llanura.webp"
        alt=""
        width={1000}
        height={547}
        priority
        aria-hidden
        className="absolute inset-x-0 bottom-0 w-full max-w-none opacity-[0.42] mix-blend-screen invert lg:bottom-auto lg:top-1/3"
      />
      <span
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-[#12180F] via-[#12180F]/80 via-50% to-[#12180F]/25"
      />

      <Barra transparente />

      <div className="relative mx-auto w-full max-w-[1180px] px-5 pb-24 pt-16 sm:pb-32 sm:pt-24 lg:px-8 lg:pb-44 lg:pt-32">
        <div className="max-w-[640px]">
          <p className="rotulo text-[#A8C08F]">
            Piedemonte Llanero · Universidad de los Llanos
          </p>

          <h1 className="mt-4 font-display text-[2.4rem] font-extrabold leading-[1.02] tracking-[-0.035em] text-[#F4F1E7] sm:text-[3.2rem] lg:text-[4rem]">
            Críe grillos y sepa
            <br />
            <span className="font-serif font-normal italic text-[#A8C08F]">
              qué darles de comer.
            </span>
          </h1>

          {/* Subtitulo en monoespaciada: el gesto de Ballerina Farm. */}
          <p className="mt-5 max-w-[46ch] font-mono text-[13px] leading-[1.7] tracking-[0.01em] text-[#D5D2C4] sm:text-[14px]">
            Cuatro pasos, desde armar la caja hasta saber qué comida le conviene
            a su tilapia, pollo o cerdo.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href={href}
              className="flex min-h-14 items-center justify-center rounded-full bg-[#F4F1E7] px-8 text-[17px] font-bold text-[#12180F] transition-opacity hover:opacity-90"
            >
              {cta}
            </Link>
            <Link
              href="/proyecto"
              className="flex min-h-14 items-center justify-center rounded-full border-2 border-white/35 px-8 text-[16px] font-bold text-[#F4F1E7] transition-colors hover:bg-white/10"
            >
              Conozca el proyecto
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
