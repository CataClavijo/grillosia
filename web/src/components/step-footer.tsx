import Link from "next/link";

import { Button } from "@/components/ui/button";

interface Accion {
  label: string;
  href?: string;
  onClick?: () => void;
}

/**
 * Pie de acción de cada pantalla. Existe para imponer la regla del proyecto:
 * como máximo un botón primario y un enlace secundario por pantalla.
 *
 * El primario ocupa el ancho completo y 68px de alto, pensado para dedos
 * gruesos y presbicia.
 */
export function StepFooter({
  primary,
  secondary,
}: {
  primary: Accion;
  secondary?: Accion;
}) {
  return (
    <div className="mt-12 flex flex-col items-center gap-1">
      {primary.href ? (
        <Button
          asChild
          size="lg"
          className="h-[68px] w-full rounded-2xl text-[18px] font-bold"
        >
          <Link href={primary.href}>{primary.label}</Link>
        </Button>
      ) : (
        <Button
          size="lg"
          onClick={primary.onClick}
          className="h-[68px] w-full rounded-2xl text-[18px] font-bold"
        >
          {primary.label}
        </Button>
      )}

      {secondary &&
        (secondary.href ? (
          <Link
            href={secondary.href}
            className="flex min-h-14 items-center text-[16px] font-semibold text-foreground/85 underline underline-offset-4 hover:text-foreground"
          >
            {secondary.label}
          </Link>
        ) : (
          <button
            type="button"
            onClick={secondary.onClick}
            className="flex min-h-14 items-center text-[16px] font-semibold text-foreground/85 underline underline-offset-4 hover:text-foreground"
          >
            {secondary.label}
          </button>
        ))}
    </div>
  );
}
