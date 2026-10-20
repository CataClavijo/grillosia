"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Carrusel de pasos sin dependencias: una fila con desplazamiento nativo y
 * "snap", asi que en celular se desliza con el dedo con la fisica del
 * sistema, y en escritorio se mueve con dos botones pequenos.
 *
 * Muestra 1 elemento en celular, 2 en tableta y 3 en escritorio (lo decide
 * `claseElemento`). Arriba a la derecha dice donde va: "01 — 08".
 *
 * El contenido sigue en el DOM aunque no se vea: se puede leer con lector de
 * pantalla y encontrar con la busqueda del navegador.
 *
 * Con `activo` se puede mover desde afuera (por ejemplo, tocando un numero
 * del mapa de la caja); `onActivo` avisa cuando la persona lo desliza.
 */
export function Carrusel({
  elementos,
  etiqueta,
  claseElemento = "basis-[86%] sm:basis-[calc(50%-10px)] lg:basis-[calc(33.333%-14px)]",
  className,
  activo,
  onActivo,
}: {
  elementos: React.ReactNode[];
  /** Elemento que se quiere mostrar; al cambiar, el carrusel se mueve a el. */
  activo?: number;
  /** Primer elemento visible tras deslizar con el dedo o con los botones. */
  onActivo?: (i: number) => void;
  /** Nombre del carrusel para lectores de pantalla. */
  etiqueta: string;
  claseElemento?: string;
  className?: string;
}) {
  const pista = useRef<HTMLUListElement>(null);
  const [primero, setPrimero] = useState(0);
  const [visibles, setVisibles] = useState(1);
  const total = elementos.length;
  // Mientras el carrusel se mueve por un `activo` de afuera, no se avisa
  // del desplazamiento: si no, al pedir el ultimo paso (que no puede quedar
  // de primero) el aviso lo devolveria al penultimo.
  const moviendoDesdeAfuera = useRef(false);
  const avisar = useRef(onActivo);
  avisar.current = onActivo;
  const ultimoAviso = useRef(-1);

  const medir = useCallback(() => {
    const p = pista.current;
    if (!p || !p.children.length) return;
    const hijo = p.children[0] as HTMLElement;
    const paso = hijo.offsetWidth + parseFloat(getComputedStyle(p).columnGap || "0");
    const i = Math.round(p.scrollLeft / paso);
    setPrimero(i);
    setVisibles(Math.max(1, Math.round(p.clientWidth / paso)));
    if (!moviendoDesdeAfuera.current && i !== ultimoAviso.current) {
      ultimoAviso.current = i;
      avisar.current?.(i);
    }
  }, []);

  useEffect(() => {
    const p = pista.current;
    if (activo === undefined || !p || !p.children[activo]) return;
    const hijo = p.children[activo] as HTMLElement;
    const visible =
      hijo.offsetLeft >= p.scrollLeft - 2 &&
      hijo.offsetLeft + hijo.offsetWidth <= p.scrollLeft + p.clientWidth + 2;
    if (visible) return;
    moviendoDesdeAfuera.current = true;
    const destino = hijo.offsetLeft - (p.children[0] as HTMLElement).offsetLeft;
    // Si el carrusel no esta a la vista, la pagina va a moverse hasta el
    // con su propio desplazamiento suave, y dos desplazamientos suaves a la
    // vez se cortan entre si: entonces se mueve de una vez.
    const r = p.getBoundingClientRect();
    const aLaVista = r.top >= 0 && r.bottom <= window.innerHeight;
    p.scrollTo({ left: destino, behavior: aLaVista ? "smooth" : "instant" });
    // Se vuelve a escuchar al dedo cuando el carrusel llega: con `scrollend`
    // donde existe, y con un plazo largo donde no (un tramo de seis
    // tarjetas en celular tarda mas de medio segundo).
    const soltar = () => {
      moviendoDesdeAfuera.current = false;
      ultimoAviso.current = activo;
      p.removeEventListener("scrollend", soltar);
    };
    p.addEventListener("scrollend", soltar);
    const t = window.setTimeout(soltar, 1600);
    return () => {
      window.clearTimeout(t);
      p.removeEventListener("scrollend", soltar);
    };
  }, [activo]);

  useEffect(() => {
    medir();
    const p = pista.current;
    if (!p) return;
    p.addEventListener("scroll", medir, { passive: true });
    window.addEventListener("resize", medir);
    return () => {
      p.removeEventListener("scroll", medir);
      window.removeEventListener("resize", medir);
    };
  }, [medir]);

  const ir = (dir: 1 | -1) => {
    const p = pista.current;
    if (!p) return;
    const hijo = p.children[0] as HTMLElement;
    const paso = hijo.offsetWidth + parseFloat(getComputedStyle(p).columnGap || "0");
    p.scrollBy({ left: dir * paso * visibles, behavior: "smooth" });
  };

  const ultimoVisible = Math.min(total, primero + visibles);
  const dos = (n: number) => String(n).padStart(2, "0");

  return (
    <section aria-roledescription="carrusel" aria-label={etiqueta} className={className}>
      <div className="mb-5 flex items-center justify-end gap-4">
        <p className="t-eyebrow tabular-nums text-subtle" aria-live="polite">
          {dos(primero + 1)}
          {visibles > 1 && `–${dos(ultimoVisible)}`}
          <span className="px-1.5 text-faint">/</span>
          {dos(total)}
        </p>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => ir(-1)}
            disabled={primero === 0}
            aria-label="Pasos anteriores"
            className="flex size-9 items-center justify-center rounded-md border border-border-strong text-foreground transition-colors hover:bg-surface-2 disabled:border-border disabled:text-disabled-foreground"
          >
            <ArrowLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => ir(1)}
            disabled={ultimoVisible >= total}
            aria-label="Pasos siguientes"
            className="flex size-9 items-center justify-center rounded-md border border-border-strong text-foreground transition-colors hover:bg-surface-2 disabled:border-border disabled:text-disabled-foreground"
          >
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>

      <ul
        ref={pista}
        className="sin-barra -mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-5 pb-2 lg:mx-0 lg:px-0"
      >
        {elementos.map((el, i) => (
          <li
            key={i}
            aria-roledescription="paso"
            aria-label={`${i + 1} de ${total}`}
            className={cn("shrink-0 snap-start", claseElemento)}
          >
            {el}
          </li>
        ))}
      </ul>

      {/* Avance del carrusel: barra fina, no puntos. */}
      <div className="mt-5 h-[2px] w-full overflow-hidden bg-border" aria-hidden>
        <div
          className="h-full bg-foreground/70 transition-[width] duration-[var(--dur-media)] ease-[var(--ease-natural)]"
          style={{ width: `${(ultimoVisible / total) * 100}%` }}
        />
      </div>
    </section>
  );
}
