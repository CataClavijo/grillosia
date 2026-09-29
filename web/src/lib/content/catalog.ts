/**
 * Grillos del proyecto: fotografías y lo que sirve saber de ellos.
 *
 * La identificación de especie todavía no está hecha: por ahora todos los
 * ejemplares se reportan como **Familia Gryllidae** (ver `taxonomia.ts`).
 * Por eso esta página no presenta especies ni nombres comunes propios: sería
 * inventar una precisión que el proyecto aún no tiene.
 *
 * Todo lo que se dice aquí aplica a los grillos en general (la familia), no a
 * una especie. No se agregan afirmaciones biológicas nuevas sin fuente.
 *
 * Las fotografías son de los ejemplares del propio proyecto y van siempre
 * con el crédito de quien las tomó.
 */

export interface CricketPhoto {
  id: string;
  src: string;
  alt: string;
  /** Autor de la fotografía. Se muestra siempre junto a la imagen. */
  credit: string;
  /** Qué se alcanza a ver en esta foto. */
  note: string;
}

export const CATALOG_INTRO =
  "Estos son los grillos con los que trabaja el proyecto. Aprenda a reconocerlos, a diferenciar machos y hembras, y a entender cómo crecen.";

export const CATALOG_NOTE =
  "Todavía no hemos terminado de identificar la especie exacta. Por eso, por ahora los reportamos a nivel de familia. Cuando la identificación esté confirmada, actualizaremos esta página.";

export const FAMILIA = "Familia Gryllidae";

export const CREDITO_FOTOS =
  "Fotografías: Catalina Clavijo-Agudelo y Sebastián Berrío, sobre ejemplares del proyecto.";

export const CRICKET_PHOTOS: CricketPhoto[] = [
  {
    id: "grillo-1",
    src: "/grillos/grillo-1.webp",
    alt: "Grillo de la familia Gryllidae visto desde arriba, de color café claro, con las patas traseras extendidas.",
    credit: "Catalina Clavijo-Agudelo",
    note: "Visto desde arriba: se distinguen las patas traseras, las que usa para saltar.",
  },
  {
    id: "grillo-2",
    src: "/grillos/grillo-2.webp",
    alt: "Grillo de la familia Gryllidae visto de lado, de color café oscuro, con las antenas largas hacia adelante.",
    credit: "Sebastián Berrío",
    note: "De lado: se ven las antenas largas, una de las señas más fáciles de reconocer.",
  },
  {
    id: "grillo-3",
    src: "/grillos/grillo-3.webp",
    alt: "Grillo de la familia Gryllidae de color café oscuro, visto de lado, con las alas plegadas sobre el cuerpo.",
    credit: "Sebastián Berrío",
    note: "Ejemplar más oscuro, con las alas plegadas sobre el lomo.",
  },
  {
    id: "grillo-4",
    src: "/grillos/grillo-4.webp",
    alt: "Grillo de la familia Gryllidae visto desde arriba sobre fondo blanco, con las antenas muy largas extendidas.",
    credit: "Catalina Clavijo-Agudelo",
    note: "Visto completo: las antenas pueden ser más largas que el cuerpo.",
  },
];

/** Cómo reconocer un grillo. Aplica a la familia, no a una especie. */
export const COMO_RECONOCER: { titulo: string; texto: string }[] = [
  {
    titulo: "Antenas largas",
    texto: "Muy largas y delgadas, a veces más que el cuerpo entero.",
  },
  {
    titulo: "Patas traseras fuertes",
    texto: "Gruesas y fuertes, adaptadas para saltar.",
  },
  {
    titulo: "Color café",
    texto: "Del café claro al casi negro, según el ejemplar.",
  },
  {
    titulo: "El canto",
    texto:
      "Los machos frotan las alas y cantan, sobre todo al caer la tarde y en la noche.",
  },
];

/** Grillo o saltamontes: la duda más común. */
export const GRILLO_O_SALTAMONTES = [
  "Lo más fácil de mirar son las antenas. El grillo las tiene muy largas, casi tan largas como el cuerpo, y las mueve todo el tiempo. El saltamontes las tiene cortas y gruesas.",
  "El grillo también es más achatado y camina; el saltamontes es más alargado y salta lejos.",
];

export const MACHO_HEMBRA = [
  "La hembra lleva atrás una aguja larga y recta, llamada ovipositor. Con ella pone los huevos en la tierra. El macho no la tiene.",
  "El que canta es el macho, frotando las alas.",
];

export const CRECIMIENTO = [
  "Del huevo sale una ninfa: un grillo pequeño, parecido al adulto pero sin alas.",
  "La ninfa cambia de piel varias veces (a esto se le llama muda) y en cada muda crece. Las alas aparecen al final.",
  "No pasa por una etapa de capullo, como sí ocurre con las mariposas.",
];

/**
 * Por qué importan los grillos para el proyecto. Sale de lo que ya dice la
 * portada; la proteína es una META interna, no un resultado.
 */
export const IMPORTANCIA = [
  "El grillo se cría en poco espacio, come poco y da una harina rica en proteína.",
  "Esa harina se estudia como alternativa a la harina de pescado importada, que encarece la alimentación de peces, aves y cerdos.",
  "La meta interna del proyecto es una harina con 60 a 70 % de proteína en base seca. Todavía no es un dato conseguido: se confirma con el análisis de laboratorio de cada prueba.",
];

/** Recomendaciones generales de captura. */
export const COMO_CAPTURAR: string[] = [
  "Búsquelos al atardecer o de noche, guiándose por el canto.",
  "Revise entre la hojarasca húmeda, bajo piedras y en la base de los pastos.",
  "Use un frasco con tapa perforada y un poco de pasto adentro.",
  "Manipúlelos con suavidad: las patas traseras se desprenden con facilidad.",
];
