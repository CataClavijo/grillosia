/**
 * Glosario corto para el productor.
 *
 * Cada termino tecnico que aparece en la plataforma se puede explicar en una
 * o dos frases, sin sacar a la persona de la pantalla (ver `InfoTip`). Se
 * conserva el nombre cientifico, pero siempre con su traduccion practica.
 *
 * Regla: la explicacion dice QUE SIGNIFICA para el productor, no la
 * definicion de libro. Frases cortas.
 */

export interface Termino {
  titulo: string;
  explicacion: string;
}

export const GLOSARIO = {
  conversion: {
    titulo: "Conversión alimenticia",
    explicacion:
      "Indica cuánto alimento necesita el animal para aumentar de peso. Si es 1,5, por cada kilo que gana se comió kilo y medio. Entre más bajo el número, mejor aprovecha la comida.",
  },
  proteinaBruta: {
    titulo: "Proteína bruta",
    explicacion:
      "Toda la proteína que tiene un alimento, medida en el laboratorio. Es la cifra que traen las etiquetas de los concentrados.",
  },
  requerimientoProteina: {
    titulo: "Necesidad de proteína",
    explicacion:
      "Cuánta proteína debe tener el alimento de su animal, en porcentaje. Cambia según la especie y la etapa en que esté.",
  },
  etapaProductiva: {
    titulo: "Etapa productiva",
    explicacion:
      "El momento de vida en que está su animal, por ejemplo alevín, juvenil o adulto. Un animal joven suele necesitar más proteína que uno adulto.",
  },
  materiaSeca: {
    titulo: "Base seca",
    explicacion:
      "El porcentaje se calcula sobre la harina sin nada de agua. Así se pueden comparar muestras que se secaron distinto.",
  },
  lipidos: {
    titulo: "Lípidos",
    explicacion: "Las grasas del alimento. Dan energía al animal.",
  },
  digestibilidad: {
    titulo: "Eficiencia digestiva",
    explicacion:
      "Qué parte de lo que come el animal logra aprovechar su cuerpo. Lo que no aprovecha sale en el estiércol.",
  },
  biomasa: {
    titulo: "Biomasa",
    explicacion: "El peso total de todos los grillos cosechados en la caja.",
  },
  supervivencia: {
    titulo: "Supervivencia",
    explicacion:
      "De cada 100 grillos que empiezan, cuántos llegan vivos a la cosecha.",
  },
  analisisBromatologico: {
    titulo: "Análisis bromatológico",
    explicacion:
      "El análisis de laboratorio que mide cuánta proteína, grasa, fibra y minerales tiene un alimento. Con él se confirma la calidad de la harina.",
  },
  prediccion: {
    titulo: "Predicción del modelo",
    explicacion:
      "Un cálculo que hace el programa a partir de los datos con que aprendió. No es una medición: sirve para orientar, no para asegurar.",
  },
  margen: {
    titulo: "Margen",
    explicacion:
      "Cuánto puede variar el número de la predicción. Entre más grande el margen, menos seguro es el resultado.",
  },
  densidad: {
    titulo: "Densidad",
    explicacion:
      "Cuántos grillos hay por espacio de caja. Si hay demasiados, pelean, se estresan y se mueren más.",
  },
} as const satisfies Record<string, Termino>;

export type TerminoId = keyof typeof GLOSARIO;
