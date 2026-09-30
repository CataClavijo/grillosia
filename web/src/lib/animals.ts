/**
 * Animales que se alimentan con la harina, y lo que cada uno necesita.
 *
 * La consulta pregunta en tres niveles, porque la necesidad de proteina
 * cambia con cada uno:
 *   1. Categoria: peces, aves o cerdos.
 *   2. Animal: la especie o el tipo de produccion (tilapia, cachama, pollo de
 *      engorde, gallina ponedora...).
 *   3. Etapa productiva: alevin, juvenil, adulto; inicio, levante, ceba...
 *
 * REGLA: ningun porcentaje de proteina entra aqui sin una referencia
 * verificada en `lib/content/referencias.ts`. Si una etapa todavia no tiene
 * fuente, su `protein` es `null` y la plataforma muestra "Dato aun no
 * disponible" en vez de un numero.
 *
 * Los `id` de animal y etapa se guardan en las consultas de la gente; no se
 * cambian. Por eso el pollo de engorde conserva el id "pollo", y las etapas
 * viejas se traducen con `alias`.
 */

export type CategoriaId = "peces" | "aves" | "cerdos";

export interface Categoria {
  id: CategoriaId;
  name: string;
  /** Ilustracion a lapiz que representa la categoria. */
  image: string;
  /** Que se le pregunta al productor para elegir el animal. */
  pregunta: string;
}

export const CATEGORIAS: Categoria[] = [
  {
    id: "peces",
    name: "Peces",
    image: "/acuarelas/tilapia.webp",
    pregunta: "¿Qué pez cría?",
  },
  {
    id: "aves",
    name: "Aves",
    image: "/acuarelas/pollo-engorde.webp",
    pregunta: "¿Qué tipo de ave cría?",
  },
  {
    id: "cerdos",
    name: "Cerdos",
    image: "/acuarelas/cerdo.webp",
    pregunta: "¿En qué etapa están sus cerdos?",
  },
];

/** Proteina que debe tener el alimento del animal, en % de la dieta. */
export interface RangoProteina {
  min: number;
  max: number;
  /** Ids de `REFERENCIAS` que respaldan el valor. */
  refs: string[];
  /** Aclaracion corta: base de calculo, como se leyo la tabla, etc. */
  nota?: string;
}

export interface Etapa {
  id: string;
  name: string;
  /** Edad o peso que define la etapa, tal como la da la fuente. */
  detail: string;
  protein: RangoProteina | null;
  /** Ids viejos que deben leerse como esta etapa. */
  alias?: string[];
}

export interface AnimalDestino {
  id: string;
  category: CategoriaId;
  name: string;
  scientific?: string;
  /** Ilustracion propia; si no tiene, se usa la de la categoria. */
  image?: string;
  stages: Etapa[];
}

