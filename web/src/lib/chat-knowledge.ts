/**
 * Respuestas predefinidas del asistente informativo.
 * NO usa LLM: hace matching por palabras clave y devuelve texto guionado.
 * Es deliberadamente conservador: nunca da una recomendación definitiva.
 */

export interface KnowledgeLink {
  label: string;
  href: string;
}

export interface KnowledgeAnswer {
  text: string;
  links?: KnowledgeLink[];
}

export interface KnowledgeEntry {
  /** Palabras clave (lowercase, sin acentos) que activan esta respuesta. */
  keywords: string[];
  answer: KnowledgeAnswer;
}

export const WELCOME_MESSAGE =
  "Esta es una versión de demostración. Las recomendaciones presentadas se basan en datos preliminares y servirán para validar la experiencia de usuario.";

export const STARTER_QUESTIONS = [
  "¿Qué es GrillIA?",
  "¿Cómo armo las cajas de cría?",
  "¿Qué grillos usamos?",
  "¿Qué dietas están en estudio?",
] as const;

const LINKS = {
  tutorial: { label: "Ver el tutorial", href: "/tutorial" },
  catalog: { label: "Ver el catálogo de grillos", href: "/catalogo" },
  enclosure: { label: "Ver la guía de armado", href: "/como-armar" },
  wizard: { label: "Ir al asistente guiado", href: "/wizard" },
  methodology: { label: "Ver la metodología", href: "/metodologia" },
  project: { label: "Sobre el proyecto", href: "/proyecto" },
  projects: { label: "Ver mis proyectos", href: "/proyectos" },
} as const;

