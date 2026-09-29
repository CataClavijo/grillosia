"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Egg,
  Leaf,
  Search,
  ScanSearch,
  Sprout,
  VenusAndMars,
  type LucideIcon,
} from "lucide-react";

import { DatoPendiente } from "@/components/dato-pendiente";
import { InfoTip } from "@/components/info-tip";
import {
  CATALOG_NOTE,
  COMO_CAPTURAR,
  COMO_RECONOCER,
  CRECIMIENTO,
  GRILLO_O_SALTAMONTES,
  IMPORTANCIA,
  MACHO_HEMBRA,
} from "@/lib/content/catalog";
import {
  NIVELES,
  TAXONOMIA,
  nivelConfirmado,
  type RegistroTaxonomico,
} from "@/lib/content/taxonomia";
import { cn } from "@/lib/utils";

/**
 * Las pestañas de "Conozca sus grillos", como en el diseño de referencia.
 *
 * Una pestaña a la vez: en celular evita una página interminable, y cada
 * tema cabe en una pantalla.
 */
type PestanaId =
  | "identificacion"
  | "reconocer"
  | "macho-hembra"
  | "crecimiento"
  | "importancia"
  | "capturar";

const PESTANAS: { id: PestanaId; titulo: string; Icono: LucideIcon }[] = [
  { id: "identificacion", titulo: "Identificación", Icono: ScanSearch },
  { id: "reconocer", titulo: "¿Cómo reconocerlos?", Icono: Search },
  { id: "macho-hembra", titulo: "Macho y hembra", Icono: VenusAndMars },
  { id: "crecimiento", titulo: "Crecimiento", Icono: Egg },
  { id: "importancia", titulo: "Importancia", Icono: Sprout },
  { id: "capturar", titulo: "Cómo capturarlos", Icono: Leaf },
];

