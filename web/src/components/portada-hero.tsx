import Image from "next/image";
import Link from "next/link";

/**
 * Portada a sangre.
 *
 * La barra NO vive aqui dentro: este contenedor tiene `overflow-hidden` para
 * recortar la lamina, y un elemento pegajoso dentro de un contenedor asi solo
 * se pega mientras ese contenedor esta en pantalla. La barra va como hermana,
 * antes, y el heroe se mete debajo con margen negativo.
 *
 * Ocupa el alto completo de la pantalla, sea cual sea el aparato: `100svh`
 * y no `100vh` porque en un celular la barra del navegador aparece y
 * desaparece, y con `vh` el heroe queda cortado por debajo justo al cargar.
 *
 * La lamina se ancla abajo y se ve entera: es un paisaje, y recortarle el
 * suelo le quita el horizonte, que es lo unico que lo hace legible como
 * paisaje. El contenido se empuja hacia arriba para dejarle ese espacio.
 *
 * Va invertida —grabado blanco sobre negro— por lectura: texto sobre un
 * grabado claro se pelea con el trazo. Blanco sobre oscuro da el contraste
 * mas alto, que es lo que necesita alguien mayor mirando el celular al sol.
 */
export function PortadaHero({ href, cta }: { href: string; cta: string }) {
  return (
    <section className="relative isolate -mt-[68px] flex min-h-[100svh] flex-col overflow-hidden bg-[#12180F] pt-[68px]">
      <Image
        src="/arte/llanura.webp"
        alt=""
        width={1000}
        height={547}
        priority
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 w-full max-w-none opacity-[0.45] mix-blend-screen invert"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#12180F] via-[#12180F]/75 via-40% to-transparent"
      />

      {/* El contenido ocupa el espacio libre y se centra; el padding de abajo
          le reserva sitio a la lamina para que se vea completa. Se mide en
          `svh` y no en pixeles: en un telefono bajo, un valor fijo empuja el
          heroe mas alla de la pantalla y le corta el suelo al paisaje, que es
          justo lo que lo hace legible como paisaje. */}
      <div className="relative flex flex-1 items-center">
        <div className="mx-auto w-full max-w-[1180px] px-5 pb-[29svh] pt-4 sm:pb-[32svh] sm:pt-6 lg:px-8 lg:pb-[30svh]">
          <div className="mx-auto max-w-[680px] text-center">
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
            <p className="mx-auto mt-5 max-w-[46ch] font-mono text-[13px] leading-[1.7] tracking-[0.01em] text-[#D5D2C4] sm:text-[14px]">
              Cuatro pasos, desde armar la caja hasta saber qué comida le
              conviene a su tilapia, pollo o cerdo.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
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
      </div>
    </section>
  );
}
