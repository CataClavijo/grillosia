"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Voz del asistente.
 *
 * DICTADO: se usa el reconocimiento nativo del navegador, no un modelo
 * descargado. La version anterior de este proyecto usaba Whisper en el
 * navegador, que son unos 200 MB la primera vez. Para alguien en una vereda
 * con datos contados, eso hace la funcion inservible justo para quien mas la
 * necesita. Android Chrome —el objetivo declarado del proyecto— trae
 * reconocimiento con soporte de espanol de Colombia sin descargar nada.
 *
 * LECTURA: se pide el audio al servidor, que usa una voz natural. Si el
 * servidor no puede, se lee con la voz del sistema. Peor, pero nadie se queda
 * sin oir.
 */

type Reconocedor = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: unknown) => void) | null;
  onerror: ((e: unknown) => void) | null;
  onend: (() => void) | null;
};

function crearReconocedor(): Reconocedor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as Record<string, unknown>;
  const Ctor = (w.SpeechRecognition ?? w.webkitSpeechRecognition) as
    | (new () => Reconocedor)
    | undefined;
  return Ctor ? new Ctor() : null;
}

export function hayDictado(): boolean {
  return crearReconocedor() !== null;
}

export type EstadoDictado = "inactivo" | "escuchando" | "no-disponible";

/**
 * Dictado por voz. Devuelve lo que se va oyendo para que el campo de texto lo
 * muestre en vivo: sin eso, el productor no sabe si lo esta escuchando.
 */
export function useDictado(alTerminar: (texto: string) => void) {
  const [estado, setEstado] = useState<EstadoDictado>("inactivo");
  const [parcial, setParcial] = useState("");
  const rec = useRef<Reconocedor | null>(null);
  const final = useRef("");
  /**
   * Ultimo texto provisional.
   *
   * Chrome no siempre marca un resultado como definitivo antes de cerrar el
   * reconocimiento: a veces todo se queda en provisional y `final` llega
   * vacio. Sin esto, el productor habla, ve su frase en pantalla, calla, y no
   * se envia nada. Guardar lo provisional es la diferencia entre que la
   * funcion sirva o no.
   */
  const ultimo = useRef("");
  /** Evita enviar dos veces si `onend` llega despues de un envio manual. */
  const enviado = useRef(false);

  useEffect(() => {
    setEstado(hayDictado() ? "inactivo" : "no-disponible");
  }, []);

  const parar = useCallback(() => {
    // Pulsar el boton significa "ya termine de hablar", no "cancela": el
    // texto que alcanzo a oirse se envia igual.
    rec.current?.stop();
  }, []);

  const empezar = useCallback(() => {
    const r = crearReconocedor();
    if (!r) {
      setEstado("no-disponible");
      return;
    }
    rec.current = r;
    final.current = "";
    ultimo.current = "";
    enviado.current = false;
    setParcial("");
    r.lang = "es-CO";
    r.continuous = false;
    r.interimResults = true;

    r.onresult = (e: unknown) => {
      const ev = e as {
        results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }>;
      };
      let enCurso = "";
      for (let i = 0; i < ev.results.length; i++) {
        const alt = ev.results[i][0]?.transcript ?? "";
        if (ev.results[i].isFinal) final.current += alt;
        else enCurso += alt;
      }
      const visible = (final.current + enCurso).trim();
      if (visible) ultimo.current = visible;
      setParcial(final.current + enCurso);
    };

    r.onerror = () => setEstado("inactivo");
    r.onend = () => {
      setEstado("inactivo");
      // Se toma lo definitivo si existe; si no, lo ultimo que se oyo.
      const texto = (final.current.trim() || ultimo.current).trim();
      setParcial("");
      if (texto && !enviado.current) {
        enviado.current = true;
        alTerminar(texto);
      }
    };

    try {
      r.start();
      setEstado("escuchando");
    } catch {
      setEstado("inactivo");
    }
  }, [alTerminar]);

  return { estado, parcial, empezar, parar };
}

/** Corta el marcado que el asistente escribe: no se lee en voz alta. */
function paraLeer(texto: string): string {
  return texto
    .replace(/\[figura:[a-z-]+\]/g, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/[*_`#>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export type EstadoLectura = "quieto" | "cargando" | "hablando";

/** Lee un texto en voz alta. */
export function useLectura() {
  const [estado, setEstado] = useState<EstadoLectura>("quieto");
  const [leyendo, setLeyendo] = useState<string | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);

  const callar = useCallback(() => {
    audio.current?.pause();
    audio.current = null;
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    setEstado("quieto");
    setLeyendo(null);
  }, []);

  const conElNavegador = useCallback((texto: string, id: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setEstado("quieto");
      return;
    }
    const u = new SpeechSynthesisUtterance(texto);
    u.lang = "es-CO";
    u.rate = 0.95;
    u.onend = () => {
      setEstado("quieto");
      setLeyendo(null);
    };
    setEstado("hablando");
    setLeyendo(id);
    window.speechSynthesis.speak(u);
  }, []);

  const leer = useCallback(
    async (texto: string, id: string) => {
      callar();
      const limpio = paraLeer(texto);
      if (!limpio) return;

      setEstado("cargando");
      setLeyendo(id);

      try {
        const res = await fetch("/api/voz", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ texto: limpio }),
        });

        if (!res.ok) {
          // 503 es lo esperado cuando no hay servicio o se paso el tope.
          conElNavegador(limpio, id);
          return;
        }

        const blob = await res.blob();
        const a = new Audio(URL.createObjectURL(blob));
        audio.current = a;
        a.onended = () => {
          setEstado("quieto");
          setLeyendo(null);
        };
        a.onerror = () => conElNavegador(limpio, id);
        setEstado("hablando");
        await a.play();
      } catch {
        conElNavegador(limpio, id);
      }
    },
    [callar, conElNavegador],
  );

  useEffect(() => callar, [callar]);

  return { estado, leyendo, leer, callar };
}
