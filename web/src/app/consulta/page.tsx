"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CSSProperties } from "react";
import { ArrowLeft, ArrowRight, Check, HelpCircle } from "lucide-react";

import { Barra } from "@/components/barra";
import { FuenteCientifica } from "@/components/fuente-cientifica";
import { IndicadorPaso } from "@/components/indicador-paso";
import { InfoTip } from "@/components/info-tip";
import { OrigenDato } from "@/components/origen-dato";
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

const d = (ms: number): CSSProperties =>
  ({ ["--delay" as string]: `${ms}ms` }) as CSSProperties;

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
      <Barra />
      <main className="mx-auto flex w-full max-w-[1240px] flex-col px-5 lg:px-8">
        <IndicadorPaso n={3} titulo="Haga su consulta" />

        <div className="grid gap-8 pb-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10 lg:pb-12">
          <div className="min-w-0">
            <h1 className="font-display text-[2.2rem] font-medium leading-[1.08] tracking-[-0.01em] lg:text-[2.9rem]">
              Haga su consulta
            </h1>
            <p className="mt-3 max-w-[56ch] text-[16.5px] leading-relaxed text-foreground/80">
              Cuéntenos a qué animal le va a dar la harina y en qué etapa está.
              Con eso le mostramos cuánta proteína necesita y cómo se comparan
              las tres comidas en estudio.
            </p>

            <section className="mt-7 rounded-xl border bg-card/60 p-4 sm:p-6">
              {enListo ? (
                <p className="py-10 text-center text-[16px] text-muted-foreground">
                  Preparando su resultado...
                </p>
              ) : (
                <>
                  <p className="text-[13.5px] font-medium text-muted-foreground">
                    Pregunta {indice + 1} de {preguntas.length}
                  </p>

                  {pregunta === "categoria" && (
                    <PreguntaCategoria
                      value={categoryId}
                      onSelect={elegirCategoria}
                    />
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
                      help="Trabajamos con condiciones objetivo entre 24 y 34 grados. Si no está seguro, deje la que viene marcada."
                      options={TEMP_OPTIONS}
                      unit="°C"
                      value={temp ?? TEMP_TIPICA}
                      onSelect={elegirTemp}
                    />
                  )}

                  {pregunta === "humedad" && (
                    <PreguntaClima
                      title="¿Y la humedad del aire?"
                      help="Buscamos entre 50 y 80 por ciento. Si no está seguro, deje la que viene marcada."
                      options={HUMIDITY_OPTIONS}
                      unit="%"
                      value={humidity ?? HUMEDAD_TIPICA}
                      onSelect={elegirHumedad}
                    />
                  )}
                </>
              )}
            </section>
          </div>

          <aside className="flex flex-col gap-5">
            <ResumenConsulta
              categoria={categoria}
              animal={animal}
              etapa={stage}
              temp={temp}
              humidity={humidity}
              onNueva={categoryId ? nuevaConsulta : undefined}
            />
            <TresComidas compacta className="hidden lg:block" />
          </aside>
        </div>

        {/* Atras / Continuar, fijos abajo como en las demas paradas. */}
        <div className="sticky bottom-0 z-20 -mx-5 flex items-center gap-3 border-t bg-background/95 px-5 pt-3 pb-[calc(env(safe-area-inset-bottom)+14px)] backdrop-blur lg:-mx-8 lg:px-8">
          {indice > 0 && !enListo ? (
            <button
              type="button"
              onClick={anterior}
              className="inline-flex min-h-12 shrink-0 items-center gap-2 rounded-md border px-4 text-[15px] font-semibold text-foreground/85 transition-colors hover:bg-muted"
            >
              <ArrowLeft className="size-4" />
              Atrás
            </button>
          ) : (
            <Link
              href="/grillos"
              className="inline-flex min-h-12 shrink-0 items-center gap-2 rounded-md border px-4 text-[15px] font-semibold text-foreground/85 transition-colors hover:bg-muted"
            >
              <ArrowLeft className="size-4" />
              Atrás
            </Link>
          )}
          <button
            type="button"
            onClick={continuar}
            disabled={!puedeContinuar || enListo}
            className="mx-auto flex min-h-12 flex-1 items-center justify-center gap-2 rounded-md bg-primary px-6 text-[16.5px] font-semibold text-primary-foreground transition-opacity hover:opacity-92 disabled:opacity-40 sm:max-w-[420px]"
          >
            {pregunta === "humedad" ? "Ver mi resultado" : "Continuar"}
            <ArrowRight className="size-4" />
          </button>
          <span className="hidden w-[104px] shrink-0 sm:block" aria-hidden />
        </div>
      </main>
    </>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */

