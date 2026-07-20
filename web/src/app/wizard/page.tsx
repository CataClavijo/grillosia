"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CSSProperties } from "react";
import {
  Beef,
  Bot,
  Check,
  ChevronLeft,
  Droplets,
  Egg,
  Fish,
  Info,
  Save,
  Sparkles,
  Thermometer,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { SiteNav } from "@/components/site-nav";
import { ANIMALS, DIETS, HYDRATION_NOTE } from "@/lib/animals";
import { useProjects } from "@/lib/projects-store";

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

const TOTAL_STEPS = 5;

const DRAFT_KEY = "grillia-wizard-draft";

interface Draft {
  animalId: string;
  stageId: string;
  temp: number | null;
  humidity: number | null;
}

function loadDraft(): Draft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as Draft) : null;
  } catch {
    return null;
  }
}

function saveDraft(d: Draft) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(d));
  } catch {
    /* noop */
  }
}

function clearDraft() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    /* noop */
  }
}

const d = (ms: number): CSSProperties =>
  ({ ["--delay" as string]: `${ms}ms` }) as CSSProperties;

export default function WizardPage() {
  const router = useRouter();
  const { active, activeId, create, setActive, updateSelection } =
    useProjects();

  const [step, setStep] = useState(1);
  const [animalId, setAnimalId] = useState("");
  const [stageId, setStageId] = useState("");
  const [temp, setTemp] = useState<number | null>(null);
  const [humidity, setHumidity] = useState<number | null>(null);

  // Hidratación inicial: si hay proyecto activo, priorizarlo. Si no, usar draft.
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
    const draft = loadDraft();
    if (draft) {
      setAnimalId(draft.animalId);
      setStageId(draft.stageId);
      setTemp(draft.temp);
      setHumidity(draft.humidity);
      // avanzar al primer paso sin responder
      if (!draft.animalId) setStep(1);
      else if (!draft.stageId) setStep(2);
      else if (draft.temp === null) setStep(3);
      else if (draft.humidity === null) setStep(4);
      else setStep(5);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  // Guardar draft en cada cambio (si NO hay proyecto activo).
  useEffect(() => {
    if (activeId) return;
    saveDraft({ animalId, stageId, temp, humidity });
  }, [activeId, animalId, stageId, temp, humidity]);

  const animal = useMemo(
    () => ANIMALS.find((a) => a.id === animalId),
    [animalId],
  );
  const stage = animal?.stages.find((s) => s.id === stageId);

  const persist = (patch: Parameters<typeof updateSelection>[1]) => {
    if (activeId) updateSelection(activeId, patch);
  };

  const reset = () => {
    setStep(1);
    setAnimalId("");
    setStageId("");
    setTemp(null);
    setHumidity(null);
    clearDraft();
    if (activeId) {
      updateSelection(activeId, {
        animalId: undefined,
        stageId: undefined,
        temp: undefined,
        humidity: undefined,
      });
    }
  };

  return (
    <main className="relative mx-auto flex w-full max-w-[520px] flex-col px-6 pb-16 pt-5">
      {/* Cabecera compacta */}
      <header className="flex items-center justify-between">
        {step > 1 && step < 5 ? (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="inline-flex min-h-[44px] items-center gap-1 rounded-full px-3 py-2 text-[15px] font-semibold text-foreground/85 transition-colors hover:text-foreground"
            aria-label="Volver al paso anterior"
          >
            <ChevronLeft className="h-5 w-5" />
            Atrás
          </button>
        ) : (
          <Link
            href="/"
            className="inline-flex min-h-[44px] items-center gap-1 rounded-full px-3 py-2 text-[15px] font-semibold text-foreground/85 transition-colors hover:text-foreground"
          >
            <ChevronLeft className="h-5 w-5" />
            Inicio
          </Link>
        )}
        <SiteNav variant={step < 5 ? "focused" : "full"} />
      </header>

      {/* Contexto de la consulta activa si existe */}
      {active && (
        <p className="mt-4 text-[13px] font-semibold text-foreground/70">
          Consulta:{" "}
          <span className="text-primary">{active.name}</span>{" "}
          <Link
            href="/proyectos"
            className="ml-1 underline underline-offset-2 hover:text-foreground"
          >
            cambiar
          </Link>
        </p>
      )}

      {/* Barra de progreso */}
      {step < 5 && (
        <div className="mt-4">
          <p className="text-[12.5px] font-semibold uppercase tracking-wider text-foreground/70">
            Paso {step} de {TOTAL_STEPS - 1}
          </p>
          <div
            className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted"
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
            subtitle="Escoja lo más parecido a su finca."
            icon={Thermometer}
            options={TEMP_OPTIONS}
            unit="°C"
            value={temp}
            typicalValue={28}
            typicalLabel="Use el más común en el llano (28 °C)"
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
            subtitle="Si no sabe, elija lo típico de su región."
            icon={Droplets}
            options={HUMIDITY_OPTIONS}
            unit="%"
            value={humidity}
            typicalValue={65}
            typicalLabel="Use lo típico del llano (65 %)"
            onSelect={(v) => {
              setHumidity(v);
              persist({ humidity: v });
              setStep(5);
            }}
          />
        )}

        {step === 5 && animal && stage && temp !== null && humidity !== null && (
          <DemoResult
            projectName={active?.name ?? null}
            animalName={animal.name}
            stageName={stage.name}
            stageDetail={stage.detail}
            proteinMin={stage.proteinMin}
            proteinMax={stage.proteinMax}
            temp={temp}
            humidity={humidity}
            onReset={reset}
            onGoChat={() => router.push("/chat")}
            onSaveConsulta={(name) => {
              const finalName =
                name.trim() ||
                `${animal.name} · ${new Date().toLocaleDateString("es-CO")}`;
              const id = create(finalName);
              setActive(id);
              updateSelection(id, {
                animalId,
                stageId,
                temp,
                humidity,
              });
              clearDraft();
              router.push("/proyectos");
            }}
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
      <p className="mt-2 text-[16px] text-foreground/85">
        Adaptamos la sugerencia al destino.
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
                aria-pressed={selected}
                className={`flex min-h-[80px] w-full items-center gap-4 rounded-2xl border p-4 text-left transition-colors ${
                  selected
                    ? "border-primary bg-primary/10"
                    : "border-border/70 bg-card/70 hover:border-primary/40 hover:bg-card"
                }`}
              >
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-8 w-8" strokeWidth={1.5} />
                </span>
                <span className="flex-1">
                  <span className="block text-[20px] font-bold">{a.name}</span>
                  <span className="mt-0.5 block text-[14px] font-semibold text-primary">
                    {min} a {max} % de proteína
                  </span>
                  <span className="mt-1 block text-[13.5px] text-foreground/80">
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
      <p className="mt-2 text-[16px] text-foreground/85">
        La etapa nos dice cuánta proteína necesita.
      </p>
      <ul className="mt-7 space-y-3">
        {animal.stages.map((s) => {
          const selected = value === s.id;
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => onSelect(s.id)}
                aria-pressed={selected}
                className={`flex min-h-[72px] w-full items-center justify-between gap-3 rounded-2xl border p-4 text-left transition-colors ${
                  selected
                    ? "border-primary bg-primary/10"
                    : "border-border/70 bg-card/70 hover:border-primary/40 hover:bg-card"
                }`}
              >
                <span className="flex-1">
                  <span className="block text-[18px] font-bold">{s.name}</span>
                  <span className="mt-0.5 block text-[14px] text-foreground/80">
                    {s.detail}
                  </span>
                </span>
                <span className="rounded-full bg-primary/10 px-3 py-1.5 text-[13.5px] font-bold tabular-nums text-primary">
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
  subtitle,
  icon: Icon,
  options,
  unit,
  value,
  typicalValue,
  typicalLabel,
  onSelect,
}: {
  title: string;
  subtitle: string;
  icon: typeof Thermometer;
  options: ClimateOption[];
  unit: string;
  value: number | null;
  typicalValue: number;
  typicalLabel: string;
  onSelect: (v: number) => void;
}) {
  return (
    <section className="reveal" style={d(0)}>
      <div className="flex items-center gap-2 text-primary">
        <Icon className="h-5 w-5" strokeWidth={1.75} />
        <span className="text-[13px] font-bold uppercase tracking-wider">
          Ambiente
        </span>
      </div>
      <h1 className="mt-3 text-[1.7rem] font-bold leading-tight tracking-[-0.015em]">
        {title}
      </h1>
      <p className="mt-2 text-[16px] text-foreground/85">{subtitle}</p>
      <div className="mt-7 grid grid-cols-2 gap-3">
        {options.map((opt) => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSelect(opt.value)}
              aria-pressed={selected}
              className={`flex min-h-[88px] flex-col items-center justify-center gap-1 rounded-2xl border py-4 transition-colors ${
                selected
                  ? "border-primary bg-primary/10"
                  : "border-border/70 bg-card/70 hover:border-primary/40 hover:bg-card"
              }`}
            >
              <span className="text-[1.7rem] font-extrabold leading-none tabular-nums">
                {opt.value}
                <span className="ml-0.5 text-[1rem] font-bold text-foreground/60">
                  {unit}
                </span>
              </span>
              <span className="text-[13px] font-semibold text-foreground/75">
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={() => onSelect(typicalValue)}
        className="mt-6 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-card/40 px-4 py-3 text-[15px] font-semibold text-foreground/85 transition-colors hover:border-primary/40 hover:text-foreground"
      >
        No estoy seguro · {typicalLabel}
      </button>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Resultado — con opción de GUARDAR consulta al final (no antes).
   ────────────────────────────────────────────────────────────────────── */

function DemoResult({
  projectName,
  animalName,
  stageName,
  stageDetail,
  proteinMin,
  proteinMax,
  temp,
  humidity,
  onReset,
  onGoChat,
  onSaveConsulta,
}: {
  projectName: string | null;
  animalName: string;
  stageName: string;
  stageDetail: string;
  proteinMin: number;
  proteinMax: number;
  temp: number;
  humidity: number;
  onReset: () => void;
  onGoChat: () => void;
  onSaveConsulta: (name: string) => void;
}) {
  const [saveOpen, setSaveOpen] = useState(false);
  const [name, setName] = useState(
    `${animalName} · ${new Date().toLocaleDateString("es-CO")}`,
  );

  return (
    <section className="reveal" style={d(0)}>
      <div className="inline-flex items-center gap-2 rounded-full border border-demo-border bg-demo-bg px-3 py-1.5 text-[12px] font-bold uppercase tracking-wider text-demo-foreground">
        <Info className="h-3.5 w-3.5" strokeWidth={2.25} />
        Vista de comparación
      </div>

      <h1 className="mt-4 text-[1.85rem] font-bold leading-tight tracking-[-0.02em]">
        Comidas que estamos probando
      </h1>
      <p className="mt-2 text-[16px] leading-relaxed text-foreground/85">
        Por ahora no le damos una única respuesta: estamos aprendiendo. Le
        mostramos las tres comidas que estamos comparando y la meta de
        proteína que pide su animal.
      </p>

      <div className="mt-6 rounded-2xl border border-border/70 bg-card/60 p-4">
        <p className="text-[12.5px] font-bold uppercase tracking-wider text-foreground/70">
          Sus respuestas{projectName ? ` (${projectName})` : ""}
        </p>
        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-[15px]">
          <div>
            <dt className="text-foreground/70">Animal</dt>
            <dd className="font-semibold">{animalName}</dd>
          </div>
          <div>
            <dt className="text-foreground/70">Etapa</dt>
            <dd className="font-semibold">
              {stageName}{" "}
              <span className="text-foreground/70">({stageDetail})</span>
            </dd>
          </div>
          <div className="col-span-2">
            <dt className="text-foreground/70">Meta de proteína</dt>
            <dd className="text-[17px] font-bold text-primary">
              {proteinMin} a {proteinMax} %
            </dd>
          </div>
          <div className="col-span-2">
            <dt className="text-foreground/70">Clima que indicó</dt>
            <dd className="font-semibold">
              {temp} °C · {humidity} % de humedad
            </dd>
          </div>
        </dl>
      </div>

      <p className="mt-7 text-[12.5px] font-bold uppercase tracking-wider text-foreground/70">
        Las tres comidas
      </p>
      <ul className="mt-3 space-y-3">
        {DIETS.map((diet) => (
          <li
            key={diet.id}
            className="rounded-2xl border border-border/70 bg-card/70 p-4"
          >
            <div className="flex items-baseline gap-2">
              <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[12px] font-bold tabular-nums text-primary">
                {diet.id}
              </span>
              <span className="text-[17px] font-bold">{diet.name}</span>
            </div>
            <p className="mt-2 text-[14px] leading-relaxed text-foreground/85">
              {diet.composition}
            </p>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[13px] leading-relaxed text-foreground/70">
        {HYDRATION_NOTE}
      </p>

      <div className="mt-7 rounded-2xl border border-demo-border bg-demo-bg/70 p-4">
        <div className="flex items-start gap-3">
          <Info
            className="mt-0.5 h-4 w-4 shrink-0 text-demo-foreground"
            strokeWidth={2.25}
          />
          <p className="text-[14px] leading-relaxed text-demo-foreground">
            Estamos en pruebas. Cuando terminemos de aprender, en esta pantalla
            verá cuál comida se acerca más a la meta de su animal.
          </p>
        </div>
      </div>

      {/* Acciones */}
      <div className="mt-6 space-y-3">
        {!projectName && (
          <>
            {saveOpen ? (
              <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4">
                <label
                  htmlFor="consulta-name"
                  className="text-[12.5px] font-bold uppercase tracking-wider text-foreground/70"
                >
                  Nombre para reconocerla después (opcional)
                </label>
                <input
                  id="consulta-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") onSaveConsulta(name);
                  }}
                  autoFocus
                  className="mt-2 h-12 w-full rounded-xl border border-border bg-background px-3 text-[16px] outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                />
                <div className="mt-3 flex gap-2">
                  <Button
                    onClick={() => onSaveConsulta(name)}
                    className="h-12 flex-1 rounded-xl text-[15px] font-bold"
                  >
                    <Check className="h-4 w-4" strokeWidth={2.5} />
                    Guardar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSaveOpen(false)}
                    className="h-12 rounded-xl border-border bg-card px-4 text-[14px] font-semibold"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                onClick={() => setSaveOpen(true)}
                className="h-14 w-full justify-between rounded-2xl px-5 text-[16px] font-bold"
              >
                <span className="flex items-center gap-3">
                  <Save className="h-5 w-5" strokeWidth={2} />
                  Guardar esta consulta
                </span>
                <span className="text-[13px] font-bold opacity-80">→</span>
              </Button>
            )}
          </>
        )}
        <Button
          onClick={onGoChat}
          variant="outline"
          className="h-14 w-full justify-between rounded-2xl border-primary/30 bg-card px-5 text-[16px] font-bold"
        >
          <span className="flex items-center gap-3 text-foreground">
            <Bot className="h-5 w-5 text-primary" strokeWidth={2} />
            Preguntar al asistente
          </span>
          <span className="text-[13px] font-bold text-primary opacity-80">
            →
          </span>
        </Button>
        <button
          type="button"
          onClick={onReset}
          className="flex min-h-[48px] w-full items-center justify-center gap-2 text-[14.5px] font-semibold text-foreground/85 underline underline-offset-4 hover:text-foreground"
        >
          <Sparkles className="h-4 w-4 text-primary" strokeWidth={2} />
          Hacer otra consulta desde el principio
        </button>
      </div>
    </section>
  );
}