export const ANIMALS: AnimalDestino[] = [
  // ── Peces ───────────────────────────────────────────────────────────
  {
    id: "tilapia",
    category: "peces",
    name: "Tilapia",
    scientific: "Oreochromis niloticus",
    image: "/acuarelas/tilapia.webp",
    stages: [
      { id: "alevin", name: "Alevín", detail: "1 a 10 g", protein: { min: 35, max: 40, refs: ["fao-affris-tilapia"], nota: "Valores para tilapia del Nilo. No encontramos una fuente revisada específica para tilapia roja." } },
      { id: "juvenil", name: "Juvenil", detail: "10 a 25 g", protein: { min: 30, max: 35, refs: ["fao-affris-tilapia"], nota: "Valores para tilapia del Nilo. No encontramos una fuente revisada específica para tilapia roja." }, alias: ["crecimiento"] },
      { id: "adulto", name: "Adulto", detail: "25 g en adelante", protein: { min: 28, max: 32, refs: ["fao-affris-tilapia"], nota: "30 a 32 % de 25 a 200 g, y 28 a 30 % por encima de 200 g. Valores para tilapia del Nilo. No encontramos una fuente revisada específica para tilapia roja." }, alias: ["engorde"] },
    ],
  },
  {
    id: "cachama-blanca",
    category: "peces",
    name: "Cachama blanca",
    scientific: "Piaractus brachypomus",
    stages: [
      { id: "alevin", name: "Alevín", detail: "", protein: null },
      { id: "juvenil", name: "Juvenil", detail: "Alrededor de 15 g", protein: { min: 31.6, max: 31.6, refs: ["vasquez-torres-2011"], nota: "Óptimo estimado en un ensayo con juveniles de 15,5 g." } },
      { id: "adulto", name: "Adulto", detail: "", protein: null },
    ],
  },
  {
    id: "cachama-negra",
    category: "peces",
    name: "Cachama negra",
    scientific: "Colossoma macropomum",
    stages: [
      { id: "alevin", name: "Alevín", detail: "0,35 a 15 g", protein: { min: 31.6, max: 31.6, refs: ["lima-2016"], nota: "Óptimo estimado de 31,57 % en un ensayo con alevines." } },
      { id: "juvenil", name: "Juvenil", detail: "Alrededor de 46 g", protein: { min: 30, max: 30, refs: ["oishi-2010"], nota: "Óptimo estimado en un ensayo con juveniles de 46 g." } },
      { id: "adulto", name: "Adulto", detail: "", protein: null },
    ],
  },
  {
    id: "trucha",
    category: "peces",
    name: "Trucha arcoíris",
    scientific: "Oncorhynchus mykiss",
    stages: [
      { id: "alevin", name: "Alevín", detail: "0,5 a 50 g", protein: { min: 44, max: 50, refs: ["fao-2014-trucha"] } },
      { id: "juvenil", name: "Juvenil", detail: "50 a 100 g", protein: { min: 42, max: 45, refs: ["fao-2014-trucha"] } },
      { id: "adulto", name: "Adulto", detail: "101 a 500 g", protein: { min: 38, max: 40, refs: ["fao-2014-trucha"] } },
    ],
  },
  {
    id: "bocachico",
    category: "peces",
    name: "Bocachico",
    scientific: "Prochilodus magdalenae",
    stages: [
      { id: "alevin", name: "Alevín", detail: "", protein: null },
      { id: "juvenil", name: "Juvenil", detail: "", protein: null },
      { id: "adulto", name: "Adulto", detail: "", protein: null },
    ],
  },
  {
    id: "yamu",
    category: "peces",
    name: "Yamú",
    scientific: "Brycon amazonicus",
    stages: [
      { id: "alevin", name: "Alevín", detail: "", protein: null },
      { id: "juvenil", name: "Juvenil", detail: "", protein: null },
      { id: "adulto", name: "Adulto", detail: "", protein: null },
    ],
  },

  // ── Aves ────────────────────────────────────────────────────────────
  {
    id: "pollo",
    category: "aves",
    name: "Pollo de engorde",
    image: "/acuarelas/pollo-engorde.webp",
    stages: [
      { id: "inicio", name: "Inicio", detail: "0 a 3 semanas", protein: { min: 23, max: 23, refs: ["nrc-1994-aves"], nota: "El NRC aclara que son niveles típicos de una dieta de maíz y soya." } },
      { id: "crecimiento", name: "Crecimiento", detail: "3 a 6 semanas", protein: { min: 20, max: 20, refs: ["nrc-1994-aves"], nota: "El NRC aclara que son niveles típicos de una dieta de maíz y soya." } },
      { id: "finalizacion", name: "Finalización", detail: "6 a 8 semanas", protein: { min: 18, max: 18, refs: ["nrc-1994-aves"], nota: "El NRC aclara que son niveles típicos de una dieta de maíz y soya." }, alias: ["engorde"] },
    ],
  },
  {
    id: "gallina",
    category: "aves",
    name: "Gallina ponedora",
    image: "/acuarelas/gallina.webp",
    stages: [
      { id: "inicio", name: "Inicio", detail: "0 a 6 semanas", protein: { min: 17, max: 18, refs: ["nrc-1994-aves"], nota: "El rango va de las líneas de huevo marrón a las de huevo blanco." } },
      { id: "levante", name: "Levante", detail: "6 a 18 semanas", protein: { min: 14, max: 16, refs: ["nrc-1994-aves"], nota: "El rango va de las líneas de huevo marrón a las de huevo blanco." } },
      { id: "prepostura", name: "Prepostura", detail: "18 semanas al primer huevo", protein: { min: 16, max: 17, refs: ["nrc-1994-aves"], nota: "El rango va de las líneas de huevo marrón a las de huevo blanco." } },
      { id: "postura", name: "Postura", detail: "Gallina en producción", protein: { min: 15, max: 15, refs: ["nrc-1994-aves"], nota: "Para una gallina que come unos 100 a 110 g al día. Si come menos, necesita más: 18,8 % con 80 g; si come más, menos: 12,5 % con 120 g." } },
    ],
  },

  // ── Cerdos ──────────────────────────────────────────────────────────
  {
    id: "cerdo",
    category: "cerdos",
    name: "Cerdo",
    image: "/acuarelas/cerdo.webp",
    stages: [
      { id: "inicio", name: "Inicio", detail: "5 a 11 kg", protein: { min: 22, max: 26, refs: ["msd-nrc-2012-cerdos"], nota: "Proteína aproximada para una dieta de maíz y soya; el NRC 2012 fija las necesidades en aminoácidos." } },
      { id: "crecimiento", name: "Levante", detail: "11 a 50 kg", protein: { min: 19.3, max: 23, refs: ["msd-nrc-2012-cerdos"], nota: "Proteína aproximada para una dieta de maíz y soya; el NRC 2012 fija las necesidades en aminoácidos." } },
      { id: "engorde", name: "Ceba", detail: "50 a 135 kg", protein: { min: 13.4, max: 17.1, refs: ["msd-nrc-2012-cerdos"], nota: "Proteína aproximada para una dieta de maíz y soya; el NRC 2012 fija las necesidades en aminoácidos." } },
    ],
  },
];