function TituloPregunta({
  children,
  ayuda,
}: {
  children: React.ReactNode;
  ayuda?: React.ReactNode;
}) {
  return (
    <div className="mt-2 flex items-start gap-3">
      <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <HelpCircle className="size-5" aria-hidden />
      </span>
      <div>
        <h2 className="font-display text-[1.55rem] font-medium leading-tight lg:text-[1.75rem]">
          {children}
        </h2>
        {ayuda && (
          <div className="mt-1 text-[14.5px] leading-relaxed text-muted-foreground">
            {ayuda}
          </div>
        )}
      </div>
    </div>
  );
}

/** Tarjeta elegible, con la marca de seleccion arriba a la derecha. */
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
      className={cn(
        "relative flex w-full rounded-xl border-2 bg-background text-left transition-colors",
        selected ? "border-primary" : "border-border hover:border-primary/40",
        className,
      )}
    >
      <span
        className={cn(
          "absolute right-3 top-3 flex size-6 items-center justify-center rounded-full border-2",
          selected
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-background",
        )}
        aria-hidden
      >
        {selected && <Check className="size-3.5" strokeWidth={3} />}
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
    <div className="reveal" style={d(0)}>
      <TituloPregunta>¿A qué animal le va a dar la harina?</TituloPregunta>
      <ul className="mt-6 grid gap-3 sm:grid-cols-3">
        {CATEGORIAS.map((c) => (
          <li key={c.id}>
            <Opcion
              selected={value === c.id}
              onClick={() => onSelect(c.id)}
              className="h-full flex-row items-center gap-3 p-3 sm:flex-col sm:items-start sm:p-4"
            >
              <Image
                src={c.image}
                alt=""
                width={280}
                height={200}
                aria-hidden
                className="lamina h-16 w-20 shrink-0 object-contain sm:h-24 sm:w-full sm:pr-8"
              />
              <span className="min-w-0 pr-8 sm:pr-0">
                <span className="block font-display text-[1.45rem] font-medium leading-tight">
                  {c.name}
                </span>
                <span className="mt-1 block text-[13.5px] leading-snug text-muted-foreground">
                  {pistaCategoria(c)}
                </span>
              </span>
            </Opcion>
          </li>
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
    <div className="reveal" style={d(0)}>
      <TituloPregunta ayuda="Lo que necesita comer cambia según la especie y el tipo de producción.">
        {categoria.pregunta}
      </TituloPregunta>
      <ul
        className={cn(
          "mt-6 grid gap-3",
          conImagen ? "sm:grid-cols-2" : "sm:grid-cols-2 xl:grid-cols-3",
        )}
      >
        {animales.map((a) => (
          <li key={a.id}>
            <Opcion
              selected={value === a.id}
              onClick={() => onSelect(a.id)}
              className="h-full items-center gap-3 p-4"
            >
              {conImagen && a.image && (
                <Image
                  src={a.image}
                  alt=""
                  width={400}
                  height={400}
                  aria-hidden
                  className="lamina size-20 shrink-0 object-contain"
                />
              )}
              <span className="min-w-0 pr-8">
                <span className="block font-display text-[1.35rem] font-medium leading-tight">
                  {a.name}
                </span>
                {a.scientific && (
                  <span className="mt-0.5 block text-[13.5px] italic text-muted-foreground">
                    {a.scientific}
                  </span>
                )}
              </span>
            </Opcion>
          </li>
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
  const refs = [
    ...new Set(animal.stages.flatMap((e) => e.protein?.refs ?? [])),
  ];

  return (
    <div className="reveal" style={d(0)}>
      <TituloPregunta
        ayuda={
          <span>
            Cada etapa productiva necesita una cantidad distinta de proteína.
            <InfoTip termino="etapaProductiva" className="ml-1" />
          </span>
        }
      >
        ¿En qué etapa está su {animal.name.toLowerCase()}?
      </TituloPregunta>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {animal.stages.map((s) => (
          <li key={s.id}>
            <Opcion
              selected={value === s.id}
              onClick={() => onSelect(s.id)}
              className="h-full flex-col gap-3 p-4"
            >
              <span className="pr-8">
                <span className="block font-display text-[1.35rem] font-medium leading-tight">
                  {s.name}
                </span>
                {s.detail && (
                  <span className="mt-0.5 block text-[13.5px] leading-snug text-muted-foreground">
                    {s.detail}
                  </span>
                )}
              </span>
              <span className="mt-auto block border-t pt-3">
                <span className="mb-1 block text-[12.5px] font-medium text-muted-foreground">
                  Necesita
                </span>
                <ProteinaEtapa etapa={s} compacto />
              </span>
            </Opcion>
          </li>
        ))}
      </ul>
      {/* La etiqueta de origen y el enlace a la fuente van fuera de los
          botones: un boton dentro de otro no se puede tocar bien. */}
      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-[13.5px] text-muted-foreground">
        <span className="inline-flex items-center gap-0.5">
          Necesidad de proteína
          <InfoTip termino="requerimientoProteina" />
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
            Solo mostramos valores con fuente científica verificada. Los de
            este animal los estamos cargando.
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
    <div className="reveal" style={d(0)}>
      <TituloPregunta ayuda={help}>{title}</TituloPregunta>
      <div
        className={cn(
          "mt-6 grid gap-2.5",
          options.length > 4 ? "grid-cols-3 sm:grid-cols-6" : "grid-cols-2 sm:grid-cols-4",
        )}
      >
        {options.map((opt) => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSelect(opt.value)}
              aria-pressed={selected}
              className={cn(
                "flex min-h-[80px] flex-col items-center justify-center gap-1 rounded-xl border-2 bg-background py-3 transition-colors",
                selected
                  ? "border-primary bg-primary/8"
                  : "border-border hover:border-primary/40",
              )}
            >
              <span className="font-display text-[1.7rem] font-medium leading-none tabular-nums">
                {opt.value}
                <span className="ml-0.5 text-[0.95rem] text-muted-foreground">
                  {unit}
                </span>
              </span>
              <span className="text-[12px] font-medium leading-tight text-muted-foreground">
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Lo que lleva elegido, a la derecha en escritorio y debajo en celular. */
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
  const filas: Array<{ rotulo: string; valor: React.ReactNode }> = [
    {
      rotulo: "Animal",
      valor: animal
        ? animalesDe(animal.category).length > 1
          ? `${categoria?.name ?? ""} · ${animal.name}`
          : animal.name
        : categoria?.name,
    },
    { rotulo: "Etapa", valor: etapa?.name },
    {
      rotulo: "Necesita",
      valor: etapa ? <ProteinaEtapa etapa={etapa} compacto /> : undefined,
    },
    { rotulo: "Temperatura", valor: temp !== null ? `${temp} °C` : undefined },
    {
      rotulo: "Humedad",
      valor: humidity !== null ? `${humidity} %` : undefined,
    },
  ];

  return (
    <section className="rounded-xl border bg-card/60 p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-[1.4rem] font-medium">Su consulta</h2>
        {onNueva && (
          <button
            type="button"
            onClick={onNueva}
            className="text-[13.5px] font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            Empezar de nuevo
          </button>
        )}
      </div>
      <dl className="mt-3 divide-y">
        {filas.map((f) => (
          <div
            key={f.rotulo}
            className="flex items-start justify-between gap-4 py-2.5"
          >
            <dt className="text-[14px] text-muted-foreground">{f.rotulo}</dt>
            <dd className="flex justify-end text-right text-[15px] font-medium">
              {f.valor ?? (
                <span className="font-normal text-muted-foreground/70">
                  Por elegir
                </span>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
