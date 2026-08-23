/**
 * Guía paso a paso para armar cajas de cría. Redactada para audiencia
 * rural adulta; los materiales pueden ser reciclados.
 */

export interface Material {
  item: string;
  detail: string;
}

export interface EnclosureStep {
  number: number;
  title: string;
  body: string;
  tip?: string;
  /** Identificador de la figura que acompaña al paso, si tiene. */
  figura?: string;
}

export const ENCLOSURE_INTRO =
  "Armar una caja de cría de grillos es sencillo y económico. Con materiales que muchas veces ya tiene en la casa o consigue reciclados, puede empezar sin gastar mucho. Lo importante es hacerlo con calma y paciencia.";

/**
 * Las cantidades y medidas de esta guía son orientativas: vienen de la
 * práctica común de cría, no de un protocolo cerrado del proyecto. Se irán
 * ajustando con lo que muestren los ensayos.
 */
export const ENCLOSURE_DISCLAIMER =
  "Las medidas y cantidades son orientativas, para que tenga un punto de partida. Los ensayos del proyecto nos irán diciendo qué funciona mejor.";

export const COST_NOTE =
  "El montaje completo suele salir muy económico, sobre todo si consigue la caja y las hueveras de segunda o reciclados. Casi todo se reutiliza entre una cría y otra.";

export const MATERIALS: Material[] = [
  {
    item: "Caja plástica transparente de 40 a 60 litros",
    detail:
      "Sirve de hogar para los grillos. Una caja con tapa, de segunda o nueva económica.",
  },
  {
    item: "Malla mosquitero fina",
    detail:
      "Para tapar la ventilación y evitar escapes. Un pedazo de 30 por 30 centímetros basta.",
  },
  {
    item: "Hueveras de cartón",
    detail:
      "Sirven de refugio y espacio para que trepen. Junte de 8 a 12 hueveras usadas.",
  },
  {
    item: "Termómetro-higrómetro económico",
    detail:
      "Mide temperatura y humedad al mismo tiempo. Uno digital sencillo cuesta poco en tiendas o internet.",
  },
  {
    item: "Bebederos pequeños o tapas plásticas",
    detail:
      "Para poner el agua sin que se ahoguen. Sirven tapas de gaseosa o frascos bajitos.",
  },
  {
    item: "Manzana en pedazos",
    detail:
      "Fuente principal de hidratación. Una manzana alcanza para varios días de cría.",
  },
  {
    item: "Cinta de doble faz",
    detail:
      "Se pega en el borde interior de la caja para que no se escapen. Un rollo alcanza para varias cajas.",
  },
  {
    item: "Tijeras o cuchillo bien afilado",
    detail: "Para recortar la tapa y la malla. Cualquiera que tenga en la cocina sirve.",
  },
];

export const ENCLOSURE_STEPS: EnclosureStep[] = [
  {
    number: 1,
    figura: "caja",
    title: "Preparar y limpiar la caja",
    body: "Lave la caja plástica con agua y jabón suave, sin cloro fuerte. Séquela muy bien al sol antes de usarla. Revise que no tenga huecos ni grietas por donde se puedan escapar los grillos.",
    tip: "Evite productos con olor fuerte como límpido puro. A los grillos les afectan los químicos.",
  },
  {
    number: 2,
    figura: "ventilacion",
    title: "Abrir ventilación con malla",
    body: "Con las tijeras o el cuchillo, recorte un cuadrado grande en la tapa de la caja, dejando un marco de unos 4 centímetros alrededor. Pegue la malla mosquitero por dentro de la tapa, bien estirada, cubriendo todo el hueco. Puede sujetarla con silicona o cinta resistente.",
    tip: "Sin buena ventilación se acumula humedad y los grillos se enferman.",
  },
  {
    number: 3,
    figura: "sustrato",
    title: "Poner la cama o sustrato",
    body: "En el fondo de la caja, ponga una capa delgada de tierra seca, aserrín limpio o simplemente papel periódico. Esto ayuda a mantener la caja seca y facilita la limpieza. No use materiales húmedos ni con olor a moho.",
  },
  {
    number: 4,
    figura: "refugios",
    title: "Armar los refugios con hueveras",
    body: "Coloque las hueveras de cartón paradas o cruzadas dentro de la caja, formando como pequeños túneles. Los grillos se esconden y trepan por ahí, y así aprovecha mejor el espacio. Deje libre una esquina para el alimento y el agua.",
    tip: "Entre más refugios, menos se pelean y mejor crecen.",
  },
  {
    number: 5,
    figura: "agua",
    title: "Colocar alimento y agua",
    body: "En una esquina, ponga una tapa con el alimento (la dieta que esté estudiando) y otra tapa con pedacitos de manzana fresca para la hidratación. Si usa bebedero, ponga algodón o piedritas para que no se ahoguen. Cambie el agua y la manzana cada dos días.",
  },
  {
    number: 6,
    figura: "clima",
    title: "Controlar temperatura y humedad",
    body: "Ponga el termómetro-higrómetro adentro, en un lugar visible. Las condiciones objetivo son entre 24 y 34 grados centígrados de temperatura, y entre 50 y 80 por ciento de humedad. Ubique la caja en un lugar tranquilo, sin sol directo ni corrientes de aire frío.",
    tip: "Si hace mucho frío en la noche, cubra parte de la caja con un trapo.",
  },
];

export const MAINTENANCE: string[] = [
  "Revise todos los días que haya agua fresca y pedacitos de manzana disponibles.",
  "Retire cada dos o tres días los restos de comida vieja y los grillos muertos.",
  "Cada semana limpie el fondo de la caja y cambie el sustrato si lo ve sucio.",
  "Anote en un cuaderno la temperatura, la humedad y lo que observa cada día.",
  "Si nota mal olor o mucha humedad, aumente la ventilación y revise los bebederos.",
];