const KNOWLEDGE: KnowledgeEntry[] = [
  {
    keywords: [
      "que es",
      "que hace",
      "proyecto",
      "grillia",
      "quienes son",
      "de que se trata",
    ],
    answer: {
      text: "GrillIA es un proyecto de la **Universidad de los Llanos** que estudia cómo optimizar la cría de **grillos nativos del Piedemonte Llanero** para producir harina proteica. La harina se evalúa como alternativa a la harina de pescado importada en piscicultura, avicultura y porcicultura. Cuenta con financiación de la **Convocatoria Minciencias 963 de 2025**.",
      links: [LINKS.project, LINKS.methodology],
    },
  },
  {
    keywords: [
      "animal",
      "animales",
      "tilapia",
      "pollo",
      "cerdo",
      "para quien",
      "para que sirve",
    ],
    answer: {
      text: "El modelo en estudio cubre tres animales destino: **tilapia** (meta 30 a 45 % de proteína), **pollo** (18 a 23 %) y **cerdo** (14 a 20 %). Cada animal se divide en etapas productivas (inicio, crecimiento, engorde). Le sugerimos abrir el asistente guiado para ver la comparación demostrativa.",
      links: [LINKS.wizard],
    },
  },
  {
    keywords: [
      "dieta",
      "dietas",
      "cuales dietas",
      "que dietas",
      "estan en estudio",
      "en estudio",
      "lista",
      "comida",
      "alimento",
      "ingredientes",
      "bore",
      "boton",
      "boton de oro",
      "salvado",
      "salvado de trigo",
      "choclo",
      "avena",
    ],
    answer: {
      text: "Hay tres dietas en estudio. Todas comparten la misma base de **harina de choclo 10 %** y **avena en hojuelas 10 %**, y varían en la fuente proteica principal (80 %): **D1** harina de bore, **D2** harina de botón de oro, **D3** salvado de trigo. La hidratación es común: bebederos con agua más pedazos de manzana.",
      links: [LINKS.wizard],
    },
  },
  {
    keywords: ["proteina", "porcentaje", "rango", "meta"],
    answer: {
      text: "La **meta interna** del proyecto es alcanzar entre **60 y 70 %** de proteína en la harina de grillo (en base seca). No es un valor ya obtenido: se confirmará mediante análisis bromatológico al final de cada ensayo.",
      links: [LINKS.methodology],
    },
  },
  {
    keywords: ["temperatura", "humedad", "clima", "ambiente"],
    answer: {
      text: "El estudio contempla como **condiciones de cría objetivo** un rango de **24 a 34 °C** de temperatura y **50 a 80 %** de humedad relativa. Son los rangos hacia los que apunta el ensayo, no mediciones ya registradas. Le pedimos su clima en el asistente guiado para mostrarle el contexto de su consulta.",
      links: [LINKS.wizard, LINKS.enclosure],
    },
  },
  {
    keywords: ["especie", "grillo", "grillos", "que grillos", "cuales grillos"],
    answer: {
      text: "El proyecto trabaja con **grillos nativos del Piedemonte Llanero**. La selección específica y su perfil nutricional se está documentando como parte del estudio. En el catálogo puede ver los grillos que estamos considerando, con fotos y descripción.",
      links: [LINKS.catalog],
    },
  },
  {
    keywords: [
      "cajas",
      "caja",
      "como armar",
      "como armo",
      "armar",
      "espacio",
      "enclosure",
      "materiales",
      "empezar",
      "como empezar",
    ],
    answer: {
      text: "Para armar sus cajas necesita pocos materiales: una **caja plástica de 40 a 60 litros**, malla mosquitero, hueveras de cartón como refugio, un termómetro-higrómetro barato y tapas para el agua y la manzana. La guía le muestra el paso a paso.",
      links: [LINKS.enclosure],
    },
  },
  {
    keywords: ["mantenimiento", "limpieza", "limpiar", "cuidado", "olor", "diario"],
    answer: {
      text: "El mantenimiento diario es sencillo: revise el agua y la manzana, retire restos de comida vieja y grillos muertos cada dos o tres días, y limpie el sustrato cada semana. Si nota mal olor, aumente la ventilación. En la guía tiene la lista completa.",
      links: [LINKS.enclosure],
    },
  },
  {
    keywords: ["wizard", "asistente guiado", "como uso", "como funciona", "paso a paso"],
    answer: {
      text: "El asistente guiado le pide cuatro datos: el animal destino, su etapa productiva, la temperatura promedio de cría y la humedad. Con eso le sugerimos qué dieta en estudio se acerca más a su meta de proteína. Puede probarlo cuando quiera.",
      links: [LINKS.wizard],
    },
  },
  {
    keywords: [
      "tutorial",
      "primera vez",
      "empezar",
      "guia",
      "recorrido",
      "onboarding",
    ],
    answer: {
      text: "Puede volver a ver el **tutorial de bienvenida** cuando quiera. Son cinco pasos cortos: qué es GrillIA, los grillos con los que trabajamos, cómo armar las cajas, las dietas en estudio y cómo usar el asistente.",
      links: [LINKS.tutorial],
    },
  },
  {
    keywords: [
      "proyectos",
      "mis proyectos",
      "cambiar de proyecto",
      "nuevo proyecto",
      "otro proyecto",
      "varios proyectos",
    ],
    answer: {
      text: "Puede tener **varios proyectos** al mismo tiempo, cada uno con su animal destino, su clima y su propia conversación. Cambiar entre proyectos es un toque desde la lista.",
      links: [LINKS.projects],
    },
  },
  {
    keywords: [
      "minciencias",
      "financiacion",
      "convocatoria",
      "univer",
      "unillanos",
      "llanos",
    ],
    answer: {
      text: "El proyecto es ejecutado por la **Universidad de los Llanos** con financiación de **Minciencias** a través de la **Convocatoria 963 de 2025** (Contrato 207 de 2025).",
      links: [LINKS.project],
    },
  },
  {
    keywords: [
      "demo",
      "demostracion",
      "real",
      "produccion",
      "validado",
      "definitivo",
      "definitiva",
    ],
    answer: {
      text: "Esta versión es **demostrativa**. Los resultados que ve aquí no son recomendaciones definitivas: se basan en datos preliminares y el modelo final aún está en fase de entrenamiento. Su propósito hoy es validar la experiencia de usuario.",
    },
  },
  {
    keywords: ["harina", "harina de pescado", "alternativa", "sustituir", "reemplazar"],
    answer: {
      text: "Colombia importa miles de toneladas de harina de pescado al año para alimentación animal. La harina de grillo se estudia como alternativa nacional, con la **meta interna** del proyecto de alcanzar entre 60 y 70 % de proteína en base seca al final de cada ensayo.",
      links: [LINKS.methodology],
    },
  },
  {
    keywords: ["piedemonte", "llanero", "region", "donde", "ubicacion"],
    answer: {
      text: "El proyecto se desarrolla en el **Piedemonte Llanero** colombiano, una región con condiciones climáticas favorables para la cría de grillos nativos. Por eso el modelo aprende a recomendar dietas dentro de los rangos típicos de esa zona.",
    },
  },
  {
    keywords: [
      "recomienda",
      "recomendar",
      "recomendacion",
      "me recomienda",
      "que me recomienda",
      "cual me recomienda",
      "me sugiere",
      "que me sugiere",
      "cual es mejor",
      "cual deberia",
      "que deberia",
    ],
    answer: {
      text: "En esta demo no entregamos una recomendación definitiva. **Le sugerimos** abrir el asistente guiado: comparamos las dietas en estudio frente a su meta de proteína y le mostramos cuál se acerca más bajo sus condiciones climáticas. La decisión final debe acompañarse de criterio técnico.",
      links: [LINKS.wizard],
    },
  },
  {
    keywords: ["precio", "costo", "valor", "cuesta"],
    answer: {
      text: "Esta versión demostrativa no estima precios ni costos. El proyecto está centrado en optimizar la composición nutricional de la harina; los análisis económicos son parte de fases posteriores.",
    },
  },
  {
    keywords: ["gracias", "muchas gracias", "ok"],
    answer: {
      text: "Con gusto. Recuerde que esta es una versión de demostración. Puede seguir explorando el asistente guiado cuando quiera.",
      links: [LINKS.wizard],
    },
  },
];

const FALLBACK: KnowledgeAnswer = {
  text: "Esa es una buena pregunta. En esta versión de demostración solo puedo responder sobre el proyecto en general: qué es GrillIA, qué animales cubre, qué dietas están en estudio, cómo armar las cajas y cómo funciona el asistente guiado. ¿Le interesa alguno de esos temas?",
  links: [LINKS.tutorial, LINKS.catalog, LINKS.enclosure],
};

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[¿?¡!.,;]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Coincidencia por límites de palabra: "dieta" no matchea dentro de "dietas",
 * y "que dieta" no matchea dentro de "que dietas". Las frases (con espacio)
 * pesan más que las palabras sueltas.
 */
function matchesAsWord(q: string, kw: string): boolean {
  const re = new RegExp(`(^|\\W)${escapeRegex(kw)}(\\W|$)`);
  return re.test(q);
}

export function answerFor(question: string): KnowledgeAnswer {
  const q = normalize(question);
  if (!q) return FALLBACK;

  let bestEntry: KnowledgeEntry | null = null;
  let bestScore = 0;

  for (const entry of KNOWLEDGE) {
    let score = 0;
    for (const kw of entry.keywords) {
      const nk = normalize(kw);
      if (matchesAsWord(q, nk)) {
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
