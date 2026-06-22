/**
 * Respuestas predefinidas del asistente informativo.
 * NO usa LLM: hace matching por palabras clave y devuelve texto guionado.
 * Es deliberadamente conservador: nunca da una recomendación definitiva.
 */

export interface KnowledgeEntry {
  /** Palabras clave (lowercase, sin acentos) que activan esta respuesta. */
  keywords: string[];
  answer: string;
}

export const WELCOME_MESSAGE =
  "Esta es una versión de demostración. Las recomendaciones presentadas se basan en datos preliminares y servirán para validar la experiencia de usuario.";

export const STARTER_QUESTIONS = [
  "¿Qué es GrillIA?",
  "¿Qué animales cubre el modelo?",
  "¿Qué dietas están en estudio?",
  "¿Cómo funciona el asistente guiado?",
] as const;

const KNOWLEDGE: KnowledgeEntry[] = [
  {
    keywords: ["que es", "qué es", "que hace", "qué hace", "proyecto", "grillia"],
    answer:
      "GrillIA es un proyecto de la Universidad de los Llanos que estudia cómo optimizar la cría de grillos nativos del Piedemonte Llanero para producir harina proteica. La harina se evalúa como alternativa a la harina de pescado importada en piscicultura, avicultura y porcicultura. El proyecto cuenta con financiación de la Convocatoria Minciencias 963 de 2025.",
  },
  {
    keywords: ["animal", "animales", "tilapia", "pollo", "cerdo", "para quien", "para quién", "para que sirve", "para qué sirve"],
    answer:
      "El modelo en estudio cubre tres animales destino: **tilapia** (meta 30 a 45 % de proteína), **pollo** (18 a 23 %) y **cerdo** (14 a 20 %). Cada animal se divide en etapas productivas (inicio, crecimiento, engorde). Le sugerimos abrir el asistente guiado para ver la comparación demostrativa.",
  },
  {
    keywords: ["dieta", "dietas", "comida", "alimento", "ingredientes", "bore", "boton", "botón", "salvado", "choclo", "avena"],
    answer:
      "Hay tres dietas en estudio. Todas comparten la misma base de **harina de choclo 10 %** y **avena en hojuelas 10 %**, y varían en la fuente proteica principal (80 %): **D1** harina de bore, **D2** harina de botón de oro, **D3** salvado de trigo. La hidratación es común: bebederos con agua más pedazos de manzana.",
  },
  {
    keywords: ["proteina", "proteína", "porcentaje", "rango", "meta"],
    answer:
      "La **meta interna** del proyecto es alcanzar entre **60 y 70 %** de proteína en la harina de grillo (en base seca). No es un valor ya obtenido: se confirmará mediante análisis bromatológico al final de cada ensayo.",
  },
  {
    keywords: ["temperatura", "humedad", "clima", "ambiente"],
    answer:
      "El estudio contempla como **condiciones de cría objetivo** un rango de **24 a 34 °C** de temperatura y **50 a 80 %** de humedad relativa. Son los rangos hacia los que apunta el ensayo, no mediciones ya registradas. Le pedimos su clima en el asistente guiado para mostrarle el contexto de su consulta.",
  },
  {
    keywords: ["especie", "grillo", "grillos"],
    answer:
      "El proyecto trabaja con **grillos nativos del Piedemonte Llanero**. La selección específica y su perfil nutricional se está documentando como parte del estudio.",
  },
  {
    keywords: ["wizard", "asistente guiado", "como uso", "cómo uso", "como funciona", "cómo funciona", "paso a paso"],
    answer:
      "El asistente guiado le pide cuatro datos: el animal destino, su etapa productiva, la temperatura promedio de cría y la humedad. Con eso le sugerimos qué dieta en estudio se acerca más a su meta de proteína. Puede probarlo desde el botón \"Probar el asistente guiado\" en la página principal.",
  },
  {
    keywords: ["minciencias", "financiacion", "financiación", "convocatoria", "univer", "unillanos", "llanos"],
    answer:
      "El proyecto es ejecutado por la **Universidad de los Llanos** con financiación de **Minciencias** a través de la **Convocatoria 963 de 2025** (Contrato 207 de 2025). La investigadora principal es la Dra. Mónica Paola Higuera-Díaz.",
  },
  {
    keywords: ["demo", "demostracion", "demostración", "real", "produccion", "producción", "validado", "validada"],
    answer:
      "Esta versión es **demostrativa**. Los resultados que ve aquí no son recomendaciones definitivas: se basan en datos preliminares y el modelo final aún está en fase de entrenamiento. Su propósito hoy es validar la experiencia de usuario.",
  },
  {
    keywords: ["harina", "harina de pescado", "alternativa", "sustituir", "reemplazar"],
    answer:
      "Colombia importa miles de toneladas de harina de pescado al año para alimentación animal. La harina de grillo se estudia como alternativa nacional, con la **meta interna** del proyecto de alcanzar entre 60 y 70 % de proteína en base seca al final de cada ensayo. GrillIA contribuye al estudio de su producción óptima.",
  },
  {
    keywords: ["piedemonte", "llanero", "región", "region", "donde", "dónde", "ubicacion", "ubicación"],
    answer:
      "El proyecto se desarrolla en el Piedemonte Llanero colombiano, una región con condiciones climáticas favorables para la cría de grillos nativos. Por eso el modelo aprende a recomendar dietas dentro de los rangos típicos de esa zona.",
  },
  {
    keywords: ["recomienda", "recomendar", "recomendación", "recomendacion", "que dieta", "qué dieta", "cual dieta", "cuál dieta"],
    answer:
      "En esta demo no entregamos una recomendación definitiva. **Le sugerimos** abrir el asistente guiado: comparamos las dietas en estudio frente a su meta de proteína y le mostramos cuál se acerca más bajo sus condiciones climáticas. La decisión final debe acompañarse de criterio técnico.",
  },
  {
    keywords: ["precio", "costo", "valor", "cuesta"],
    answer:
      "Esta versión demostrativa no estima precios ni costos. El proyecto está centrado en optimizar la composición nutricional de la harina; los análisis económicos forman parte de fases posteriores.",
  },
  {
    keywords: ["gracias", "muchas gracias", "ok"],
    answer:
      "Con gusto. Recuerde que esta es una versión de demostración. Puede seguir explorando el asistente guiado cuando quiera.",
  },
];

const FALLBACK =
  "Esa es una buena pregunta. En esta versión de demostración solo puedo responder sobre el proyecto en general: qué es GrillIA, qué animales cubre, qué dietas están en estudio y cómo funciona el asistente guiado. ¿Le interesa alguno de esos temas?";

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[¿?¡!.,;]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function answerFor(question: string): string {
  const q = normalize(question);
  if (!q) return FALLBACK;

  let bestEntry: KnowledgeEntry | null = null;
  let bestScore = 0;

  for (const entry of KNOWLEDGE) {
    let score = 0;
    for (const kw of entry.keywords) {
      const nk = normalize(kw);
      if (q.includes(nk)) {
        // Coincidencia de frase compuesta vale más que palabra suelta
        score += nk.includes(" ") ? 3 : 1;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestEntry = entry;
    }
  }

  return bestEntry ? bestEntry.answer : FALLBACK;
}
