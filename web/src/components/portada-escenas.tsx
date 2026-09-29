"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";

import type { EscenaPortada } from "@/lib/content/landing";
import { cn } from "@/lib/utils";

const DURACION = 6500;

/**
 * Carrusel de la entrada: escenas que se cruzan con un fundido lento
 * (1,2 s) y un acercamiento muy leve mientras estan a la vista.
 *
 * - Avanza solo cada 6,5 s; se detiene al pasar el raton, al tocar, al tener
 *   el foco dentro, cuando la pestana no esta visible y con el boton de
 *   pausa (obligatorio para contenido que se mueve solo mas de 5 s).
 * - Con "reducir movimiento" no avanza solo ni hace acercamiento.
 * - El pie de cada escena cambia con ella: la foto dice que es una imagen de
 *   referencia, con su autor y licencia.
 *
 * Todas las escenas estan en el DOM; solo la primera se carga con prioridad.
 */
export function PortadaEscenas({
  escenas,
  className,
}: {
  escenas: EscenaPortada[];
  className?: string;
}) {
  const [actual, setActual] = useState(0);
  const [pausado, setPausado] = useState(false);
  const [detenido, setDetenido] = useState(false); // pausa por hover, foco o toque
  const [quieto, setQuieto] = useState(false); // prefers-reduced-motion
  const [ciclo, setCiclo] = useState(0); // reinicia la barra de avance
  const caja = useRef<HTMLDivElement>(null);
  const total = escenas.length;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setQuieto(mq.matches);
    const cambio = () => setQuieto(mq.matches);
    mq.addEventListener("change", cambio);
    return () => mq.removeEventListener("change", cambio);
  }, []);

  const ir = useCallback(
    (i: number) => {
      setActual(((i % total) + total) % total);
      setCiclo((c) => c + 1);
    },
    [total],
  );

  const corriendo = !pausado && !detenido && !quieto && total > 1;

  // Al reanudar, la escena actual vuelve a contar desde cero: la barra y el
  // temporizador quedan siempre en sincronia.
  useEffect(() => {
    if (corriendo) setCiclo((c) => c + 1);
  }, [corriendo]);

  useEffect(() => {
    if (!corriendo) return;
    const t = window.setTimeout(() => ir(actual + 1), DURACION);
    return () => window.clearTimeout(t);
  }, [corriendo, actual, ciclo, ir]);

  // Pestana oculta: no avanzar a escondidas.
  useEffect(() => {
    const vis = () => setDetenido(document.hidden);
    document.addEventListener("visibilitychange", vis);
    return () => document.removeEventListener("visibilitychange", vis);
  }, []);

  const escena = escenas[actual];

  return (
    <div
      ref={caja}
      className={cn("relative isolate overflow-hidden", className)}
      aria-roledescription="carrusel"
      aria-label="Imágenes de GrillosIA"
      onMouseEnter={() => setDetenido(true)}
      onMouseLeave={() => setDetenido(false)}
      onFocus={() => setDetenido(true)}
      onBlur={(e) => {
        if (!caja.current?.contains(e.relatedTarget as Node)) setDetenido(false);
      }}
      onTouchStart={() => setDetenido(true)}
    >
      {escenas.map((e, i) => {
        const visible = i === actual;
        return (
          <div
            key={e.src}
            aria-hidden={!visible}
            className={cn(
              "absolute inset-0 transition-opacity duration-[1200ms] ease-[var(--ease-natural)]",
              visible ? "opacity-100" : "opacity-0",
            )}
          >
            {/* El papel va en la misma capa que se escala: el multiply de la
                acuarela solo se funde con el fondo de su propio contexto de
                apilamiento, y el transform crea uno nuevo. */}
            <div
              className={cn(
                "absolute inset-0 transition-transform ease-linear",
                visible && !quieto ? "scale-100 duration-[7500ms]" : "scale-[1.06] duration-0",
                e.tipo === "lamina" && "bg-[#f4efe4] px-8 pt-8 pb-24 sm:px-12 sm:pt-12 sm:pb-28 lg:px-16 lg:pt-16 lg:pb-32",
              )}
            >
              <div className="relative h-full w-full">
                <Image
                  src={e.src}
                  alt={e.alt}
                  fill
                  priority={i === 0}
                  sizes="(min-width: 1024px) 56vw, 100vw"
                  className={cn(
                    e.tipo === "foto" ? "object-cover" : "object-contain mix-blend-multiply",
                  )}
                  style={e.posicion ? { objectPosition: e.posicion } : undefined}
                />
              </div>
            </div>
          </div>
        );
      })}

      {/* Velo inferior solo sobre la foto, para que el pie y los controles se
          lean; sobre el papel de las laminas el texto pasa a tinta oscura. */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black/55 via-black/20 to-transparent transition-opacity duration-[1200ms]",
          escena.tipo === "foto" ? "opacity-100" : "opacity-0",
        )}
      />

      <div
        className={cn(
          "absolute inset-x-0 bottom-0 flex flex-col gap-3 p-4 transition-colors duration-700 sm:p-5 lg:p-6",
          escena.tipo === "foto" ? "text-white" : "text-[#2a211a]",
        )}
      >
        <p
          className={cn(
            "max-w-[46ch] text-[12px] leading-snug",
            escena.tipo === "foto" ? "opacity-85 [text-shadow:0_1px_2px_rgb(0_0_0/0.45)]" : "opacity-75",
          )}
        >
          {escena.pie}
          {escena.credito && (
            <>
              {". "}
              {escena.url ? (
                <a
                  href={escena.url}
                  target="_blank"
                  rel="noreferrer"
                  className="underline decoration-current/50 underline-offset-2 hover:opacity-100"
                >
                  {escena.credito}
                </a>
              ) : (
                escena.credito
              )}
            </>
          )}
        </p>

        {total > 1 && (
          <div className="flex items-center gap-3">
            <div className="flex flex-1 gap-1.5">
              {escenas.map((e, i) => (
                <button
                  key={e.src}
                  type="button"
                  onClick={() => ir(i)}
                  aria-label={`Ver imagen ${i + 1} de ${total}`}
                  aria-current={i === actual}
                  className="group flex h-6 flex-1 items-center"
                >
                  <span className="relative h-[2px] w-full overflow-hidden rounded-full bg-current/30">
                    {i < actual && <span className="absolute inset-0 rounded-full bg-current" />}
                    {i === actual && (
                      <span
                        key={`a-${ciclo}`}
                        className="absolute inset-0 rounded-full bg-current animate-in slide-in-from-left ease-linear"
                        style={{
                          animationDuration: quieto ? "0ms" : `${DURACION}ms`,
                          animationPlayState: corriendo || quieto ? "running" : "paused",
                        }}
                      />
                    )}
                  </span>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setPausado((p) => !p)}
              aria-label={pausado ? "Reanudar las imágenes" : "Pausar las imágenes"}
              className="flex size-8 shrink-0 items-center justify-center rounded-full ring-1 ring-current/35 transition-colors hover:bg-current/10"
            >
              {pausado ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
