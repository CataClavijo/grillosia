"use client";

import { useEffect, useRef } from "react";

/**
 * El modelo trabajando.
 *
 * Es el momento central de la aplicacion: el productor contesto cuatro
 * preguntas y aqui el modelo evalua sus condiciones contra las tres comidas.
 * Decir "calculando" en texto plano desperdicia el unico instante en que se
 * puede mostrar que hay un modelo detras y no una tabla fija.
 *
 * Lo que se dibuja no es adorno: son las seis variables de entrada entrando a
 * los arboles del bosque y saliendo como tres resultados. La animacion
 * cuenta lo que de verdad esta pasando.
 */
export function Analizando({ etiqueta = "Evaluando las tres comidas" }) {
  const lienzo = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = lienzo.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reducido = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const ancho = 300;
    const alto = 120;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = ancho * dpr;
    canvas.height = alto * dpr;
    ctx.scale(dpr, dpr);

    const VERDE = "47, 93, 60";
    const OLIVA = "110, 148, 64";

    // Seis entradas a la izquierda, tres salidas a la derecha.
    const entradas = Array.from({ length: 6 }, (_, i) => ({
      y: 16 + i * 17.5,
    }));
    const salidas = Array.from({ length: 3 }, (_, i) => ({
      y: 30 + i * 30,
    }));

    /** Cada particula recorre una entrada hasta una salida. */
    const particulas = Array.from({ length: 14 }, (_, i) => ({
      e: i % 6,
      s: i % 3,
      t: i / 14,
      v: 0.006 + (i % 4) * 0.0018,
    }));

    let cuadro = 0;
    let cancelado = false;
    let reloj = 0;

    const dibujar = () => {
      if (cancelado) return;
      reloj += 0.016;
      ctx.clearRect(0, 0, ancho, alto);

      const xe = 26;
      const xc = ancho / 2;
      const xs = ancho - 34;

      // Trazos de union, tenues
      ctx.strokeStyle = `rgba(${VERDE}, 0.13)`;
      ctx.lineWidth = 1;
      for (const e of entradas) {
        for (const s of salidas) {
          ctx.beginPath();
          ctx.moveTo(xe, e.y);
          ctx.quadraticCurveTo(xc, (e.y + s.y) / 2, xs, s.y);
          ctx.stroke();
        }
      }

      // Entradas: las seis variables
      for (const e of entradas) {
        ctx.beginPath();
        ctx.arc(xe, e.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${VERDE}, 0.5)`;
        ctx.fill();
      }

      // Particulas viajando
      if (!reducido) {
        for (const p of particulas) {
          p.t += p.v;
          if (p.t > 1) p.t -= 1;
          const e = entradas[p.e];
          const s = salidas[p.s];
          const t = p.t;
          const mt = 1 - t;
          const x = mt * mt * xe + 2 * mt * t * xc + t * t * xs;
          const y =
            mt * mt * e.y + 2 * mt * t * ((e.y + s.y) / 2) + t * t * s.y;
          const alfa = Math.sin(t * Math.PI) * 0.85;
          ctx.beginPath();
          ctx.arc(x, y, 2.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${OLIVA}, ${alfa.toFixed(3)})`;
          ctx.fill();
        }
      }

      // Salidas: las tres comidas, latiendo por turnos
      salidas.forEach((s, i) => {
        const pulso = reducido
          ? 0.5
          : 0.35 + Math.abs(Math.sin(reloj * 1.4 - i * 0.7)) * 0.65;
        ctx.beginPath();
        ctx.arc(xs, s.y, 5.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${VERDE}, ${(pulso * 0.28).toFixed(3)})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(${VERDE}, ${(0.35 + pulso * 0.5).toFixed(3)})`;
        ctx.lineWidth = 1.6;
        ctx.stroke();
      });

      cuadro = requestAnimationFrame(dibujar);
    };
    cuadro = requestAnimationFrame(dibujar);

    return () => {
      cancelado = true;
      cancelAnimationFrame(cuadro);
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-2 py-6">
      <canvas
        ref={lienzo}
        aria-hidden
        style={{ width: 300, height: 120, maxWidth: "100%" }}
      />
      <p className="rotulo text-muted-foreground" aria-live="polite">
        {etiqueta}
      </p>
    </div>
  );
}
