"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";

import { Barra } from "@/components/barra";
import { Estado } from "@/components/ds/estado";
import { Pasos } from "@/components/ds/pasos";
import { Revelar } from "@/components/ds/revelar";
import { FuenteCientifica } from "@/components/fuente-cientifica";
import { InfoTip } from "@/components/info-tip";
import { LaminaNormalizada } from "@/components/lamina-normalizada";
import { OrigenDato } from "@/components/origen-dato";
import { BarraAcciones } from "@/components/paso";
import { ProteinaEtapa } from "@/components/proteina-etapa";
import { TresComidas } from "@/components/tres-comidas";
import {
  animalPorId,
  animalesDe,
  categoriaPorId,
  etapaPorId,
  CATEGORIAS,
  type AnimalDestino,
  type Categoria,
  type CategoriaId,
  type Etapa,
} from "@/lib/animals";
import {
  PANTALLAS,
  pantallasPara,
  pasosConsulta,
  primeraSinContestar,
  type Pantalla,
} from "@/lib/consulta-pasos";
import { marcarPaso } from "@/lib/journey";
import { useProjects } from "@/lib/projects-store";
import { cn } from "@/lib/utils";
import {
  clearWizardDraft,
  loadWizardDraft,
  saveWizardDraft,
  type WizardDraft,
} from "@/lib/wizard-draft";

/**
 * La consulta: lo que su animal necesita y que comida le conviene.
 *
 * Es su propio recorrido, separado de la guia de cria, con sus pasos a la
 * vista: Animal · Etapa · Clima · Resultado.
 *
 * Reglas que la hacen entendible:
 *  - UNA pregunta por pantalla, y la pregunta es el titulo.
 *  - Tocar una opcion pasa a la siguiente. No hay boton "Continuar" que
 *    obligue a tocar dos veces ni que aparezca gris sin explicacion.
 *  - Cada pantalla tiene su direccion (`/consulta?p=etapa`), asi que la
 *    flecha de atras del navegador y la de la pagina hacen lo mismo.
 *  - El clima va en una sola pantalla y nada viene marcado: o la persona
 *    elige, o toca "No lo se" y se usa lo tipico del Piedemonte, dicho en
 *    voz alta.
 *  - Entrar a `/consulta` sin pantalla es empezar una consulta NUEVA. Las
 *    anteriores quedan en "Mis consultas"; antes, el boton "Hacer mi
 *    consulta" llevaba al resultado viejo y no dejaba hacer otra.
 *
 * Lo contestado vive en el borrador de la sesion (`wizard-draft`). Al
 * terminar se guarda como consulta y se abre el resultado.
 */

const TEMP_OPTIONS = [
  { value: 24, label: "Fresquito" },
  { value: 26, label: "Suave" },
  { value: 28, label: "Cálido" },
  { value: 30, label: "Caliente" },
  { value: 32, label: "Bien caliente" },
  { value: 34, label: "Muy caliente" },
];

const HUMIDITY_OPTIONS = [
  { value: 50, label: "Seca" },
  { value: 60, label: "Normal" },
  { value: 70, label: "Húmeda" },
  { value: 80, label: "Muy húmeda" },
];

/** Lo tipico del Piedemonte, para quien no tiene termometro. */
const TEMP_TIPICA = 28;
const HUMEDAD_TIPICA = 60;

const VACIO: WizardDraft = {
  categoryId: "",
  animalId: "",
  stageId: "",
  temp: null,
  humidity: null,
};

export default function ConsultaPage() {
  // `useSearchParams` necesita un Suspense alrededor para que la pagina se
  // pueda generar de antemano.
  return (
    <Suspense fallback={<Barra modo="enfocado" />}>
      <Consulta />
    </Suspense>
  );
}

