"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";

import { Barra } from "@/components/barra";
import { Estado } from "@/components/ds/estado";
import { Revelar } from "@/components/ds/revelar";
import { FuenteCientifica } from "@/components/fuente-cientifica";
import { InfoTip } from "@/components/info-tip";
import { LaminaNormalizada } from "@/components/lamina-normalizada";
import { OrigenDato } from "@/components/origen-dato";
import { BarraAcciones } from "@/components/paso";
import { ProteinaEtapa } from "@/components/proteina-etapa";
import { TresComidas } from "@/components/tres-comidas";
import {
  CATEGORIAS,
  animalPorId,
  animalesDe,
  categoriaPorId,
  etapaPorId,
  type AnimalDestino,
  type Categoria,
  type CategoriaId,
  type Etapa,
} from "@/lib/animals";
import { useProjects } from "@/lib/projects-store";
import { marcarPaso } from "@/lib/journey";
import { cn } from "@/lib/utils";
import {
  clearWizardDraft,
  loadWizardDraft,
  saveWizardDraft,
} from "@/lib/wizard-draft";

/**
 * Parada 3: la consulta.
 *
 * Pregunta en orden de lo general a lo particular, porque lo que su animal
 * necesita cambia en cada nivel:
 *   categoria (peces, aves, cerdos) -> animal -> etapa productiva ->
 *   temperatura -> humedad.
 * Si una categoria tiene un solo animal (cerdos), esa pregunta se salta.
 *
 * Al tocar una opcion se pasa sola a la siguiente pregunta: para quien usa el
 * celular con el pulgar, un toque menos es mucho. El boton "Continuar" de
 * abajo sirve para aceptar lo que ya viene marcado.
 *
 * Lo que se guarda en la consulta sigue siendo `animalId` y `stageId`, como
 * antes: la categoria se deduce del animal, y las etapas con nombre viejo se
 * leen con `etapaPorId`.
 */

type Pregunta = "categoria" | "animal" | "etapa" | "temp" | "humedad";

interface ClimateOption {
  value: number;
  label: string;
}

const TEMP_OPTIONS: ClimateOption[] = [
  { value: 24, label: "Fresquito" },
  { value: 26, label: "Suave" },
  { value: 28, label: "Cálido" },
  { value: 30, label: "Caliente" },
  { value: 32, label: "Bien caliente" },
  { value: 34, label: "Muy caliente" },
];

const HUMIDITY_OPTIONS: ClimateOption[] = [
  { value: 50, label: "Seca" },
  { value: 60, label: "Normal" },
  { value: 70, label: "Húmeda" },
  { value: 80, label: "Muy húmeda" },
];

/** Valores típicos del Piedemonte, preseleccionados: casi nadie tiene termómetro. */
const TEMP_TIPICA = 28;
const HUMEDAD_TIPICA = 60;

/** Las preguntas que tocan con la categoria elegida. */
function preguntasPara(categoryId: string): Pregunta[] {
  const unSoloAnimal =
    categoryId !== "" && animalesDe(categoryId as CategoriaId).length === 1;
  return unSoloAnimal
    ? ["categoria", "etapa", "temp", "humedad"]
    : ["categoria", "animal", "etapa", "temp", "humedad"];
}

