/**
 * Guía para armar una caja de cría de grillos.
 *
 * Redactada para productores: frases cortas, palabras claras y un tono
 * cercano pero profesional. Los materiales pueden ser reciclados.
 *
 * REGLA: aquí no entran cifras nuevas. Las medidas y frecuencias que aparecen
 * son las que el proyecto ya venía usando como punto de partida práctico; las
 * condiciones de temperatura y humedad son las CONDICIONES OBJETIVO del
 * proyecto, no mediciones.
 */

/** Ícono que acompaña a cada material (se traduce a un ícono en la página). */
export type IconoMaterial =
  | "caja"
  | "malla"
  | "sustrato"
  | "hueveras"
  | "termohigrometro"
  | "bebedero"
  | "manzana"
  | "cinta"
  | "tijeras";

export interface Material {
  id: IconoMaterial;
  item: string;
  detail: string;
}

export interface EnclosureStep {
  number: number;
  title: string;
  body: string;
  tip?: string;
  /** Ilustración en grabado del paso (ruta dentro de /public). */
  imagen: string;
}

export const ENCLOSURE_INTRO =
  "Siga estos pasos para preparar una caja segura, sencilla y fácil de mantener. Muchos materiales se consiguen reciclados.";

/**
 * Las cantidades y medidas de esta guía son orientativas: vienen de la
 * práctica común de cría, no de un protocolo cerrado del proyecto. Se irán
 * ajustando con lo que muestren los ensayos.
 */
export const ENCLOSURE_DISCLAIMER =
  "Las medidas y cantidades son orientativas: son un punto de partida. Los ensayos del proyecto irán mostrando qué funciona mejor.";

export const COST_NOTE =
  "El montaje suele salir económico, sobre todo si consigue la caja y las hueveras de segunda. Casi todo se reutiliza entre una cría y otra.";

/** Ilustración principal de la página: la caja ya armada. */
export const CAJA_ARMADA = {
  src: "/ilustraciones/caja-cria.webp",
  alt: "Grabado de una caja plástica de cría abierta, con hueveras de cartón paradas como refugio, un bebedero y un plato de alimento, y la tapa con una ventana de malla a un lado.",
  width: 1100,
  height: 681,
};

export const MATERIALS: Material[] = [
  {
    id: "caja",
    item: "Caja plástica con tapa (40 a 60 litros)",
    detail: "Transparente, nueva o de segunda.",
  },
  {
    id: "malla",
    item: "Malla mosquitera fina",
    detail: "Un pedazo de 30 × 30 cm para la ventilación de la tapa.",
  },
  {
    id: "sustrato",
    item: "Sustrato seco",
    detail: "Tierra seca, aserrín limpio o papel periódico para el fondo.",
  },
  {
    id: "hueveras",
    item: "Hueveras de cartón (8 a 12)",
    detail: "Sirven de refugio y de espacio para trepar.",
  },
  {
    id: "termohigrometro",
    item: "Termómetro-higrómetro",
    detail: "Mide la temperatura y la humedad al mismo tiempo.",
  },
  {
    id: "bebedero",
    item: "Bebederos o tapas plásticas bajas",
    detail: "Para el agua y el alimento, sin riesgo de que se ahoguen.",
  },
  {
    id: "manzana",
    item: "Manzana en pedazos",
    detail: "Su principal fuente de hidratación.",
  },
  {
    id: "cinta",
    item: "Cinta de doble faz",
    detail: "En el borde interior de la caja, para evitar escapes.",
  },
  {
    id: "tijeras",
    item: "Tijeras o cuchillo afilado",
    detail: "Para recortar la tapa y la malla.",
  },
];

