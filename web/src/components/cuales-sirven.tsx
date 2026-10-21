import Image from "next/image";
import { Check, X } from "lucide-react";

import { EncabezadoSeccion } from "@/components/ds/encabezado-seccion";
import {
  CUALES_SIRVEN,
  CUALES_SIRVEN_CREDITOS,
  CUALES_SIRVEN_NOTA,
} from "@/lib/content/catalog";
import { conCursivas } from "@/lib/cursivas";
import { cn } from "@/lib/utils";

/**
 * ¿Cuáles sirven para la cría?
 *
 * Una lámina de guía de campo: los cinco grupos en una fila (dos por fila
 * en el celular), cada insecto recortado sobre el mismo papel y del mismo
 * tamaño, con su veredicto encima. Una frase por tarjeta: lo que hay que
 * mirar. Con fotos grandes en su ambiente y dos parrafos por tarjeta la
 * seccion pesaba mas que el resto de la pagina.
 *
 * El veredicto lleva palabra e icono, no solo color.
 */
export function CualesSirven() {
  return (
    <section aria-labelledby="cuales-sirven">
      <EncabezadoSeccion
        rotulo="Antes de recolectar"
        titulo={<span id="cuales-sirven">¿Cuáles sirven para la cría?</span>}
        entrada="Al salir a buscar va a encontrar varios insectos parecidos. Estos se pueden llevar a la colonia y estos no."
      />

      <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-5 lg:gap-x-5">
        {CUALES_SIRVEN.map((x) => {
          const Icono = x.sirve ? Check : X;
          return (
            <li key={x.id} className="flex flex-col">
              <div className="relative flex aspect-[4/3] items-center justify-center gap-2 rounded-lg bg-surface-2 px-3">
                {x.fotos.map((f) => (
                  <div key={f.src} className="relative h-[62%] flex-1">
                    <Image src={f.src} alt={f.alt} fill sizes="(max-width: 1024px) 45vw, 280px" className="object-contain" />
                  </div>
                ))}
                <span
                  className={cn(
                    "absolute top-2.5 left-2.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[12.5px] font-semibold text-background",
                    x.sirve ? "bg-vegetal" : "bg-destructive",
                  )}
                >
                  <Icono className="size-3.5" strokeWidth={3} aria-hidden />
                  {x.sirve ? "Sirve" : "No sirve"}
                </span>
              </div>
              <h3 className="mt-3 font-display text-[1.3rem] font-semibold leading-tight">{x.nombre}</h3>
              {x.grupo && <p className="t-eyebrow mt-0.5 text-subtle">{x.grupo}</p>}
              <p className="t-small mt-1.5 text-foreground/80">{x.texto}</p>
            </li>
          );
        })}
      </ul>

      <p className="t-small mt-8 text-foreground/80">{conCursivas(CUALES_SIRVEN_NOTA)}</p>
      {/* Credito obligatorio por la licencia de las fotos de Commons; la
          licencia CC BY-SA pide decir que se modificaron (se recortaron). */}
      <p className="mt-2 text-[12px] leading-relaxed text-subtle">
        Fotos recortadas sin su fondo.{" "}
        {CUALES_SIRVEN_CREDITOS.map((c, i) => (
          <span key={c.quien}>
            {c.url ? (
              <a
                href={c.url}
                target="_blank"
                rel="noreferrer"
                className="underline decoration-border-strong underline-offset-2 hover:text-foreground"
              >
                {conCursivas(c.que)}: {c.quien}, {c.licencia}
              </a>
            ) : (
              <>
                {conCursivas(c.que)}: {c.quien}
              </>
            )}
            {i < CUALES_SIRVEN_CREDITOS.length - 1 ? " · " : ". "}
          </span>
        ))}
        Las de Wikimedia Commons son imágenes de referencia, no ejemplares del proyecto.
      </p>
    </section>
  );
}
