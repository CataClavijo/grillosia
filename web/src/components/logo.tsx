import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * Marca de GrillosIA: el simbolo (grillo sobre la hoja, con la curva de
 * datos) y el nombre, con el lema debajo.
 *
 * El simbolo es un vector (`/logo.svg`) trazado del dibujo original con el
 * trazo un poco mas grueso, para que se vea nitido y solido desde 24 px.
 *
 *  - `completo`: simbolo + nombre + lema. Cabecera de escritorio y pie.
 *  - `compacto`: simbolo + nombre. Cabecera al bajar, celular y el camino
 *    guiado, donde el lema ya no se lee y solo ocupa sitio.
 *  - `simbolo`: solo el simbolo, para espacios minimos.
 *
 * El lema se alinea con el inicio del nombre, no con el simbolo.
 */
export function Logo({
  variante = "completo",
  className,
  prioridad = false,
}: {
  variante?: "completo" | "compacto" | "simbolo";
  className?: string;
  prioridad?: boolean;
}) {
  // Dos versiones del simbolo: en oscuro el trazo cafe del grillo se volvia
  // invisible, asi que ahi va en tinta clara y el verde un poco mas luminoso.
  const clase = cn(
    "h-auto shrink-0 transition-[width] duration-[var(--dur-media)] ease-[var(--ease-natural)]",
    variante === "completo" ? "w-10" : "w-8",
  );
  const simbolo = (
    <>
      <Image
        src="/logo.svg"
        alt=""
        width={40}
        height={42}
        priority={prioridad}
        aria-hidden
        className={cn(clase, "dark:hidden")}
      />
      <Image
        src="/logo-oscuro.svg"
        alt=""
        width={40}
        height={42}
        aria-hidden
        className={cn(clase, "hidden dark:block")}
      />
    </>
  );

  if (variante === "simbolo") {
    return (
      <span className={cn("inline-flex", className)}>
        {simbolo}
        <span className="sr-only">GrillosIA</span>
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      {simbolo}
      <span className="flex flex-col">
        <span
          className={cn(
            "font-display font-semibold leading-none tracking-[0.005em] text-foreground",
            variante === "completo" ? "text-[26px]" : "text-[23px]",
          )}
        >
          Grillos<span className="text-primary">IA</span>
        </span>
        {variante === "completo" && (
          <span className="mt-1 text-[11.5px] font-medium leading-none tracking-[0.01em] text-subtle">
            Inteligencia natural para decisiones reales
          </span>
        )}
      </span>
    </span>
  );
}
