"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Maximize2, Sparkles, Trash2, X } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { Conversacion } from "@/components/conversacion";
import { EVENTO_ABRIR_ASISTENTE, type OpcionesAsistente } from "@/lib/asistente";
import { useConversacion } from "@/lib/use-conversacion";
import { cn } from "@/lib/utils";

/**
 * El asistente de GrillosIA, en toda la plataforma.
 *
 * Un boton discreto abajo a la derecha abre un panel lateral con la
 * conversacion. Se eligio panel y no pagina porque la persona pregunta
 * SOBRE lo que esta viendo (su resultado, la guia de la caja): el panel deja
 * la pagina a la vista y se cierra sin perder el lugar.
 *
 * Donde no aparece:
 *  - /chat: ya es la conversacion en pantalla completa.
 *  - /reset: herramienta de soporte.
 *
 * En las paradas del camino no flota: el acceso vive en la barra de acciones
 * (`BotonAsistente`, junto a "Continuar"), para no tapar nunca contenido.
 * El panel si es el mismo y se abre por el evento de `lib/asistente.ts`.
 */
const OCULTO = ["/chat", "/reset"];
const CAMINO = ["/caja", "/grillos", "/consulta", "/resultado"];

export function AsistenteFlotante() {
  const pathname = usePathname() ?? "/";
  const [abierto, setAbierto] = useState(false);
  const [pregunta, setPregunta] = useState<string | undefined>();
  // Cuando aparece el boton:
  //  - En la portada, solo despues de pasar la foto de entrada: ahi arriba
  //    ya estan "Comenzar consulta" y "Conozca como funciona", y el boton
  //    los tapaba en celular.
  //  - En las demas paginas, un momento despues de cargar (600 ms): primero
  //    se lee la pagina, luego aparece la ayuda.
  //  - Se esconde cuando el pie de pagina entra en pantalla, para no tapar
  //    sus enlaces.
  const [listo, setListo] = useState(false);
  const [pasoHeroe, setPasoHeroe] = useState(false);
  const [pieVisible, setPieVisible] = useState(false);
  const esPortada = pathname === "/";

  useEffect(() => {
    setListo(false);
    const t = window.setTimeout(() => setListo(true), 600);
    return () => window.clearTimeout(t);
  }, [pathname]);

  useEffect(() => {
    if (!esPortada) return;
    const medir = () => setPasoHeroe(window.scrollY > window.innerHeight * 0.6);
    medir();
    window.addEventListener("scroll", medir, { passive: true });
    return () => window.removeEventListener("scroll", medir);
  }, [esPortada]);

  useEffect(() => {
    const pie = document.querySelector("footer");
    if (!pie || typeof IntersectionObserver === "undefined") {
      setPieVisible(false);
      return;
    }
    const obs = new IntersectionObserver(([e]) => setPieVisible(e.isIntersecting), {
      threshold: 0.05,
    });
    obs.observe(pie);
    return () => obs.disconnect();
  }, [pathname]);

  const visible = listo && (!esPortada || pasoHeroe) && !pieVisible;

  useEffect(() => {
    const abrir = (e: Event) => {
      const detalle = (e as CustomEvent<OpcionesAsistente>).detail;
      setPregunta(detalle?.pregunta);
      setAbierto(true);
    };
    window.addEventListener(EVENTO_ABRIR_ASISTENTE, abrir);
    return () => window.removeEventListener(EVENTO_ABRIR_ASISTENTE, abrir);
  }, []);

  // Al cambiar de pagina se cierra: el panel habla de lo que se estaba viendo.
  useEffect(() => {
    setAbierto(false);
  }, [pathname]);

  if (OCULTO.some((r) => pathname.startsWith(r))) return null;
  const enCamino = CAMINO.some((r) => pathname.startsWith(r));

  return (
    <>
      {!enCamino && (
        <button
          type="button"
          onClick={() => {
            setPregunta(undefined);
            setAbierto(true);
          }}
          aria-label="Pregunte a GrillosIA"
          aria-haspopup="dialog"
          aria-expanded={abierto}
          aria-hidden={!visible}
          tabIndex={visible ? 0 : -1}
          className={cn(
            "fixed right-4 bottom-4 z-30 inline-flex h-12 items-center gap-2 rounded-full border border-border-strong bg-surface/95 px-4 text-[14.5px] font-semibold text-foreground backdrop-blur-md transition-[background-color,border-color,opacity,transform] duration-[var(--dur-lenta)] ease-[var(--ease-natural)] hover:border-foreground/30 hover:bg-surface active:translate-y-px lg:right-6 lg:bottom-6 lg:h-11",
            visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0",
            "shadow-[0_1px_2px_rgb(31_27_22/0.06),0_4px_16px_-6px_rgb(31_27_22/0.12)]",
            abierto && "pointer-events-none opacity-0",
          )}
        >
          <Sparkles className="size-[18px] text-primary" aria-hidden />
          Pregunte a GrillosIA
        </button>
      )}

      <Sheet open={abierto} onOpenChange={setAbierto}>
        <SheetContent
          side="right"
          showCloseButton={false}
          className="w-full gap-0 border-l border-border bg-background p-0 ease-[var(--ease-natural)] data-open:duration-[280ms] data-closed:duration-200 data-[side=right]:w-full sm:data-[side=right]:max-w-[440px]"
        >
          {abierto && (
            <PanelAsistente
              pregunta={pregunta}
              onCerrar={() => setAbierto(false)}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

/**
 * Contenido del panel. Va aparte para que la conversacion (y la consulta al
 * modelo que hace) solo exista mientras el panel esta abierto.
 */
function PanelAsistente({
  pregunta,
  onCerrar,
}: {
  pregunta?: string;
  onCerrar: () => void;
}) {
  const conv = useConversacion();
  const hayMensajes = conv.messages.length > 0;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="border-b border-border px-5 pt-4 pb-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <Image
              src="/logo.svg"
              alt=""
              width={32}
              height={34}
              aria-hidden
              className="h-auto w-8 shrink-0"
            />
            <SheetTitle className="t-h2 truncate !text-[1.5rem] leading-none text-foreground">
              Asistente GrillosIA
            </SheetTitle>
          </div>
          <div className="-mr-2 flex shrink-0 items-center">
            {hayMensajes && (
              <button
                type="button"
                onClick={() => void conv.borrar()}
                aria-label="Borrar la conversación"
                title="Borrar la conversación"
                className="flex size-11 items-center justify-center rounded-md text-subtle transition-colors hover:bg-surface-2 hover:text-foreground"
              >
                <Trash2 className="size-4" />
              </button>
            )}
            <Link
              href="/chat"
              onClick={onCerrar}
              aria-label="Abrir en pantalla completa"
              title="Abrir en pantalla completa"
              className="flex size-11 items-center justify-center rounded-md text-subtle transition-colors hover:bg-surface-2 hover:text-foreground"
            >
              <Maximize2 className="size-4" />
            </Link>
            <button
              type="button"
              onClick={onCerrar}
              aria-label="Cerrar el asistente"
              title="Cerrar"
              className="flex size-11 items-center justify-center rounded-md text-subtle transition-colors hover:bg-surface-2 hover:text-foreground"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>
        <SheetDescription className="t-small mt-2 text-subtle">
          El asistente científico del proyecto. Responde con los datos de
          GrillosIA y le dice de dónde sale cada cifra.
        </SheetDescription>
      </header>

      <Conversacion conv={conv} variante="panel" preguntaInicial={pregunta} />
    </div>
  );
}
