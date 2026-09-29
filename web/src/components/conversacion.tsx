"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUp, AudioLines, Mic, Square, Volume2, VolumeX, X } from "lucide-react";

import { Estado } from "@/components/ds/estado";
import { STARTER_QUESTIONS } from "@/lib/chat-knowledge";
import { inlineMarkdown } from "@/lib/markdown";
import { textoConFiguras } from "@/lib/figuras-en-texto";
import type { Conversacion as ConversacionApi, MensajeConversacion } from "@/lib/use-conversacion";
import type { ErrorDictado, EstadoDictado, EstadoLectura } from "@/lib/voz";
import { cn } from "@/lib/utils";

/**
 * La conversacion con el asistente: hilo, preguntas sugeridas y campo para
 * escribir. La misma pieza vive en el panel lateral y en la pagina /chat.
 *
 * Diseno: el asistente no habla en "burbujas" de chat generico. Sus
 * respuestas son texto sobre el fondo, firmadas con el simbolo de GrillosIA,
 * como una nota de un investigador; las preguntas de la persona van a la
 * derecha en una superficie discreta. Asi se lee como una consulta
 * cientifica, no como un chatbot de atencion al cliente.
 */

export interface VozConversacion {
  lectura: {
    estado: EstadoLectura;
    leyendo: string | null;
    leer: (texto: string, id: string) => void;
    callar: () => void;
  };
  dictado: {
    estado: EstadoDictado;
    parcial: string;
    empezar: () => void;
    parar: () => void;
    /** El navegador esta pasando la voz a texto. */
    procesando?: boolean;
    error?: ErrorDictado | null;
    limpiarError?: () => void;
  };
  /** Abre la conversacion por voz continua (modo manos libres). */
  abrirManosLibres?: () => void;
}

/**
 * Que decir cuando el dictado falla. En humano, con lo que la persona puede
 * hacer, y nunca el codigo del navegador.
 */
const MENSAJE_ERROR: Record<ErrorDictado | "no-disponible", { titulo: string; texto: string }> = {
  permiso: {
    titulo: "No tenemos permiso para usar el micrófono",
    texto:
      "Actívelo en la configuración del navegador (toque el candado junto a la dirección de la página, luego Micrófono, Permitir) y vuelva a intentarlo. También puede escribir su pregunta.",
  },
  "sin-microfono": {
    titulo: "No encontramos un micrófono",
    texto:
      "Revise que el equipo tenga micrófono y que ninguna otra aplicación lo esté usando.",
  },
  "sin-red": {
    titulo: "El dictado necesita internet",
    texto: "Revise la conexión o escriba su pregunta.",
  },
  "sin-voz": {
    titulo: "No alcanzamos a oírle",
    texto: "Toque el micrófono y hable cerca del teléfono, sin prisa.",
  },
  otro: {
    titulo: "No pudimos abrir el micrófono",
    texto: "Inténtelo de nuevo en un momento o escriba su pregunta.",
  },
  "no-disponible": {
    titulo: "Este navegador no permite dictar",
    texto:
      "Para hablar en vez de escribir, abra GrillosIA en Chrome (Android o computador) o en Safari (iPhone).",
  },
};

/** Preguntas para empezar, segun haya o no una consulta terminada. */
function sugerencias(conv: ConversacionApi): string[] {
  if (conv.consultaLista && conv.active) {
    const animal = conv.active.name.split(" · ")[0]?.toLowerCase() || "animal";
    return [
      `¿Qué me dice el resultado de mi consulta de ${animal}?`,
      "¿Cuánta proteína necesita mi animal en esta etapa?",
      "¿Cómo mezclo la harina de grillo con otros ingredientes?",
      "¿Qué pasa si sube la humedad de la caja?",
    ];
  }
  return [
    "¿Qué comidas están probando para los grillos?",
    ...STARTER_QUESTIONS.slice(0, 3),
  ];
}

