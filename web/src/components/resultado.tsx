"use client";

import Image from "next/image";
import {
  Clock,
  Compass,
  Droplets,
  FlaskConical,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  Thermometer,
} from "lucide-react";

import { Analizando } from "@/components/analizando";
import { Estado, EsqueletoFilas } from "@/components/ds/estado";
import { Revelar } from "@/components/ds/revelar";
import { FuenteCientifica } from "@/components/fuente-cientifica";
import { InfoTip } from "@/components/info-tip";
import { LeyendaOrigenes, OrigenDato } from "@/components/origen-dato";
import { ProteinaEtapa } from "@/components/proteina-etapa";
import { TresComidas } from "@/components/tres-comidas";
import { Button } from "@/components/ui/button";
import {
  DIETS,
  categoriaPorId,
  formatoProteina,
  type AnimalDestino,
  type Etapa,
} from "@/lib/animals";
import { abrirAsistente } from "@/lib/asistente";
import { usePrediccion, type ResultadoDieta } from "@/lib/prediccion";
import { cn } from "@/lib/utils";

/**
 * La parada 4: el resultado, como un tablero cientifico limpio.
 *
 * Orden de lectura (de lo que el productor ya sabe a lo que viene a saber):
 *   1. Que consulto: animal y etapa.
 *   2. Lo que su animal necesita (referencia cientifica) y sus condiciones.
 *   3. Que harina daria cada comida (prediccion del modelo).
 *   4. Como leerlo, y la sugerencia si la hay.
 *   5. Las tres comidas en estudio.
 *   6. Preguntarle al asistente.
 *
 * Cada cifra dice de donde sale (ver `OrigenDato`). Lo que todavia no existe
 * no se rellena: se dice una vez, con su motivo.
 *
 * REGLA DURA: mientras el modelo este entrenado con datos simulados NO se
 * ordena ni se destaca ninguna comida. En ese conjunto el orden lo fijo una
 * constante del generador, no un hallazgo; senalar una "recomendada" seria
 * inventar un resultado. Solo con datos reales y con un requerimiento con
 * fuente aparece una "recomendacion orientativa", y aun asi en "le
 * sugerimos".
 */

const DIBUJO: Record<string, string> = {
  D1: "/ilustraciones/ing-bore.webp",
  D2: "/ilustraciones/ing-boton-oro.webp",
  D3: "/ilustraciones/ing-salvado.webp",
};

/** Preguntas que abren el asistente ya escritas. */
const PREGUNTAS = [
  "¿Qué significa la conversión alimenticia?",
  "¿Cómo mezclo la harina con otros ingredientes?",
  "¿Qué pasa si la humedad sube?",
];

/** Cuanto se aleja una proteina del rango que el animal necesita. */
function distancia(proteina: number, min: number, max: number): number {
  if (proteina < min) return min - proteina;
  if (proteina > max) return proteina - max;
  return 0;
}

/** Numero con coma decimal, como se escribe en Colombia. */
function numeroES(n: number): string {
  return n.toLocaleString("es-CO", { maximumFractionDigits: 1 });
}

