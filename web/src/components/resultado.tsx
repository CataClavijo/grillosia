"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, MessageCircle, RotateCcw } from "lucide-react";

import { Analizando } from "@/components/analizando";
import { FuenteCientifica } from "@/components/fuente-cientifica";
import { InfoTip } from "@/components/info-tip";
import { LeyendaOrigenes, OrigenDato } from "@/components/origen-dato";
import { ProteinaEtapa } from "@/components/proteina-etapa";
import { TresComidas } from "@/components/tres-comidas";
import {
  DIETS,
  formatoProteina,
  type AnimalDestino,
  type Etapa,
} from "@/lib/animals";
import type { TerminoId } from "@/lib/content/glosario";
import { usePrediccion, type ResultadoDieta } from "@/lib/prediccion";
import { cn } from "@/lib/utils";

/**
 * La parada 4: el resultado.
 *
 * Conserva la organizacion de los disenos de referencia —lo principal
 * arriba, la comparacion de las tres comidas, por que, los ingredientes, el
 * asistente y la nueva consulta— pero cada cifra dice de donde sale:
 *
 *  - Lo que su animal necesita: valor de referencia cientifica (o pendiente).
 *  - La proteina y los lipidos de la harina: prediccion del modelo.
 *  - Conversion alimenticia y biomasa: todavia no se miden; se dice asi, sin
 *    poner un numero para que la tabla se vea llena.
 *
 * REGLA DURA: mientras el modelo este entrenado con datos simulados NO se
 * ordena ni se destaca ninguna comida. En ese conjunto el orden lo fijo una
 * constante del generador, no un hallazgo; senalar una "recomendada" seria
 * inventar un resultado. Solo con datos reales y con un requerimiento con
 * fuente aparece una "recomendacion orientativa", y aun asi en "le
 * sugerimos".
 */

const DIBUJO: Record<string, string> = {
  D1: "/figuras/lapiz/ing-bore.webp",
  D2: "/figuras/lapiz/ing-boton-oro.webp",
  D3: "/figuras/lapiz/ing-salvado.webp",
};

/** Cuanto se aleja una proteina del rango que el animal necesita. */
function distancia(proteina: number, min: number, max: number): number {
  if (proteina < min) return min - proteina;
  if (proteina > max) return proteina - max;
  return 0;
}

