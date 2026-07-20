/**
 * Contenido del tutorial de bienvenida.
 * Redactado para audiencia rural adulta colombiana; tratamiento de usted.
 */

export interface TutorialStep {
  id: string;
  number: number;
  icon: "sparkles" | "bug" | "box" | "wheat" | "message-circle";
  title: string;
  subtitle: string;
  body: string;
  cta_next: string;
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: "bienvenida",
    number: 1,
    icon: "sparkles",
    title: "Bienvenido a GrillIA",
    subtitle: "Su guía paso a paso para criar grillos en casa",
    body: "Hola, qué gusto tenerlo por aquí. **GrillIA** es una herramienta pensada para acompañarle en la cría de grillos nativos del Piedemonte Llanero, para que pueda producir harina rica en proteína y usarla en la alimentación de sus tilapias, pollos o cerdos.\n\nNo es solo un formulario. Es una guía paso a paso: le vamos a mostrar cómo preparar los espacios, qué dietas estudiamos, qué condiciones objetivo mantener y cómo comparar los resultados de cada opción.\n\nEste proyecto es de la Universidad de los Llanos y apenas está en fase de pruebas, así que lo que vea aquí son **sugerencias basadas en lo que estudiamos**, no promesas. Le vamos a hablar claro y sin tecnicismos. Puede volver a ver este tutorial cuando quiera desde el menú.",
    cta_next: "Continuar",
  },
  {
    id: "grillos",
    number: 2,
    icon: "bug",
    title: "Grillos de la zona",
    subtitle: "Trabajamos con grillos nativos del Piedemonte Llanero",
    body: "Los grillos con los que trabajamos son **nativos del Piedemonte Llanero**, es decir, son insectos que ya viven en su región. Eso los hace más fáciles de criar porque están acostumbrados al clima y a los alimentos que usted puede conseguir cerca.\n\nEn la aplicación tenemos un **catálogo** donde puede verlos con fotos y una descripción sencilla: cómo son, dónde suelen aparecer y qué señales le ayudan a reconocerlos. Puede visitarlo cuando quiera desde el menú principal.\n\nNo hace falta que se aprenda nombres raros ni términos científicos. Lo importante es que pueda identificarlos si los ve en su finca y sepa que son los mismos que usamos en el estudio. Si tiene dudas, siempre puede preguntarle al asistente.",
    cta_next: "Continuar",
  },
  {
    id: "cajas",
    number: 3,
    icon: "box",
    title: "Arme el espacio",
    subtitle: "Con materiales sencillos y de bajo costo",
    body: "Para criar los grillos necesita armar unos **espacios de cría** sencillos. La buena noticia es que los materiales son baratos y muchos se pueden reciclar: cajas plásticas, cartones de huevo, mallas finas y recipientes pequeños para el agua y la comida.\n\nDentro de la aplicación tiene una **guía de armado** paso a paso. Ahí le mostramos cómo preparar la caja, cómo dejar la ventilación, dónde poner los refugios de cartón y cómo mantener limpio el espacio.\n\nLas condiciones objetivo son **entre 24 y 34 grados** de temperatura y **entre 50 y 80% de humedad**. No se preocupe si no tiene equipos: la guía le explica trucos simples para mantener el ambiente adecuado en su casa o galpón.",
    cta_next: "Continuar",
  },
  {
    id: "dieta",
    number: 4,
    icon: "wheat",
    title: "Las dietas en estudio",
    subtitle: "Tres opciones con ingredientes de la región",
    body: "En este momento estamos comparando **tres dietas** para ver cuál produce mejor harina de grillo. Todas comparten una base común: **10% de harina de choclo y 10% de avena en hojuelas**, más una hidratación con agua y pedacitos de manzana.\n\nLo que cambia es el 80% restante, que es la fuente principal de proteína:\n\n- **D1:** harina de bore\n- **D2:** harina de botón de oro\n- **D3:** salvado de trigo\n\nLa **meta interna** del proyecto es lograr una harina con **60 a 70% de proteína**, aunque esto se confirmará con los análisis de laboratorio al final de cada ensayo. Por eso todavía le hablamos de sugerencias y no de resultados definitivos.",
    cta_next: "Continuar",
  },
  {
    id: "asistente",
    number: 5,
    icon: "message-circle",
    title: "Su asistente guiado",
    subtitle: "Compare dietas y resuelva sus dudas cuando quiera",
    body: "Cuando esté listo para probar, el **asistente guiado** le hace unas preguntas sencillas: qué animal alimenta, en qué etapa está y qué condiciones tiene en su espacio de cría. Con eso le sugerimos cuál de las tres dietas en estudio se acerca más a su meta de proteína.\n\nTambién tiene un **chat** disponible donde puede escribir o hablar. Pregúntele lo que quiera sobre el proyecto: cómo cuidar los grillos, qué significa cada dieta, cómo interpretar los resultados o cualquier duda que le vaya saliendo en el camino.\n\nRecuerde que estamos en fase de pruebas, así que le pedimos paciencia. Todo lo que aprenda usando la aplicación nos ayuda a mejorarla. Ya está listo para empezar.",
    cta_next: "Empezar a usar GrillIA",
  },
];
