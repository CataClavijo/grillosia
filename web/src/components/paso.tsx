import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { Barra } from "@/components/barra";
import { BotonAsistente } from "@/components/boton-asistente";
import { CAMINO, siguienteParada } from "@/lib/camino";
import { cn } from "@/lib/utils";

/**
 * Armazon de una parada del camino.
 *
 * Hace tres cosas, y las tres son la razon de que exista:
 *  1. Dice en que parada va (la cabecera en modo `camino`: "Paso 3 de 4 ·
 *     Consulta" y una barra fina). Una sola senal de progreso.
 *  2. Deja UNA sola accion hacia adelante, al final.
 *  3. Ofrece volver, que no es lo mismo que ir al inicio.
 *
 * La barra de acciones de abajo no atraviesa la pantalla con una linea: se
 * apoya en un fundido del fondo y alinea sus botones con el contenido.
 *
 * Exporta `BarraAcciones` para las paradas que manejan su propio avance (la
 * consulta, que va pregunta por pregunta).
 */
export function Paso({
  n,
  titulo,
  children,
  accion,
  className,
}: {
  n: number;
  titulo: string;
  children: React.ReactNode;
  /** Sobrescribe el texto o destino del boton. `href: ""` lo oculta. */
  accion?: { texto?: string; href?: string };
  className?: string;
}) {
  // El texto sale de ESTA parada —describe lo que el productor esta a punto
  // de hacer— y la direccion de la siguiente.
  const actual = CAMINO.find((x) => x.n === n);
  const sigue = siguienteParada(n);
  const href = accion?.href ?? sigue?.href;
  const texto = accion?.texto ?? actual?.siguiente ?? "Seguir";
  const anterior = n > 1 ? `/${["", "caja", "grillos", "consulta"][n - 1]}` : "/";

  return (
    <>
      <Barra modo="camino" paso={n} />
      <main
        aria-label={titulo}
        className={cn(
          "mx-auto flex w-full max-w-[1240px] flex-col px-5 pt-8 lg:px-8 lg:pt-12",
          className,
        )}
      >
        <div className="pb-10 lg:pb-16">{children}</div>
        <BarraAcciones
          atras={{ href: anterior }}
          adelante={href ? { href, texto } : undefined}
        />
      </main>
    </>
  );
}

/**
 * Barra de acciones fija abajo: "Atras" a la izquierda y la accion principal
 * a la derecha, alineadas con el contenido. En celular la principal ocupa el
 * ancho que queda, al alcance del pulgar.
 */
export function BarraAcciones({
  atras,
  adelante,
}: {
  atras: { href?: string; onClick?: () => void; texto?: string };
  adelante?: {
    href?: string;
    onClick?: () => void;
    texto: string;
    deshabilitado?: boolean;
  };
}) {
  const claseAtras =
    "inline-flex h-12 shrink-0 items-center gap-2 rounded-md px-3 text-[15px] font-medium text-foreground/80 transition-colors hover:bg-surface-2 hover:text-foreground";
  const claseAdelante =
    "inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-md bg-primary px-6 text-[16px] font-semibold text-primary-foreground transition-colors duration-150 hover:bg-primary-hover disabled:bg-disabled disabled:text-disabled-foreground sm:flex-none sm:min-w-[240px]";

  return (
    <div className="sticky bottom-0 z-20 -mx-5 mt-auto bg-gradient-to-t from-background from-70% to-transparent px-5 pt-6 pb-[calc(env(safe-area-inset-bottom)+14px)] lg:-mx-8 lg:px-8">
      <div className="flex items-center justify-between gap-3">
        {atras.href ? (
          <Link href={atras.href} className={claseAtras}>
            <ArrowLeft className="size-4" />
            {atras.texto ?? "Atrás"}
          </Link>
        ) : (
          <button type="button" onClick={atras.onClick} className={claseAtras}>
            <ArrowLeft className="size-4" />
            {atras.texto ?? "Atrás"}
          </button>
        )}
        {/* El asistente vive aqui en el camino, junto a la accion principal,
            y no flotando sobre el contenido. */}
        <div className="flex flex-1 items-center justify-end gap-2 sm:flex-none">
        <BotonAsistente />
        {adelante &&
          (adelante.href && !adelante.deshabilitado ? (
            <Link href={adelante.href} className={claseAdelante}>
              {adelante.texto}
              <ArrowRight className="size-4" />
            </Link>
          ) : (
            <button
              type="button"
              onClick={adelante.onClick}
              disabled={adelante.deshabilitado}
              className={claseAdelante}
            >
              {adelante.texto}
              <ArrowRight className="size-4" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
