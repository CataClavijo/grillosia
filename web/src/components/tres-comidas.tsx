import Image from "next/image";

import { LaminaNormalizada } from "@/components/lamina-normalizada";
import { DIETS, DIET_BASE, HYDRATION_NOTE } from "@/lib/animals";
import { cn } from "@/lib/utils";

/**
 * Las tres comidas en estudio, con su grabado.
 *
 * Lo que cambia entre ellas es el 50 % principal; la base (harina de maiz y
 * avena molida) es la misma y se dice una sola vez, en una linea. Las
 * descripciones son las mismas que usa el asistente, para que la pagina y el
 * chat no se contradigan.
 *
 * Sin tarjetas: tres columnas separadas por espacio, con los grabados en
 * cajas de la misma altura y la misma area, para que pesen igual.
 */
const DIBUJO: Record<string, string> = {
  D1: "/ilustraciones/ing-bore.webp",
  D2: "/ilustraciones/ing-boton-oro.webp",
  D3: "/ilustraciones/ing-salvado.webp",
};

const QUE_ES: Record<string, string> = {
  D1: "Planta de hojas muy grandes que se cultiva como forraje. Se seca y se muele.",
  D2: "Arbusto de flores amarillas que también se usa como forraje. Se seca y se muele.",
  D3: "La cascarilla que queda del grano de trigo al sacar la harina.",
};

const BASE_DIBUJO: Record<string, string> = {
  "Harina de maíz": "/ilustraciones/ing-maiz.webp",
  "Avena molida": "/ilustraciones/ing-avena.webp",
};

/** "30 % de harina de maíz + 20 % de avena molida" */
const BASE_TEXTO = DIET_BASE.base
  .map((b) => `${b.pct} % de ${b.name.toLowerCase()}`)
  .join(" + ");

export function TresComidas({
  compacta = false,
  className,
}: {
  /** Lista corta para una columna lateral. */
  compacta?: boolean;
  className?: string;
}) {
  if (compacta) {
    return (
      <section className={className} aria-labelledby="tres-comidas-compacta">
        <h2 id="tres-comidas-compacta" className="t-eyebrow text-subtle">
          Comidas que se comparan
        </h2>
        <ul className="mt-3 flex flex-col gap-2.5">
          {DIETS.map((d) => (
            <li key={d.id} className="flex items-center gap-3">
              <Image
                src={DIBUJO[d.id]}
                alt=""
                width={80}
                height={80}
                aria-hidden
                className="lamina size-9 shrink-0 object-contain"
              />
              <span className="text-[14.5px] leading-tight">
                <span className="t-eyebrow mr-1.5 text-faint">{d.id}</span>
                {d.main}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[13px] leading-snug text-subtle">
          Cada una: {DIET_BASE.mainPct} % del ingrediente principal + {BASE_TEXTO}.
        </p>
      </section>
    );
  }

  return (
    <section className={className} aria-labelledby="tres-comidas">
      <p className="t-eyebrow text-subtle">Qué se está comparando</p>
      <h2 id="tres-comidas" className="t-h2 mt-3">
        Las tres comidas en estudio
      </h2>
      <p className="t-body mt-3 text-subtle">
        Solo cambia el ingrediente principal, que es el {DIET_BASE.mainPct} % de
        la comida. El resto es igual en las tres: {BASE_TEXTO}.
      </p>

      {/* En celular el grabado va a la izquierda del texto: apiladas, las
          tres comidas ocupaban tres pantallas. */}
      <ul className="mt-10 grid gap-x-10 gap-y-8 [--escala:0.5] sm:grid-cols-3 sm:gap-y-10 sm:[--escala:1]">
        {DIETS.map((d) => (
          <li
            key={d.id}
            className="grid grid-cols-[96px_1fr] items-center gap-4 sm:flex sm:flex-col sm:items-stretch sm:gap-0"
          >
            <LaminaNormalizada src={DIBUJO[d.id]} area={17000} alto={150} />
            <div>
              <p className="t-eyebrow text-primary sm:mt-5">{d.id}</p>
              <h3 className="t-h3 mt-1.5">{d.main}</h3>
              <p className="t-small mt-1 text-subtle">{QUE_ES[d.id]}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-10 flex flex-col gap-4 rounded-lg bg-surface-2 p-5 sm:flex-row sm:items-center sm:gap-8">
        <p className="t-eyebrow shrink-0 text-subtle">Base común</p>
        <ul className="flex flex-wrap gap-x-8 gap-y-3">
          {DIET_BASE.base.map((b) => (
            <li key={b.name} className="flex items-center gap-3">
              <Image
                src={BASE_DIBUJO[b.name]}
                alt=""
                width={96}
                height={96}
                aria-hidden
                className="lamina size-11 object-contain"
              />
              <span className="text-[15px]">
                <span className="t-cifra text-[1.35rem]">{b.pct}</span>
                <span className="t-unidad">%</span>
                <span className="ml-2">{b.name}</span>
              </span>
            </li>
          ))}
        </ul>
        <p className={cn("text-[13.5px] leading-snug text-subtle sm:ml-auto sm:max-w-[30ch]")}>
          {HYDRATION_NOTE}
        </p>
      </div>
    </section>
  );
}
