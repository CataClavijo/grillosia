import Image from "next/image";
import Link from "next/link";

/**
 * Portada a sangre.
 *
 * Toma de Ballerina Farm el heroe de imagen a todo lo ancho con el titular
 * encima y un boton solido, y de MAS Agro la claridad del bloque tipografico.
 *
 * La banda va oscura y la lamina invertida —grabado blanco sobre negro— por
 * una razon practica, no de gusto: el texto encima de un grabado claro se
 * pelea con el trazo y deja de leerse. Blanco sobre oscuro da el contraste
 * mas alto que hay, que es lo que necesita alguien mayor mirando el celular
 * a pleno sol. El resto de la pagina sigue en claro.
 */
export function PortadaHero({
  href,
  cta,
}: {
  href: string;
  cta: string;
}) {
  return (
    <section className="relative -mx-5 overflow-hidden bg-[#12180F] px-5 pb-32 pt-10">
      <Image
        src="/arte/llanura.webp"
        alt=""
        width={1000}
        height={547}
        priority
        aria-hidden
        className="absolute inset-x-0 bottom-0 w-full max-w-none opacity-[0.42] mix-blend-screen invert"
      />
      {/* Oscurece la mitad de arriba para que el titular no compita con el
          horizonte de la lamina. */}
      <span
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-[#12180F] via-[#12180F]/85 via-45% to-transparent"
      />

      <div className="relative">
        <p className="rotulo text-[#A8C08F]">Piedemonte Llanero</p>

        <h1 className="mt-3 font-display text-[2.3rem] font-extrabold leading-[1.02] tracking-[-0.035em] text-[#F4F1E7]">
          Críe grillos y sepa
          <br />
          <span className="font-serif font-normal italic text-[#A8C08F]">
            qué darles de comer.
          </span>
        </h1>

        {/* Subtitulo en monoespaciada: el gesto de Ballerina Farm. */}
        <p className="mt-4 max-w-[34ch] font-mono text-[13px] leading-[1.65] tracking-[0.01em] text-[#D5D2C4]">
          Cuatro pasos, desde armar la caja hasta saber qué comida le conviene a
          su tilapia, pollo o cerdo.
        </p>

        <Link
          href={href}
          className="mt-7 flex min-h-14 w-full items-center justify-center rounded-full bg-[#F4F1E7] px-6 text-[17px] font-bold text-[#12180F] transition-opacity hover:opacity-90"
        >
          {cta}
        </Link>
      </div>
    </section>
  );
}
