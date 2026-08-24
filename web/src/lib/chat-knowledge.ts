/**
 * Respuestas del asistente informativo.
 *
 * NO usa LLM. Trabaja en dos capas:
 *
 *  1. Si la pregunta es sobre los números del resultado y hay una predicción
 *     del modelo a la mano, se contesta con esos números. Nunca inventados:
 *     salen del modelo entrenado, con su margen de duda y con el aviso de si
 *     el modelo se entrenó con datos simulados.
 *  2. Si no, se busca por palabras clave entre las respuestas guionadas.
 *
 * En las dos capas el tono es el mismo: se sugiere, no se receta.
 */

import { DIETS } from "@/lib/animals";

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
  tutorial: { label: "Arme su caja", href: "/caja" },
  catalog: { label: "Ver los grillos que estudiamos", href: "/grillos" },
  enclosure: { label: "Ver la guía de las cajas", href: "/caja" },
  wizard: { label: "Ir a la consulta paso a paso", href: "/consulta" },
  methodology: { label: "Ver metodología (técnica)", href: "/metodologia" },
  project: { label: "Sobre GrillosIA", href: "/proyecto" },
  projects: { label: "Mis consultas guardadas", href: "/consultas" },
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
      text: "GrillosIA es un proyecto de la **Universidad de los Llanos** que estudia cómo criar mejor **grillos nativos del Piedemonte Llanero** para hacer harina rica en proteína. Esa harina se estudia para dársela a tilapia, pollo o cerdo, y así reemplazar la harina de pescado importada. El proyecto tiene apoyo de **Minciencias (Convocatoria 963 de 2025)**.",
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

/**
 * Cuando el asistente no esta disponible.
 *
 * Antes esto se disimulaba: se devolvia una respuesta guionada cualquiera y
 * parecia que el asistente no sabia nada. Vale mas decir lo que pasa, que asi
 * la persona sabe que puede volver, en vez de pensar que la aplicacion esta
 * rota o que el asistente es inutil.
 */
export const DEMASIADAS: KnowledgeAnswer = {
  text: "Ha hecho muchas preguntas seguidas y necesito un descanso. Espere un rato y vuelva a preguntar.",
  links: [],
};

export const SIN_SERVICIO: KnowledgeAnswer = {
  text: "Ahora mismo no puedo contestar preguntas nuevas. Vuelva a intentarlo en un rato.",
  links: [],
};

const FALLBACK: KnowledgeAnswer = {
  // Sin la promesa de que alguien le escribira: eso hacia pensar que del otro
  // lado hay una persona pendiente, y no la hay. El enlace de contacto sigue
  // abajo, que ahi si se ve que es una pagina y no un mensaje que se manda.
  text: "Esa pregunta todavía no la sé responder bien. Puedo ayudarle con la cría de grillos, las cajas, las comidas y el clima.",
  links: [
    LINKS.tutorial,
    LINKS.enclosure,
    { label: "Dejar mis datos para que me contacten", href: "/contacto" },
  ],
};

// ─────────────────────── Respuestas con números del modelo ───────────────────

/** Una fila del resultado del modelo, tal como la devuelve la API. */
export interface ResultadoModelo {
  tipo_dieta: string;
  proteina_harina: number;
  lipidos_harina: number;
  margen_proteina: number;
  tasa_supervivencia: number | null;
}

/**
 * Lo que el asistente sabe del resultado que el productor está mirando.
 *
 * Va aparte de la pregunta porque la misma pregunta se contesta distinto
 * según haya o no predicción: sin ella, el asistente dice que todavía no hay
 * números, en lugar de callarlo.
 */
export interface ContextoModelo {
  animal: string;
  etapa: string;
  proteinaMin: number;
  proteinaMax: number;
  temperatura: number;
  humedad: number;
  resultados: ResultadoModelo[];
  /** Si el modelo se entrenó con datos simulados, hay que decirlo. Siempre. */
  datosSimulados: boolean;
}

const NOMBRE_DIETA = new Map<string, string>(
  DIETS.map((d) => [d.id, d.name]),
);

function nombreDieta(id: string): string {
  return NOMBRE_DIETA.get(id) ?? id;
}

/**
 * El aviso que acompaña a cualquier número mientras el modelo esté entrenado
 * con datos simulados. No es opcional: un número que se ve bien no debe poder
 * pasar por real.
 */
const AVISO_SIMULADO =
  "\n\nOjo: estos números salen de un modelo entrenado con datos de prueba, mientras llegan los análisis del laboratorio. Sirven para ver cómo va a funcionar el sistema, no para decidir todavía.";

/** Cuánto se acerca una dieta a lo que el animal necesita. */
function distanciaAlObjetivo(
  proteina: number,
  min: number,
  max: number,
): number {
  if (proteina < min) return min - proteina;
  if (proteina > max) return proteina - max;
  return 0;
}

function listaDeDietas(ctx: ContextoModelo): string {
  return ctx.resultados
    .map(
      (r) =>
        `- **${nombreDieta(r.tipo_dieta)}** (${r.tipo_dieta}): ${r.proteina_harina} % de proteína, más o menos ${r.margen_proteina} puntos arriba o abajo.`,
    )
    .join("\n");
}