export default function ConsultaPage() {
  const { active, activeId, create, setActive, updateSelection } = useProjects();

  const router = useRouter();
  const [pregunta, setPregunta] = useState<Pregunta | "listo">("categoria");
  const [categoryId, setCategoryId] = useState("");
  const [animalId, setAnimalId] = useState("");
  const [stageId, setStageId] = useState("");
  const [temp, setTemp] = useState<number | null>(null);
  const [humidity, setHumidity] = useState<number | null>(null);
  const guardado = useRef(false);

  useEffect(() => {
    marcarPaso("3");
  }, []);

  // Hidratación: proyecto activo primero, si no el borrador.
  useEffect(() => {
    /**
     * ¿Vino a cambiar sus respuestas?
     *
     * Sin esto, entrar con una consulta ya contestada saltaba al final, que
     * a su vez empuja a /resultado: el boton "cambiar" mandaba aqui y rebotaba
     * de vuelta al instante. Se lee de la URL ya montado, no con
     * `useSearchParams`, para no obligar a envolver la pagina en un Suspense
     * por un dato que solo importa en el navegador.
     */
    const editar =
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).has("editar");

    if (active && active.selection.animalId) {
      const a = animalPorId(active.selection.animalId);
      const e = etapaPorId(a, active.selection.stageId);
      setCategoryId(a?.category ?? "");
      setAnimalId(active.selection.animalId);
      // Se usa el id actual de la etapa, aunque la consulta traiga uno viejo.
      setStageId(e?.id ?? "");
      setTemp(active.selection.temp ?? null);
      setHumidity(active.selection.humidity ?? null);
      if (editar) {
        // Al venir a cambiar se empieza por la primera pregunta, con lo
        // contestado ya puesto: se toca solo lo que se quiere mover.
        guardado.current = false;
        setPregunta("categoria");
      } else if (
        e &&
        active.selection.temp !== undefined &&
        active.selection.humidity !== undefined
      ) {
        setPregunta("listo");
      }
      return;
    }
    const draft = loadWizardDraft();
    if (draft) {
      const a = animalPorId(draft.animalId);
      const e = etapaPorId(a, draft.stageId);
      const cat = a?.category ?? draft.categoryId ?? "";
      setCategoryId(cat);
      setAnimalId(a ? draft.animalId : "");
      setStageId(e?.id ?? "");
      setTemp(draft.temp);
      setHumidity(draft.humidity);
      if (!cat) setPregunta("categoria");
      else if (!a) setPregunta("animal");
      else if (!e) setPregunta("etapa");
      else if (draft.temp === null) setPregunta("temp");
      else if (draft.humidity === null) setPregunta("humedad");
      else setPregunta("listo");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  useEffect(() => {
    if (activeId) return;
    saveWizardDraft({ categoryId, animalId, stageId, temp, humidity });
  }, [activeId, categoryId, animalId, stageId, temp, humidity]);

  const categoria = categoriaPorId(categoryId);
  const animal = useMemo(() => animalPorId(animalId), [animalId]);
  const stage = etapaPorId(animal, stageId);

  const preguntas = preguntasPara(categoryId);
  const indice =
    pregunta === "listo" ? preguntas.length : preguntas.indexOf(pregunta);

  const persist = (patch: Parameters<typeof updateSelection>[1]) => {
    if (activeId) void updateSelection(activeId, patch);
  };

  const siguiente = (desde: Pregunta, cat = categoryId) => {
    const lista = preguntasPara(cat);
    const i = lista.indexOf(desde);
    setPregunta(i + 1 < lista.length ? lista[i + 1] : "listo");
  };

  const anterior = () => {
    if (pregunta === "listo") return;
    const i = preguntas.indexOf(pregunta);
    if (i > 0) setPregunta(preguntas[i - 1]);
  };

  /* ── respuestas ───────────────────────────────────────────────────── */

  const elegirCategoria = (id: CategoriaId) => {
    if (id !== categoryId) {
      // Otra categoria: lo elegido debajo ya no aplica.
      const lista = animalesDe(id);
      const unico = lista.length === 1 ? lista[0].id : "";
      setAnimalId(unico);
      setStageId("");
      persist({ animalId: unico || undefined, stageId: undefined });
    }
    setCategoryId(id);
    siguiente("categoria", id);
  };

  const elegirAnimal = (id: string) => {
    if (id !== animalId) {
      setStageId("");
      persist({ animalId: id, stageId: undefined });
    }
    setAnimalId(id);
    siguiente("animal");
  };

  const elegirEtapa = (id: string) => {
    setStageId(id);
    persist({ stageId: id });
    siguiente("etapa");
  };

  const elegirTemp = (v: number) => {
    setTemp(v);
    persist({ temp: v });
    siguiente("temp");
  };

  const elegirHumedad = (v: number) => {
    setHumidity(v);
    persist({ humidity: v });
    // Fin de la parada 3. El resultado vive en su propia ruta.
    siguiente("humedad");
  };

  /** "Continuar": acepta lo que ya esta marcado en la pregunta actual. */
  const continuar = () => {
    if (pregunta === "categoria" && categoryId) siguiente("categoria");
    else if (pregunta === "animal" && animalId) siguiente("animal");
    else if (pregunta === "etapa" && stage) siguiente("etapa");
    else if (pregunta === "temp") elegirTemp(temp ?? TEMP_TIPICA);
    else if (pregunta === "humedad") elegirHumedad(humidity ?? HUMEDAD_TIPICA);
  };

  const puedeContinuar =
    (pregunta === "categoria" && !!categoryId) ||
    (pregunta === "animal" && !!animalId) ||
    (pregunta === "etapa" && !!stage) ||
    pregunta === "temp" ||
    pregunta === "humedad";

  /**
   * Al contestar la ultima pregunta: se guarda la consulta y se pasa a la
   * parada 4, que vive en su propia ruta.
   *
   * La navegacion va en `finally` a proposito. El resultado se calcula con lo
   * que el productor acaba de responder, no con lo guardado, asi que aunque
   * el guardado falle —sin senal, por ejemplo— igual tiene que ver su
   * resultado.
   */
  useEffect(() => {
    if (pregunta !== "listo" || guardado.current) return;
    if (!animal || !stage || temp === null || humidity === null) return;
    guardado.current = true;
    marcarPaso("listo");

    const seleccion = { animalId, stageId: stage.id, temp, humidity };

    void (async () => {
      try {
        if (activeId) {
          await updateSelection(activeId, seleccion);
        } else {
          const fecha = new Date().toLocaleDateString("es-CO", {
            day: "numeric",
            month: "short",
          });
          // create deja la consulta abierta, no hace falta setActive aparte.
          await create(`${animal.name} · ${stage.name} · ${fecha}`, seleccion);
          clearWizardDraft();
        }
      } catch {
        // El guardado se reintentara solo la proxima vez.
        guardado.current = false;
      } finally {
        router.push("/resultado");
      }
    })();
  }, [
    pregunta,
    animal,
    stage,
    temp,
    humidity,
    activeId,
    animalId,
    create,
    updateSelection,
    router,
  ]);

  const nuevaConsulta = () => {
    guardado.current = false;
    setActive(null);
    clearWizardDraft();
    setCategoryId("");
    setAnimalId("");
    setStageId("");
    setTemp(null);
    setHumidity(null);
    setPregunta("categoria");
  };


  const enListo = pregunta === "listo";

  return (
    <>
      <Barra modo="camino" paso={3} />
      <main className="mx-auto flex min-h-[calc(100dvh-60px)] w-full max-w-[1240px] flex-col px-5 pt-8 lg:px-8 lg:pt-12">
        <div className="grid flex-1 content-start gap-10 pb-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-16 lg:pb-16">
          <div className="min-w-0">
            <header>
              <h1 className="t-h1">Haga su consulta</h1>
              {/* La explicacion solo hace falta al empezar. En las preguntas
                  siguientes, en celular, empujaba la pregunta fuera de la
                  primera pantalla. */}
              <p
                className={cn(
                  "t-lead mt-3",
                  pregunta !== "categoria" && "hidden lg:block",
                )}
              >
                Cuéntenos a qué animal le va a dar la harina, en qué etapa está
                y cómo es su clima. Con eso comparamos las tres comidas en
                estudio para su caso.
              </p>
            </header>

            {/* En celular, lo elegido cabe en una linea: el panel lateral
                completo empujaria la pregunta fuera de la pantalla. */}
            <ResumenLinea
              categoria={categoria}
              animal={animal}
              etapa={stage}
              temp={temp}
              humidity={humidity}
              onNueva={categoryId ? nuevaConsulta : undefined}
              className="mt-6 lg:hidden"
            />

            <section className="mt-10 lg:mt-14">
              {enListo ? (
                <Estado tipo="cargando" titulo="Preparando su resultado" compacto>
                  Guardamos su consulta y abrimos la comparación.
                </Estado>
              ) : (
                <div
                  key={pregunta}
                  className="animate-in fade-in-0 slide-in-from-bottom-2 duration-[250ms] ease-[var(--ease-natural)]"
                >
                  <IndicadorPregunta actual={indice + 1} total={preguntas.length} />

                  {pregunta === "categoria" && (
                    <PreguntaCategoria value={categoryId} onSelect={elegirCategoria} />
                  )}

                  {pregunta === "animal" && categoria && (
                    <PreguntaAnimal
                      categoria={categoria}
                      value={animalId}
                      onSelect={elegirAnimal}
                    />
                  )}

                  {pregunta === "etapa" && animal && (
                    <PreguntaEtapa
                      animal={animal}
                      value={stage?.id ?? ""}
                      onSelect={elegirEtapa}
                    />
                  )}

                  {pregunta === "temp" && (
                    <PreguntaClima
                      title="¿Qué tan caliente es el lugar donde cría los grillos?"
                      help="Trabajamos con condiciones objetivo entre 24 y 34 °C. Si no está seguro, deje la que viene marcada."
                      options={TEMP_OPTIONS}
                      unit="°C"
                      value={temp ?? TEMP_TIPICA}
                      onSelect={elegirTemp}
                    />
                  )}

                  {pregunta === "humedad" && (
                    <PreguntaClima
                      title="¿Y la humedad del aire?"
                      help="Buscamos entre 50 y 80 % de humedad relativa (HR). Si no está seguro, deje la que viene marcada."
                      options={HUMIDITY_OPTIONS}
                      unit="% HR"
                      value={humidity ?? HUMEDAD_TIPICA}
                      onSelect={elegirHumedad}
                    />
                  )}
                </div>
              )}
            </section>
          </div>

          <aside className="hidden lg:block" aria-label="Resumen de su consulta">
            <div className="sticky top-24 flex flex-col gap-8 rounded-lg bg-surface-2 p-6">
              <ResumenConsulta
                categoria={categoria}
                animal={animal}
                etapa={stage}
                temp={temp}
                humidity={humidity}
                onNueva={categoryId ? nuevaConsulta : undefined}
              />
              <TresComidas compacta />
            </div>
          </aside>
        </div>

        <BarraAcciones
          atras={indice > 0 && !enListo ? { onClick: anterior } : { href: "/grillos" }}
          adelante={{
            texto: pregunta === "humedad" ? "Ver mi resultado" : "Continuar",
            onClick: continuar,
            deshabilitado: !puedeContinuar || enListo,
          }}
        />
      </main>
    </>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */

/**
 * "Pregunta 2 de 5" con cinco trazos finos que se llenan. Es el avance
 * DENTRO de la consulta; el avance del camino ya lo dice la cabecera. Los
 * trazos cambian con una transicion de 250 ms.
 */
function IndicadorPregunta({ actual, total }: { actual: number; total: number }) {
  return (
    <div className="flex items-center gap-4">
      <p className="t-eyebrow text-subtle">
        Pregunta {actual} de {total}
      </p>
      <span className="flex gap-1" aria-hidden>
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={cn(
              "h-[3px] w-5 rounded-full transition-colors duration-[250ms] ease-[var(--ease-natural)]",
              i < actual ? "bg-primary" : "bg-border-strong/70",
            )}
          />
        ))}
      </span>
    </div>
  );
}

function TituloPregunta({
  children,
  ayuda,
}: {
  children: React.ReactNode;
  ayuda?: React.ReactNode;
}) {
  return (
    <div className="mt-3">
      <h2 id="pregunta-actual" className="t-h2 text-balance">
        {children}
      </h2>
      {ayuda && <div className="t-small mt-2 max-w-[60ch] text-subtle">{ayuda}</div>}
    </div>
  );
}

/**
 * Opcion elegible.
 *
 * Reposo: superficie blanca con un filo casi invisible. Elegida: filo fino
 * en terracota, fondo apenas tenido y una marca de check pequena que aparece
 * con una transicion corta. El estado se lee por el check y por
 * `aria-pressed`, no solo por el color.
 */
function Opcion({
  selected,
  onClick,
  children,
  className,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      // `elevar` sube la tarjeta 3 px al pasar el raton; la transicion va en
      // linea para que tambien cubra el filo (box-shadow) de la seleccion.
      style={{
        transition:
          "transform 200ms var(--ease-natural), box-shadow 200ms var(--ease-natural), background-color 200ms var(--ease-natural)",
      }}
      className={cn(
        "elevar relative flex w-full rounded-lg text-left ring-inset",
        selected
          ? "bg-primary-soft/55 ring-[1.5px] ring-primary"
          : "bg-surface ring-1 ring-border hover:ring-border-strong",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute top-3 right-3 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground transition-[opacity,transform] duration-200 ease-[var(--ease-natural)]",
          selected ? "scale-100 opacity-100" : "scale-75 opacity-0",
        )}
      >
        <Check className="size-3" strokeWidth={3} />
      </span>
      {children}
    </button>
  );
}

/** Lo que agrupa cada categoria, dicho con los datos y no a mano. */
function pistaCategoria(c: Categoria): string {
  const animales = animalesDe(c.id);
  if (animales.length === 1) {
    return `Etapas: ${animales[0].stages.map((e) => e.name.toLowerCase()).join(", ")}`;
  }
  return animales.map((a) => a.name).join(", ");
}

function PreguntaCategoria({
  value,
  onSelect,
}: {
  value: string;
  onSelect: (id: CategoriaId) => void;
}) {
  return (
    <div>
      <TituloPregunta>¿A qué animal le va a dar la harina?</TituloPregunta>
      <ul
        role="group"
        aria-labelledby="pregunta-actual"
        className="mt-8 grid gap-3 [--escala:0.5] sm:grid-cols-3 sm:gap-4 sm:[--escala:1]"
      >
        {CATEGORIAS.map((c, i) => (
          <Revelar as="li" key={c.id} retraso={i * 60}>
            <Opcion
              selected={value === c.id}
              onClick={() => onSelect(c.id)}
              className="h-full items-center gap-4 p-4 sm:flex-col sm:items-stretch sm:gap-5 sm:p-5 sm:pt-7"
            >
              <LaminaNormalizada
                src={c.image}
                area={11500}
                alto={116}
                className="w-24 shrink-0 sm:w-full"
              />
              <span className="min-w-0 pr-6 sm:pr-0">
                <span className="block font-display text-[1.6rem] font-semibold leading-none">
                  {c.name}
                </span>
                <span className="mt-2 block text-[13.5px] leading-snug text-subtle">
                  {pistaCategoria(c)}
                </span>
              </span>
            </Opcion>
          </Revelar>
        ))}
      </ul>
    </div>
  );
}

function PreguntaAnimal({
  categoria,
  value,
  onSelect,
}: {
  categoria: Categoria;
  value: string;
  onSelect: (id: string) => void;
}) {
  const animales = animalesDe(categoria.id);
  // Solo se dibuja el animal si TODOS tienen su propia lamina. Poner la
  // tilapia sobre la cachama o el bocachico seria mostrar otra especie.
  const conImagen = animales.every((a) => a.image);

  return (
    <div>
      <TituloPregunta ayuda="Lo que necesita comer cambia según la especie y el tipo de producción.">
        {categoria.pregunta}
      </TituloPregunta>
      <ul
        role="group"
        aria-labelledby="pregunta-actual"
        className={cn(
          "mt-8 grid gap-3 [--escala:0.6] sm:[--escala:1]",
          conImagen ? "sm:grid-cols-2 sm:gap-4" : "sm:grid-cols-2 xl:grid-cols-3",
        )}
      >
        {animales.map((a, i) => (
          <Revelar as="li" key={a.id} retraso={i * 60}>
            <Opcion
              selected={value === a.id}
              onClick={() => onSelect(a.id)}
              className={cn(
                "h-full items-center gap-4",
                conImagen ? "p-4 sm:p-5" : "min-h-[76px] px-4 py-3.5",
              )}
            >
              {conImagen && a.image && (
                <LaminaNormalizada
                  src={a.image}
                  area={9000}
                  alto={96}
                  className="w-24 shrink-0 sm:w-32"
                />
              )}
              <span className="min-w-0 pr-6">
                <span className="block text-[16.5px] font-semibold leading-snug">
                  {a.name}
                </span>
                {a.scientific && (
                  <span className="mt-0.5 block text-[13.5px] italic text-subtle">
                    {a.scientific}
                  </span>
                )}
              </span>
            </Opcion>
          </Revelar>
        ))}
      </ul>
    </div>
  );
}

function PreguntaEtapa({
  animal,
  value,
  onSelect,
}: {
  animal: AnimalDestino;
  value: string;
  onSelect: (id: string) => void;
}) {
  const refs = [...new Set(animal.stages.flatMap((e) => e.protein?.refs ?? []))];

  return (
    <div>
      <TituloPregunta
        ayuda={
          <span className="inline-flex flex-wrap items-center">
            Cada etapa productiva necesita una cantidad distinta de proteína.
            <InfoTip termino="etapaProductiva" className="ml-0.5" />
          </span>
        }
      >
        ¿En qué etapa está su {animal.name.toLowerCase()}?
      </TituloPregunta>
      <ul
        role="group"
        aria-labelledby="pregunta-actual"
        className="mt-8 grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3"
      >
        {animal.stages.map((s, i) => (
          <Revelar as="li" key={s.id} retraso={i * 60}>
            <Opcion
              selected={value === s.id}
              onClick={() => onSelect(s.id)}
              className="h-full flex-col p-5"
            >
              <span className="pr-6">
                <span className="block text-[16.5px] font-semibold leading-snug">
                  {s.name}
                </span>
                {s.detail && (
                  <span className="mt-0.5 block text-[13.5px] leading-snug text-subtle">
                    {s.detail}
                  </span>
                )}
              </span>
              <span className="mt-5 flex flex-col gap-1">
                <span className="t-eyebrow text-faint">Necesita</span>
                <ProteinaEtapa etapa={s} compacto />
              </span>
            </Opcion>
          </Revelar>
        ))}
      </ul>
      {/* La etiqueta de origen y el enlace a la fuente van fuera de los
          botones: un boton dentro de otro no se puede tocar bien. */}
      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13.5px] text-subtle">
        <span className="inline-flex items-center">
          Necesidad de proteína
          <InfoTip termino="requerimientoProteina" className="ml-0.5" />
        </span>
        {refs.length > 0 ? (
          <>
            <OrigenDato origen="literatura" />
            <FuenteCientifica
              ids={refs}
              detalle="Estos valores vienen de la literatura científica, no de los ensayos del proyecto. Algunos son el óptimo de un solo ensayo; lo aclaramos en cada caso."
            />
          </>
        ) : (
          <span>
            Solo mostramos valores con fuente científica verificada. Los de este
            animal los estamos cargando.
          </span>
        )}
      </div>
    </div>
  );
}

