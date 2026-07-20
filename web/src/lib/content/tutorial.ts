/**
 * Contenido del recorrido de bienvenida.
 *
 * Tres pasos, no cinco: los pasos que antes describían los grillos y las
 * dietas duplicaban el catálogo y lo que el wizard muestra veinte segundos
 * después. Ahora esos temas viven como enlaces en línea dentro de los pasos
 * que quedan.
 *
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
  /** Enlace opcional de consulta que se ofrece dentro del paso. */
  inlineLink?: { label: string; href: string };
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: "bienvenida",
    number: 1,
    icon: "sparkles",
    title: "Bienvenido a GrillIA",
    subtitle: "Su guía para criar grillos en casa",
    body: "Hola, qué gusto tenerlo por aquí. **GrillIA** le acompaña en la cría de grillos nativos del Piedemonte Llanero, para que produzca harina rica en proteína y la use con sus tilapias, pollos o cerdos.\n\nLe vamos a mostrar cómo preparar el espacio de cría y qué comidas estamos comparando. Son grillos de su misma región, así que ya están acostumbrados al clima de por aquí.",
    cta_next: "Continuar",
    inlineLink: {
      label: "Ver los grillos del proyecto",
      href: "/catalogo",
    },
  },
  {
    id: "cajas",
    number: 2,
    icon: "box",
    title: "Arme el espacio",
    subtitle: "Con materiales sencillos y baratos",
    body: "Para criar los grillos necesita una **caja plástica**, malla mosquitera (angeo), cartones de huevo como escondite y unas tapas para el agua y la manzana. Casi todo se consigue reciclado.\n\nBuscamos mantener la caja **entre 24 y 34 grados** y con la humedad del aire **entre 50 y 80 por ciento**. En la guía le explicamos trucos sencillos para lograrlo sin equipos caros.",
    cta_next: "Continuar",
    inlineLink: {
      label: "Ver cómo armar la caja paso a paso",
      href: "/como-armar",
    },
  },
  {
    id: "comidas",
    number: 3,
    icon: "wheat",
    title: "Las tres comidas",
    subtitle: "Estamos comparando cuál da mejor harina",
    body: "Probamos **tres comidas**. Las tres llevan la misma base de harina de choclo y avena en hojuelas, y cambian en el ingrediente principal: **harina de bore**, **harina de botón de oro** o **salvado de trigo**. La hidratación es con agua y pedacitos de manzana.\n\nAhora le mostramos cuál de las tres se acerca más a lo que necesita su animal. Recuerde que estamos en pruebas: le damos una comparación, no una única respuesta.",
    cta_next: "Ver qué comida le conviene",
  },
];