/**
 * Contesta con los números del modelo cuando la pregunta va de eso.
 *
 * Devuelve `null` si la pregunta no es de este terreno, para que el llamador
 * siga con las respuestas guionadas.
 */
function respuestaConNumeros(
  q: string,
  ctx: ContextoModelo,
): KnowledgeAnswer | null {
  const hay = (...palabras: string[]) =>
    palabras.some((w) => matchesAsWord(q, normalize(w)));

  const sobreDietas = hay(
    "proteina",
    "cual",
    "mejor",
    "comparar",
    "comparacion",
    "dieta",
    "comida",
    "d1",
    "d2",
    "d3",
    "bore",
    "boton de oro",
    "salvado",
  );
  const sobreGrasa = hay("grasa", "lipidos", "lipido", "gordo");
  const sobreVivos = hay(
    "supervivencia",
    "vivos",
    "mueren",
    "muertos",
    "mortalidad",
  );

  if (!sobreDietas && !sobreGrasa && !sobreVivos) return null;
  if (ctx.resultados.length === 0) return null;

  const cola = ctx.datosSimulados ? AVISO_SIMULADO : "";

  if (sobreVivos && !sobreDietas) {
    const conDato = ctx.resultados.filter((r) => r.tasa_supervivencia !== null);
    if (conDato.length === 0) return null;
    const filas = conDato
      .map(
        (r) =>
          `- **${nombreDieta(r.tipo_dieta)}**: llegarían vivos alrededor del ${r.tasa_supervivencia} %.`,
      )
      .join("\n");
    return {
      text: `A ${ctx.temperatura} °C y ${ctx.humedad} % de humedad, el modelo espera esto:\n\n${filas}\n\nLa humedad muy alta es lo que más nos ha costado en los ensayos: los lotes que criamos por encima del 74 % casi no llegaron vivos.${cola}`,
      links: [LINKS.enclosure],
    };
  }

  if (sobreGrasa && !sobreDietas) {
    const filas = ctx.resultados
      .map(
        (r) =>
          `- **${nombreDieta(r.tipo_dieta)}**: ${r.lipidos_harina} % de grasa.`,
      )
      .join("\n");
    return {
      text: `La grasa de la harina que esperaría el modelo con sus condiciones:\n\n${filas}\n\nLa grasa sube cuando la proteína baja, así que las dos van juntas. Para su ${ctx.animal.toLowerCase()} lo que manda es la proteína.${cola}`,
      links: [LINKS.methodology],
    };
  }

  // Pregunta sobre las dietas y la proteína: la más frecuente.
  const ordenadas = [...ctx.resultados].sort(
    (a, b) =>
      distanciaAlObjetivo(a.proteina_harina, ctx.proteinaMin, ctx.proteinaMax) -
      distanciaAlObjetivo(b.proteina_harina, ctx.proteinaMin, ctx.proteinaMax),
  );
  const cerca = ordenadas[0];
  const distancia = distanciaAlObjetivo(
    cerca.proteina_harina,
    ctx.proteinaMin,
    ctx.proteinaMax,
  );

  const encabezado = `Su ${ctx.animal.toLowerCase()} en etapa de ${ctx.etapa.toLowerCase()} necesita entre ${ctx.proteinaMin} y ${ctx.proteinaMax} % de proteína. Con ${ctx.temperatura} °C y ${ctx.humedad} % de humedad, el modelo espera:\n\n${listaDeDietas(ctx)}`;

  const cierre =
    distancia === 0
      ? `\n\nDe las tres, **${nombreDieta(cerca.tipo_dieta)}** es la que le sugerimos mirar primero: cae dentro de lo que su animal necesita.`
      : cerca.proteina_harina > ctx.proteinaMax
        ? `\n\nLas tres quedan por encima de lo que su animal necesita, y la más cercana es **${nombreDieta(cerca.tipo_dieta)}**. Pasarse no se desperdicia: se mezcla la harina de grillo con salvado o maíz para bajarla al punto.`
        : `\n\nNinguna de las tres alcanza sola lo que su animal necesita; la más cercana es **${nombreDieta(cerca.tipo_dieta)}**, a ${distancia.toFixed(1)} puntos. Habría que complementar con otra fuente de proteína.`;

  return {
    text: `${encabezado}${cierre}${cola}`,
    links: [LINKS.methodology, LINKS.wizard],
  };
}

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

/** ¿Es la respuesta de "no sé", o una de verdad? */
export function esGenerica(respuesta: KnowledgeAnswer) {
  return respuesta === FALLBACK;
}

export function answerFor(
  question: string,
  contexto?: ContextoModelo | null,
): KnowledgeAnswer {
  const q = normalize(question);
  if (!q) return FALLBACK;

  // Los números del modelo mandan sobre el texto guionado: si el productor
  // pregunta por su resultado, hay que contestarle con su resultado.
  if (contexto) {
    const conNumeros = respuestaConNumeros(q, contexto);
    if (conNumeros) return conNumeros;
  }

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
