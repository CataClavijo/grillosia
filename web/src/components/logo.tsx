import Image from "next/image";

/**
 * Marca de GrillosIA: el grillo sobre la hoja.
 *
 * El archivo tiene fondo transparente, así que se ve igual en claro y en
 * oscuro sin necesidad de dos versiones.
 */
export function Logo({
  size = 36,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src="/logo.png"
      alt=""
      width={size}
      height={size}
      priority
      className={className}
      aria-hidden
    />
  );
}