export function Resultado({
  animal,
  etapa,
  temp,
  humidity,
  onCambiar,
  onNueva,
}: {
  animal: AnimalDestino;
  etapa: Etapa;
  temp: number;
  humidity: number;
  onCambiar: () => void;
  onNueva: () => void;
}) {
  const prediccion = usePrediccion({ temperatura: temp, humedad: humidity });
  const listo = prediccion.estado === "listo";
  const simulado = listo && prediccion.modelo.datos_simulados;

  // Siempre en el orden D1, D2, D3: el orden de la tabla no dice nada.
  const filas = DIETS.map((d) => ({
    ...d,
    p: listo
      ? prediccion.resultados.find((r) => r.tipo_dieta === d.id)
      : undefined,
  }));

  // Recomendacion orientativa: SOLO con datos reales y requerimiento con fuente.
  const req = etapa.protein;
  const sugerida =
    listo && !simulado && req
      ? [...filas]
          .filter((f) => f.p)
          .sort(
            (a, b) =>
              distancia(a.p!.proteina_harina, req.min, req.max) -
              distancia(b.p!.proteina_harina, req.min, req.max),
          )[0]
      : undefined;

  // ¿Las supervivencias se diferencian de verdad, o caben dentro del margen?
  const vivos = filas
    .map((f) => f.p?.tasa_supervivencia)
    .filter((v): v is number => v != null);
  // Con datos simulados no se saca ninguna conclusion entre comidas, ni
  // siquiera "son iguales": tambien seria leer un hallazgo en numeros de prueba.
  const mismaSupervivencia =
    !simulado &&
    vivos.length > 1 &&
    Math.max(...vivos) - Math.min(...vivos) <= 3;

  const motivos = [
    ...(listo || prediccion.estado === "cargando"
      ? []
      : [
          {
            que: "Proteína, lípidos y supervivencia",
            porque:
              "las calcula el modelo, que en este momento no está disponible.",
          },
        ]),
    {
      que: "Conversión alimenticia",
      porque: "hace falta pesar el alimento que sobra en cada caja de los ensayos.",
    },
    { que: "Biomasa", porque: "se mide al cosechar los grillos." },
  ];

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10">
      <div className="flex min-w-0 flex-col gap-10">
        {/* ── Encabezado ───────────────────────────────────────────── */}
        <header>
          <h1 className="font-display text-[2.2rem] font-medium leading-[1.08] tracking-[-0.01em] lg:text-[2.9rem]">
            Vea su resultado
          </h1>
          <p className="mt-2 flex flex-wrap items-center gap-x-2 text-[15.5px] text-foreground/80">
            <span>
              {animal.name} · {etapa.name} · {temp} °C · {humidity} % de humedad
            </span>
            <button
              type="button"
              onClick={onCambiar}
              className="text-[14.5px] font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              Cambiar respuestas
            </button>
          </p>
        </header>

        {/* ── Lo principal ─────────────────────────────────────────── */}
        <section className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border bg-card/60 p-5">
            <h2 className="flex items-center gap-1 text-[14.5px] font-medium text-muted-foreground">
              Lo que necesita su animal
              <InfoTip termino="requerimientoProteina" />
            </h2>
            <p className="mt-1 text-[14px] text-foreground/80">
              {animal.name} en etapa de {etapa.name.toLowerCase()}
            </p>
            <div className="mt-3">
              <ProteinaEtapa etapa={etapa} grande />
            </div>
            {req && (
              <FuenteCientifica
                ids={req.refs}
                detalle={req.nota}
                className="mt-3"
              />
            )}
          </div>

          <div
            className={cn(
              "rounded-xl border p-5",
              sugerida ? "border-primary/40 bg-primary/5" : "bg-card/60",
            )}
          >
            {sugerida ? (
              <>
                <OrigenDato origen="orientativo" />
                <p className="mt-3 text-[14.5px] text-muted-foreground">
                  Le sugerimos mirar primero
                </p>
                <p className="mt-1 font-display text-[1.9rem] font-medium leading-tight">
                  {sugerida.main}{" "}
                  <span className="text-[1.1rem] text-muted-foreground">
                    ({sugerida.id})
                  </span>
                </p>
                <p className="mt-2 text-[14.5px] leading-relaxed text-foreground/80">
                  Es la comida con la que el modelo predice una harina más
                  cercana a lo que su animal necesita. Es una orientación: la
                  decisión es suya.
                </p>
              </>
            ) : (
              <>
                <h2 className="text-[14.5px] font-medium text-muted-foreground">
                  ¿Cuál comida le conviene?
                </h2>
                <p className="mt-2 font-display text-[1.6rem] font-medium leading-tight">
                  Todavía no se lo podemos decir
                </p>
                <p className="mt-2 text-[14.5px] leading-relaxed text-foreground/80">
                  {simulado
                    ? "Los números de abajo son de prueba, mientras llegan los análisis del laboratorio. Sirven para ver cómo funcionará la plataforma, no para escoger qué comida comprar."
                    : !req
                      ? "Nos falta cargar la referencia científica de lo que su animal necesita en esta etapa, y sin ella no hay contra qué comparar."
                      : "Cuando el laboratorio termine de analizar la harina de los ensayos, aquí verá cuál de las tres se acerca más a lo que su animal necesita."}
                </p>
              </>
            )}
          </div>
        </section>

        {/* ── Comparacion de las tres comidas ──────────────────────── */}
        <section>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-[1.8rem] font-medium leading-tight">
                Comparación de las tres comidas
              </h2>
              <p className="mt-1 text-[14.5px] text-muted-foreground">
                Qué harina daría cada comida con sus condiciones de cría.
              </p>
            </div>
            <OrigenDato origen="modelo" />
          </div>

          {prediccion.estado === "cargando" && (
            <Analizando etiqueta="El modelo está evaluando sus condiciones" />
          )}

          {simulado && (
            <p className="mt-4 rounded-lg border border-demo-border bg-demo-bg px-4 py-3 text-[14.5px] leading-relaxed text-demo-foreground">
              <strong>Números de prueba.</strong> El modelo todavía aprende con
              datos simulados mientras llegan los análisis del laboratorio. Por
              eso no ordenamos las comidas ni señalamos una.
            </p>
          )}

          {(prediccion.estado === "sin-servicio" ||
            prediccion.estado === "sin-modelo" ||
            prediccion.estado === "error") && (
            <p className="mt-4 border-l-2 border-demo-border pl-3 text-[14px] leading-relaxed text-muted-foreground">
              {prediccion.estado === "error"
                ? "No pudimos comunicarnos con el modelo. Revise su conexión e intente de nuevo más tarde."
                : "Los grillos de los ensayos siguen creciendo. Cuando se cosechen, el laboratorio mide cuánta proteína quedó en la harina de cada comida, y con eso el modelo podrá predecir."}
            </p>
          )}

          <TablaComidas
            filas={filas}
            sugeridaId={sugerida?.id}
            motivos={motivos}
          />

          {mismaSupervivencia && (
            <p className="mt-2 text-[13.5px] text-muted-foreground">
              Entre las tres no hay diferencia apreciable en cuántos grillos
              llegan vivos.
            </p>
          )}
        </section>

        {/* ── Por que / como leerlo ────────────────────────────────── */}
        <section className="rounded-xl border bg-card/60 p-5 sm:p-6">
          <h2 className="font-display text-[1.6rem] font-medium leading-tight">
            {sugerida ? "¿Por qué esta sugerencia?" : "Cómo leer este resultado"}
          </h2>
          <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-[15px] leading-relaxed text-foreground/85 marker:text-primary">
            {sugerida && req && (
              <li>
                Su animal necesita {formatoProteina(req)} de proteína, y la
                harina que el modelo predice con {sugerida.main.toLowerCase()}{" "}
                es la que más se acerca.
              </li>
            )}
            <li>
              La proteína de la harina es la que tendría la harina de grillo,
              medida en base seca
              <InfoTip termino="materiaSeca" className="ml-0.5" />, no la del
              alimento final de su animal.
            </li>
            <li>
              Si la harina tiene más proteína de la que su animal necesita, no
              se desperdicia: se mezcla con otros ingredientes para bajarla al
              punto.
            </li>
            <li>
              Lo que aparece como pendiente todavía no se ha medido. Preferimos
              dejar el espacio vacío a poner un número inventado.
            </li>
          </ul>
          <LeyendaOrigenes
            origenes={["literatura", "modelo", "experimental", "orientativo"]}
            className="mt-5 border-t pt-4"
          />
        </section>

        {/* ── Ingredientes ─────────────────────────────────────────── */}
        <TresComidas />
      </div>

      {/* ── Columna lateral: asistente y nueva consulta ─────────────── */}
      <aside className="flex flex-col gap-5 lg:sticky lg:top-24 lg:self-start">
        <section className="rounded-xl border bg-card/60 p-5">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <MessageCircle className="size-5" aria-hidden />
            </span>
            <h2 className="font-display text-[1.4rem] font-medium leading-tight">
              Asistente de GrillosIA
            </h2>
          </div>
          <p className="mt-3 text-[14.5px] leading-relaxed text-foreground/80">
            Pregúntele sobre este resultado, con sus palabras o con la voz. Por
            ejemplo:
          </p>
          <ul className="mt-2 flex flex-col gap-1.5 text-[14px] text-foreground/80">
            <li className="rounded-md border bg-background px-3 py-2">
              ¿Qué significa la conversión alimenticia?
            </li>
            <li className="rounded-md border bg-background px-3 py-2">
              ¿Cómo mezclo la harina con otros ingredientes?
            </li>
            <li className="rounded-md border bg-background px-3 py-2">
              ¿Qué pasa si la humedad sube?
            </li>
          </ul>
          <Link
            href="/chat"
            className="mt-4 flex min-h-12 items-center justify-center gap-2 rounded-md bg-primary px-4 text-[15.5px] font-semibold text-primary-foreground transition-opacity hover:opacity-92"
          >
            Hablar con el asistente
            <ArrowRight className="size-4" />
          </Link>
        </section>

        <section className="rounded-xl border bg-card/60 p-5">
          <h2 className="font-display text-[1.4rem] font-medium leading-tight">
            ¿Otro animal u otras condiciones?
          </h2>
          <button
            type="button"
            onClick={onNueva}
            className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-md border px-4 text-[15px] font-semibold transition-colors hover:bg-muted"
          >
            <RotateCcw className="size-4" aria-hidden />
            Nueva consulta
          </button>
          <Link
            href="/consultas"
            className="mt-2 flex min-h-11 items-center justify-center text-[14.5px] font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            Ver mis consultas guardadas
          </Link>
        </section>
      </aside>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */

type Fila = (typeof DIETS)[number] & { p?: ResultadoDieta };

interface Columna {
  titulo: string;
  termino?: TerminoId;
  valor: (f: Fila) => React.ReactNode;
}

/**
 * Celda de un dato que todavia no existe.
 *
 * Corta a proposito: la tabla tiene quince celdas, y repetir en cada una el
 * motivo completo la volvia ilegible. El porque va una sola vez, debajo de la
 * tabla (ver `motivos`).
 */
function Pendiente() {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-[13px] text-muted-foreground">
      <Clock className="size-3.5 shrink-0" aria-hidden />
      Pendiente
    </span>
  );
}

