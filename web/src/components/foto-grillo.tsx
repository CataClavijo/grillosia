import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * Marco uniforme para las fotografias reales de grillos.
 *
 * Las fotos del proyecto se tomaron con fondos de estudio distintos (blanco,
 * gris claro). Dentro de este marco todas se ven iguales: misma proporcion
 * 4:3, mismo borde y el fondo de estudio llenando el marco de borde a borde.
 * Con un margen interno el gris del estudio quedaba como un rectangulo
 * dentro de otro. Las fotos horizontales del proyecto ya son 4:3, asi que
 * `object-cover` no les corta ni patas ni antenas; si se usa una vertical,
 * pasar `contener` para verla entera.
 */
export function FotoGrillo({
  src,
  width,
  height,
  alt,
  priority = false,
  contener = false,
  className,
}: {
  src: string;
  width: number;
  height: number;
  alt: string;
  priority?: boolean;
  /** Foto vertical: se ve entera, con el fondo del marco alrededor. */
  contener?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg border bg-card",
        contener && "p-4",
        className,
      )}
    >
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        sizes="(min-width: 1024px) 340px, 280px"
        className={cn(
          "h-full w-full",
          contener
            ? "object-contain mix-blend-multiply dark:mix-blend-normal"
            : "object-cover",
        )}
      />
    </div>
  );
}
