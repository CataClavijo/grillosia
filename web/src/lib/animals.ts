/**
 * Animales destino soportados por el modelo y catálogo de dietas en estudio.
 * Los rangos de proteína provienen de tablas NRC y se usan solo como guía
 * orientativa dentro de la versión demostrativa.
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

export const DIETS = [
  {
    id: "D1",
    name: "Maíz + Soya + Yuca",
    composition: "50% maíz, 30% soya, 20% yuca",
    hydration: "Pepino",
  },
  {
    id: "D2",
    name: "Salvado + Soya",
    composition: "60% salvado de trigo, 40% soya",
    hydration: "Zanahoria",
  },
  {
    id: "D3",
    name: "Concentrado comercial",
    composition: "Concentrado balanceado para aves",
    hydration: "Manzana",
  },
  {
    id: "D4",
    name: "Pescado + Maíz + Soya",
    composition: "20% harina de pescado, 40% maíz, 40% soya",
    hydration: "Pepino",
  },
] as const;

export type Animal = (typeof ANIMALS)[number];
export type Stage = Animal["stages"][number];
export type Diet = (typeof DIETS)[number];
