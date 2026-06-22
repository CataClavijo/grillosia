/**
 * Animales destino soportados por el modelo y catálogo de dietas en estudio.
 *
 * Los rangos de proteína por animal y etapa provienen de tablas NRC (National
 * Research Council) y se usan como referencia técnica orientativa.
 *
 * Las dietas son las que el proyecto está evaluando actualmente en
 * laboratorio. La hidratación se hace por medio de bebederos con agua y
 * pedazos de manzana, común a todas las dietas.
 */

export const ANIMALS = [
  {
    id: "tilapia",
    name: "Tilapia",
    stages: [
      {
        id: "alevin",
        name: "Alevín",
        detail: "0 a 5 g",
        proteinMin: 40,
        proteinMax: 45,
      },
      {
        id: "crecimiento",
        name: "Crecimiento",
        detail: "5 a 100 g",
        proteinMin: 28,
        proteinMax: 32,
      },
      {
        id: "engorde",
        name: "Engorde",
        detail: "100 g en adelante",
        proteinMin: 24,
        proteinMax: 28,
      },
    ],
  },
  {
    id: "pollo",
    name: "Pollo",
    stages: [
      {
        id: "inicio",
        name: "Inicio",
        detail: "0 a 3 semanas",
        proteinMin: 22,
        proteinMax: 24,
      },
      {
        id: "crecimiento",
        name: "Crecimiento",
        detail: "3 a 6 semanas",
        proteinMin: 20,
        proteinMax: 22,
      },
      {
        id: "engorde",
        name: "Engorde",
        detail: "6 semanas en adelante",
        proteinMin: 18,
        proteinMax: 20,
      },
    ],
  },
  {
    id: "cerdo",
    name: "Cerdo",
    stages: [
      {
        id: "inicio",
        name: "Inicio",
        detail: "5 a 10 kg",
        proteinMin: 22,
        proteinMax: 24,
      },
      {
        id: "crecimiento",
        name: "Crecimiento",
        detail: "10 a 50 kg",
        proteinMin: 16,
        proteinMax: 18,
      },
      {
        id: "engorde",
        name: "Engorde",
        detail: "50 kg en adelante",
        proteinMin: 13,
        proteinMax: 16,
      },
    ],
  },
] as const;

/**
 * Dietas reales en estudio dentro del proyecto.
 *
 * En las tres se mantiene la misma base de cereal y avena (10 % cada uno),
 * variando únicamente la fuente proteica principal (80 %). La hidratación es
 * común: agua en bebederos + pedazos de manzana reemplazados a necesidad.
 */
export const DIETS = [
  {
    id: "D1",
    name: "Base bore",
    main: "Harina de bore",
    composition:
      "Harina de bore 80 %, harina de choclo 10 %, avena en hojuelas 10 %",
  },
  {
    id: "D2",
    name: "Base botón de oro",
    main: "Harina de botón de oro",
    composition:
      "Harina de botón de oro 80 %, harina de choclo 10 %, avena en hojuelas 10 %",
  },
  {
    id: "D3",
    name: "Base salvado de trigo",
    main: "Salvado de trigo",
    composition:
      "Salvado de trigo 80 %, harina de choclo 10 %, avena en hojuelas 10 %",
  },
] as const;

export const HYDRATION_NOTE =
  "Bebederos con agua y pedazos de manzana, comunes a las tres dietas.";

export type Animal = (typeof ANIMALS)[number];
export type Stage = Animal["stages"][number];
export type Diet = (typeof DIETS)[number];