function PreguntaClima({
  title,
  help,
  options,
  unit,
  value,
  onSelect,
}: {
  title: string;
  help: string;
  options: ClimateOption[];
  unit: string;
  value: number;
  onSelect: (v: number) => void;
}) {
  return (
    <div>
      <TituloPregunta ayuda={help}>{title}</TituloPregunta>
      <ul
        role="group"
        aria-labelledby="pregunta-actual"
        className={cn(
          "mt-8 grid gap-3",
          options.length > 4 ? "grid-cols-2 sm:grid-cols-3 xl:grid-cols-6" : "grid-cols-2 sm:grid-cols-4",
        )}
      >
        {options.map((opt, i) => (
          <Revelar as="li" key={opt.value} retraso={i * 60}>
            <Opcion
              selected={value === opt.value}
              onClick={() => onSelect(opt.value)}
              className="min-h-[92px] flex-col justify-end gap-1.5 px-4 pt-6 pb-4"
            >
              <span className="t-cifra text-[2rem] text-foreground">
                {opt.value}
                <span className="t-unidad">{unit}</span>
              </span>
              <span className="text-[13px] leading-tight text-subtle">{opt.label}</span>
            </Opcion>
          </Revelar>
        ))}
      </ul>
    </div>
  );
}

/** Las filas del resumen, compartidas por el panel y la linea de celular. */
function filasResumen(
  categoria?: Categoria,
  animal?: AnimalDestino,
  etapa?: Etapa,
  temp?: number | null,
  humidity?: number | null,
) {
  return [
    {
      rotulo: "Animal",
      valor: animal
        ? animalesDe(animal.category).length > 1
          ? `${categoria?.name ?? ""} · ${animal.name}`
          : animal.name
        : categoria?.name,
    },
    { rotulo: "Etapa", valor: etapa?.name },
    { rotulo: "Temperatura", valor: temp != null ? `${temp} °C` : undefined },
    { rotulo: "Humedad", valor: humidity != null ? `${humidity} % HR` : undefined },
  ];
}

