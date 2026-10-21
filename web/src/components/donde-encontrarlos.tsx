import Image from "next/image";
import { Check, X } from "lucide-react";

import { EncabezadoSeccion } from "@/components/ds/encabezado-seccion";
import {
  AL_RECOGERLOS,
  FOTO_PIEDEMONTE,
  METODOS_RECOLECCION,
  MUNICIPIOS_MUESTREO,
} from "@/lib/content/catalog";

/**
 * ¿Donde encontrarlos?
 *
 * Una foto real del Piedemonte a un lado y, al otro, lo que hay que saber:
 * en que sitios se buscaron y como se sacan vivos. Lo que no funciono va
 * en una linea, al lado de lo que si, porque las trampas son lo primero que
 * a cualquiera se le ocurre.
 *
 * Cuando lleguen las fotos de los seis sitios de muestreo (`foto` en
 * `MUNICIPIOS_MUESTREO`), van en lugar de la foto del paisaje.
 */
export function DondeEncontrarlos() {
  const { tradicionales, ajustado } = METODOS_RECOLECCION;
  return (
    <section aria-labelledby="donde-encontrarlos" className="grid gap-10 lg:grid-cols-12 lg:gap-14">
      <figure className="lg:col-span-5">
        <div className="relative aspect-[3/2] w-full overflow-hidden rounded-lg">
          <Image
            src={FOTO_PIEDEMONTE.src}
            alt={FOTO_PIEDEMONTE.alt}
            fill
            sizes="(max-width: 1024px) 100vw, 480px"
            className="object-cover"
          />
        </div>
        <figcaption className="mt-2 text-[12px] text-subtle">
          {FOTO_PIEDEMONTE.pie}.{" "}
          <a
            href={FOTO_PIEDEMONTE.url}
            target="_blank"
            rel="noreferrer"
            className="underline decoration-border-strong underline-offset-2 hover:text-foreground"
          >
            Foto: {FOTO_PIEDEMONTE.quien}, {FOTO_PIEDEMONTE.licencia}, Wikimedia Commons
          </a>
        </figcaption>
      </figure>

      <div className="lg:col-span-7">
        <EncabezadoSeccion
          rotulo="En el Piedemonte Llanero"
          titulo={<span id="donde-encontrarlos">¿Dónde encontrarlos?</span>}
          entrada="El proyecto los recolectó en seis sitios de Granada y Cubarral, en el Meta: zonas con árboles, cultivos y hojarasca en el suelo."
        />
        <p className="t-small mt-3 text-subtle">
          {MUNICIPIOS_MUESTREO.map((m, i) => (
            <span key={m.nombre}>
              <span className="font-semibold text-foreground">{m.nombre}</span>{" "}
              {m.sitios.map((s) => s.codigo).join(", ")}
              {i < MUNICIPIOS_MUESTREO.length - 1 ? " · " : ""}
            </span>
          ))}
        </p>

        <h3 className="mt-10 font-display text-[1.6rem] font-semibold leading-tight">Cómo sacarlos vivos</h3>
        <ul className="mt-4 flex flex-col divide-y divide-border border-y border-border">
          <li className="grid grid-cols-[28px_1fr] gap-3 py-4">
            <span className="mt-0.5 flex size-6 items-center justify-center rounded-full bg-vegetal text-white">
              <Check className="size-3.5" strokeWidth={3} aria-label="Funcionó" />
            </span>
            <span>
              <span className="block font-semibold">
                {ajustado.metodo}, {ajustado.profundidad.toLowerCase()} de profundidad
              </span>
              <span className="t-small mt-0.5 block text-foreground/80">{ajustado.texto}</span>
            </span>
          </li>
          <li className="grid grid-cols-[28px_1fr] gap-3 py-4">
            <span className="mt-0.5 flex size-6 items-center justify-center rounded-full bg-destructive/15 text-destructive">
              <X className="size-3.5" strokeWidth={3} aria-label="No funcionó" />
            </span>
            <span>
              <span className="block font-semibold">{tradicionales.metodos
                  .map((m, i) => (i === 0 ? m : m.toLowerCase()))
                  .join(", ")
                  .replace(/, ([^,]+)$/, " y $1")}</span>
              <span className="t-small mt-0.5 block text-foreground/80">{tradicionales.texto}</span>
            </span>
          </li>
        </ul>
        <p className="t-small mt-4 text-subtle">
          <span className="font-semibold text-foreground">Al recogerlos: </span>
          {AL_RECOGERLOS.join(" ")}
        </p>
      </div>
    </section>
  );
}