function Consulta() {
  const router = useRouter();
  const params = useSearchParams();
  const { active, activeId, loading, create, updateSelection } = useProjects();

  const [r, setR] = useState<WizardDraft | null>(null);
  const [guardando, setGuardando] = useState(false);
  const iniciado = useRef(false);

  const pedida = params.get("p") as Pantalla | null;
  const pantalla: Pantalla = pedida && PANTALLAS.includes(pedida) ? pedida : "animal";

  useEffect(() => {
    marcarPaso("3");
  }, []);

  /**
   * Arranque. Se decide una sola vez, segun como se llego:
   *  - `?editar=1`: corregir la consulta abierta (desde el resultado).
   *  - `?categoria=peces`: consulta nueva con la categoria ya elegida.
   *  - `?p=...`: seguir con el borrador (recargar, o volver con el navegador).
   *  - nada: consulta nueva desde cero.
   */
  useEffect(() => {
    if (iniciado.current) return;
    const editar = params.has("editar");
    if (editar && loading) return; // espera a tener la consulta abierta
    iniciado.current = true;

    if (editar && active?.selection.animalId) {
      const a = animalPorId(active.selection.animalId);
      const borrador: WizardDraft = {
        categoryId: a?.category ?? "",
        animalId: active.selection.animalId,
        stageId: etapaPorId(a, active.selection.stageId)?.id ?? "",
        temp: active.selection.temp ?? null,
        humidity: active.selection.humidity ?? null,
        proyectoId: activeId ?? undefined,
      };
      saveWizardDraft(borrador);
      setR(borrador);
      router.replace(`/consulta?p=${pedida ?? "animal"}`, { scroll: false });
      return;
    }

    const c = params.get("categoria");
    if (c && categoriaPorId(c)) {
      const lista = animalesDe(c as CategoriaId);
      const borrador: WizardDraft = {
        ...VACIO,
        categoryId: c,
        animalId: lista.length === 1 ? lista[0].id : "",
      };
      saveWizardDraft(borrador);
      setR(borrador);
      router.replace(`/consulta?p=${lista.length === 1 ? "etapa" : "especie"}`, { scroll: false });
      return;
    }

    if (pedida) {
      const borrador = loadWizardDraft() ?? VACIO;
      setR(borrador);
      // Si la direccion pide una pantalla a la que todavia no se llega (por
      // ejemplo un enlace viejo), se va a la primera que falta contestar.
      const falta = primeraSinContestar(borrador);
      const lista = pantallasPara(borrador.categoryId ?? "");
      if (lista.indexOf(pedida) > lista.indexOf(falta)) {
        router.replace(`/consulta?p=${falta}`, { scroll: false });
      }
      return;
    }

    clearWizardDraft();
    setR(VACIO);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  const actualizar = (cambio: Partial<WizardDraft>) => {
    setR((prev) => {
      const nuevo = { ...(prev ?? VACIO), ...cambio };
      saveWizardDraft(nuevo);
      return nuevo;
    });
  };

  const ir = (p: Pantalla) => router.push(`/consulta?p=${p}`);

  const categoria = categoriaPorId(r?.categoryId ?? "");
  const animal = useMemo(() => animalPorId(r?.animalId), [r?.animalId]);
  const etapa = etapaPorId(animal, r?.stageId);
  const lista = pantallasPara(r?.categoryId ?? "");
  const anterior = lista[lista.indexOf(pantalla) - 1];

  /* ── respuestas: cada una guarda y pasa a la siguiente ─────────────── */

  const elegirCategoria = (id: CategoriaId) => {
    const animales = animalesDe(id);
    const unico = animales.length === 1 ? animales[0].id : "";
    if (id !== r?.categoryId) {
      // Otra categoria: lo elegido debajo ya no aplica.
      actualizar({ categoryId: id, animalId: unico, stageId: "" });
    }
    ir(unico ? "etapa" : "especie");
  };

  const elegirAnimal = (id: string) => {
    if (id !== r?.animalId) actualizar({ animalId: id, stageId: "" });
    ir("etapa");
  };

  const elegirEtapa = (id: string) => {
    actualizar({ stageId: id });
    ir("clima");
  };

  /**
   * Termina: guarda la consulta y abre el resultado. La navegacion va en
   * `finally` a proposito: el resultado se calcula con lo contestado, asi
   * que aunque el guardado falle —sin senal, por ejemplo— igual lo ve.
   */
  const terminar = async (temp: number, humidity: number) => {
    if (!r || !animal || !etapa || guardando) return;
    actualizar({ temp, humidity });
    setGuardando(true);
    marcarPaso("listo");
    const seleccion = { animalId: animal.id, stageId: etapa.id, temp, humidity };
    try {
      if (r.proyectoId) {
        await updateSelection(r.proyectoId, seleccion);
      } else {
        const fecha = new Date().toLocaleDateString("es-CO", {
          day: "numeric",
          month: "short",
        });
        // `create` deja la consulta abierta.
        const id = await create(`${animal.name} · ${etapa.name} · ${fecha}`, seleccion);
        // Si vuelve desde el resultado y cambia algo, se corrige ESTA
        // consulta en vez de crear otra igual.
        actualizar({ temp, humidity, proyectoId: id });
      }
    } catch {
      // Se guardara la proxima vez; el resultado se ve igual.
    } finally {
      router.push("/resultado");
    }
  };

  const listo = r !== null;

  return (
    <>
      <Barra modo="enfocado" />
      <Pasos pasos={pasosConsulta()} actual={PANTALLAS_PASO[pantalla]} />
      <main className="mx-auto flex min-h-[calc(100dvh-var(--alto-barra)-48px)] w-full max-w-[1240px] flex-col px-5 pt-7 lg:px-8 lg:pt-12">
        <div className="grid flex-1 content-start gap-10 pb-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-16 lg:pb-16">
          <div className="min-w-0">
            {/* Lo contestado, en una linea, para ubicarse. Cada parte lleva
                a su pregunta. */}
            <Respuestas
              categoria={categoria}
              animal={animal}
              etapa={etapa}
              pantalla={pantalla}
              className="mb-6 lg:hidden"
            />

            {!listo ? null : guardando ? (
              <Estado tipo="cargando" titulo="Preparando su resultado" compacto>
                Guardamos su consulta y abrimos la comparación.
              </Estado>
            ) : (
              <div
                key={pantalla}
                className="animate-in fade-in-0 slide-in-from-bottom-2 duration-[250ms] ease-[var(--ease-natural)]"
              >
                {pantalla === "animal" && (
                  <PreguntaCategoria value={r.categoryId ?? ""} onSelect={elegirCategoria} />
                )}

                {pantalla === "especie" && categoria && (
                  <PreguntaAnimal
                    categoria={categoria}
                    value={r.animalId}
                    onSelect={elegirAnimal}
                  />
                )}

                {pantalla === "etapa" && animal && (
                  <PreguntaEtapa animal={animal} value={etapa?.id ?? ""} onSelect={elegirEtapa} />
                )}

                {pantalla === "clima" && (
                  <PreguntaClima
                    temp={r.temp}
                    humidity={r.humidity}
                    onTemp={(v) => actualizar({ temp: v })}
                    onHumidity={(v) => actualizar({ humidity: v })}
                    onTerminar={terminar}
                  />
                )}
              </div>
            )}
          </div>

          <aside className="hidden lg:block" aria-label="Resumen de su consulta">
            <div className="sticky top-24 flex flex-col gap-8 rounded-lg bg-surface-2 p-6">
              <ResumenConsulta
                categoria={categoria}
                animal={animal}
                etapa={etapa}
                temp={r?.temp ?? null}
                humidity={r?.humidity ?? null}
              />
              <TresComidas compacta />
            </div>
          </aside>
        </div>

        <BarraAcciones
          atras={anterior ? { href: `/consulta?p=${anterior}` } : { href: "/", texto: "Inicio" }}
          adelante={
            pantalla === "clima" && !guardando
              ? {
                  texto: "Ver mi resultado",
                  onClick: () => {
                    if (r?.temp != null && r?.humidity != null) void terminar(r.temp, r.humidity);
                  },
                  deshabilitado: r?.temp == null || r?.humidity == null,
                }
              : undefined
          }
        />
      </main>
    </>
  );
}

/** En que paso del indicador va cada pantalla. */
const PANTALLAS_PASO: Record<Pantalla, number> = {
  animal: 1,
  especie: 1,
  etapa: 2,
  clima: 3,
};

/** Lo contestado hasta aqui, en una linea; cada parte lleva a su pregunta. */
function Respuestas({
  categoria,
  animal,
  etapa,
  pantalla,
  className,
}: {
  categoria?: Categoria;
  animal?: AnimalDestino;
  etapa?: Etapa;
  pantalla: Pantalla;
  className?: string;
}) {
  const partes: { texto: string; p: Pantalla }[] = [];
  if (categoria && pantalla !== "animal") partes.push({ texto: categoria.name, p: "animal" });
  if (animal && animalesDe(animal.category).length > 1 && pantalla !== "especie" && pantalla !== "animal")
    partes.push({ texto: animal.name, p: "especie" });
  if (etapa && pantalla === "clima") partes.push({ texto: etapa.name, p: "etapa" });
  if (partes.length === 0) return null;
  return (
    <p className={cn("flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[14px] text-subtle", className)}>
      <span className="sr-only">Lleva elegido: </span>
      {partes.map((x, i) => (
        <span key={x.p} className="inline-flex items-center gap-1.5">
          {i > 0 && <span aria-hidden className="text-faint">·</span>}
          <Link
            href={`/consulta?p=${x.p}`}
            className="underline decoration-border-strong underline-offset-4 transition-colors hover:text-foreground"
          >
            {x.texto}
          </Link>
        </span>
      ))}
    </p>
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
    <div>
      {/* La pregunta ES el titulo de la pantalla. */}
      <h1 id="pregunta-actual" className="t-h1 text-balance">
        {children}
      </h1>
      {ayuda && <div className="t-lead mt-3 max-w-[60ch] text-subtle">{ayuda}</div>}
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
                area={9000}
                alto={100}
                className="w-24 shrink-0 sm:w-full"
              />
              <span className="min-w-0 pr-6 sm:pr-0">
                <span className="block font-display text-[2rem] font-semibold leading-none">
                  {c.name}
                </span>
                <span className="mt-2 block text-[14.5px] leading-snug text-subtle">
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
                <span className="block font-display text-[1.6rem] font-semibold leading-tight">
                  {a.name}
                </span>
                {a.scientific && (
                  <span className="mt-0.5 block text-[14.5px] italic text-subtle">
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
          <>
            Cada etapa productiva necesita una cantidad distinta de{" "}
            <span className="whitespace-nowrap">
              proteína.
              <InfoTip termino="etapaProductiva" className="ml-0.5 align-middle" />
            </span>
          </>
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

/**
 * El clima en una sola pantalla: temperatura y humedad.
 *
 * Nada viene marcado: antes los 28 °C aparecian elegidos sin que la persona
 * los tocara. Quien no tiene termometro toca "No lo sé" y se usa lo tipico
 * del Piedemonte, que se dice con todas las cifras.
 */
function PreguntaClima({
  temp,
  humidity,
  onTemp,
  onHumidity,
  onTerminar,
}: {
  temp: number | null;
  humidity: number | null;
  onTemp: (v: number) => void;
  onHumidity: (v: number) => void;
  onTerminar: (temp: number, humidity: number) => void;
}) {
  return (
    <div>
      <TituloPregunta ayuda="Elija lo más parecido al lugar donde cría sus grillos. Con eso ajustamos la comparación.">
        ¿Cómo es el clima donde cría sus grillos?
      </TituloPregunta>

      <GrupoClima
        titulo="Temperatura"
        ayuda="Trabajamos entre 24 y 34 °C."
        options={TEMP_OPTIONS}
        unit="°C"
        value={temp}
        onSelect={onTemp}
        columnas="grid-cols-3 sm:grid-cols-6"
      />
      <GrupoClima
        titulo="Humedad del aire"
        ayuda="Humedad relativa (HR), entre 50 y 80 %."
        options={HUMIDITY_OPTIONS}
        unit="% HR"
        value={humidity}
        onSelect={onHumidity}
        columnas="grid-cols-2 sm:grid-cols-4"
      />

      <button
        type="button"
        onClick={() => onTerminar(temp ?? TEMP_TIPICA, humidity ?? HUMEDAD_TIPICA)}
        className="group mt-8 flex w-full items-center justify-between gap-4 rounded-lg border border-dashed border-border-strong px-5 py-4 text-left transition-colors hover:border-primary/60 hover:bg-primary-soft/40 sm:w-auto sm:min-w-[420px]"
      >
        <span className="flex flex-col">
          <span className="text-[15.5px] font-semibold">
            {temp == null && humidity == null ? "No lo sé" : "No sé el resto"}
          </span>
          <span className="t-small text-subtle">
            {temp == null && humidity == null
              ? `Usar lo típico del Piedemonte: ${TEMP_TIPICA} °C y ${HUMEDAD_TIPICA} % de humedad`
              : temp == null
                ? `Usar ${TEMP_TIPICA} °C, lo típico del Piedemonte`
                : humidity == null
                  ? `Usar ${HUMEDAD_TIPICA} % de humedad, lo típico del Piedemonte`
                  : "Ver mi resultado con lo que eligió"}
          </span>
        </span>
        <ArrowRight className="size-4 shrink-0 text-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
      </button>
    </div>
  );
}

function GrupoClima({
  titulo,
  ayuda,
  options,
  unit,
  value,
  onSelect,
  columnas,
}: {
  titulo: string;
  ayuda: string;
  options: { value: number; label: string }[];
  unit: string;
  value: number | null;
  onSelect: (v: number) => void;
  columnas: string;
}) {
  const id = `clima-${titulo.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <section className="mt-8" aria-labelledby={id}>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
        <h2 id={id} className="text-[16px] font-semibold">
          {titulo}
        </h2>
        <p className="t-small text-subtle">{ayuda}</p>
        {value != null && (
          <Check className="size-4 text-primary" aria-label="Elegida" strokeWidth={2.5} />
        )}
      </div>
      <ul role="group" aria-labelledby={id} className={cn("mt-3 grid gap-2.5", columnas)}>
        {options.map((opt) => (
          <li key={opt.value}>
            <Opcion
              selected={value === opt.value}
              onClick={() => onSelect(opt.value)}
              className="min-h-[84px] flex-col justify-end gap-1 px-3.5 pt-5 pb-3.5"
            >
              <span className="t-cifra text-[1.75rem] text-foreground">
                {opt.value}
                <span className="t-unidad">{unit}</span>
              </span>
              <span className="text-[13px] leading-tight text-subtle">{opt.label}</span>
            </Opcion>
          </li>
        ))}
      </ul>
    </section>
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