export function Conversacion({
  conv,
  variante,
  voz,
  preguntaInicial,
  className,
}: {
  conv: ConversacionApi;
  variante: "panel" | "pagina";
  voz?: VozConversacion;
  /** Se envia una sola vez, en cuanto la conversacion esta lista. */
  preguntaInicial?: string;
  className?: string;
}) {
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [enLinea, setEnLinea] = useState(true);
  const hilo = useRef<HTMLDivElement>(null);
  const campo = useRef<HTMLTextAreaElement>(null);
  const idCampo = useId();
  const inicialEnviada = useRef<string | null>(null);
  // Los mensajes que ya estaban al abrir no se animan: solo los nuevos
  // entran con un fundido corto. Se fija cuando termina de cargar.
  const yaEstaban = useRef<Set<string> | null>(null);
  if (yaEstaban.current === null && !conv.loading) {
    yaEstaban.current = new Set(conv.messages.map((m) => m.id));
  }

  // Al terminar de hablar, el reconocimiento sigue abierto un momento
  // mientras entrega el texto: en ese rato se muestra "pasando a texto" y no
  // "le escuchamos", que confundiria (la persona ya callo).
  const procesando = !!voz?.dictado.procesando;
  const oyendo = voz?.dictado.estado === "escuchando";
  const escuchando = oyendo && !procesando;
  const sinDictado = voz?.dictado.estado === "no-disponible";
  /** Se muestra al tocar el microfono en un navegador que no dicta. */
  const [avisoSinDictado, setAvisoSinDictado] = useState(false);
  const errorVoz = voz?.dictado.error
    ? MENSAJE_ERROR[voz.dictado.error]
    : avisoSinDictado
      ? MENSAJE_ERROR["no-disponible"]
      : null;

  const tocarMicrofono = () => {
    if (!voz) return;
    if (sinDictado) {
      setAvisoSinDictado(true);
      return;
    }
    if (escuchando) voz.dictado.parar();
    else voz.dictado.empezar();
  };

  const enviar = (texto: string) => {
    const limpio = texto.trim();
    if (!limpio || conv.thinking) return;
    setInput("");
    setError(false);
    conv.preguntar(limpio).catch(() => setError(true));
  };

  // Pregunta que llega desde otra pagina ("abrirAsistente({ pregunta })").
  useEffect(() => {
    if (!preguntaInicial || conv.loading) return;
    if (inicialEnviada.current === preguntaInicial) return;
    inicialEnviada.current = preguntaInicial;
    enviar(preguntaInicial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preguntaInicial, conv.loading]);

  useEffect(() => {
    hilo.current?.scrollTo({ top: hilo.current.scrollHeight, behavior: "smooth" });
  }, [conv.messages.length, conv.thinking]);

  useEffect(() => {
    const act = () => setEnLinea(navigator.onLine);
    act();
    window.addEventListener("online", act);
    window.addEventListener("offline", act);
    return () => {
      window.removeEventListener("online", act);
      window.removeEventListener("offline", act);
    };
  }, []);

  // El campo crece con el texto, hasta cuatro lineas. Tambien con lo que se
  // va dictando: si no, la frase dictada quedaba cortada.
  const dictando = voz?.dictado.parcial ?? "";
  useEffect(() => {
    const c = campo.current;
    if (!c) return;
    c.style.height = "auto";
    c.style.height = `${Math.min(c.scrollHeight, 132)}px`;
  }, [input, dictando, oyendo]);

  const hayMensajes = conv.messages.length > 0;
  const panel = variante === "panel";

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col", className)}>
      <div
        ref={hilo}
        className={cn(
          "flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overflow-x-hidden",
          panel ? "px-5 py-5" : "py-6",
        )}
        aria-live="polite"
        aria-busy={conv.thinking}
      >
        {conv.loading && (
          <Estado tipo="cargando" titulo="Cargando su conversación" compacto />
        )}

        {!conv.loading && !hayMensajes && !conv.thinking && (
          <div className="flex flex-col gap-5">
            <p className="t-body text-subtle">
              {conv.consultaLista
                ? "Puede preguntarme sobre el resultado de su consulta o sobre la cría en general. Le respondo con los datos del proyecto y le digo de dónde sale cada cifra."
                : "Pregúnteme sobre la cría de grillos, las comidas en estudio o el proyecto. Si hace su consulta, también le explico su resultado."}
            </p>
            <div>
              <p className="t-eyebrow mb-2 text-faint">Para empezar</p>
              <ul className="flex flex-col">
                {sugerencias(conv).map((q) => (
                  <li key={q} className="border-t border-border last:border-b">
                    <button
                      type="button"
                      onClick={() => enviar(q)}
                      className="group flex min-h-12 w-full items-center justify-between gap-3 py-3 text-left text-[15px] text-foreground/90 transition-colors duration-150 hover:text-foreground"
                    >
                      <span>{q}</span>
                      <ArrowRight className="size-4 shrink-0 text-faint transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-primary" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            {voz?.abrirManosLibres && !sinDictado && (
              <button
                type="button"
                onClick={voz.abrirManosLibres}
                className="group flex w-full items-center gap-3 rounded-lg border border-border-strong px-4 py-3.5 text-left transition-colors duration-150 hover:border-primary/50 hover:bg-primary-soft/60"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
                  <AudioLines className="size-5" aria-hidden />
                </span>
                <span className="flex flex-col">
                  <span className="text-[15px] font-semibold">Prefiero hablar</span>
                  <span className="t-small text-subtle">
                    Conversación por voz: usted pregunta y el asistente le responde en voz alta.
                  </span>
                </span>
              </button>
            )}
            {!conv.consultaLista && (
              <Link
                href="/consulta"
                className="t-small inline-flex w-fit items-center gap-1.5 font-semibold text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
              >
                Hacer mi consulta
                <ArrowRight className="size-3.5" />
              </Link>
            )}
          </div>
        )}

        {conv.consultaLista && conv.datosSimulados && hayMensajes && (
          <p className="t-caption rounded-md bg-warning-soft px-3 py-2 text-warning">
            Los números del modelo son de prueba mientras llegan los análisis
            del laboratorio. Sirven para orientarse, no para decidir.
          </p>
        )}

        {conv.messages.map((m) => (
          <Mensaje
            key={m.id}
            mensaje={m}
            lectura={voz?.lectura}
            panel={panel}
            nuevo={!yaEstaban.current?.has(m.id)}
          />
        ))}

        {conv.thinking && <Pensando />}

        {error && (
          <Estado tipo="error" titulo="No pudimos enviar su pregunta" compacto>
            Su conversación sigue guardada. Revise la conexión e inténtelo de
            nuevo.
          </Estado>
        )}
        {!enLinea && (
          <Estado tipo="sin-conexion" titulo="Sin conexión a internet" compacto>
            Puede seguir leyendo. Para preguntar, espere a tener señal.
          </Estado>
        )}
      </div>

      {/* Campo para escribir */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          enviar(input);
        }}
        className={cn(
          "shrink-0 bg-background pt-3 pb-[max(env(safe-area-inset-bottom),14px)]",
          panel ? "border-t border-border px-5" : "",
        )}
      >
        {/* Lo que esta pasando con la voz, dicho en voz alta a los lectores de
            pantalla y a la vista de todos. */}
        <div aria-live="polite" className="empty:hidden">
          {escuchando && (
            <div className="mb-2.5 flex items-center gap-3 rounded-md bg-primary-soft px-3 py-2.5 text-[14px] text-foreground">
              <Ondas />
              <span className="flex-1 leading-snug">
                <span className="font-semibold">Le escuchamos.</span>{" "}
                <span className="text-subtle">Al callar, enviamos su pregunta.</span>
              </span>
              <button
                type="button"
                onClick={() => voz?.dictado.parar()}
                className="min-h-9 shrink-0 rounded-md px-2.5 text-[13.5px] font-semibold text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
              >
                Ya terminé
              </button>
            </div>
          )}
          {procesando && (
            <div className="mb-2.5 flex items-center gap-3 rounded-md bg-surface-2 px-3 py-2.5 text-[14px] text-subtle">
              <Puntos />
              Pasando su voz a texto…
            </div>
          )}
          {errorVoz && !escuchando && (
            <div role="alert" className="mb-2.5 flex items-start gap-3 rounded-md bg-surface-2 px-3 py-2.5 text-[14px]">
              <Mic className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />
              <span className="flex-1 leading-snug">
                <span className="block font-semibold">{errorVoz.titulo}</span>
                <span className="block text-subtle">{errorVoz.texto}</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setAvisoSinDictado(false);
                  voz?.dictado.limpiarError?.();
                }}
                aria-label="Cerrar el aviso"
                className="-mr-1 flex size-8 shrink-0 items-center justify-center rounded-md text-subtle hover:bg-accent hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
          )}
        </div>

        <label htmlFor={idCampo} className="sr-only">
          Escriba su pregunta
        </label>
        <div className="flex items-end gap-2 rounded-lg border border-border-strong bg-surface p-1.5 pl-3.5 transition-colors duration-150 focus-within:border-foreground/40">
          <textarea
            ref={campo}
            id={idCampo}
            rows={1}
            value={oyendo ? voz?.dictado.parcial : input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                enviar(input);
              }
            }}
            readOnly={oyendo}
            placeholder={escuchando ? "Le escuchamos…" : voz ? "Escriba o toque el micrófono" : "Escriba su pregunta"}
            className="max-h-[132px] min-h-11 flex-1 resize-none bg-transparent py-2.5 text-[16px] leading-snug outline-none placeholder:text-faint focus-visible:outline-none"
            autoComplete="off"
          />
          {voz && (
            <button
              type="button"
              aria-label={escuchando ? "Terminar de hablar y enviar" : "Hablar en vez de escribir"}
              aria-pressed={escuchando}
              title={escuchando ? "Terminar de hablar" : "Hablar"}
              onClick={tocarMicrofono}
              disabled={procesando || conv.thinking}
              className={cn(
                "relative flex size-11 shrink-0 items-center justify-center rounded-md border transition-colors duration-150 disabled:opacity-60",
                escuchando
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-primary/35 text-primary hover:border-primary hover:bg-primary-soft",
                sinDictado && "border-border-strong text-subtle hover:border-border-strong hover:bg-surface-2",
              )}
            >
              {escuchando && (
                <span
                  aria-hidden
                  className="absolute inset-0 animate-ping rounded-md bg-primary/30 [animation-duration:1.6s] motion-reduce:hidden"
                />
              )}
              {escuchando ? (
                <Square className="relative size-4 fill-current" />
              ) : (
                <Mic className="size-5" />
              )}
            </button>
          )}
          <button
            type="submit"
            aria-label="Enviar pregunta"
            disabled={!input.trim() || conv.thinking}
            className="flex size-11 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground transition-colors duration-150 hover:bg-primary-hover disabled:bg-disabled disabled:text-disabled-foreground"
          >
            <ArrowUp className="size-5" />
          </button>
        </div>
        <p className="t-caption mt-2 text-faint">
          Las respuestas pueden equivocarse. Las cifras del proyecto llevan su fuente.
        </p>
      </form>
    </div>
  );
}