const COLUMNAS: Columna[] = [
  {
    titulo: "Proteína de la harina",
    termino: "proteinaBruta",
    valor: (f) =>
      f.p ? (
        <Cifra valor={f.p.proteina_harina} margen={f.p.margen_proteina} />
      ) : (
        <Pendiente />
      ),
  },
  {
    titulo: "Lípidos",
    termino: "lipidos",
    valor: (f) =>
      f.p ? (
        <Cifra valor={f.p.lipidos_harina} margen={f.p.margen_lipidos} />
      ) : (
        <Pendiente />
      ),
  },
  {
    titulo: "Supervivencia",
    termino: "supervivencia",
    valor: (f) =>
      f.p?.tasa_supervivencia != null ? (
        <span className="font-display text-[1.25rem] font-medium tabular-nums">
          ~{numeroES(f.p.tasa_supervivencia)} %
        </span>
      ) : (
        <Pendiente />
      ),
  },
  {
    titulo: "Conversión alimenticia",
    termino: "conversion",
    valor: () => <Pendiente />,
  },
  {
    titulo: "Biomasa",
    termino: "biomasa",
    valor: () => <Pendiente />,
  },
];

/** Numero con coma decimal, como se escribe en Colombia. */
function numeroES(n: number): string {
  return n.toLocaleString("es-CO", { maximumFractionDigits: 1 });
}

