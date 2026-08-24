"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CSSProperties } from "react";
import { ArrowLeft, Beef, ChevronLeft, Egg, Fish } from "lucide-react";

import { Barra } from "@/components/barra";
import { SiteNav } from "@/components/site-nav";
import { StepFooter } from "@/components/step-footer";
import { ANIMALS, DIETS, HYDRATION_NOTE } from "@/lib/animals";
import { useProjects } from "@/lib/projects-store";
import { marcarPaso } from "@/lib/journey";
import { usePrediccion } from "@/lib/prediccion";
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

  const router = useRouter();
  const [step, setStep] = useState(1);
  const [animalId, setAnimalId] = useState("");
  const [stageId, setStageId] = useState("");
  const [temp, setTemp] = useState<number | null>(null);
  const [humidity, setHumidity] = useState<number | null>(null);
  const guardado = useRef(false);

  useEffect(() => {
    marcarPaso("3");
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
    if (activeId) void updateSelection(activeId, patch);
  };

  /**
   * Al contestar la cuarta pregunta: se guarda la consulta y se pasa a la
   * parada 4, que vive en su propia ruta.
   *
   * La navegacion va en `finally` a proposito. El resultado se calcula con lo
   * que el productor acaba de responder, no con lo guardado, asi que aunque
   * el guardado falle —sin senal, por ejemplo— igual tiene que ver su
   * resultado. Perder el guardado es molesto; perder el resultado despues de
   * contestar cuatro preguntas es motivo para cerrar la aplicacion.
   */
  useEffect(() => {
    if (step !== 5 || guardado.current) return;
    if (!animal || !stage || temp === null || humidity === null) return;
    guardado.current = true;
    marcarPaso("listo");

    const seleccion = { animalId, stageId, temp, humidity };

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
    step,
    animal,
    stage,
    temp,
    humidity,
    activeId,
    animalId,
    stageId,
    create,
    updateSelection,
    router,
  ]);

  const volverAPreguntas = () => {
    guardado.current = false;
    setStep(1);
  };

  const enResultado = step === 5;

  return (
    <>
      {/* En escritorio hay sitio para la navegacion completa; en celular
          bastan la flecha de atras y el menu. La clase va en la barra y no en
          un envoltorio, que le quitaba el `sticky`. */}
      <Barra className="hidden lg:block" />
    <main className="mx-auto flex w-full max-w-[560px] flex-col px-5 lg:px-8 pb-16 pt-5">
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
        {/* Solo en celular: en escritorio la barra de arriba ya lleva la
            navegacion, y dos menus a la vez confunden. */}
        <div className="lg:hidden">
          <SiteNav variant={enResultado ? "full" : "focused"} />
        </div>
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
              // Fin de la parada 3. El resultado vive en su propia ruta.
              setStep(5);
            }}
          />
        )}

        {enResultado && (
          <p className="py-10 text-center text-[16px] text-muted-foreground">
            Preparando su resultado...
          </p>
        )}
      </div>
    </main>
    </>
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
      <h1 className="font-display text-[1.7rem] font-extrabold leading-[1.12] tracking-[-0.03em]">
        ¿A qué animal le va a dar la harina?
      </h1>
      <ul className="mt-6 flex flex-col gap-2.5">
        {ANIMALS.map((a) => {
          const min = a.stages[a.stages.length - 1].proteinMin;
          const max = a.stages[0].proteinMax;
          const sel = value === a.id;
          return (
            <li key={a.id}>
              <button
                type="button"
                onClick={() => onSelect(a.id)}
                aria-pressed={sel}
                className={`flex min-h-[74px] w-full items-center gap-3 rounded-2xl border-2 px-3 py-2.5 text-left transition-colors ${
                  sel
                    ? "border-primary bg-primary/8"
                    : "border-border/70 bg-card hover:border-primary/40"
                }`}
              >
                {/* La misma lamina grabada de la portada, partida en tres */}
                <Image
                  src={`/animales/${a.id}.webp`}
                  alt=""
                  width={280}
                  height={200}
                  aria-hidden
                  className="lamina size-14 shrink-0 object-contain"
                />
                <span className="flex-1">
                  <span className="block font-display text-[18px] font-bold tracking-[-0.02em]">
                    {a.name}
                  </span>
                  <span className="rotulo mt-0.5 block text-muted-foreground">
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
      <h1 className="font-display text-[1.7rem] font-extrabold leading-[1.12] tracking-[-0.03em]">
        ¿En qué etapa está su {animal.name.toLowerCase()}?
      </h1>
      <ul className="mt-6 flex flex-col gap-2.5">
        {animal.stages.map((s) => {
          const selected = value === s.id;
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => onSelect(s.id)}
                aria-pressed={selected}
                className={`flex min-h-[68px] w-full items-center justify-between gap-3 rounded-2xl border-2 px-4 py-3 text-left transition-colors ${
                  selected
                    ? "border-primary bg-primary/8"
                    : "border-border/70 bg-card hover:border-primary/40"
                }`}
              >
                <span className="flex-1">
                  <span className="block font-display text-[17px] font-bold tracking-[-0.02em]">
                    {s.name}
                  </span>
                  <span className="mt-0.5 block text-[13.5px] leading-snug text-muted-foreground">
                    {s.detail}
                  </span>
                </span>
                <span className="rotulo shrink-0 text-primary">
                  {s.proteinMin}–{s.proteinMax} %
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
      <h1 className="font-display text-[1.7rem] font-extrabold leading-[1.12] tracking-[-0.03em]">
        {title}
      </h1>
      <p className="mt-2 text-[14.5px] leading-relaxed text-muted-foreground">
        {help}
      </p>
      <div className="mt-6 grid grid-cols-3 gap-2.5">
        {options.map((opt) => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSelect(opt.value)}
              aria-pressed={selected}
              className={`flex min-h-[76px] flex-col items-center justify-center gap-0.5 rounded-2xl border-2 py-3 transition-colors ${
                selected
                  ? "border-primary bg-primary/8"
                  : "border-border/70 bg-card hover:border-primary/40"
              }`}
            >
              <span className="font-display text-[1.6rem] font-extrabold leading-none tabular-nums tracking-[-0.03em]">
                {opt.value}
                <span className="ml-0.5 text-[0.9rem] font-bold text-muted-foreground">
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
    </section>
  );
}

