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

/** Al modo de "Por qué surge MAS Meta". */
export const POR_QUE = [
  "Buena parte de la harina que alimenta a los peces y las aves del país viene de afuera y cuesta cara. Cada alza del dólar se siente en el costo de levantar un lote.",
  "El grillo se cría en poco espacio, come poco y da una harina rica en proteína. Es una alternativa que el productor puede montar en su propia finca.",
  "Lo que falta es saber, con números, qué comida conviene darle a los grillos para cada caso. Esa es la pregunta que este proyecto está respondiendo.",
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
  { valor: "3", rotulo: "Animales destino" },
  { valor: "17", rotulo: "Variables registradas por lote" },
  { valor: "12", rotulo: "Meses de proyecto" },
] as const;
