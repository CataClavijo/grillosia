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
 *
 * La ventanita se alinea sola: centrada bajo el icono, o pegada a la
 * izquierda o a la derecha si el icono esta cerca del borde, para que en un
 * celular nunca se salga de la pantalla.
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
  const [lado, setLado] = useState<"centro" | "izquierda" | "derecha">("centro");
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

  const alternar = () => {
    const r = caja.current?.getBoundingClientRect();
    if (r) {
      const margen = 150;
      if (r.left < margen) setLado("izquierda");
      else if (window.innerWidth - r.right < margen) setLado("derecha");
      else setLado("centro");
    }
    setAbierto((v) => !v);
  };

  return (
    <span ref={caja} className={cn("relative inline-flex align-middle", className)}>
      <button
        type="button"
        aria-label={`Qué significa ${titulo.toLowerCase()}`}
        aria-expanded={abierto}
        aria-controls={id}
        onClick={alternar}
        className={cn(
          "inline-flex size-6 items-center justify-center rounded-full transition-colors duration-150",
          abierto
            ? "bg-surface-2 text-foreground"
            : "text-faint hover:bg-surface-2 hover:text-foreground",
        )}
      >
        <Info className="size-[15px]" strokeWidth={1.75} />
      </button>
      {abierto && (
        <span
          id={id}
          role="tooltip"
          className={cn(
            "animate-in fade-in-0 zoom-in-[0.98] absolute top-full z-50 mt-2 w-[min(280px,calc(100vw-40px))] rounded-lg bg-popover p-3.5 text-left font-sans text-[14px] font-normal normal-case leading-snug tracking-normal text-popover-foreground ring-1 ring-border shadow-[0_1px_2px_rgb(0_0_0/0.04),0_8px_24px_rgb(0_0_0/0.06)] duration-150",
            lado === "centro" && "left-1/2 -translate-x-1/2",
            lado === "izquierda" && "-left-1",
            lado === "derecha" && "-right-1",
          )}
        >
          <span className="block font-semibold text-foreground">{titulo}</span>
          <span className="mt-1 block text-subtle">{explicacion}</span>
        </span>
      )}
    </span>
  );
}
