"use client";

import { useEffect, useRef } from "react";

/**
 * Visualizador de voz.
 *
 * Reacciona a la amplitud real: al microfono mientras escucha, y al audio de
 * la respuesta mientras habla. Esa es la diferencia entre una animacion que
 * decora y una que informa. Cuando el circulo se mueve con la voz, el
 * productor SABE que lo esta oyendo; con una animacion en bucle solo puede
 * suponerlo, y si duda, repite la pregunta.
 *
 * Va en canvas y no en CSS porque son decenas de trazos redibujados en cada
 * cuadro. Si el navegador no da permiso de microfono, o el aparato no puede,
 * cae a un latido suave: se pierde la reaccion, no la funcion.
 */

type Fase = "escuchando" | "pensando" | "hablando";

const VERDE = "168, 192, 143"; // #A8C08F
const CREMA = "244, 241, 231"; // #F4F1E7

export function OrbeVoz({
  fase,
  audio,
  className,
}: {
  fase: Fase;
  /** Elemento que reproduce la respuesta, para leer su amplitud. */
  audio?: HTMLAudioElement | null;
  className?: string;
}) {
  const lienzo = useRef<HTMLCanvasElement | null>(null);
  const faseRef = useRef<Fase>(fase);
  faseRef.current = fase;

  useEffect(() => {
    const canvas = lienzo.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reducido = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const lado = 260;
    canvas.width = lado * dpr;
    canvas.height = lado * dpr;
    ctx.scale(dpr, dpr);

    let cancelado = false;
    let cuadro = 0;
    let flujo: MediaStream | null = null;
    let audioCtx: AudioContext | null = null;
    let analizador: AnalyserNode | null = null;
    let datos: Uint8Array<ArrayBuffer> | null = null;
    /** Nivel suavizado, 0 a 1. Sin suavizado el circulo tiembla. */
    let nivel = 0;
    let t = 0;

    async function escucharMicrofono() {
      try {
        flujo = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (cancelado) {
          flujo.getTracks().forEach((p) => p.stop());
          return;
        }
        const AC =
          window.AudioContext ??
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        audioCtx = new AC();
        const fuente = audioCtx.createMediaStreamSource(flujo);
        analizador = audioCtx.createAnalyser();
        analizador.fftSize = 256;
        fuente.connect(analizador);
        datos = new Uint8Array(new ArrayBuffer(analizador.frequencyBinCount));
      } catch {
        // Sin permiso de microfono se anima igual, solo que sin reaccionar.
        analizador = null;
      }
    }

    void escucharMicrofono();

    const dibujar = () => {
      if (cancelado) return;
      t += 0.016;

      // Amplitud actual
      let crudo = 0;
      if (analizador && datos && faseRef.current === "escuchando") {
        analizador.getByteFrequencyData(datos);
        let suma = 0;
        for (let i = 0; i < datos.length; i++) suma += datos[i];
        crudo = Math.min(1, suma / datos.length / 90);
      } else if (faseRef.current === "hablando") {
        // Mientras habla no se lee el audio: se late con el ritmo del habla,
        // que es suficiente y evita enredarse con el elemento de audio.
        crudo = 0.35 + Math.sin(t * 7) * 0.18 + Math.sin(t * 11.3) * 0.08;
      } else {
        crudo = 0.12;
      }
      if (reducido) crudo = 0.2;
      nivel += (crudo - nivel) * 0.18;

      const c = lado / 2;
      ctx.clearRect(0, 0, lado, lado);

      const color = faseRef.current === "hablando" ? CREMA : VERDE;
      const base = 52;

      // Anillos concentricos que se abren con la voz
      const anillos = 3;
      for (let i = 0; i < anillos; i++) {
        const fase01 = ((t * 0.32 + i / anillos) % 1);
        const r = base + fase01 * (46 + nivel * 58);
        const alfa = (1 - fase01) * 0.42 * (0.35 + nivel);
        ctx.beginPath();
        ctx.arc(c, c, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${color}, ${alfa.toFixed(3)})`;
        ctx.lineWidth = 1.4;
        ctx.stroke();
      }

      // Nucleo: un circulo apenas deformado, para que respire sin parecer gelatina
      const radio = base + nivel * 26;
      ctx.beginPath();
      for (let a = 0; a <= Math.PI * 2 + 0.01; a += 0.06) {
        const onda =
          Math.sin(a * 3 + t * 1.7) * 2.2 * nivel +
          Math.sin(a * 5 - t * 2.3) * 1.4 * nivel;
        const rr = radio + onda;
        const x = c + Math.cos(a) * rr;
        const y = c + Math.sin(a) * rr;
        if (a === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fillStyle = `rgba(${color}, ${(0.1 + nivel * 0.14).toFixed(3)})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(${color}, ${(0.5 + nivel * 0.35).toFixed(3)})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Mientras piensa: un arco que gira, sin amplitud que mostrar
      if (faseRef.current === "pensando") {
        const giro = t * 2.4;
        ctx.beginPath();
        ctx.arc(c, c, base + 30, giro, giro + Math.PI * 0.42);
        ctx.strokeStyle = `rgba(${VERDE}, 0.85)`;
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";
        ctx.stroke();
      }

      cuadro = requestAnimationFrame(dibujar);
    };
    cuadro = requestAnimationFrame(dibujar);

    return () => {
      cancelado = true;
      cancelAnimationFrame(cuadro);
      flujo?.getTracks().forEach((p) => p.stop());
      void audioCtx?.close();
    };
  }, []);

  return (
    <canvas
      ref={lienzo}
      aria-hidden
      className={className}
      style={{ width: 260, height: 260 }}
    />
  );
}
