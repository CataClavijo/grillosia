import Image from "next/image";

import { DIETS, DIET_BASE, HYDRATION_NOTE } from "@/lib/animals";
import { cn } from "@/lib/utils";

/**
 * Las tres comidas en estudio, con su dibujo a lapiz.
 *
 * Lo que cambia entre ellas es el 50 % principal; la base (harina de maiz y
 * avena molida) es la misma y se dice una sola vez. Las descripciones son las
 * mismas que usa el asistente, para que la pagina y el chat no se
 * contradigan.
 */
const DIBUJO: Record<string, string> = {
  D1: "/figuras/lapiz/ing-bore.webp",
  D2: "/figuras/lapiz/ing-boton-oro.webp",
  D3: "/figuras/lapiz/ing-salvado.webp",
};

const QUE_ES: Record<string, string> = {
  D1: "Planta de hojas muy grandes que se cultiva como forraje. Se seca y se muele.",
  D2: "Arbusto de flores amarillas que también se usa como forraje. Se seca y se muele.",
  D3: "La cascarilla que queda del grano de trigo al sacar la harina.",
};

const BASE_DIBUJO: Record<string, string> = {
  "Harina de maíz": "/figuras/lapiz/ing-maiz.webp",
  "Avena molida": "/figuras/lapiz/ing-avena.webp",
};

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
      <section className={cn("rounded-xl border bg-card/60 p-5", className)}>
        <h2 className="font-display text-[1.4rem] font-medium">
          Las tres comidas en estudio
        </h2>
        <p className="mt-1 text-[13.5px] leading-snug text-muted-foreground">
          {DIET_BASE.mainPct} % de ingrediente principal +{" "}
          {DIET_BASE.base.map((b) => `${b.pct} % de ${b.name.toLowerCase()}`).join(" + ")}.
        </p>
        <ul className="mt-3 divide-y">
          {DIETS.map((d) => (
            <li key={d.id} className="flex items-center gap-3 py-2.5">
              <Image
                src={DIBUJO[d.id]}
                alt=""
                width={120}
                height={90}
                aria-hidden
                className="lamina h-11 w-14 shrink-0 object-contain"
              />
              <span>
                <span className="block text-[12.5px] font-semibold text-primary">
                  {d.id}
                </span>
                <span className="block text-[15px] font-medium leading-tight">
                  {d.main}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  return (
    <section className={className}>
      <h2 className="font-display text-[1.8rem] font-medium leading-tight">
        Las tres comidas en estudio
      </h2>
      <p className="mt-1.5 text-[15px] leading-relaxed text-foreground/80">
        Las tres llevan la misma base: {DIET_BASE.base[0].pct} % de{" "}
        {DIET_BASE.base[0].name.toLowerCase()} y {DIET_BASE.base[1].pct} % de{" "}
        {DIET_BASE.base[1].name.toLowerCase()}. Lo que cambia es el{" "}
        {DIET_BASE.mainPct} % principal.
      </p>

      <ul className="mt-5 grid gap-3 sm:grid-cols-3">
        {DIETS.map((d) => (
          <li key={d.id} className="flex flex-col rounded-xl border bg-card/60 p-4">
            <span className="w-fit rounded border bg-background px-1.5 text-[12.5px] font-semibold text-primary">
              {d.id}
            </span>
            <Image
              src={DIBUJO[d.id]}
              alt=""
              width={320}
              height={240}
              aria-hidden
              className="lamina mx-auto mt-2 h-28 w-auto object-contain"
            />
            <h3 className="mt-2 font-display text-[1.3rem] font-medium leading-tight">
              {d.main}
            </h3>
            <p className="mt-1 text-[13.5px] leading-snug text-muted-foreground">
              {QUE_ES[d.id]}
            </p>
            <p className="mt-auto pt-3 text-[13px] font-medium text-foreground/80">
              {DIET_BASE.mainPct} % {d.main.toLowerCase()}
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {DIET_BASE.base.map((b) => (
          <div
            key={b.name}
            className="flex items-center gap-3 rounded-xl border border-dashed px-4 py-3"
          >
            <Image
              src={BASE_DIBUJO[b.name]}
              alt=""
              width={160}
              height={120}
              aria-hidden
              className="lamina h-14 w-16 shrink-0 object-contain"
            />
            <span>
              <span className="block font-display text-[1.25rem] font-medium leading-tight">
                {b.pct} % {b.name.toLowerCase()}
              </span>
              <span className="block text-[13px] text-muted-foreground">
                Igual en las tres comidas
              </span>
            </span>
          </div>
        ))}
      </div>

      <p className="mt-3 text-[13.5px] leading-relaxed text-muted-foreground">
        {HYDRATION_NOTE}
      </p>
    </section>
  );
}
