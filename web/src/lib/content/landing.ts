/**
 * Contenido de la portada.
 *
 * Vive aparte de la pagina para que se pueda editar sin tocar maquetacion, y
 * para que se vea de un vistazo que se afirma. Todo lo de aqui tiene que ser
 * defendible: son productores tomando decisiones y una evaluacion de
 * Minciencias leyendo.
 */

export interface Objetivo {
  n: string;
  titulo: string;
  cuerpo: string;
}

/** Al modo de "Objetivos MAS Meta": que se propone el proyecto. */
export const OBJETIVOS: Objetivo[] = [
  {
    n: "01",
    titulo: "Saber qué comida rinde más",
    cuerpo:
      "Comparar tres comidas hechas con lo que se consigue en la región y medir cuánta proteína queda en la harina de cada una.",
  },
  {
    n: "02",
    titulo: "Poner el dato en manos del productor",
    cuerpo:
      "Que la respuesta no se quede en un informe: que quien cría grillos pueda consultarla desde su celular, en palabras claras.",
  },
  {
    n: "03",
    titulo: "Acompañar desde el primer día",
    cuerpo:
      "Guías para armar la caja, reconocer los grillos y cuidarlos, para que empezar no dependa de conocer a alguien que ya sepa.",
  },
  {
    n: "04",
    titulo: "Dejar el método abierto",
    cuerpo:
      "El código, los datos y el modelo quedan públicos, para que otros grupos puedan revisarlos y continuarlos.",
  },
];

/** Al modo de "Por qué surge MAS Meta". Frases cortas. */
export const POR_QUE = [
  "Buena parte de la harina que alimenta a peces y aves en Colombia viene de afuera y cuesta cara.",
  "El grillo se cría en poco espacio y da una harina rica en proteína. Se puede producir en la propia finca.",
  "Falta saber, con números, qué comida conviene darles a los grillos. Esa es la pregunta del proyecto.",
];

/**
 * Cifras del proyecto.
 *
 * Solo cosas verificables. Nada de personas beneficiadas ni resultados de
 * laboratorio mientras no existan: inventar un numero aqui costaria la
 * credibilidad de todo lo demas.
 */
export const CIFRAS = [
  { valor: "3", rotulo: "Comidas en estudio" },
  { valor: "3", rotulo: "Grupos de animales: peces, aves y cerdos" },
  { valor: "17", rotulo: "Variables registradas por lote" },
  // Contrato 207-2025: del 29-12-2025 al 29-06-2027.
  { valor: "18", rotulo: "Meses de proyecto" },
] as const;

/**
 * Lo que se hace en cada parada del camino, dicho para la portada. Los
 * titulos y las direcciones salen de `CAMINO`; aqui solo va la frase.
 */
export const PASOS_PORTADA: Record<number, string> = {
  1: "Qué necesita y cómo montarla, paso a paso.",
  2: "Cómo reconocerlos, diferenciar macho y hembra y cuidarlos.",
  3: "Cuéntenos qué animal alimenta, en qué etapa está y cómo es su clima.",
  4: "Las tres comidas en estudio, comparadas para su caso.",
};

/**
 * Foto real del paisaje del Piedemonte Llanero para la seccion del
 * territorio.
 *
 * Vacia a proposito: solo se pone una fotografia real, con licencia libre y
 * su credito completo (autor, licencia y enlace). Mientras sea `null`, la
 * seccion muestra solo el mapa. Nunca un dibujo ni una imagen generada.
 */
export interface FotoConCredito {
  src: string;
  width: number;
  height: number;
  alt: string;
  /** Linea lista para mostrar: "Foto: Autor, CC BY-SA 4.0, Wikimedia Commons". */
  credito: string;
  /** Pagina del archivo, para enlazar el credito. */
  url?: string;
}

export const FOTO_PAISAJE: FotoConCredito | null = null;
