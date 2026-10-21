import Image from "next/image";
import { Check, X } from "lucide-react";

import { EncabezadoSeccion } from "@/components/ds/encabezado-seccion";
import { CUALES_SIRVEN, type InsectoCria } from "@/lib/content/catalog";
import { conCursivas } from "@/lib/cursivas";
import { cn } from "@/lib/utils";

/**
 * ¿Cuáles sirven para la cría?
 *
 * Dos grupos, uno al lado del otro en pantalla grande y uno debajo del otro
 * en el celular: lo que se puede llevar a la colonia (oliva, con chulo) y lo
 * que no (rojo, con equis). El color nunca va solo: cada grupo lleva tambien
 * su palabra y su icono, para quien no distingue bien los colores.
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
      <div className="mt-10 grid gap-12 lg:grid-cols-2 lg:gap-10">
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
      <ul className="mt-5 flex flex-col gap-4">
        {items.map((x) => (
          <li
            key={x.id}
            // En el celular el dibujo va arriba y a todo el ancho: al lado del
            // texto quedaba diminuto y el texto en una columna angosta.
            className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-5 sm:grid sm:grid-cols-[160px_1fr] sm:gap-6"
          >
            <div className="relative h-32 w-full sm:h-28 sm:self-center">
              <Image
                src={x.imagen}
                alt={x.alt}
                fill
                sizes="(max-width: 640px) 90vw, 160px"
                className="lamina object-contain"
              />
            </div>
            <div className="min-w-0">
              <h3 className="font-display text-[1.45rem] font-semibold leading-tight">{x.nombre}</h3>
              {x.grupo && <p className="t-eyebrow mt-1 text-subtle">{x.grupo}</p>}
              <p className="t-small mt-2 text-foreground/85">{conCursivas(x.texto)}</p>
              <p className="t-small mt-2 text-subtle">
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
