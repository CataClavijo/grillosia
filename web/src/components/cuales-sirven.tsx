import Image from "next/image";
import { Check, X } from "lucide-react";

import { EncabezadoSeccion } from "@/components/ds/encabezado-seccion";
import { CUALES_SIRVEN, type FotoInsecto, type InsectoCria } from "@/lib/content/catalog";
import { conCursivas } from "@/lib/cursivas";
import { cn } from "@/lib/utils";

/**
 * ¿Cuáles sirven para la cría?
 *
 * Dos grupos, uno debajo del otro: lo que se puede llevar a la colonia
 * (oliva, con chulo) y lo que no (rojo, con equis). El color nunca va solo:
 * cada grupo lleva tambien su palabra y su icono, para quien no distingue
 * bien los colores.
 *
 * Cada tarjeta abre con la foto grande: es lo que el productor va a comparar
 * con lo que tiene en la mano. Con un dibujo chico al lado del texto no
 * alcanzaba a reconocerse nada.
 */
export function CualesSirven() {
  const si = CUALES_SIRVEN.filter((x) => x.sirve);
  const no = CUALES_SIRVEN.filter((x) => !x.sirve);
  return (
    <section aria-labelledby="cuales-sirven">
      <EncabezadoSeccion
        rotulo="Antes de recolectar"
        titulo={<span id="cuales-sirven">¿Cuáles sirven para la cría?</span>}
        entrada="Al salir a buscar va a encontrar varios insectos parecidos. Estos se pueden llevar a la colonia y estos no."
      />
      <div className="mt-10 flex flex-col gap-14">
        <Grupo sirve items={si} />
        <Grupo sirve={false} items={no} />
      </div>
    </section>
  );
}

function Grupo({ sirve, items }: { sirve: boolean; items: InsectoCria[] }) {
  const Icono = sirve ? Check : X;
  return (
    <div>
      <p
        className={cn(
          "inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[14px] font-semibold",
          sirve ? "bg-vegetal-soft text-vegetal" : "bg-destructive/10 text-destructive",
        )}
      >
        <Icono className="size-4" strokeWidth={2.5} aria-hidden />
        {sirve ? "Sí sirven" : "No sirven"}
      </p>
      <ul className="mt-5 grid gap-5 md:grid-cols-2 lg:gap-8">
        {items.map((x) => (
          <li
            key={x.id}
            className={cn(
              "flex flex-col overflow-hidden rounded-lg border bg-surface",
              sirve ? "border-vegetal/30" : "border-destructive/25",
            )}
          >
            <div className={cn("grid gap-px bg-border", x.fotos.length > 1 && "grid-cols-2")}>
              {x.fotos.map((f) => (
                <Foto key={f.src} foto={f} doble={x.fotos.length > 1} />
              ))}
            </div>
            <div className="flex flex-1 flex-col p-5 lg:p-6">
              <h3 className="font-display text-[1.6rem] font-semibold leading-tight">{x.nombre}</h3>
              {x.grupo && <p className="t-eyebrow mt-1 text-subtle">{x.grupo}</p>}
              <p className="t-body mt-3 text-foreground/85">{conCursivas(x.texto)}</p>
              <p className="t-small mt-3 text-subtle">
                <span className="font-semibold text-foreground">Cómo reconocerlo: </span>
                {x.sena}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Foto({ foto, doble }: { foto: FotoInsecto; doble: boolean }) {
  return (
    <figure className="flex flex-col bg-surface">
      <div className={cn("relative w-full bg-white", doble ? "aspect-[4/5] sm:aspect-[4/3]" : "aspect-[4/3]")}>
        <Image
          src={foto.src}
          alt={foto.alt}
          fill
          sizes={doble ? "(max-width: 768px) 50vw, 300px" : "(max-width: 768px) 100vw, 600px"}
          className="object-cover"
          style={foto.encuadre ? { objectPosition: foto.encuadre } : undefined}
        />
      </div>
      {/* Credito obligatorio por la licencia de las fotos de Commons. */}
      <figcaption className="px-5 pt-3 text-[12px] leading-snug text-subtle lg:px-6">
        <span className="font-medium text-foreground/80">{conCursivas(foto.rotulo)}</span>
        {". "}
        {foto.url ? (
          <>
            Imagen de referencia.{" "}
            <a
              href={foto.url}
              target="_blank"
              rel="noreferrer"
              className="underline decoration-border-strong underline-offset-2 hover:text-foreground"
            >
              Foto: {foto.autor}, {foto.licencia}, Wikimedia Commons
            </a>
          </>
        ) : (
          <>Foto: {foto.autor}</>
        )}
      </figcaption>
    </figure>
  );
}
