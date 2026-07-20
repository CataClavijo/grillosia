"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowLeft, Beef, ChevronLeft, Egg, Fish } from "lucide-react";

import { SiteNav } from "@/components/site-nav";
import { StepFooter } from "@/components/step-footer";
import { ANIMALS, DIETS, HYDRATION_NOTE } from "@/lib/animals";
import { useProjects } from "@/lib/projects-store";
import { marcarPaso } from "@/lib/journey";
import {
  clearWizardDraft,
  loadWizardDraft,
  saveWizardDraft,
} from "@/lib/wizard-draft";

const ANIMAL_ICONS: Record<string, typeof Fish> = {
  tilapia: Fish,
  pollo: Egg,
  cerdo: Beef,
};

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

const TOTAL_PREGUNTAS = 4;

const d = (ms: number): CSSProperties =>
  ({ ["--delay" as string]: `${ms}ms` }) as CSSProperties;

export default function WizardPage() {
  const { active, activeId, create, setActive, updateSelection } = useProjects();

  const [step, setStep] = useState(1);
  const [animalId, setAnimalId] = useState("");
  const [stageId, setStageId] = useState("");
  const [temp, setTemp] = useState<number | null>(null);
  const [humidity, setHumidity] = useState<number | null>(null);
  const guardado = useRef(false);

  useEffect(() => {
    marcarPaso("wizard");
  }, []);

  /**
   * Empezar una consulta nueva. Sin soltar la consulta activa, la hidratación
   * de abajo volvería a saltar al resultado de la anterior y sería imposible
   * crear una segunda.
   */
  const nuevaConsulta = () => {
    guardado.current = false;
    setActive(null);
    clearWizardDraft();
    setAnimalId("");
    setStageId("");
    setTemp(null);
    setHumidity(null);
    setStep(1);
  };

  // Hidratación: proyecto activo primero, si no el borrador.
  useEffect(() => {
    if (active && active.selection.animalId) {
      setAnimalId(active.selection.animalId);
      setStageId(active.selection.stageId ?? "");
      setTemp(active.selection.temp ?? null);
      setHumidity(active.selection.humidity ?? null);
      if (
        active.selection.stageId &&
        active.selection.temp !== undefined &&
        active.selection.humidity !== undefined
      ) {
        setStep(5);
      }
      return;
    }
    const draft = loadWizardDraft();
    if (draft) {
      setAnimalId(draft.animalId);
      setStageId(draft.stageId);
      setTemp(draft.temp);
      setHumidity(draft.humidity);
      if (!draft.animalId) setStep(1);
      else if (!draft.stageId) setStep(2);
      else if (draft.temp === null) setStep(3);
      else if (draft.humidity === null) setStep(4);
      else setStep(5);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  useEffect(() => {
    if (activeId) return;
    saveWizardDraft({ animalId, stageId, temp, humidity });
  }, [activeId, animalId, stageId, temp, humidity]);

  const animal = useMemo(
    () => ANIMALS.find((a) => a.id === animalId),
    [animalId],
  );
  const stage = animal?.stages.find((s) => s.id === stageId);

  const persist = (patch: Parameters<typeof updateSelection>[1]) => {
    if (activeId) updateSelection(activeId, patch);
  };

  // Guardado silencioso al llegar al resultado: no le pedimos al productor
  // que bautice nada.
  useEffect(() => {
    if (step !== 5 || guardado.current) return;
    if (!animal || !stage || temp === null || humidity === null) return;
    guardado.current = true;
    marcarPaso("listo");
    if (activeId) {
      updateSelection(activeId, { animalId, stageId, temp, humidity });
      return;
    }
    const nombre = `${animal.name} · ${stage.name} · ${new Date().toLocaleDateString("es-CO", { day: "numeric", month: "short" })}`;
    const id = create(nombre);
    setActive(id);
    updateSelection(id, { animalId, stageId, temp, humidity });
    clearWizardDraft();
  }, [
    step,
    animal,
    stage,
    temp,
    humidity,
    activeId,
    animalId,
    stageId,
    create,
    setActive,
    updateSelection,
  ]);

  const volverAPreguntas = () => {
    guardado.current = false;
    setStep(1);
  };

  const enResultado = step === 5;

  return (
    <main className="mx-auto flex w-full max-w-[520px] flex-col px-6 pb-16 pt-5">
      <header className="flex items-center justify-between">
        {step > 1 && step < 5 ? (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            aria-label="Pregunta anterior"
            className="inline-flex min-h-11 items-center gap-1 rounded-full px-3 py-2 text-[15px] font-semibold text-foreground/85 transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-5" />
            Atrás
          </button>
        ) : (
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-1 rounded-full px-3 py-2 text-[15px] font-semibold text-foreground/85 transition-colors hover:text-foreground"
          >
            <ChevronLeft className="size-5" />
            Inicio
          </Link>
        )}
        <SiteNav variant={enResultado ? "full" : "focused"} />
      </header>

      {!enResultado && (
        <div className="mt-6">
          <p className="text-[16px] font-semibold text-foreground/85">
            Pregunta {step} de {TOTAL_PREGUNTAS}
          </p>
          <div
            className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted"
            aria-hidden
          >
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${(step / TOTAL_PREGUNTAS) * 100}%` }}
            />
          </div>
        </div>
      )}

      <div className="mt-8">
        {step === 1 && (
          <StepAnimal
            value={animalId}
            onSelect={(id) => {
              setAnimalId(id);
              setStageId("");
              persist({ animalId: id, stageId: undefined });
              setStep(2);
            }}
          />
        )}

        {step === 2 && animal && (
          <StepStage
            animal={animal}
            value={stageId}
            onSelect={(id) => {
              setStageId(id);
              persist({ stageId: id });
              setStep(3);
            }}
          />
        )}

        {step === 3 && (
          <StepClimate
            title="¿Qué tan caliente es la zona de cría?"
            help="Trabajamos con condiciones objetivo entre 24 y 34 grados. Si no está seguro, deje la que viene marcada."
            options={TEMP_OPTIONS}
            unit="°C"
            value={temp ?? TEMP_TIPICA}
            onSelect={(v) => {
              setTemp(v);
              persist({ temp: v });
              setStep(4);
            }}
          />
        )}

        {step === 4 && (
          <StepClimate
            title="¿Y la humedad del aire?"
            help="Buscamos entre 50 y 80 por ciento. Si no está seguro, deje la que viene marcada."
            options={HUMIDITY_OPTIONS}
            unit="%"
            value={humidity ?? HUMEDAD_TIPICA}
            onSelect={(v) => {
              setHumidity(v);
              persist({ humidity: v });
              setStep(5);
            }}
          />
        )}

        {enResultado && animal && stage && temp !== null && humidity !== null && (
          <Resultado
            animalName={animal.name}
            stageName={stage.name}
            temp={temp}
            humidity={humidity}
            onCambiar={volverAPreguntas}
            onNueva={nuevaConsulta}
          />
        )}
      </div>
    </main>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */

function StepAnimal({
  value,
  onSelect,
}: {
  value: string;
  onSelect: (id: string) => void;
}) {
  return (
    <section className="reveal" style={d(0)}>
      <h1 className="text-[1.85rem] font-bold leading-tight tracking-[-0.02em]">
        ¿A qué animal le va a dar la harina?
      </h1>
      <ul className="mt-7 flex flex-col gap-3">
        {ANIMALS.map((a) => {
          const Icon = ANIMAL_ICONS[a.id] ?? Fish;
          const min = a.stages[a.stages.length - 1].proteinMin;
          const max = a.stages[0].proteinMax;
          const selected = value === a.id;
          return (
            <li key={a.id}>
              <button
                type="button"
                onClick={() => onSelect(a.id)}
                aria-pressed={selected}
                className={`flex min-h-20 w-full items-center gap-4 rounded-2xl border p-4 text-left transition-colors ${
                  selected
                    ? "border-primary bg-primary/10"
                    : "border-border/70 bg-card hover:border-primary/40"
                }`}
              >
                <span className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-8" strokeWidth={1.5} />
                </span>
                <span className="flex-1">
                  <span className="block text-[20px] font-bold">{a.name}</span>
                  <span className="mt-0.5 block text-[14px] font-medium text-muted-foreground">
                    {min} a {max} % de proteína
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function StepStage({
  animal,
  value,
  onSelect,
}: {
  animal: (typeof ANIMALS)[number];
  value: string;
  onSelect: (id: string) => void;
}) {
  return (
    <section className="reveal" style={d(0)}>
      <h1 className="text-[1.85rem] font-bold leading-tight tracking-[-0.02em]">
        ¿En qué etapa está su {animal.name.toLowerCase()}?
      </h1>
      <ul className="mt-7 flex flex-col gap-3">
        {animal.stages.map((s) => {
          const selected = value === s.id;
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => onSelect(s.id)}
                aria-pressed={selected}
                className={`flex min-h-18 w-full items-center justify-between gap-3 rounded-2xl border p-4 text-left transition-colors ${
                  selected
                    ? "border-primary bg-primary/10"
                    : "border-border/70 bg-card hover:border-primary/40"
                }`}
              >
                <span className="flex-1">
                  <span className="block text-[18px] font-bold">{s.name}</span>
                  <span className="mt-0.5 block text-[14px] text-muted-foreground">
                    {s.detail}
                  </span>
                </span>
                <span className="text-[14px] font-bold tabular-nums text-primary">
                  {s.proteinMin} a {s.proteinMax} %
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function StepClimate({
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
    <section className="reveal" style={d(0)}>
      <h1 className="text-[1.7rem] font-bold leading-tight tracking-[-0.015em]">
        {title}
      </h1>
      <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
        {help}
      </p>
      <div className="mt-7 grid grid-cols-2 gap-3">
        {options.map((opt) => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSelect(opt.value)}
              aria-pressed={selected}
              className={`flex min-h-22 flex-col items-center justify-center gap-1 rounded-2xl border py-4 transition-colors ${
                selected
                  ? "border-primary bg-primary/10"
                  : "border-border/70 bg-card hover:border-primary/40"
              }`}
            >
              <span className="text-[1.7rem] font-extrabold leading-none tabular-nums">
                {opt.value}
                <span className="ml-0.5 text-[1rem] font-bold text-muted-foreground">
                  {unit}
                </span>
              </span>
              <span className="text-[13px] font-medium text-muted-foreground">
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function Resultado({
  animalName,
  stageName,
  temp,
  humidity,
  onCambiar,
  onNueva,
}: {
  animalName: string;
  stageName: string;
  temp: number;
  humidity: number;
  onCambiar: () => void;
  onNueva: () => void;
}) {
  return (
    <section className="reveal" style={d(0)}>
      <h1 className="text-[1.85rem] font-bold leading-tight tracking-[-0.02em]">
        Las tres comidas en estudio
      </h1>
      <p className="mt-2 text-[16px] leading-relaxed text-foreground/85">
        Le sugerimos comparar estas tres. Todavía no le damos una sola
        respuesta: seguimos aprendiendo.
      </p>

      {/* Una línea, no una tarjeta de cuatro celdas */}
      <p className="mt-6 text-[15px] text-muted-foreground">
        {animalName} · {stageName} · {temp} °C · {humidity} % —{" "}
        <button
          type="button"
          onClick={onCambiar}
          className="font-semibold text-primary underline underline-offset-2"
        >
          cambiar
        </button>
      </p>

      <ul className="mt-6 flex flex-col gap-3">
        {DIETS.map((diet) => (
          <li key={diet.id} className="rounded-2xl bg-card p-4">
            <p className="text-[17px] font-bold">{diet.name}</p>
            <p className="mt-1.5 text-[14px] leading-relaxed text-foreground/85">
              {diet.composition}
            </p>
          </li>
        ))}
      </ul>

      <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
        {HYDRATION_NOTE} Guardado en Mis consultas.
      </p>

      <StepFooter
        primary={{ label: "Preguntar al asistente", href: "/chat" }}
        secondary={{ label: "Ver cómo armar la caja", href: "/como-armar" }}
      />

      <button
        type="button"
        onClick={onNueva}
        className="mt-2 flex min-h-14 w-full items-center justify-center text-[15px] font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground"
      >
        Hacer una consulta para otro animal
      </button>
    </section>
  );
}