/** Lo que lleva elegido, en el panel lateral de escritorio. */
function ResumenConsulta({
  categoria,
  animal,
  etapa,
  temp,
  humidity,
  onNueva,
}: {
  categoria?: Categoria;
  animal?: AnimalDestino;
  etapa?: Etapa;
  temp: number | null;
  humidity: number | null;
  onNueva?: () => void;
}) {
  const filas = filasResumen(categoria, animal, etapa, temp, humidity);

  return (
    <section aria-labelledby="resumen-consulta">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="resumen-consulta" className="t-eyebrow text-subtle">
          Su consulta
        </h2>
        {onNueva && (
          <button
            type="button"
            onClick={onNueva}
            className="text-[13px] font-medium text-subtle underline decoration-border-strong underline-offset-4 transition-colors hover:text-foreground"
          >
            Empezar de nuevo
          </button>
        )}
      </div>
      <dl className="mt-4 flex flex-col gap-3">
        {filas.map((f) => (
          <div key={f.rotulo} className="flex items-baseline justify-between gap-4">
            <dt className="text-[14px] text-subtle">{f.rotulo}</dt>
            <dd className="text-right text-[14.5px] font-medium">
              {f.valor ?? <span className="font-normal text-faint">Por elegir</span>}
            </dd>
          </div>
        ))}
        <div className="flex items-start justify-between gap-4">
          <dt className="pt-0.5 text-[14px] text-subtle">Necesita</dt>
          <dd className="flex justify-end text-right">
            {etapa ? (
              <ProteinaEtapa etapa={etapa} compacto />
            ) : (
              <span className="text-[14.5px] text-faint">Por elegir</span>
            )}
          </dd>
        </div>
      </dl>
    </section>
  );
}

/** Lo elegido en una sola linea, para celular y tableta. */
function ResumenLinea({
  categoria,
  animal,
  etapa,
  temp,
  humidity,
  onNueva,
  className,
}: {
  categoria?: Categoria;
  animal?: AnimalDestino;
  etapa?: Etapa;
  temp: number | null;
  humidity: number | null;
  onNueva?: () => void;
  className?: string;
}) {
  const partes = filasResumen(categoria, animal, etapa, temp, humidity)
    .map((f) => f.valor)
    .filter(Boolean);
  if (partes.length === 0) return null;
  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-3 gap-y-1", className)}>
      <p className="text-[14px] text-subtle">
        <span className="sr-only">Lleva elegido: </span>
        {partes.join(" · ")}
      </p>
      {onNueva && (
        <button
          type="button"
          onClick={onNueva}
          className="text-[13px] font-medium text-subtle underline decoration-border-strong underline-offset-4 hover:text-foreground"
        >
          Empezar de nuevo
        </button>
      )}
    </div>
  );
}
