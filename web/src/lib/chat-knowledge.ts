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
  "Estamos en pruebas. Lo que le respondemos le sirve de guía, pero conviene confirmarlo con su experiencia.";

/** Preguntas prácticas que un productor real haría (no meta-preguntas). */
export const STARTER_QUESTIONS = [
  "¿Cada cuánto cambio el agua de los bebederos?",
  "¿Cuántos grillos caben en una caja?",
  "¿Cómo sé cuándo cosechar?",
  "¿Se me murieron muchos, qué hago?",
] as const;

const LINKS = {
  tutorial: { label: "Ver cómo empezar", href: "/tutorial" },
  catalog: { label: "Ver los grillos que estudiamos", href: "/catalogo" },
  enclosure: { label: "Ver la guía de las cajas", href: "/como-armar" },
  wizard: { label: "Ir a la consulta paso a paso", href: "/wizard" },
  methodology: { label: "Ver metodología (técnica)", href: "/metodologia" },
  project: { label: "Sobre GrillIA", href: "/proyecto" },
  projects: { label: "Mis consultas guardadas", href: "/proyectos" },
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
      text: "GrillIA es un proyecto de la **Universidad de los Llanos** que estudia cómo criar mejor **grillos nativos del Piedemonte Llanero** para hacer harina rica en proteína. Esa harina se estudia para dársela a tilapia, pollo o cerdo, y así reemplazar la harina de pescado importada. El proyecto tiene apoyo de **Minciencias (Convocatoria 963 de 2025)**.",
      links: [LINKS.project, LINKS.tutorial],
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
      text: "La harina que estudiamos sirve para tres animales: **tilapia** (le pide entre 30 y 45 % de proteína), **pollo** (18 a 23 %) y **cerdo** (14 a 20 %). Cada uno tiene sus etapas (inicio, crecimiento, engorde). Si me cuenta a cuál va destinada, le sugerimos una comida.",
      links: [LINKS.wizard],
    },
  },
  {
    keywords: [
      "dieta",
      "dietas",
      "cuales dietas",
      "que dietas",
      "que comidas",
      "cuales comidas",
      "comida",
      "comidas",
      "estan en estudio",
      "en estudio",
      "lista",
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
      text: "Estamos probando **tres comidas**. Todas comparten la misma base: **10 % de harina de choclo y 10 % de avena en hojuelas**. Lo que cambia es el 80 % principal:\n\n- **D1** — harina de bore.\n- **D2** — harina de botón de oro.\n- **D3** — salvado de trigo.\n\nPara la hidratación, en las tres ponemos bebederos con agua y pedacitos de manzana.",
      links: [LINKS.wizard],
    },
  },
  {
    keywords: ["proteina", "porcentaje", "rango", "meta"],
    answer: {
      text: "La **meta** del proyecto es que la harina de grillo tenga entre **60 y 70 %** de proteína (en base seca). Todavía no es un dato conseguido: se confirma con un análisis de laboratorio al final de cada prueba.",
      links: [LINKS.methodology],
    },
  },
  {
    keywords: ["temperatura", "humedad", "clima", "ambiente", "calor"],
    answer: {
      text: "Buscamos criar a los grillos entre **24 y 34 grados** de temperatura y con la humedad del aire entre **50 y 80 %**. Son los rangos con los que estamos aprendiendo, no medidas ya tomadas. Si me dice su clima en la consulta, le mostramos las opciones que le van mejor.",
      links: [LINKS.wizard, LINKS.enclosure],
    },
  },
  {
    keywords: [
      "especie",
      "grillo",
      "grillos",
      "que grillos",
      "cuales grillos",
      "gryllidae",
      "familia",
    ],
    answer: {
      text: "Trabajamos con **grillos nativos del Piedemonte Llanero**, de la **familia Gryllidae**, que es el grupo al que llamamos comúnmente grillos. La especie exacta todavía está por identificar, así que por ahora los reportamos a nivel de familia. Puede ver las fotografías de nuestros ejemplares en el catálogo.",
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
      "montar",
    ],
    answer: {
      text: "Para armar sus cajas necesita cosas sencillas: una **caja plástica de 40 a 60 litros**, malla mosquitera (angeo), hueveras de cartón como escondite, un termómetro con medidor de humedad barato, y tapas para el agua y la manzana. Todo lo explicamos paso a paso.",
      links: [LINKS.enclosure],
    },
  },
  {
    keywords: [
      "mantenimiento",
      "limpieza",
      "limpiar",
      "cuidado",
      "olor",
      "diario",
      "agua",
      "cambio el agua",
      "cada cuanto",
    ],
    answer: {
      text: "Todos los días revise que haya **agua fresca y pedacitos de manzana**. Cada dos o tres días retire restos de comida vieja y grillos muertos. Cada semana limpie el fondo de la caja. Si nota mal olor, seguramente falta ventilación o hay demasiada humedad.",
      links: [LINKS.enclosure],
    },
  },
  {
    keywords: [
      "cuantos grillos",
      "cuantos caben",
      "densidad",
      "cuantos por caja",
      "poblacion",
    ],
    answer: {
      text: "Todavía no le puedo dar un número: la densidad de cría es una de las cosas que estamos midiendo en los ensayos. Lo que sí sabemos por experiencia es que conviene **empezar con pocos** e ir agregando cartones de huevo como escondite, porque cuando quedan apretados se pelean y se mueren más.",
      links: [LINKS.enclosure],
    },
  },
  {
    keywords: [
      "cosechar",
      "cosecha",
      "cuando cosecho",
      "cuando cosechar",
      "cuando estan listos",
      "cuanto tardan",
      "cuanto tiempo tardan",
      "crecen",
      "tardan en crecer",
    ],
    answer: {
      text: "Todavía no le podemos dar un número exacto porque depende de la comida, la temperatura y la especie. Es parte de lo que estamos estudiando. Por eso le pedimos paciencia mientras aprendemos. Si guarda una consulta con sus datos, cuando terminemos podremos avisarle qué esperar.",
      links: [LINKS.wizard],
    },
  },
  {
    keywords: [
      "se murieron",
      "muchos muertos",
      "mortalidad",
      "murieron",
      "se me murieron",
      "enfermos",
      "enfermedad",
      "estan enfermos",
    ],
    answer: {
      text: "Lo más común es problema de **ambiente**: demasiada humedad, mala ventilación o cambios bruscos de temperatura. Revise: (1) que la caja tenga buena malla en la tapa, (2) que no haya charcos en el fondo, (3) que no le esté dando sol directo, (4) que los bebederos no permitan ahogamientos. Si el problema sigue, escríbanos con detalles.",
      links: [LINKS.enclosure],
    },
  },
  {
    keywords: [
      "cocina",
      "sobras",
      "restos de comida",
      "puedo dar",
      "les puedo dar",
    ],
    answer: {
      text: "Le sugerimos usar solo las comidas que estamos probando (harina de bore, botón de oro o salvado de trigo, con choclo y avena). Sobras de cocina con sal, aceite o químicos les pueden hacer daño. La manzana sí sirve bien para la hidratación.",
      links: [LINKS.wizard],
    },
  },
  {
    keywords: ["wizard", "asistente guiado", "consulta paso", "como uso", "como funciona", "paso a paso"],
    answer: {
      text: "La **consulta paso a paso** le hace cuatro preguntas cortas: qué animal alimenta, en qué etapa está, y qué calor y humedad tiene su espacio. Con eso le mostramos qué comida se acerca más a lo que necesita su animal.",
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
      "como empezar",
    ],
    answer: {
      text: "Si es su primera vez, hay un **recorrido corto de cinco pasos** que le explica todo. Puede volver a verlo cuando quiera.",
      links: [LINKS.tutorial],
    },
  },
  {
    keywords: [
      "proyectos",
      "consultas",
      "mis consultas",
      "mis proyectos",
      "cambiar de proyecto",
      "cambiar de consulta",
      "nueva consulta",
      "otra consulta",
      "varias consultas",
      "guardar",
    ],
    answer: {
      text: "Puede guardar **varias consultas** al mismo tiempo, cada una con su animal, su clima y su conversación. Cambiar entre ellas es un toque desde la lista.",
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
      text: "El proyecto lo hace la **Universidad de los Llanos** con apoyo de **Minciencias** a través de la **Convocatoria 963 de 2025** (Contrato 207 de 2025).",
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
      "pruebas",
    ],
    answer: {
      text: "Estamos en **pruebas**. Lo que ve aquí le sirve de guía, pero todavía no le damos respuestas definitivas: seguimos aprendiendo con las consultas y los ensayos del laboratorio.",
    },
  },
  {
    keywords: ["harina", "harina de pescado", "alternativa", "sustituir", "reemplazar"],
    answer: {
      text: "Colombia importa miles de toneladas de harina de pescado al año para dársela a los animales. La harina de grillo se estudia como una alternativa nacional, con la **meta** de tener entre 60 y 70 % de proteína al terminar cada prueba de laboratorio.",
      links: [LINKS.methodology],
    },
  },
  {
    keywords: ["piedemonte", "llanero", "region", "donde", "ubicacion"],
    answer: {
      text: "Trabajamos en el **Piedemonte Llanero**, una región del país con clima favorable para criar grillos nativos. Por eso estudiamos las comidas y condiciones típicas de esa zona.",
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
      text: "Todavía no le damos una respuesta única. **Le sugerimos** ir a la consulta paso a paso: comparamos las comidas que estamos probando frente a lo que necesita su animal, y le mostramos cuál se acerca más. La decisión final siempre conviene acompañarla con su propia experiencia.",
      links: [LINKS.wizard],
    },
  },
  {
    keywords: ["precio", "costo", "valor", "cuesta", "cuanto vale"],
    answer: {
      text: "En esta versión no estamos calculando precios ni costos. El foco del proyecto es la calidad nutricional de la harina; los números de plata vienen en fases posteriores.",
    },
  },
  {
    keywords: ["gracias", "muchas gracias", "ok", "listo"],
    answer: {
      text: "Con gusto. Recuerde que estamos en pruebas, así que puede volver cuando quiera y seguir explorando.",
      links: [LINKS.wizard],
    },
  },
];

const FALLBACK: KnowledgeAnswer = {
  text: "Esa pregunta todavía no la sé responder bien. Puedo ayudarle con temas de **grillos**, **cajas de cría**, **comidas** o **clima**. Si prefiere que le responda una persona del equipo, déjenos sus datos y le escribimos.",
  links: [
    LINKS.tutorial,
    LINKS.enclosure,
    { label: "Dejar mis datos para que me contacten", href: "/contacto" },
  ],
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