export const ENCLOSURE_STEPS: EnclosureStep[] = [
  {
    number: 1,
    imagen: "/ilustraciones/caja-recipiente.webp",
    title: "Prepare la caja",
    body: "Lávela con agua y jabón suave, sin cloro fuerte, y séquela bien al sol. Revise que no tenga huecos ni grietas.",
    tip: "Los productos de olor fuerte, como el límpido puro, afectan a los grillos.",
  },
  {
    number: 2,
    imagen: "/ilustraciones/caja-ventilacion.webp",
    title: "Abra la ventilación",
    body: "Recorte un cuadrado grande en la tapa, dejando un marco de unos 4 cm. Pegue la malla por dentro, bien estirada, con silicona o cinta resistente.",
    tip: "Sin buena ventilación se acumula humedad y los grillos se enferman.",
  },
  {
    number: 3,
    imagen: "/ilustraciones/caja-sustrato.webp",
    title: "Ponga el sustrato",
    body: "Cubra el fondo con una capa delgada de material seco. Ayuda a mantener la caja seca y facilita la limpieza.",
    tip: "No use materiales húmedos ni con olor a moho.",
  },
  {
    number: 4,
    imagen: "/ilustraciones/caja-refugios.webp",
    title: "Arme los refugios",
    body: "Coloque las hueveras de cartón paradas o cruzadas, formando túneles. Deje libre una esquina para el alimento y el agua.",
    tip: "Con más refugios hay menos peleas y mejor crecimiento.",
  },
  {
    number: 5,
    imagen: "/ilustraciones/caja-alimento.webp",
    title: "Ponga el alimento",
    body: "En la esquina libre, ponga una tapa o un plato bajo con la comida que esté usando.",
    tip: "Retire la comida vieja cada dos o tres días.",
  },
  {
    number: 6,
    imagen: "/ilustraciones/caja-agua.webp",
    title: "Ponga el agua",
    body: "Ofrezca pedazos de manzana fresca. Si usa bebedero, póngale algodón o piedras pequeñas para que no se ahoguen.",
    tip: "Cambie el agua y la manzana cada dos días.",
  },
  {
    number: 7,
    imagen: "/ilustraciones/caja-clima.webp",
    title: "Vigile el clima",
    body: "Ponga el termómetro-higrómetro dentro de la caja, en un lugar visible. Ubique la caja en un sitio tranquilo, sin sol directo ni corrientes de aire frío.",
    tip: "Si en la noche hace mucho frío, cubra parte de la caja con un trapo.",
  },
  {
    number: 8,
    imagen: "/ilustraciones/caja-limpieza.webp",
    title: "Mantenga la caja limpia",
    body: "Cada dos o tres días retire la comida vieja y los grillos muertos. Cada semana limpie el fondo y cambie el sustrato si está sucio.",
    tip: "Si hay mal olor o charcos, aumente la ventilación y revise los bebederos.",
  },
];

/**
 * Condiciones objetivo del proyecto. Son los rangos con los que se está
 * aprendiendo, no valores ya medidos ni óptimos confirmados.
 */
export const CONDICIONES_OBJETIVO = {
  temperatura: "24 a 34 °C",
  humedad: "50 a 80 %",
};

/** Los mismos rangos, en cifras, para mostrarlos con su unidad aparte. */
export const RANGOS_OBJETIVO = {
  temperatura: { min: 24, max: 34, unidad: "°C" },
  humedad: { min: 50, max: 80, unidad: "% HR" },
} as const;

export interface Consejo {
  id: "temperatura" | "humedad" | "ventilacion" | "limpieza" | "registro";
  texto: string;
}

export const CONSEJOS: Consejo[] = [
  {
    id: "temperatura",
    texto: `Temperatura objetivo: ${CONDICIONES_OBJETIVO.temperatura}.`,
  },
  {
    id: "humedad",
    texto: `Humedad objetivo: ${CONDICIONES_OBJETIVO.humedad}.`,
  },
  {
    id: "ventilacion",
    texto: "Si nota mal olor o mucha humedad, aumente la ventilación.",
  },
  {
    id: "limpieza",
    texto: "Limpie el fondo cada semana y cambie el sustrato si está sucio.",
  },
  {
    id: "registro",
    texto: "Anote cada día la temperatura, la humedad y lo que observe.",
  },
];

export const NOTA_IMPORTANTE =
  "Evite el sol directo y los cambios bruscos de temperatura. Mantenga siempre agua y manzana frescas.";
