"use client";

import { useEffect, useRef } from "react";

/**
 * Visualizador de voz.
 *
 * Dice, sin leer nada, de quien es el turno:
 *
 *   escuchando  aro terracota, hueco, con ondas que ENTRAN hacia el centro.
 *               Se hincha cuando el telefono oye voz.
 *   hablando    disco crema, LLENO, con ondas que SALEN. Late al ritmo del
 *               habla mientras suena el audio.
 *   pensando    aro apagado con un arco que gira.
 *   pausa       aro quieto y tenue: el microfono esta cerrado.
 *
 * Hueco contra lleno y entrar contra salir, y no solo un cambio de color: en
 * la version anterior los dos turnos eran el mismo circulo translucido y el
 * de "hablando" se veia gris, sin que se supiera quien tenia la palabra.
 *
 * NO abre el microfono por su cuenta. Antes pedia `getUserMedia` para leer la
 * amplitud real, y eso traia tres problemas: en Chrome de Android el
 * reconocimiento de voz y un flujo de microfono abierto se estorban (el
 * flujo queda en silencio, o el reconocimiento deja de oir); el microfono
 * seguia tomado mientras el asistente hablaba; y cada vez que el circulo
 * volvia a aparecer se pedia de nuevo. Ahora reacciona a lo que el propio
 * reconocimiento informa: `voz` (hay alguien hablando) y `pulso` (llego una
 * palabra nueva). Es menos fino que la amplitud, pero es verdad: se mueve
 * cuando de verdad se le esta oyendo.
 */

export type ModoOrbe = "escuchando" | "pensando" | "hablando" | "pausa";

const TERRACOTA = "224, 162, 127"; // #E0A27F, el color de accion aclarado para fondo oscuro
const CREMA = "244, 241, 231"; // #F4F1E7
const TENUE = "154, 145, 134"; // #9A9186

export function OrbeVoz({
  modo,
  voz = false,
  pulso = 0,
  sonando = false,
  lado = 232,
  className,
}: {
  modo: ModoOrbe;
  /** El reconocimiento esta oyendo voz ahora mismo. */
  voz?: boolean;
  /** Cambia cada vez que llega una palabra nueva; cada cambio da un empujon. */
  pulso?: number;
  /** El audio de la respuesta ya esta sonando (no solo cargando). */
  sonando?: boolean;
  /** Lado del lienzo, en pixeles. */
  lado?: number;
  className?: string;
}) {
  const lienzo = useRef<HTMLCanvasElement | null>(null);
  // Lo que cambia en cada pintado se lee por referencia: asi el bucle de
  // dibujo se arma una sola vez y no se reinicia con cada palabra.
  const actual = useRef({ modo, voz, sonando });
  const empujon = useRef(0);

  useEffect(() => {
    actual.current = { modo, voz, sonando };
  }, [modo, voz, sonando]);

  useEffect(() => {
    if (pulso) empujon.current = 1;
  }, [pulso]);

  useEffect(() => {
    const canvas = lienzo.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reducido = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = lado * dpr;
    canvas.height = lado * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    let cancelado = false;
    let cuadro = 0;
    /** Nivel suavizado, 0 a 1. Sin suavizado el circulo tiembla. */
    let nivel = 0;
    /** Cuanto de "lleno" esta el disco, 0 a 1: suaviza el cambio de turno. */
    let lleno = 0;
    let t = 0;
    let antes = performance.now();

    const c = lado / 2;
    const base = lado * 0.235;
    const holgura = c - base - 3;

    const dibujar = (ahora: number) => {
      if (cancelado) return;
      const dt = Math.min(0.05, Math.max(0, (ahora - antes) / 1000));
      antes = ahora;
      t += dt;

      const { modo: m, voz: oyendo, sonando: suena } = actual.current;

      // A donde quiere ir el nivel segun el turno.
      let meta: number;
      if (m === "escuchando") {
        meta = oyendo
          ? 0.5 + Math.sin(t * 9) * 0.12
          : 0.14 + Math.sin(t * 1.6) * 0.05;
        meta += empujon.current * 0.45;
      } else if (m === "hablando") {
        // Ritmo de habla, no la amplitud real: leer el audio obligaria a
        // pasarlo por otro canal, y si ese canal falla la respuesta no suena.
        meta = suena
          ? 0.42 + Math.sin(t * 7) * 0.2 + Math.sin(t * 11.3) * 0.1
          : 0.16;
      } else if (m === "pensando") {
        meta = 0.12;
      } else {
        meta = 0.04;
      }
      empujon.current *= 0.9;
      if (reducido) meta = m === "pausa" ? 0.04 : 0.2;
      nivel += (Math.min(1, Math.max(0, meta)) - nivel) * 0.16;
      lleno += ((m === "hablando" ? 1 : 0) - lleno) * 0.14;

      ctx.clearRect(0, 0, lado, lado);

      const color =
        m === "hablando" ? CREMA : m === "pausa" ? TENUE : TERRACOTA;
      const radio = base + nivel * holgura * 0.42;

      // Ondas: salen cuando habla, entran cuando escucha.
      if (!reducido && (m === "hablando" || m === "escuchando")) {
        const ondas = 3;
        for (let i = 0; i < ondas; i++) {
          let f = (t * (m === "hablando" ? 0.42 : 0.3) + i / ondas) % 1;
          if (m === "escuchando") f = 1 - f;
          const r = radio + 4 + f * (holgura * (0.5 + nivel * 0.5));
          // Fuerte cerca del nucleo y se apaga hacia afuera, en los dos
          // sentidos: asi la que entra "aparece" lejos y la que sale se va.
          const alfa = (1 - f) * 0.55 * (0.35 + nivel);
          ctx.beginPath();
          ctx.arc(c, c, Math.min(r, c - 1.5), 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${color}, ${Math.max(0, alfa).toFixed(3)})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }

      // Nucleo: un circulo apenas deformado, para que respire sin parecer
      // gelatina.
      ctx.beginPath();
      for (let a = 0; a <= Math.PI * 2 + 0.01; a += 0.06) {
        const onda = reducido
          ? 0
          : Math.sin(a * 3 + t * 1.7) * 2.4 * nivel +
            Math.sin(a * 5 - t * 2.3) * 1.5 * nivel;
        const rr = radio + onda;
        const x = c + Math.cos(a) * rr;
        const y = c + Math.sin(a) * rr;
        if (a === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      // Hueco al escuchar, lleno al hablar.
      const relleno = 0.08 + nivel * 0.1 + lleno * 0.84;
      ctx.fillStyle = `rgba(${color}, ${Math.min(1, relleno).toFixed(3)})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(${color}, ${(m === "pausa" ? 0.55 : 0.75 + nivel * 0.25).toFixed(3)})`;
      ctx.lineWidth = m === "pausa" ? 1.5 : 2.5;
      ctx.stroke();

      // Mientras piensa: un arco que gira, sin amplitud que mostrar.
      if (m === "pensando") {
        const giro = reducido ? -Math.PI / 2 : t * 2.6;
        ctx.beginPath();
        ctx.arc(c, c, radio + 14, giro, giro + Math.PI * 0.5);
        ctx.strokeStyle = `rgba(${TERRACOTA}, 0.9)`;
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.stroke();
      }

      cuadro = requestAnimationFrame(dibujar);
    };
    cuadro = requestAnimationFrame(dibujar);

    return () => {
      cancelado = true;
      cancelAnimationFrame(cuadro);
    };
  }, [lado]);

  return (
    <canvas
      ref={lienzo}
      aria-hidden
      className={className}
      style={{ width: lado, height: lado }}
    />
  );
}