export function GrillosPestanas() {
  const [activa, setActiva] = useState<PestanaId>("identificacion");

  return (
    <div>
      <div
        role="tablist"
        aria-label="Temas sobre los grillos"
        className="-mx-5 flex gap-1 overflow-x-auto border-b px-5 lg:mx-0 lg:px-0"
      >
        {PESTANAS.map(({ id, titulo, Icono }) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`tab-${id}`}
            aria-selected={activa === id}
            aria-controls={`panel-${id}`}
            onClick={() => setActiva(id)}
            className={cn(
              "relative flex min-h-12 shrink-0 items-center gap-2 px-3 text-[15px] font-medium text-foreground/70 transition-colors hover:text-foreground",
              activa === id &&
                "text-foreground after:absolute after:inset-x-2 after:-bottom-px after:h-[2px] after:rounded-full after:bg-primary",
            )}
          >
            <Icono className="size-4" strokeWidth={1.6} aria-hidden />
            {titulo}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`panel-${activa}`}
        aria-labelledby={`tab-${activa}`}
        className="pt-7"
      >
        {activa === "identificacion" && <Identificacion />}
        {activa === "reconocer" && (
          <TextoConLamina
            titulo="¿Cómo reconocer un grillo?"
            lamina="/ilustraciones/identificar.webp"
            laminaAlt="Dibujo a lápiz que compara un grillo, de antenas largas, con un saltamontes, de antenas cortas."
          >
            <ul className="grid gap-4 sm:grid-cols-2">
              {COMO_RECONOCER.map((c) => (
                <li key={c.titulo} className="rounded-xl border bg-card p-4">
                  <p className="font-display text-[1.1rem] font-medium">
                    {c.titulo}
                  </p>
                  <p className="mt-1 text-[14.5px] leading-snug text-foreground/80">
                    {c.texto}
                  </p>
                </li>
              ))}
            </ul>
            <h3 className="mt-7 font-display text-[1.25rem] font-medium">
              ¿Grillo o saltamontes?
            </h3>
            {GRILLO_O_SALTAMONTES.map((t) => (
              <p key={t} className="mt-2 text-[15.5px] leading-relaxed text-foreground/85">
                {t}
              </p>
            ))}
          </TextoConLamina>
        )}
        {activa === "macho-hembra" && (
          <TextoConLamina
            titulo="¿Cuál es hembra y cuál es macho?"
            lamina="/ilustraciones/macho-hembra.webp"
            laminaAlt="Dibujo a lápiz de un grillo macho y una grillo hembra; la hembra lleva atrás una aguja larga."
          >
            {MACHO_HEMBRA.map((t) => (
              <p key={t} className="mt-2 first:mt-0 text-[15.5px] leading-relaxed text-foreground/85">
                {t}
              </p>
            ))}
          </TextoConLamina>
        )}
        {activa === "crecimiento" && (
          <TextoConLamina
            titulo="Cómo crecen"
            lamina="/ilustraciones/ciclo.webp"
            laminaAlt="Dibujo a lápiz del ciclo de vida del grillo: huevo, ninfa sin alas y adulto con alas."
          >
            <ol className="flex flex-col gap-3">
              {CRECIMIENTO.map((t, i) => (
                <li key={t} className="flex gap-3 text-[15.5px] leading-relaxed text-foreground/85">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border text-[12px] font-semibold text-foreground/70">
                    {i + 1}
                  </span>
                  <span>{t}</span>
                </li>
              ))}
            </ol>
            <div className="mt-6 rounded-xl border bg-card p-4">
              <p className="text-[14.5px] font-semibold">
                ¿Cuántos días tardan en crecer?
              </p>
              <DatoPendiente
                className="mt-1"
                motivo="Es parte de lo que se está midiendo en los ensayos de cría."
              />
            </div>
          </TextoConLamina>
        )}
        {activa === "importancia" && (
          <div className="max-w-[68ch]">
            <h3 className="font-display text-[1.5rem] font-medium">
              ¿Por qué son importantes?
            </h3>
            <ul className="mt-4 flex flex-col gap-3">
              {IMPORTANCIA.map((t, i) => (
                <li
                  key={t}
                  className="border-b pb-3 text-[15.5px] leading-relaxed text-foreground/85 last:border-b-0"
                >
                  {t}
                  {i === IMPORTANCIA.length - 1 && (
                    <>
                      {" "}
                      <InfoTip termino="materiaSeca" />
                      <InfoTip termino="analisisBromatologico" />
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
        {activa === "capturar" && (
          <TextoConLamina
            titulo="Dónde buscarlos y cómo capturarlos"
            lamina="/ilustraciones/donde-buscar.webp"
            laminaAlt="Dibujo a lápiz de hojarasca, piedras y pastos al pie de un muro, donde se esconden los grillos."
          >
            <ul className="flex flex-col gap-2.5">
              {COMO_CAPTURAR.map((t) => (
                <li key={t} className="border-b pb-2.5 text-[15.5px] leading-relaxed text-foreground/85 last:border-b-0">
                  {t}
                </li>
              ))}
            </ul>
          </TextoConLamina>
        )}
      </div>
    </div>
  );
}

/** Texto a la izquierda y una lámina pequeña a la derecha. */
function TextoConLamina({
  titulo,
  lamina,
  laminaAlt,
  children,
}: {
  titulo: string;
  lamina: string;
  laminaAlt: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px] lg:gap-12">
      <div>
        <h3 className="mb-4 font-display text-[1.5rem] font-medium">{titulo}</h3>
        {children}
      </div>
      <Image
        src={lamina}
        alt={laminaAlt}
        width={900}
        height={600}
        sizes="(max-width: 1024px) 80vw, 340px"
        className="lamina mx-auto h-auto w-full max-w-[340px] self-start"
      />
    </div>
  );
}

/** Fichas de identificación: solo hasta el nivel confirmado. */
function Identificacion() {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,560px)_1fr] lg:gap-10">
      <ul className="flex flex-col gap-4">
        {TAXONOMIA.map((r) => (
          <FichaTaxonomica key={r.id} registro={r} />
        ))}
      </ul>
      <div className="flex flex-col gap-3">
        <h3 className="font-display text-[1.35rem] font-medium">
          Identificación en curso
        </h3>
        <p className="text-[15.5px] leading-relaxed text-foreground/85">
          {CATALOG_NOTE}
        </p>
        <p className="text-[14px] leading-relaxed text-muted-foreground">
          Mostramos cada grillo solo hasta el nivel que ya está confirmado:
          familia, género o especie. Preferimos un dato pendiente a un nombre
          equivocado.
        </p>
      </div>
    </div>
  );
}

function FichaTaxonomica({ registro: r }: { registro: RegistroTaxonomico }) {
  const valor = { familia: r.familia, genero: r.genero, especie: r.especie };
  return (
    <li className="flex gap-4 rounded-xl border bg-card p-4 sm:p-5">
      {r.fotos[0] && (
        <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-background sm:size-28">
          <Image
            src={r.fotos[0]}
            alt=""
            aria-hidden
            width={220}
            height={165}
            className="h-full w-full object-contain p-1.5 mix-blend-multiply brightness-[1.07] dark:mix-blend-normal dark:brightness-100"
          />
        </div>
      )}
      <div className="min-w-0 flex-1">
        {r.nombreComun && (
          <p className="font-display text-[1.2rem] font-medium leading-tight">
            {r.nombreComun}
          </p>
        )}
        <span
          className={cn(
            "mt-1.5 inline-block rounded-full px-2.5 py-0.5 text-[12.5px] font-semibold",
            r.estado === "confirmado"
              ? "bg-primary/10 text-primary"
              : "bg-muted text-foreground/70",
          )}
        >
          {r.estado === "confirmado"
            ? "Identificación confirmada"
            : `Confirmado hasta ${NIVELES.find((n) => n.id === r.nivelConfirmado)?.etiqueta.toLowerCase()}`}
        </span>
        <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[14.5px]">
          {NIVELES.map((n) => (
            <div key={n.id} className="contents">
              <dt className="text-muted-foreground">{n.etiqueta}</dt>
              <dd>
                {nivelConfirmado(r, n.id) && valor[n.id] ? (
                  <span
                    className={cn(
                      "font-semibold",
                      // En nomenclatura, solo género y especie van en cursiva.
                      n.id !== "familia" && "italic",
                    )}
                  >
                    {valor[n.id]}
                  </span>
                ) : (
                  <DatoPendiente
                    compacto
                    motivo={
                      n.id === "especie"
                        ? "Se mostrará cuando la identificación esté confirmada."
                        : undefined
                    }
                  />
                )}
              </dd>
            </div>
          ))}
        </dl>
        {r.fuenteIdentificacion && (
          <p className="mt-2 text-[13px] text-muted-foreground">
            Identificación: {r.fuenteIdentificacion}
          </p>
        )}
      </div>
    </li>
  );
}
