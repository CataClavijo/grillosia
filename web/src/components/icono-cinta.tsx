import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";

/**
 * Rollo de cinta, dibujado con el mismo trazo que los iconos de Lucide.
 *
 * Lucide no tiene uno, y el lazo (`Ribbon`) que se usaba antes se lee como el
 * de una campana de salud, no como cinta de pegar.
 */
export const IconoCinta = forwardRef<SVGSVGElement, LucideProps>(function IconoCinta(
  { size = 24, strokeWidth = 2, className, ...props },
  ref,
) {
  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* El rollo y su hueco */}
      <circle cx="9.5" cy="11" r="7" />
      <circle cx="9.5" cy="11" r="2.5" />
      {/* La tira que sale del rollo, con el corte en zigzag */}
      <path d="M9.5 18H20l-1-1.5 1-1.5h-3.6" />
    </svg>
  );
});