export function Resultado({
  animal,
  etapa,
  temp,
  humidity,
  onCambiar,
  onNueva,
  onReintentar,
}: {
  animal: AnimalDestino;
  etapa: Etapa;
  temp: number;
  humidity: number;
  onCambiar: () => void;
  onNueva: () => void;
  /** Vuelve a consultar el modelo tras un error. */
  onReintentar: () => void;
}) {
  const prediccion = usePrediccion({ temperatura: temp, humedad: humidity });
  const listo = prediccion.estado === "listo";
  const simulado = listo && prediccion.modelo.datos_simulados;
  const categoria = categoriaPorId(animal.category);

  // Siempre en el orden D1, D2, D3: el orden de la tabla no dice nada.
  const filas: Fila[] = DIETS.map((d) => ({
    ...d,
    p: listo ? prediccion.resultados.find((r) => r.tipo_dieta === d.id) : undefined,
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
  // Con datos simulados no se saca ninguna conclusion entre comidas, ni
  // siquiera "son iguales": tambien seria leer un hallazgo en numeros de prueba.
  const vivos = filas
    .map((f) => f.p?.tasa_supervivencia)
    .filter((v): v is number => v != null);
  const mismaSupervivencia =
    !simulado && vivos.length > 1 && Math.max(...vivos) - Math.min(...vivos) <= 3;

  const sinConexion =
    prediccion.estado === "error" &&
    typeof navigator !== "undefined" &&
    navigator.onLine === false;

  const porQueNoHaySugerencia = simulado
    ? "Los números de la comparación son de prueba, mientras llegan los análisis del laboratorio. Sirven para ver cómo funcionará la plataforma, no para escoger qué comida comprar."
    : !req
      ? "Nos falta la referencia científica de lo que su animal necesita en esta etapa, y sin ella no hay contra qué comparar."
      : "Cuando el laboratorio termine de analizar la harina de los ensayos, aquí verá cuál de las tres se acerca más a lo que su animal necesita.";

  return (
    <div className="flex flex-col gap-16 lg:gap-20">
      {/* ── 1. Que se consulto ─────────────────────────────────────── */}
      <Revelar className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
        <div>
          <p className="t-eyebrow text-subtle">
            Resultado de su consulta{categoria ? ` · ${categoria.name}` : ""}
          </p>
          <h1 className="t-h1 mt-3 text-balance">
            {animal.name}
            <span className="text-subtle">
              <span className="hidden sm:inline"> · </span>
              <span className="block sm:inline">{etapa.name}</span>
            </span>
          </h1>
          <p className="t-lead mt-3">
            Lo que su animal necesita y qué harina daría cada una de las tres
            comidas en estudio, con sus condiciones de cría.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-x-2 gap-y-1">
          <Button variant="outline" size="sm" onClick={onCambiar}>
            <SlidersHorizontal />
            Cambiar respuestas
          </Button>
          <Button variant="ghost" size="sm" onClick={onNueva}>
            <RotateCcw />
            Nueva consulta
          </Button>
        </div>
      </Revelar>

      {/* ── 2. Lo que necesita y sus condiciones ──────────────────── */}
      <section
        aria-label="Necesidad de proteína y condiciones de cría"
        className="-mt-4 grid gap-8 rounded-lg bg-surface-2 p-6 sm:grid-cols-2 sm:p-8 lg:-mt-6 lg:grid-cols-[1.6fr_1fr_1fr] lg:gap-10"
      >
        <Revelar className="flex flex-col gap-3 sm:col-span-2 lg:col-span-1">
          <h2 className="flex items-center text-[14px] font-medium text-subtle">
            Proteína que necesita su animal
            <InfoTip termino="requerimientoProteina" className="ml-0.5" />
          </h2>
          <ProteinaEtapa etapa={etapa} grande />
          {req && (
            <FuenteCientifica ids={req.refs} detalle={req.nota} className="-mt-1" />
          )}
        </Revelar>
        <Indicador
          Icono={Thermometer}
          rotulo="Temperatura"
          valor={temp}
          unidad="°C"
          nota="La que usted indicó para la cría."
          retraso={80}
        />
        <Indicador
          Icono={Droplets}
          rotulo="Humedad relativa"
          valor={humidity}
          unidad="% HR"
          nota="La que usted indicó para la cría."
          retraso={160}
        />
      </section>

      {/* ── 3. Que harina daria cada comida ────────────────────────── */}
      <Revelar as="section" retraso={120}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="t-eyebrow text-subtle">Comparación</p>
            <h2 id="comparacion" className="t-h2 mt-3">
              Qué harina daría cada comida
            </h2>
          </div>
          {listo && <OrigenDato origen="modelo" />}
        </div>

        <div className="mt-8">
          {prediccion.estado === "cargando" && (
            <div className="flex flex-col gap-6">
              <Analizando etiqueta="El modelo está evaluando sus condiciones" />
              <EsqueletoFilas filas={3} />
            </div>
          )}

          {prediccion.estado === "error" && (
            <Estado
              tipo={sinConexion ? "sin-conexion" : "sin-modelo"}
              titulo={
                sinConexion ? "Sin conexión a internet" : "No pudimos consultar el modelo"
              }
              accion={
                <Button variant="outline" size="sm" onClick={onReintentar}>
                  <RotateCcw />
                  Intentar de nuevo
                </Button>
              }
            >
              {sinConexion
                ? "Cuando vuelva la señal, inténtelo de nuevo. Sus datos siguen guardados en este dispositivo."
                : "No pudimos consultar el modelo en este momento. Sus datos siguen guardados. Inténtelo nuevamente."}
            </Estado>
          )}

          {(prediccion.estado === "sin-modelo" ||
            prediccion.estado === "sin-servicio") && (
            <Estado tipo="pendiente" titulo="Predicciones pendientes">
              Los grillos de los ensayos siguen creciendo. Cuando el laboratorio
              analice su harina, el modelo podrá predecir qué da cada comida.
              Más abajo puede ver las tres comidas en estudio.
            </Estado>
          )}

          {listo && (
            <>
              {simulado && (
                <p className="mb-6 flex items-start gap-3 rounded-lg bg-warning-soft px-4 py-3.5 text-[14.5px] leading-relaxed text-foreground/85">
                  <FlaskConical
                    className="mt-[3px] size-4 shrink-0 text-warning"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                  <span>
                    <strong className="font-semibold text-warning">Números de prueba.</strong>{" "}
                    El modelo todavía aprende con datos simulados mientras llegan
                    los análisis del laboratorio. Por eso no ordenamos las comidas
                    ni señalamos una.
                  </span>
                </p>
              )}

              <TablaComidas filas={filas} sugeridaId={sugerida?.id} />

              <p className="mt-5 flex items-start gap-2 text-[13.5px] leading-relaxed text-subtle">
                <Clock className="mt-[3px] size-3.5 shrink-0 text-faint" aria-hidden />
                <span>
                  Aún no disponibles: la{" "}
                  <span className="inline-flex items-center whitespace-nowrap font-medium text-foreground/80">
                    conversión alimenticia
                    <InfoTip termino="conversion" />
                  </span>
                  , porque hace falta pesar el alimento que sobra en cada caja, y
                  la{" "}
                  <span className="inline-flex items-center whitespace-nowrap font-medium text-foreground/80">
                    biomasa
                    <InfoTip termino="biomasa" />
                  </span>
                  , que se mide al cosechar.
                </span>
              </p>
              {mismaSupervivencia && (
                <p className="mt-2 pl-[22px] text-[13.5px] leading-relaxed text-subtle">
                  Entre las tres no hay diferencia apreciable en cuántos grillos
                  llegan vivos.
                </p>
              )}
            </>
          )}
        </div>
      </Revelar>

      {/* ── 4. Interpretacion ──────────────────────────────────────── */}
      <Revelar
        as="section"
        className="grid gap-12 lg:grid-cols-2 lg:gap-16"
      >
        <div>
          <p className="t-eyebrow text-subtle">Interpretación</p>
          {sugerida && req ? (
            <>
              <OrigenDato origen="orientativo" className="mt-4" />
              <h2 id="interpretacion" className="t-h2 mt-3 text-balance">
                Le sugerimos mirar primero la comida {sugerida.id}:{" "}
                {sugerida.main.toLowerCase()}
              </h2>
              <p className="t-body mt-3 text-subtle">
                Su animal necesita {formatoProteina(req)} de proteína, y la harina
                que el modelo predice con esta comida es la que más se acerca. Es
                una orientación: la decisión es suya.
              </p>
            </>
          ) : (
            <>
              <h2 id="interpretacion" className="t-h2 mt-3 text-balance">
                Todavía no le podemos sugerir una comida
              </h2>
              <p className="t-body mt-3 text-subtle">{porQueNoHaySugerencia}</p>
            </>
          )}
        </div>

        <div className="lg:pt-8">
          <h3 className="t-h4">Cómo leer este resultado</h3>
          <ol className="mt-4 flex flex-col gap-4">
            {[
              <>
                La proteína de la tabla es la que tendría la harina de grillo,
                medida en base seca
                <InfoTip termino="materiaSeca" className="ml-0.5" />, no la del
                alimento final de su animal.
              </>,
              "Si la harina tiene más proteína de la que su animal necesita, no se desperdicia: se mezcla con otros ingredientes para bajarla al punto.",
              "Lo que aparece como pendiente todavía no se ha medido. Preferimos dejar el espacio vacío a poner un número inventado.",
            ].map((texto, i) => (
              <li key={i} className="grid grid-cols-[28px_1fr] text-[15px] leading-relaxed">
                <span className="t-eyebrow pt-[5px] text-faint">0{i + 1}</span>
                <span className="text-foreground/85">{texto}</span>
              </li>
            ))}
          </ol>

          <details className="group mt-8">
            <summary className="inline-flex min-h-10 list-none items-center gap-2 text-[14px] font-medium text-subtle underline decoration-border-strong underline-offset-4 transition-colors hover:text-foreground [&::-webkit-details-marker]:hidden">
              ¿De dónde sale cada dato?
            </summary>
            <LeyendaOrigenes
              origenes={["literatura", "modelo", "experimental", "orientativo"]}
              className="mt-5"
            />
          </details>
        </div>
      </Revelar>

      {/* ── 5. Las tres comidas ────────────────────────────────────── */}
      <Revelar>
        <TresComidas />
      </Revelar>

      {/* ── 6. Preguntas sugeridas ─────────────────────────────────── */}
      {/* Discretas a proposito: el asistente ya tiene su boton en la barra de
          abajo. Aqui solo se ofrecen preguntas atadas a este resultado, que
          abren el panel con la pregunta ya escrita. */}
      <Revelar as="section" className="flex flex-col gap-4">
        <p className="t-eyebrow flex items-center gap-2 text-subtle">
          <Sparkles className="size-3.5 text-primary" aria-hidden />
          Pregúntele a GrillosIA sobre este resultado
        </p>
        <ul className="flex flex-col gap-x-8 gap-y-2 sm:flex-row sm:flex-wrap">
          {PREGUNTAS.map((q) => (
            <li key={q}>
              <button
                type="button"
                onClick={() => abrirAsistente({ pregunta: q })}
                className="min-h-10 text-left text-[15px] text-foreground/85 underline decoration-border-strong underline-offset-[5px] transition-colors duration-150 hover:text-foreground hover:decoration-primary"
              >
                {q}
              </button>
            </li>
          ))}
        </ul>
      </Revelar>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */

function Indicador({
  Icono,
  rotulo,
  valor,
  unidad,
  nota,
  retraso = 0,
}: {
  Icono: typeof Thermometer;
  rotulo: string;
  valor: number;
  unidad: string;
  nota: string;
  retraso?: number;
}) {
  return (
    <Revelar retraso={retraso} className="flex flex-col gap-3">
      <h2 className="flex items-center gap-1.5 text-[14px] font-medium text-subtle">
        <Icono className="size-4 text-faint" strokeWidth={1.75} aria-hidden />
        {rotulo}
      </h2>
      <p className="t-cifra text-[3rem] text-foreground sm:text-[3.5rem]">
        {numeroES(valor)}
        <span className="t-unidad">{unidad}</span>
      </p>
      <p className="text-[13px] leading-snug text-subtle">{nota}</p>
    </Revelar>
  );
}

type Fila = (typeof DIETS)[number] & { p?: ResultadoDieta };

/** Una prediccion con su margen, en la misma linea de base. */
function Cifra({ valor, margen }: { valor: number; margen: number }) {
  return (
    <span className="inline-flex items-baseline gap-2 whitespace-nowrap">
      <span className="t-cifra text-[1.75rem] text-foreground">
        {numeroES(valor)}
        <span className="t-unidad">%</span>
      </span>
      <span className="text-[13px] tabular-nums text-subtle">± {numeroES(margen)}</span>
    </span>
  );
}

function Pendiente() {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-[13.5px] text-subtle">
      <Clock className="size-3.5 shrink-0 text-faint" aria-hidden />
      Pendiente
    </span>
  );
}

function Supervivencia({ f }: { f: Fila }) {
  return f.p?.tasa_supervivencia != null ? (
    <span className="t-cifra text-[1.75rem] text-foreground">
      <span className="t-unidad !ml-0 mr-0.5">~</span>
      {numeroES(f.p.tasa_supervivencia)}
      <span className="t-unidad">%</span>
    </span>
  ) : (
    <Pendiente />
  );
}

function EtiquetaSugerida() {
  return (
    <span className="inline-flex items-center gap-1 rounded-sm bg-warning-soft px-1.5 py-0.5 text-[11.5px] font-semibold text-warning">
      <Compass className="size-3" aria-hidden />
      Sugerida
    </span>
  );
}

/**
 * Tabla de predicciones: tres filas, tres medidas. Las lineas que quedan son
 * las de la tabla, que si ayudan a seguir una fila con la vista.
 *
 * En celular cada comida es un bloque con sus tres medidas en fila: una
 * tabla de cuatro columnas no cabe en 390 px sin volverse ilegible.
 */
function TablaComidas({ filas, sugeridaId }: { filas: Fila[]; sugeridaId?: string }) {
  const hProteina = (
    <span className="inline-flex items-center">
      Proteína de la harina
      <InfoTip termino="proteinaBruta" />
    </span>
  );
  const hLipidos = (
    <span className="inline-flex items-center">
      Lípidos
      <InfoTip termino="lipidos" />
    </span>
  );
  const hSuper = (
    <span className="inline-flex items-center">
      Supervivencia
      <InfoTip termino="supervivencia" />
    </span>
  );

  return (
    <>
      {/* Tableta y escritorio */}
      <table className="hidden w-full text-left md:table">
        <caption className="sr-only">
          Predicción del modelo para cada comida, con su margen
        </caption>
        <thead>
          <tr className="border-b border-border-strong text-[13px] text-subtle">
            <th scope="col" className="w-[34%] pb-3 font-medium">
              Comida
            </th>
            <th scope="col" className="pb-3 font-medium">
              {hProteina}
            </th>
            <th scope="col" className="pb-3 font-medium">
              {hLipidos}
            </th>
            <th scope="col" className="pb-3 font-medium">
              {hSuper}
            </th>
          </tr>
        </thead>
        <tbody>
          {filas.map((f, i) => (
            <tr
              key={f.id}
              style={{ animationDelay: `${i * 70}ms` }}
              className={cn(
                "animate-in fade-in-0 slide-in-from-bottom-2 fill-mode-both border-b border-border duration-[350ms] ease-[var(--ease-natural)]",
                f.id === sugeridaId && "bg-primary-soft/40",
              )}
            >
              <th scope="row" className="py-5 pr-4 font-normal">
                <span className="flex items-center gap-4">
                  <Image
                    src={DIBUJO[f.id]}
                    alt=""
                    width={96}
                    height={96}
                    aria-hidden
                    className="lamina size-12 shrink-0 object-contain"
                  />
                  <span className="flex flex-col gap-0.5">
                    <span className="t-eyebrow text-faint">{f.id}</span>
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-[16px] font-semibold">{f.main}</span>
                      {f.id === sugeridaId && <EtiquetaSugerida />}
                    </span>
                  </span>
                </span>
              </th>
              <td className="py-5 pr-4">
                {f.p ? <Cifra valor={f.p.proteina_harina} margen={f.p.margen_proteina} /> : <Pendiente />}
              </td>
              <td className="py-5 pr-4">
                {f.p ? <Cifra valor={f.p.lipidos_harina} margen={f.p.margen_lipidos} /> : <Pendiente />}
              </td>
              <td className="py-5">
                <Supervivencia f={f} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Celular */}
      <ul className="flex flex-col md:hidden">
        {filas.map((f, i) => (
          <li
            key={f.id}
            style={{ animationDelay: `${i * 70}ms` }}
            className={cn(
              "animate-in fade-in-0 slide-in-from-bottom-2 fill-mode-both border-b border-border py-5 duration-[350ms] ease-[var(--ease-natural)] first:border-t first:border-t-border-strong",
              f.id === sugeridaId && "-mx-3 rounded-md border-transparent bg-primary-soft/40 px-3",
            )}
          >
            <div className="flex items-center gap-3">
              <Image
                src={DIBUJO[f.id]}
                alt=""
                width={96}
                height={96}
                aria-hidden
                className="lamina size-11 shrink-0 object-contain"
              />
              <span className="flex flex-col gap-0.5">
                <span className="t-eyebrow text-faint">{f.id}</span>
                <span className="flex flex-wrap items-center gap-2">
                  <span className="text-[16px] font-semibold">{f.main}</span>
                  {f.id === sugeridaId && <EtiquetaSugerida />}
                </span>
              </span>
            </div>
            <dl className="mt-4 grid grid-cols-3 gap-3">
              {[
                { t: "Proteína", v: f.p ? <MiniCifra v={f.p.proteina_harina} m={f.p.margen_proteina} /> : <Pendiente /> },
                { t: "Lípidos", v: f.p ? <MiniCifra v={f.p.lipidos_harina} m={f.p.margen_lipidos} /> : <Pendiente /> },
                {
                  t: "Superviv.",
                  v:
                    f.p?.tasa_supervivencia != null ? (
                      <span className="t-cifra text-[1.4rem]">
                        ~{numeroES(f.p.tasa_supervivencia)}
                        <span className="t-unidad">%</span>
                      </span>
                    ) : (
                      <Pendiente />
                    ),
                },
              ].map((m) => (
                <div key={m.t} className="flex flex-col gap-1">
                  <dt className="text-[12.5px] text-subtle">{m.t}</dt>
                  <dd>{m.v}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
    </>
  );
}

function MiniCifra({ v, m }: { v: number; m: number }) {
  return (
    <span className="flex flex-col">
      <span className="t-cifra text-[1.4rem]">
        {numeroES(v)}
        <span className="t-unidad">%</span>
      </span>
      <span className="text-[12px] tabular-nums text-subtle">± {numeroES(m)}</span>
    </span>
  );
}
