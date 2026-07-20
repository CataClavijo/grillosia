/**
 * Grillos del proyecto.
 *
 * La identificación de especie todavía no está hecha: por ahora todos los
 * ejemplares se reportan como **Familia Gryllidae**. Por eso esta página no
 * presenta especies distintas ni nombres comunes propios — sería inventar
 * una precisión que el proyecto aún no tiene.
 *
 * Las fotografías son de los ejemplares del propio proyecto y van siempre
 * con el crédito de quien las tomó.
 */

export interface CricketPhoto {
  id: string;
  src: string;
  alt: string;
  /** Autor de la fotografía. Se muestra siempre bajo la imagen. */
  credit: string;
  /** Qué se alcanza a ver en esta foto. */
  note: string;
}

export const CATALOG_INTRO =
  "Estas son fotografías de los grillos con los que estamos trabajando en el proyecto. Todos pertenecen a la familia Gryllidae, que es el grupo al que llamamos comúnmente grillos.";

export const CATALOG_NOTE =
  "Todavía no hemos terminado de identificar la especie exacta de cada ejemplar. Por eso, por ahora los reportamos a nivel de familia. Cuando la identificación esté confirmada, actualizaremos esta página.";

export const FAMILIA = "Familia Gryllidae";

export const CRICKET_PHOTOS: CricketPhoto[] = [
  {
    id: "grillo-1",
    src: "/grillos/grillo-1.webp",
    alt: "Grillo de la familia Gryllidae visto desde arriba, de color café claro, con las patas traseras extendidas.",
    credit: "Catalina Clavijo-Agudelo",
    note: "Ejemplar de color café claro, visto desde arriba. Se distinguen bien las patas traseras, que son las que usa para saltar.",
  },
  {
    id: "grillo-2",
    src: "/grillos/grillo-2.webp",
    alt: "Grillo de la familia Gryllidae visto de lado, de color café oscuro, con las antenas largas hacia adelante.",
    credit: "Sebastián Berrío",
    note: "Vista de lado. Se ven las antenas largas, una de las señas más fáciles para reconocer un grillo.",
  },
  {
    id: "grillo-3",
    src: "/grillos/grillo-3.webp",
    alt: "Grillo de la familia Gryllidae de color café oscuro, visto de lado, con las alas plegadas sobre el cuerpo.",
    credit: "Sebastián Berrío",
    note: "Ejemplar más oscuro. Se aprecian las alas plegadas sobre el lomo.",
  },
  {
    id: "grillo-4",
    src: "/grillos/grillo-4.webp",
    alt: "Grillo de la familia Gryllidae visto desde arriba sobre fondo blanco, con las antenas muy largas extendidas.",
    credit: "Catalina Clavijo-Agudelo",
    note: "Vista completa desde arriba. Las antenas pueden ser más largas que el propio cuerpo.",
  },
];

/** Cómo reconocer un grillo en campo. Aplica a la familia, no a una especie. */
export const COMO_RECONOCER: string[] = [
  "Antenas muy largas, a veces más que el cuerpo entero.",
  "Patas traseras gruesas y fuertes, hechas para saltar.",
  "Color café, del claro al casi negro según el ejemplar.",
  "El canto: los machos frotan las alas y suenan sobre todo al caer la tarde y en la noche.",
];

/** Recomendaciones generales de captura. */
export const COMO_CAPTURAR: string[] = [
  "Búsquelos al atardecer o de noche, guiándose por el canto.",
  "Revise entre la hojarasca húmeda, bajo piedras y en la base de los pastos.",
  "Use un frasco con tapa perforada y un poco de pasto adentro.",
  "Manipúlelos con suavidad: las patas traseras se desprenden con facilidad.",
];