/** Numero en formato colombiano: 31,6 y no 31.6. */
function numeroES(n: number): string {
  return n.toLocaleString("es-CO", { maximumFractionDigits: 1 });
}

/**
 * Texto listo para mostrar: "22–26 %" o, si la fuente da un solo valor,
 * "31,6 %". Siempre con coma decimal.
 */
export function formatoProteina(r: { min: number; max: number }): string {
  return r.min === r.max
    ? `${numeroES(r.min)} %`
    : `${numeroES(r.min)}–${numeroES(r.max)} %`;
}

export function categoriaPorId(id: string | undefined): Categoria | undefined {
  return CATEGORIAS.find((c) => c.id === id);
}

export function animalPorId(id: string | undefined): AnimalDestino | undefined {
  return ANIMALS.find((a) => a.id === id);
}

export function animalesDe(category: CategoriaId): AnimalDestino[] {
  return ANIMALS.filter((a) => a.category === category);
}

/** Busca la etapa por su id actual o por un id viejo guardado. */
export function etapaPorId(
  animal: AnimalDestino | undefined,
  id: string | undefined,
): Etapa | undefined {
  if (!animal || !id) return undefined;
  return animal.stages.find((e) => e.id === id || e.alias?.includes(id));
}

/** Rango total de proteina del animal, solo con etapas que tienen fuente. */
export function rangoAnimal(
  animal: AnimalDestino,
): { min: number; max: number } | null {
  const con = animal.stages.flatMap((e) => (e.protein ? [e.protein] : []));
  if (con.length === 0) return null;
  return {
    min: Math.min(...con.map((p) => p.min)),
    max: Math.max(...con.map((p) => p.max)),
  };
}

/**
 * Dietas reales en estudio dentro del proyecto.
 *
 * Formulación: 50 % ingrediente principal + 30 % harina de maíz + 20 % avena
 * molida. Solo cambia el ingrediente principal. La avena va molida y no en
 * hojuelas porque los grillos se llevan las hojuelas y dejan el resto de la
 * comida sin consumir. La hidratación es común: agua en bebederos + pedazos de
 * manzana reemplazados a necesidad.
 */
export const DIETS = [
  {
    id: "D1",
    name: "Base bore",
    main: "Harina de bore",
    composition:
      "Harina de bore 50 %, harina de maíz 30 %, avena molida 20 %",
  },
  {
    id: "D2",
    name: "Base botón de oro",
    main: "Harina de botón de oro",
    composition:
      "Harina de botón de oro 50 %, harina de maíz 30 %, avena molida 20 %",
  },
  {
    id: "D3",
    name: "Base salvado de trigo",
    main: "Salvado de trigo",
    composition:
      "Salvado de trigo 50 %, harina de maíz 30 %, avena molida 20 %",
  },
] as const;

/** Base común a las tres dietas. Solo cambia el ingrediente principal. */
export const DIET_BASE = {
  mainPct: 50,
  base: [
    { name: "Harina de maíz", pct: 30 },
    { name: "Avena molida", pct: 20 },
  ],
} as const;

export const HYDRATION_NOTE =
  "Bebederos con agua y pedazos de manzana, comunes a las tres dietas.";

export type Animal = AnimalDestino;
export type Stage = Etapa;
export type Diet = (typeof DIETS)[number];