function Cifra({ valor, margen }: { valor: number; margen: number }) {
  return (
    <span className="flex flex-col">
      <span className="font-display text-[1.35rem] font-medium leading-none tabular-nums text-primary">
        {numeroES(valor)} %
      </span>
      <span className="mt-1 text-[12.5px] text-muted-foreground">
        ± {numeroES(margen)}
        <InfoTip termino="margen" className="ml-0.5" />
      </span>
    </span>
  );
}

function TablaComidas({
  filas,
  sugeridaId,
  motivos,
}: {
  filas: Fila[];
  sugeridaId?: string;
  /** Por que falta cada dato, dicho una sola vez. */
  motivos: Array<{ que: string; porque: string }>;
}) {
  return (
    <>
      {/* Escritorio ancho: tabla. Solo desde xl: por debajo, seis columnas no
          caben junto al panel lateral y la tabla se montaba encima de el.
          Sin overflow-hidden: recortaria las ventanitas de las InfoTip. */}
      <div className="mt-5 hidden rounded-xl border xl:block">
        <table className="w-full table-fixed text-left">
          <colgroup>
            <col className="w-[27%]" />
            {COLUMNAS.map((c) => (
              <col key={c.titulo} />
            ))}
          </colgroup>
          <thead className="text-[13px] text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Comida</th>
              {COLUMNAS.map((c) => (
                <th key={c.titulo} className="px-2.5 py-3 align-top font-medium leading-snug">
                  <span className="inline-flex items-center gap-0.5">
                    {c.titulo}
                    {c.termino && <InfoTip termino={c.termino} />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {filas.map((f) => (
              <tr
                key={f.id}
                className={cn(
                  "align-top",
                  f.id === sugeridaId && "bg-primary/5",
                )}
              >
                <td className="px-4 py-4">
                  <span className="flex items-center gap-3">
                    <Image
                      src={DIBUJO[f.id]}
                      alt=""
                      width={120}
                      height={90}
                      aria-hidden
                      className="lamina h-10 w-12 shrink-0 object-contain"
                    />
                    <span>
                      <span className="block text-[15px] font-semibold leading-tight">
                        {f.main}
                      </span>
                      <span className="text-[12.5px] text-muted-foreground">
                        {f.id}
                      </span>
                    </span>
                  </span>
                </td>
                {COLUMNAS.map((c) => (
                  <td key={c.titulo} className="px-2.5 py-4">
                    {c.valor(f)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Celular, tableta y pantallas medianas: una tarjeta por comida. */}
      <ul className="mt-5 grid gap-3 md:grid-cols-3 xl:hidden">
        {filas.map((f) => (
          <li
            key={f.id}
            className={cn(
              "rounded-xl border bg-card/60 p-4",
              f.id === sugeridaId && "border-primary/40 bg-primary/5",
            )}
          >
            <div className="flex items-center gap-3">
              <Image
                src={DIBUJO[f.id]}
                alt=""
                width={120}
                height={90}
                aria-hidden
                className="lamina h-11 w-14 shrink-0 object-contain"
              />
              <span>
                <span className="block text-[12.5px] font-semibold text-primary">
                  {f.id}
                </span>
                <span className="block font-display text-[1.3rem] font-medium leading-tight">
                  {f.main}
                </span>
              </span>
            </div>
            <dl className="mt-3 divide-y border-t">
              {COLUMNAS.map((c) => (
                <div
                  key={c.titulo}
                  className="flex items-start justify-between gap-4 py-2.5"
                >
                  <dt className="flex min-w-0 items-center gap-0.5 text-[14px] text-muted-foreground">
                    {c.titulo}
                    {c.termino && <InfoTip termino={c.termino} />}
                  </dt>
                  <dd className="shrink-0 text-right">{c.valor(f)}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>

      {motivos.length > 0 && (
        <div className="mt-3 flex flex-col gap-1 text-[13.5px] leading-snug text-muted-foreground">
          <p className="font-semibold text-foreground/80">
            Por qué faltan algunos datos
          </p>
          <ul className="flex flex-col gap-0.5">
            {motivos.map((m) => (
              <li key={m.que}>
                <span className="font-medium text-foreground/80">{m.que}:</span>{" "}
                {m.porque}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
