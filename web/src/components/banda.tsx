import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * Banda ilustrada a todo el ancho.
 *
 * Separa secciones y da aire. Va a sangre —se sale de los margenes del
 * contenido— porque una lamina recortada dentro de una tarjeta pierde el
 * caracter de lamina.
 *
 * El degradado solo cubre el borde superior, lo justo para que la imagen no
 * choque de golpe con el texto de arriba. Cubrir toda la banda la lavaba
 * hasta dejarla en un manchon gris.
 */
export function Banda({
  src,
  alto = "h-[150px]",
  className,
}: {
  src: string;
  alto?: string;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none relative -mx-5 overflow-hidden",
        alto,
        className,
      )}
    >
      <Image
        src={src}
        alt=""
        width={1000}
        height={547}
        className="lamina absolute bottom-0 left-1/2 w-[112%] max-w-none -translate-x-1/2"
      />
      <span className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-background to-transparent" />
    </div>
  );
}
