"use client";

import { useState } from "react";
import Link from "next/link";
import { AudioLines, ChevronLeft, MoreHorizontal } from "lucide-react";

import { Barra } from "@/components/barra";
import { Conversacion } from "@/components/conversacion";
import { ManosLibres } from "@/components/manos-libres";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useConversacion } from "@/lib/use-conversacion";
import { useDictado, useLectura } from "@/lib/voz";

/**
 * El asistente en pantalla completa.
 *
 * Es la misma conversacion del panel lateral (`useConversacion`), con lo que
 * solo cabe aqui: la voz (dictado, lectura en voz alta y el modo manos
 * libres) y el espacio para leer respuestas largas con sus figuras.
 *
 * Antes, sin una consulta terminada, esta pagina mandaba a hacer la consulta.
 * Ahora el asistente tambien responde sobre cria y el proyecto, igual que el
 * panel; la invitacion a la consulta queda dentro de la conversacion.
 */
export default function ChatPage() {
  const conv = useConversacion();
  const [confirmarBorrado, setConfirmarBorrado] = useState(false);
  const [manosLibres, setManosLibres] = useState(false);

  // Voz. El dictado envia en cuanto la persona termina de hablar: pedirle
  // que despues pulse "enviar" pierde justo a quien la funcion sirve.
  const { estado: lectura, leyendo, leer, callar, desbloquear } = useLectura();
  const dictado = useDictado((texto) => void conv.preguntar(texto));

  const hayMensajes = conv.messages.length > 0;
  const tema = conv.consultaLista && conv.active
    ? `Sobre su consulta: ${conv.active.name}`
    : "Cría de grillos y el proyecto";

  return (
    <div className="flex h-[100dvh] flex-col">
      {/* En celular la pantalla entera es de la conversacion: basta la flecha
          de volver. En escritorio va la cabecera del sitio. */}
      <Barra className="hidden lg:block" />

      <main className="mx-auto flex min-h-0 w-full max-w-[760px] flex-1 flex-col px-5 lg:px-8">
        <header className="flex items-center justify-between gap-3 border-b border-border py-3 lg:py-5">
          <div className="flex min-w-0 items-center gap-1">
            <Link
              href="/"
              aria-label="Volver al inicio"
              className="-ml-2 flex size-11 shrink-0 items-center justify-center rounded-md text-foreground/80 transition-colors hover:bg-surface-2 hover:text-foreground lg:hidden"
            >
              <ChevronLeft className="size-5" />
            </Link>
            <div className="flex min-w-0 flex-col">
              <h1 className="t-h2 whitespace-nowrap !text-[1.45rem] leading-none sm:!text-[1.9rem]">Asistente GrillosIA</h1>
              <p className="t-caption mt-1 truncate">{tema}</p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            {dictado.estado !== "no-disponible" && (
              <button
                type="button"
                onClick={() => {
                  // Dentro del gesto, no despues: es el unico momento en que el
                  // navegador movil deja desbloquear la reproduccion del audio.
                  desbloquear();
                  setManosLibres(true);
                }}
                className="inline-flex h-11 items-center gap-2 rounded-md border border-border-strong px-3.5 text-[14.5px] font-semibold text-foreground transition-colors hover:bg-surface-2"
              >
                <AudioLines className="size-4 text-primary" />
                Hablar
              </button>
            )}
            {hayMensajes && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label="Más opciones"
                    className="flex size-11 items-center justify-center rounded-md text-subtle transition-colors hover:bg-surface-2 hover:text-foreground"
                  >
                    <MoreHorizontal className="size-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onSelect={(e: Event) => {
                      e.preventDefault();
                      setConfirmarBorrado(true);
                    }}
                    className="min-h-11 text-destructive"
                  >
                    Borrar conversación
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </header>

        <Conversacion
          conv={conv}
          variante="pagina"
          voz={{
            lectura: { estado: lectura, leyendo, leer, callar },
            dictado,
            abrirManosLibres:
              dictado.estado !== "no-disponible"
                ? () => {
                    desbloquear();
                    setManosLibres(true);
                  }
                : undefined,
          }}
        />
      </main>

      <AlertDialog open={confirmarBorrado} onOpenChange={setConfirmarBorrado}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Borrar toda la conversación?</AlertDialogTitle>
            <AlertDialogDescription>
              Se perderán todas las preguntas y respuestas. No se puede
              deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-11 text-[15px]">No, dejarla</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void conv.borrar()}
              className="h-11 bg-destructive text-[15px] text-white hover:bg-destructive/90"
            >
              Sí, borrarla
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ManosLibres
        abierto={manosLibres}
        onCerrar={() => setManosLibres(false)}
        preguntar={conv.preguntar}
      />
    </div>
  );
}
