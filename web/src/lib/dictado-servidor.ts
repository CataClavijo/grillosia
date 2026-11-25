"use client";

/**
 * Dictado por el servidor, para navegadores que no pueden dictar.
 *
 * Chrome y Safari pasan la voz a texto con su propio servicio. Brave, Firefox
 * y otros no: Brave expone la funcion pero le bloquea el servicio de Google,
 * y siempre falla con "network". Para esos casos el telefono graba la
 * pregunta y la manda a /api/transcribir.
 *
 * Esta clase imita al reconocedor del navegador (start, stop, abort y los
 * mismos eventos) para que `useDictado` no tenga que saber cual de los dos
 * esta usando. Las diferencias que se notan:
 *  - No hay texto en vivo: el texto llega completo cuando la persona calla.
 *  - El fin de la frase lo decide un detector de silencio propio, que mide la
 *    energia del microfono.
 */

type Manejador<T = unknown> = ((e: T) => void) | null;

/** Silencio, despues de haber hablado, que cierra la pregunta. */
const SILENCIO_FIN_MS = 1400;
/** Si en este tiempo no se oye a nadie, se avisa "no se oyo nada". */
const SIN_VOZ_MS = 8000;
/** Una pregunta no dura mas que esto. */
const MAXIMO_MS = 30_000;
/** Cada cuanto se mide el volumen. */
const PASO_MS = 100;

function tipoDeAudio(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  const opciones = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];
  return opciones.find((t) => MediaRecorder.isTypeSupported?.(t));
}

/** El navegador puede grabar audio del microfono. */
export function puedeGrabar(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof MediaRecorder !== "undefined" &&
    !!navigator.mediaDevices?.getUserMedia
  );
}

export class ReconocedorServidor {
  lang = "es-CO";
  continuous = true;
  interimResults = false;
  onspeechstart: (() => void) | null = null;
  onspeechend: (() => void) | null = null;
  onresult: Manejador = null;
  onerror: Manejador = null;
  onend: (() => void) | null = null;

  private flujo: MediaStream | null = null;
  private grabadora: MediaRecorder | null = null;
  private contexto: AudioContext | null = null;
  private reloj: number | null = null;
  private trozos: Blob[] = [];
  private activo = false;
  /** Se corto con abort: no se entrega nada ni se avisa. */
  private descartado = false;

  start() {
    if (this.activo) return;
    this.activo = true;
    this.descartado = false;
    this.trozos = [];
    void this.abrir();
  }

  /** "Ya termine de hablar": se transcribe lo grabado. */
  stop() {
    if (!this.activo) return;
    this.terminarGrabacion();
  }

  /** Se cierra sin transcribir ni avisar. */
  abort() {
    this.descartado = true;
    this.terminarGrabacion();
  }

  private async abrir() {
    let flujo: MediaStream;
    try {
      flujo = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
    } catch (e) {
      const nombre = (e as { name?: string })?.name;
      this.activo = false;
      if (this.descartado) return;
      this.onerror?.({
        error: nombre === "NotAllowedError" || nombre === "SecurityError" ? "not-allowed" : "audio-capture",
      });
      this.onend?.();
      return;
    }
    if (this.descartado || !this.activo) {
      flujo.getTracks().forEach((t) => t.stop());
      return;
    }
    this.flujo = flujo;

    const tipo = tipoDeAudio();
    const grabadora = new MediaRecorder(flujo, tipo ? { mimeType: tipo } : undefined);
    this.grabadora = grabadora;
    grabadora.ondataavailable = (e) => {
      if (e.data.size > 0) this.trozos.push(e.data);
    };
    grabadora.onstop = () => void this.alDetener(grabadora.mimeType || tipo || "audio/webm");
    grabadora.start(250);

    this.vigilarVolumen(flujo);
  }

