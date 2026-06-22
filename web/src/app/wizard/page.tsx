"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { CSSProperties } from "react";
import {
  Beef,
  Bot,
  ChevronLeft,
  Droplets,
  Egg,
  Fish,
  Info,
  Sparkles,
  Thermometer,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { ANIMALS, DIETS } from "@/lib/animals";

const ANIMAL_ICONS: Record<string, typeof Fish> = {
  tilapia: Fish,
  pollo: Egg,
  cerdo: Beef,
};

const TEMP_OPTIONS = [24, 26, 28, 30, 32, 34];
const HUMIDITY_OPTIONS = [50, 55, 60, 65, 70, 75, 80];

const TOTAL_STEPS = 5;

const d = (ms: number): CSSProperties =>
  ({ ["--delay" as string]: `${ms}ms` }) as CSSProperties;

export default function WizardPage() {
  const [step, setStep] = useState(1);
  const [animalId, setAnimalId] = useState("");
  const [stageId, setStageId] = useState("");
  const [temp, setTemp] = useState(28);
  const [humidity, setHumidity] = useState(65);

  const animal = useMemo(
    () => ANIMALS.find((a) => a.id === animalId),
    [animalId],
  );
  const stage = animal?.stages.find((s) => s.id === stageId);

  const reset = () => {
    setStep(1);
    setAnimalId("");
    setStageId("");
    setTemp(28);
    setHumidity(65);
  };

  return (
    <main className="relative mx-auto flex w-full max-w-[480px] flex-col px-6 pb-16 pt-5">
      {/* Cabecera */}
      <header className="flex items-center justify-between">
        {step > 1 && step < 5 ? (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[14px] font-semibold text-foreground/70 transition-colors hover:text-foreground"
            aria-label="Volver al paso anterior"
          >
            <ChevronLeft className="h-5 w-5" />
            Atrás
          </button>
        ) : (
          <Link
            href="/"
            className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[14px] font-semibold text-foreground/70 transition-colors hover:text-foreground"
          >
            <ChevronLeft className="h-5 w-5" />
            Inicio
          </Link>
        )}
        <ThemeToggle />
      </header>

      {/* Barra de progreso simple */}
      {step < 5 && (
        <div className="mt-6">
          <div className="flex items-center justify-between text-[11.5px] font-semibold uppercase tracking-wider text-foreground/55">
            <span>
              Paso {step} de {TOTAL_STEPS - 1}
            </span>
            <span>Asistente guiado</span>
          </div>
          <div
            className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted"
            aria-hidden
          >
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${(step / (TOTAL_STEPS - 1)) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Steps */}
      <div className="mt-8">
        {step === 1 && (
          <StepAnimal
            value={animalId}
            onSelect={(id) => {
              setAnimalId(id);
              setStageId("");
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
              setStep(3);
            }}
          />
        )}

        {step === 3 && (
          <StepGrid
            title="¿Cuál es la temperatura habitual de su zona de cría?"
            subtitle="Seleccione la más cercana al promedio de su finca."
            icon={Thermometer}
            options={TEMP_OPTIONS}
            unit="°C"
            value={temp}
            onSelect={(v) => {
              setTemp(v);
              setStep(4);
            }}
          />
        )}

        {step === 4 && (
          <StepGrid
            title="¿Y la humedad relativa promedio?"
            subtitle="Si no la conoce, elija el rango más típico de su región."
            icon={Droplets}
            options={HUMIDITY_OPTIONS}
            unit="%"
            value={humidity}
            onSelect={(v) => {
              setHumidity(v);
              setStep(5);
            }}
          />
        )}

        {step === 5 && animal && stage && (
          <DemoResult
            animalName={animal.name}
            stageName={stage.name}
            stageDetail={stage.detail}
            proteinMin={stage.proteinMin}
            proteinMax={stage.proteinMax}
            temp={temp}
            humidity={humidity}
            onReset={reset}
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
        ¿A qué animal va destinada la harina?
      </h1>
      <p className="mt-2 text-[15px] text-foreground/65">
        Adaptamos la sugerencia al destino productivo.
      </p>
      <ul className="mt-7 space-y-3">
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
                className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-colors ${
                  selected
                    ? "border-primary bg-primary/10"
                    : "border-border/70 bg-card/70 hover:border-primary/40 hover:bg-card"
                }`}
              >
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-7 w-7" strokeWidth={1.5} />
                </span>
                <span className="flex-1">
                  <span className="block text-[19px] font-bold">{a.name}</span>
                  <span className="mt-0.5 block text-[13.5px] font-semibold text-primary">
                    {min} a {max} % de proteína
                  </span>
                  <span className="mt-1 block text-[13px] text-foreground/65">
                    {a.stages.length} etapas productivas
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
      <p className="mt-2 text-[15px] text-foreground/65">
        La etapa marca la meta de proteína que buscamos.
      </p>
      <ul className="mt-7 space-y-3">
        {animal.stages.map((s) => {
          const selected = value === s.id;
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => onSelect(s.id)}
                className={`flex w-full items-center justify-between gap-3 rounded-2xl border p-4 text-left transition-colors ${
                  selected
                    ? "border-primary bg-primary/10"
                    : "border-border/70 bg-card/70 hover:border-primary/40 hover:bg-card"
                }`}
              >
                <span className="flex-1">
                  <span className="block text-[17px] font-bold">{s.name}</span>
                  <span className="mt-0.5 block text-[13px] text-foreground/65">
                    {s.detail}
                  </span>
                </span>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-[12.5px] font-bold text-primary tabular-nums">
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

function StepGrid({
  title,
  subtitle,
  icon: Icon,
  options,
  unit,
  value,
  onSelect,
}: {
  title: string;
  subtitle: string;
  icon: typeof Thermometer;
  options: number[];
  unit: string;
  value: number;
  onSelect: (v: number) => void;
}) {
  return (
    <section className="reveal" style={d(0)}>
      <div className="flex items-center gap-2 text-primary">
        <Icon className="h-5 w-5" strokeWidth={1.75} />
        <span className="text-[12px] font-bold uppercase tracking-wider">
          Condición climática
        </span>
      </div>
      <h1 className="mt-3 text-[1.7rem] font-bold leading-tight tracking-[-0.015em]">
        {title}
      </h1>
      <p className="mt-2 text-[15px] text-foreground/65">{subtitle}</p>
      <div className="mt-7 grid grid-cols-3 gap-3">
        {options.map((opt) => {
          const selected = value === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onSelect(opt)}
              className={`flex flex-col items-center gap-1 rounded-2xl border py-5 transition-colors ${
                selected
                  ? "border-primary bg-primary/10"
                  : "border-border/70 bg-card/70 hover:border-primary/40 hover:bg-card"
              }`}
            >
              <span className="text-[1.6rem] font-extrabold leading-none tabular-nums">
                {opt}
              </span>
              <span className="text-[12px] font-semibold text-foreground/60">
                {unit}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Pantalla de resultado — demostrativa. NO predice; muestra las dietas en
   estudio con bandas orientativas calculadas localmente.
   ────────────────────────────────────────────────────────────────────── */

interface DemoRow {
  diet: (typeof DIETS)[number];
  proteinLow: number;
  proteinHigh: number;
  matchScore: number; // 0..1 cuánto cubre la meta de proteína
}

/**
 * Bandas orientativas asociadas a cada dieta. No son predicciones del modelo;
 * son rangos de literatura preliminar usados solo para la demo.
 */
const DIET_BANDS: Record<
  (typeof DIETS)[number]["id"],
  { low: number; high: number }
> = {
  D1: { low: 56, high: 62 },
  D2: { low: 52, high: 58 },
  D3: { low: 58, high: 64 },
  D4: { low: 62, high: 68 },
};

function DemoResult({
  animalName,
  stageName,
  stageDetail,
  proteinMin,
  proteinMax,
  temp,
  humidity,
  onReset,
}: {
  animalName: string;
  stageName: string;
  stageDetail: string;
  proteinMin: number;
  proteinMax: number;
  temp: number;
  humidity: number;
  onReset: () => void;
}) {
  const rows: DemoRow[] = useMemo(() => {
    return DIETS.map((diet) => {
      const band = DIET_BANDS[diet.id];
      // Ajuste leve por temperatura/humedad sin pretender precisión científica.
      const climateAdj =
        (temp >= 26 && temp <= 30 ? 0.5 : -0.5) +
        (humidity >= 55 && humidity <= 70 ? 0.5 : -0.5);
      const proteinLow = Math.round(band.low + climateAdj);
      const proteinHigh = Math.round(band.high + climateAdj);

      // Cuánto del rango de la dieta cae dentro de la meta del animal.
      const overlapLow = Math.max(proteinLow, proteinMin);
      const overlapHigh = Math.min(proteinHigh, proteinMax);
      const overlap = Math.max(0, overlapHigh - overlapLow);
      const span = Math.max(1, proteinMax - proteinMin);
      const matchScore = Math.min(1, overlap / span);

      return { diet, proteinLow, proteinHigh, matchScore };
    }).sort((a, b) => b.matchScore - a.matchScore);
  }, [proteinMin, proteinMax, temp, humidity]);

  return (
    <section className="reveal" style={d(0)}>
      <div className="inline-flex items-center gap-2 rounded-full border border-demo-border bg-demo-bg px-3 py-1.5 text-[11.5px] font-bold uppercase tracking-wider text-demo-foreground">
        <Info className="h-3.5 w-3.5" strokeWidth={2.25} />
        Resultado demostrativo
      </div>

      <h1 className="mt-4 text-[1.85rem] font-bold leading-tight tracking-[-0.02em]">
        Comparación de dietas en estudio
      </h1>
      <p className="mt-2 text-[15px] leading-relaxed text-foreground/70">
        Le sugerimos las dietas con mejor ajuste a su caso. No es una
        recomendación definitiva: las bandas son rangos preliminares que el
        modelo está validando.
      </p>

      {/* Contexto */}
      <div className="mt-6 rounded-2xl border border-border/70 bg-card/60 p-4">
        <p className="text-[12px] font-bold uppercase tracking-wider text-foreground/55">
          Su consulta
        </p>
        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-[14px]">
          <div>
            <dt className="text-foreground/55">Animal</dt>
            <dd className="font-semibold">{animalName}</dd>
          </div>
          <div>
            <dt className="text-foreground/55">Etapa</dt>
            <dd className="font-semibold">
              {stageName}{" "}
              <span className="text-foreground/55">({stageDetail})</span>
            </dd>
          </div>
          <div>
            <dt className="text-foreground/55">Meta de proteína</dt>
            <dd className="font-semibold text-primary">
              {proteinMin} a {proteinMax} %
            </dd>
          </div>
          <div>
            <dt className="text-foreground/55">Clima</dt>
            <dd className="font-semibold">
              {temp} °C · {humidity} % HR
            </dd>
          </div>
        </dl>
      </div>

      {/* Comparación */}
      <ul className="mt-6 space-y-3">
        {rows.map((row, i) => (
          <li
            key={row.diet.id}
            className={`rounded-2xl border p-4 ${
              i === 0
                ? "border-primary/40 bg-primary/5"
                : "border-border/70 bg-card/60"
            }`}
          >
            <div className="flex items-baseline justify-between gap-3">
              <div className="flex items-baseline gap-2">
                <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[11.5px] font-bold tabular-nums text-primary">
                  {row.diet.id}
                </span>
                <span className="text-[16px] font-bold">{row.diet.name}</span>
              </div>
              {i === 0 && (
                <span className="rounded-full bg-gold/30 px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-foreground/85">
                  Mejor ajuste
                </span>
              )}
            </div>
            <p className="mt-1 text-[13px] text-foreground/65">
              {row.diet.composition}
            </p>
            <div className="mt-3 flex items-center gap-3">
              <span className="text-[12px] font-semibold text-foreground/55">
                Banda estimada
              </span>
              <span className="text-[14px] font-bold tabular-nums">
                {row.proteinLow} a {row.proteinHigh} %
              </span>
              <span
                className="ml-auto rounded-md bg-muted px-2 py-0.5 text-[11.5px] font-bold uppercase tracking-wider text-foreground/70"
                title="Cobertura de la meta de proteína del animal"
              >
                Ajuste {Math.round(row.matchScore * 100)} %
              </span>
            </div>
          </li>
        ))}
      </ul>

      {/* Disclaimer */}
      <div className="mt-7 rounded-2xl border border-demo-border bg-demo-bg/70 p-4">
        <div className="flex items-start gap-3">
          <Info
            className="mt-0.5 h-4 w-4 shrink-0 text-demo-foreground"
            strokeWidth={2.25}
          />
          <p className="text-[13px] leading-relaxed text-demo-foreground">
            Esta comparación es <strong>demostrativa</strong>. Las bandas se
            basan en literatura preliminar y servirán para validar la
            experiencia de usuario. El modelo final está en fase de
            entrenamiento.
          </p>
        </div>
      </div>

      {/* Acciones */}
      <div className="mt-6 flex flex-col gap-3">
        <Button
          asChild
          size="lg"
          className="h-auto justify-between rounded-2xl px-5 py-5 text-[16px] font-semibold"
        >
          <Link href="/chat">
            <span className="flex items-center gap-3">
              <Bot className="h-5 w-5" strokeWidth={2} />
              Preguntar al asistente
            </span>
            <span className="text-[13px] font-bold opacity-80">→</span>
          </Link>
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={onReset}
          className="h-auto justify-center gap-2 rounded-2xl border-border bg-card/60 px-5 py-5 text-[15px] font-semibold"
        >
          <Sparkles className="h-4 w-4 text-primary" strokeWidth={2} />
          Hacer otra consulta
        </Button>
      </div>
    </section>
  );
}