/** Entrada de un mensaje nuevo: fundido y 6 px hacia arriba, 300 ms. */
const ENTRADA =
  "animate-in fade-in-0 slide-in-from-bottom-1.5 duration-300 ease-[var(--ease-natural)]";

function Firma() {
  return (
    <span className="flex items-center gap-2">
      <Image src="/logo.svg" alt="" width={18} height={19} className="h-auto w-[18px]" aria-hidden />
      <span className="t-eyebrow normal-case tracking-[0.02em] text-subtle">GrillosIA</span>
    </span>
  );
}

function Mensaje({
  mensaje,
  lectura,
  panel = false,
  nuevo = false,
}: {
  mensaje: MensajeConversacion;
  /** Entra con fundido y 6 px de desplazamiento. */
  nuevo?: boolean;
  lectura?: VozConversacion["lectura"];
  /** En el panel las laminas van mas pequenas: acompanan, no dominan. */
  panel?: boolean;
}) {
  if (mensaje.role === "user") {
    return (
      <div className={cn("flex justify-end", nuevo && ENTRADA)}>
        <p className="max-w-[85%] whitespace-pre-wrap rounded-lg bg-surface-2 px-4 py-2.5 text-[15.5px] leading-relaxed [overflow-wrap:anywhere]">
          <span className="sr-only">Usted: </span>
          {inlineMarkdown(mensaje.text)}
        </p>
      </div>
    );
  }

  const sonando = lectura?.leyendo === mensaje.id;
  return (
    <article className={cn("flex min-w-0 flex-col gap-2", nuevo && ENTRADA)}>
      <Firma />
      {/* `overflow-wrap: anywhere` parte solo lo que de verdad no cabe (una
          direccion larga), sin cortar el espanol normal a mitad de palabra. */}
      <div className={cn("flex min-w-0 flex-col gap-3 text-[15.5px] leading-relaxed text-foreground [overflow-wrap:anywhere] [&_figure]:my-1 [&_figure]:w-full", panel ? "[&_figure]:max-w-[260px]" : "[&_figure]:max-w-[360px]")}>
        {textoConFiguras(mensaje.text)}
      </div>
      {mensaje.links && mensaje.links.length > 0 && (
        <ul className="mt-1 flex flex-wrap gap-2">
          {mensaje.links.map((l) => {
            const cls =
              "inline-flex min-h-10 items-center gap-1.5 rounded-md border border-border-strong px-3 text-[14px] font-medium text-foreground transition-colors duration-150 hover:bg-surface-2";
            return (
              <li key={l.href}>
                {l.href.startsWith("http") ? (
                  <a href={l.href} target="_blank" rel="noopener noreferrer" className={cls}>
                    {l.label}
                    <ArrowRight className="size-3.5" />
                  </a>
                ) : (
                  <Link href={l.href} className={cls}>
                    {l.label}
                    <ArrowRight className="size-3.5" />
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {lectura && (
        <button
          type="button"
          onClick={() => (sonando ? lectura.callar() : lectura.leer(mensaje.text, mensaje.id))}
          aria-label={sonando ? "Dejar de leer" : "Escuchar esta respuesta"}
          className="inline-flex min-h-9 w-fit items-center gap-1.5 rounded-md px-2 -ml-2 text-[13.5px] font-medium text-subtle transition-colors hover:bg-surface-2 hover:text-foreground"
        >
          {sonando ? (
            <>
              <VolumeX className="size-4" />
              {lectura.estado === "cargando" ? "Preparando..." : "Detener"}
            </>
          ) : (
            <>
              <Volume2 className="size-4" />
              Escuchar
            </>
          )}
        </button>
      )}
    </article>
  );
}

function Pensando() {
  return (
    <div className={cn("flex flex-col gap-2", ENTRADA)} role="status">
      <Firma />
      <span className="flex items-center gap-2 text-[14.5px] text-subtle">
        <span className="flex gap-1" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="size-1.5 animate-pulse rounded-full bg-foreground/45"
              style={{ animationDelay: `${i * 180}ms` }}
            />
          ))}
        </span>
        Consultando los datos del proyecto
      </span>
    </div>
  );
}

/**
 * Ondas de "le escuchamos": cuatro barras que suben y bajan, sobrias. Con
 * "reducir movimiento" se quedan quietas.
 */
function Ondas() {
  return (
    <span className="flex h-5 shrink-0 items-center gap-[3px]" aria-hidden>
      <style>{`@keyframes grillosia-onda{0%,100%{transform:scaleY(.35)}50%{transform:scaleY(1)}}`}</style>
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className="h-full w-[3px] origin-center rounded-full bg-primary motion-reduce:[animation:none]"
          style={{ animation: `grillosia-onda 900ms ${i * 140}ms ease-in-out infinite` }}
        />
      ))}
    </span>
  );
}

function Puntos() {
  return (
    <span className="flex gap-1" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-1.5 animate-pulse rounded-full bg-foreground/45"
          style={{ animationDelay: `${i * 180}ms` }}
        />
      ))}
    </span>
  );
}
