"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Info } from "lucide-react";

import { GLOSARIO, type TerminoId } from "@/lib/content/glosario";
import { cn } from "@/lib/utils";

/**
 * Boton pequeno de informacion junto a un termino tecnico.
 *
 * Se abre con un toque (en celular no hay "pasar el raton por encima") y se
 * cierra tocando fuera o con Escape. Asi el termino cientifico se queda en la
 * pantalla, pero quien no lo conoce puede entenderlo sin salir de ella.
 */
export function InfoTip({
  termino,
  className,
}: {
  termino: TerminoId;
  className?: string;
}) {
  const { titulo, explicacion } = GLOSARIO[termino];
  const [abierto, setAbierto] = useState(false);
  const caja = useRef<HTMLSpanElement>(null);
  const id = useId();

  useEffect(() => {
    if (!abierto) return;
    const fuera = (e: PointerEvent) => {
      if (caja.current && !caja.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    };
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAbierto(false);
    };
    document.addEventListener("pointerdown", fuera);
    document.addEventListener("keydown", tecla);
    return () => {
      document.removeEventListener("pointerdown", fuera);
      document.removeEventListener("keydown", tecla);
    };
  }, [abierto]);

  return (
    <span ref={caja} className={cn("relative inline-flex align-middle", className)}>
      <button
        type="button"
        aria-label={`Qué significa ${titulo.toLowerCase()}`}
        aria-expanded={abierto}
        aria-controls={id}
        onClick={() => setAbierto((v) => !v)}
        className="inline-flex size-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <Info className="size-4" />
      </button>
      {abierto && (
        <span
          id={id}
          role="tooltip"
          className="absolute left-1/2 top-full z-50 mt-1.5 w-[260px] -translate-x-1/2 rounded-lg border bg-popover p-3 text-left text-[14px] font-normal leading-snug text-popover-foreground shadow-md"
        >
          <span className="block font-semibold">{titulo}</span>
          <span className="mt-1 block text-foreground/80">{explicacion}</span>
        </span>
      )}
    </span>
  );
}