  /**
   * Detector de voz por energia.
   *
   * Mide el ruido de fondo el primer medio segundo y considera voz lo que
   * pase claramente por encima. Asi funciona igual en una cocina silenciosa
   * que al lado de un ventilador.
   */
  private vigilarVolumen(flujo: MediaStream) {
    const Ctx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const contexto = new Ctx();
    this.contexto = contexto;
    const analizador = contexto.createAnalyser();
    analizador.fftSize = 1024;
    contexto.createMediaStreamSource(flujo).connect(analizador);
    const muestras = new Float32Array(analizador.fftSize);

    const inicio = Date.now();
    let fondo = 0;
    let medidasFondo = 0;
    let hablo = false;
    let ultimaVoz = 0;

    this.reloj = window.setInterval(() => {
      analizador.getFloatTimeDomainData(muestras);
      let suma = 0;
      for (const m of muestras) suma += m * m;
      const nivel = Math.sqrt(suma / muestras.length);
      const ahora = Date.now();

      if (ahora - inicio < 500) {
        fondo += nivel;
        medidasFondo++;
        return;
      }
      const umbral = Math.max(0.015, (fondo / Math.max(medidasFondo, 1)) * 3);

      if (nivel > umbral) {
        ultimaVoz = ahora;
        if (!hablo) {
          hablo = true;
          this.onspeechstart?.();
        }
      }

      if (hablo && ahora - ultimaVoz > SILENCIO_FIN_MS) {
        this.onspeechend?.();
        this.terminarGrabacion();
      } else if (!hablo && ahora - inicio > SIN_VOZ_MS) {
        this.sinVoz = true;
        this.terminarGrabacion();
      } else if (ahora - inicio > MAXIMO_MS) {
        this.terminarGrabacion();
      }
    }, PASO_MS);
  }

  private sinVoz = false;

  private terminarGrabacion() {
    if (this.reloj) window.clearInterval(this.reloj);
    this.reloj = null;
    const g = this.grabadora;
    if (g && g.state !== "inactive") {
      g.stop(); // dispara onstop -> alDetener
    } else {
      this.cerrarMicrofono();
      if (this.activo) {
        this.activo = false;
        if (!this.descartado) this.onend?.();
      }
    }
  }

  private cerrarMicrofono() {
    this.flujo?.getTracks().forEach((t) => t.stop());
    this.flujo = null;
    void this.contexto?.close().catch(() => undefined);
    this.contexto = null;
    this.grabadora = null;
  }

  private async alDetener(tipo: string) {
    this.cerrarMicrofono();
    const sinVoz = this.sinVoz;
    this.sinVoz = false;
    if (this.descartado) {
      this.activo = false;
      return;
    }
    if (sinVoz) {
      this.activo = false;
      this.onerror?.({ error: "no-speech" });
      this.onend?.();
      return;
    }

    const audio = new Blob(this.trozos, { type: tipo.split(";")[0] || "audio/webm" });
    this.trozos = [];
    const extension = audio.type.includes("mp4") ? "m4a" : audio.type.includes("ogg") ? "ogg" : "webm";
    const datos = new FormData();
    datos.append("audio", audio, `pregunta.${extension}`);

    let texto = "";
    let fallo: string | null = null;
    try {
      const res = await fetch("/api/transcribir", {
        method: "POST",
        body: datos,
        signal: AbortSignal.timeout(25_000),
      });
      if (res.ok) {
        texto = ((await res.json()) as { texto?: string }).texto ?? "";
      } else {
        fallo = "servidor";
      }
    } catch {
      fallo = navigator.onLine === false ? "network" : "servidor";
    }

    this.activo = false;
    if (this.descartado) return;
    if (fallo) {
      this.onerror?.({ error: fallo });
    } else if (!texto.trim()) {
      this.onerror?.({ error: "no-speech" });
    } else {
      const resultado = Object.assign([{ transcript: texto.trim() }], { isFinal: true });
      this.onresult?.({ resultIndex: 0, results: [resultado] });
    }
    this.onend?.();
  }
}
