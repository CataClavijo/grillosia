import { Bird, Fish } from "lucide-react";

import type { CategoriaId } from "@/lib/animals";

/**
 * Icono lineal de cada categoria de animal, con el mismo grosor y la misma
 * caja de 24 x 24 que los iconos de lucide. El cerdo se dibuja aqui porque
 * lucide no lo tiene: silueta de perfil, oreja, jeta y cola enroscada.
 */
function Cerdo({ className, strokeWidth = 1.5 }: { className?: string; strokeWidth?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M4 12.5C4 9.2 7.2 7 11.5 7c2.6 0 4.8.8 6 2.1" />
      <path d="M17.5 9.1c.9.6 1.5 1.4 1.8 2.3h1.3c.5 0 .9.4.9.9v1.4c0 .5-.4.9-.9.9h-1.3c-.5 1.3-1.5 2.3-2.8 2.9V20h-2.2v-1.8h-4.4V20H7.7v-2.4C5.4 16.6 4 14.8 4 12.5" />
      <path d="M15.2 7.6 16.4 5l1.1 3.4" />
      <path d="M20.5 12.3v1.4" />
      <circle cx="17.2" cy="11" r=".6" fill="currentColor" stroke="none" />
      <path d="M4 12c-1.3.2-1.9-.7-1.5-1.3.5-.6 1.4-.2 1.1.6" />
    </svg>
  );
}

export function IconoCategoria({
  categoria,
  className,
  strokeWidth = 1.5,
}: {
  categoria: CategoriaId;
  className?: string;
  strokeWidth?: number;
}) {
  if (categoria === "peces") return <Fish className={className} strokeWidth={strokeWidth} aria-hidden />;
  if (categoria === "aves") return <Bird className={className} strokeWidth={strokeWidth} aria-hidden />;
  return <Cerdo className={className} strokeWidth={strokeWidth} />;
}
