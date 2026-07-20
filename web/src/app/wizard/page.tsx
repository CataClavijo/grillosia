"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { SiteNav } from "@/components/site-nav";
import { ANIMALS, DIETS, HYDRATION_NOTE } from "@/lib/animals";
import { useProjects } from "@/lib/projects-store";

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
  const router = useRouter();
  const { active, activeId, create, setActive, updateSelection } = useProjects();

  const [step, setStep] = useState(1);
  const [animalId, setAnimalId] = useState("");
  const [stageId, setStageId] = useState("");
  const [temp, setTemp] = useState(28);
  const [humidity, setHumidity] = useState(65);

  // Hidratar desde el proyecto activo cuando cambie.
  useEffect(() => {
    if (!active) return;
    setAnimalId(active.selection.animalId ?? "");
    setStageId(active.selection.stageId ?? "");
    setTemp(active.selection.temp ?? 28);
    setHumidity(active.selection.humidity ?? 65);
    // Si el proyecto ya tiene todo respondido, saltamos al resumen.
    if (
      active.selection.animalId &&
      active.selection.stageId &&
      active.selection.temp !== undefined &&
      active.selection.humidity !== undefined
    ) {
      setStep(5);
    } else {
      setStep(1);
    }
  }, [activeId, active]);

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
    if (activeId) {
      updateSelection(activeId, {
        animalId: undefined,
        stageId: undefined,
        temp: undefined,
        humidity: undefined,
      });
    }
  };

  const persist = (patch: Parameters<typeof updateSelection>[1]) => {
    if (activeId) updateSelection(activeId, patch);
  };

  // Si no hay proyecto activo, ofrecer crearlo.
  if (!active) {
    return <NoProjectPrompt onCreate={(name) => {
      const id = create(name);
      setActive(id);
    }} />;
  }

  return (
    <main className="relative mx-auto flex w-full max-w-[520px] flex-col px-6 pb-16 pt-5">
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
        <SiteNav />
      </header>

      {/* Contexto del proyecto */}
      <p className="mt-4 text-[12px] font-semibold text-foreground/55">
        Proyecto:{" "}
        <span className="text-primary">{active.name}</span>{" "}
        <Link
          href="/proyectos"
          className="ml-1 underline underline-offset-2 hover:text-foreground"
        >
          cambiar
        </Link>
      </p>

      {/* Barra de progreso */}
      {step < 5 && (
        <div className="mt-4">
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
          <StepGrid
            title="¿Cuál es la temperatura habitual de su zona de cría?"
            subtitle="Seleccione la más cercana al promedio de su finca."
            icon={Thermometer}
            options={TEMP_OPTIONS}
            unit="°C"
            value={temp}
            onSelect={(v) => {
              setTemp(v);
              persist({ temp: v });
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
              persist({ humidity: v });
              setStep(5);
            }}
          />
        )}

        {step === 5 && animal && stage && (
          <DemoResult
            projectName={active.name}
            animalName={animal.name}
            stageName={stage.name}
            stageDetail={stage.detail}
            proteinMin={stage.proteinMin}
            proteinMax={stage.proteinMax}
            temp={temp}
            humidity={humidity}
            onReset={reset}
            onGoChat={() => router.push("/chat")}
          />
        )}
      </div>
    </main>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */

function NoProjectPrompt({
  onCreate,
}: {
  onCreate: (name: string) => void;
}) {
  const [name, setName] = useState("Mi primera cría");
  return (
    <main className="relative mx-auto flex w-full max-w-[520px] flex-col px-6 pb-16 pt-5">
      <header className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[14px] font-semibold text-foreground/70 transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-5 w-5" />
          Inicio
        </Link>
        <SiteNav />
      </header>
      <section className="mt-10">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Sparkles className="h-6 w-6" strokeWidth={1.5} />
        </span>
        <h1 className="mt-5 text-[1.85rem] font-bold leading-tight tracking-[-0.02em]">
          Empecemos con un proyecto
        </h1>
        <p className="mt-3 text-[15.5px] leading-relaxed text-foreground/75">
          Un proyecto guarda su animal destino, el clima y la conversación con
          el asistente. Puede tener varios y cambiarse entre ellos.
        </p>
        <label
          className="mt-8 block text-[12px] font-bold uppercase tracking-wider text-foreground/55"
          htmlFor="project-name"
        >
          Nombre del proyecto
        </label>
        <input
          id="project-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onCreate(name || "Mi primera cría");
          }}
          className="mt-2 h-12 w-full rounded-xl border border-border bg-background px-4 text-[15.5px] outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
        />
        <Button
          size="lg"
          onClick={() => onCreate(name || "Mi primera cría")}
          className="mt-5 h-auto w-full justify-between rounded-2xl px-5 py-4 text-[16px] font-semibold"
        >
          Crear y continuar
        </Button>
      </section>
    </main>
  );
}

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
}: {
  projectName: string;
  animalName: string;
  stageName: string;
  stageDetail: string;
  proteinMin: number;
  proteinMax: number;
  temp: number;
  humidity: number;
  onReset: () => void;
  onGoChat: () => void;
}) {
  return (
    <section className="reveal" style={d(0)}>
      <div className="inline-flex items-center gap-2 rounded-full border border-demo-border bg-demo-bg px-3 py-1.5 text-[11.5px] font-bold uppercase tracking-wider text-demo-foreground">
        <Info className="h-3.5 w-3.5" strokeWidth={2.25} />
        Vista demostrativa
      </div>

      <h1 className="mt-4 text-[1.85rem] font-bold leading-tight tracking-[-0.02em]">
        Las dietas que estamos estudiando
      </h1>
      <p className="mt-2 text-[15px] leading-relaxed text-foreground/70">
        Por ahora no entregamos una recomendación: el modelo aún está en fase
        de entrenamiento. Le mostramos las tres dietas que el proyecto está
        comparando junto con la meta de proteína que pide el animal que indicó.
      </p>

      <div className="mt-6 rounded-2xl border border-border/70 bg-card/60 p-4">
        <p className="text-[12px] font-bold uppercase tracking-wider text-foreground/55">
          Su consulta ({projectName})
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
          <div className="col-span-2">
            <dt className="text-foreground/55">
              Meta de proteína{" "}
              <span className="font-normal italic">(referencia NRC)</span>
            </dt>
            <dd className="text-[16px] font-bold text-primary">
              {proteinMin} a {proteinMax} %
            </dd>
          </div>
          <div className="col-span-2">
            <dt className="text-foreground/55">Clima indicado</dt>
            <dd className="font-semibold">
              {temp} °C · {humidity} % HR
            </dd>
          </div>
        </dl>
      </div>

      <p className="mt-7 text-[12px] font-bold uppercase tracking-wider text-foreground/55">
        Dietas en estudio
      </p>
      <ul className="mt-3 space-y-3">
        {DIETS.map((diet) => (
          <li
            key={diet.id}
            className="rounded-2xl border border-border/70 bg-card/70 p-4"
          >
            <div className="flex items-baseline gap-2">
              <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[11.5px] font-bold tabular-nums text-primary">
                {diet.id}
              </span>
              <span className="text-[16px] font-bold">{diet.name}</span>
            </div>
            <p className="mt-2 text-[13.5px] leading-relaxed text-foreground/75">
              {diet.composition}
            </p>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[12.5px] leading-relaxed text-foreground/60">
        {HYDRATION_NOTE}
      </p>

      <div className="mt-7 rounded-2xl border border-demo-border bg-demo-bg/70 p-4">
        <div className="flex items-start gap-3">
          <Info
            className="mt-0.5 h-4 w-4 shrink-0 text-demo-foreground"
            strokeWidth={2.25}
          />
          <p className="text-[13px] leading-relaxed text-demo-foreground">
            Esta es una vista <strong>demostrativa</strong>. Cuando termine la
            fase de entrenamiento del modelo, en este lugar verá una sugerencia
            comparativa entre las dietas según el clima y el animal indicado.
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <Button
          size="lg"
          onClick={onGoChat}
          className="h-auto justify-between rounded-2xl px-5 py-5 text-[16px] font-semibold"
        >
          <span className="flex items-center gap-3">
            <Bot className="h-5 w-5" strokeWidth={2} />
            Preguntar al asistente
          </span>
          <span className="text-[13px] font-bold opacity-80">→</span>
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
