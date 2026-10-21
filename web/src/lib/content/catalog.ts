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

/**
 * Vistas del ejemplar para la lámina de la ficha: las mismas fotos del
 * proyecto, recortadas sin el fondo de estudio para que se integren a la
 * página (script en el repositorio de trabajo; los originales siguen en
 * public/grillos/grillo-*.webp). La foto 2 no se usa recortada: en el
 * original el cuerpo queda cortado por el borde.
 */
export interface VistaEjemplar {
  id: string;
  src: string;
  width: number;
  height: number;
  etiqueta: string;
  alt: string;
  credit: string;
}

/**
 * Foto de referencia para la lamina anotada de "¿Como reconocer un grillo?".
 *
 * NO es un ejemplar del proyecto: es un Gryllus bimaculatus (familia
 * Gryllidae) fotografiado por Holger Krisp, con licencia CC BY 3.0. Se usa
 * porque las fotos del proyecto tienen poca resolucion y el recorte quedaba
 * sucio. Los rasgos que se senalan son de la familia, no de la especie.
 * Redimensionada a 1600 px, sin recorte.
 */
export const FOTO_REFERENCIA_LATERAL = {
  src: "/fotos/referencia-grillo-lateral.webp",
  width: 1600,
  height: 1067,
  alt: "Grillo adulto de color café muy oscuro, visto de lado sobre una piedra, con las antenas largas, las alas plegadas y las patas traseras con espinas.",
  pie: "Imagen de referencia, familia Gryllidae; no corresponde a los ejemplares del proyecto.",
  credito: "Foto: Holger Krisp, CC BY 3.0, Wikimedia Commons (redimensionada)",
  url: "https://commons.wikimedia.org/wiki/File:Zweifleckgrille_Gryllus_bimaculatus_1.jpg",
};

export const VISTAS_EJEMPLAR: VistaEjemplar[] = [
  {
    id: "lateral",
    src: "/grillos/recorte-3.webp",
    width: 611,
    height: 379,
    etiqueta: "Vista lateral",
    alt: "Grillo del proyecto, familia Gryllidae, de color café oscuro, visto de lado con las alas plegadas y las antenas largas.",
    credit: "Sebastián Berrío",
  },
  {
    id: "dorsal-oscuro",
    src: "/grillos/recorte-4.webp",
    width: 559,
    height: 828,
    etiqueta: "Vista dorsal",
    alt: "Grillo del proyecto, familia Gryllidae, visto desde arriba, con las antenas muy largas extendidas.",
    credit: "Catalina Clavijo-Agudelo",
  },
  {
    id: "dorsal-claro",
    src: "/grillos/recorte-1.webp",
    width: 510,
    height: 810,
    etiqueta: "Ejemplar claro",
    alt: "Grillo del proyecto, familia Gryllidae, de color café claro, visto desde arriba con las patas traseras extendidas.",
    credit: "Catalina Clavijo-Agudelo",
  },
];

/**
 * Cómo reconocer un grillo. Aplica a la familia, no a una especie.
 *
 * Cada rasgo lleva el punto donde se ve en la foto de referencia lateral
 * (`FOTO_REFERENCIA_LATERAL`, 1600 x 1067), en porcentaje del ancho y el alto
 * de la imagen, medido sobre la foto con una cuadricula. `rotulo` es donde va la etiqueta corta
 * que se une al punto con una linea fina (solo en pantallas anchas).
 */
export interface RasgoReconocer {
  id: string;
  titulo: string;
  /** Etiqueta corta junto al punto. */
  corto: string;
  texto: string;
  punto: { x: number; y: number };
  rotulo: { x: number; y: number; ancla: "izquierda" | "derecha" };
}

export const COMO_RECONOCER: RasgoReconocer[] = [
  {
    id: "antenas",
    titulo: "Antenas largas",
    corto: "Antenas",
    texto: "Muy largas y delgadas, a veces más que el cuerpo entero.",
    punto: { x: 14, y: 55 },
    rotulo: { x: 4, y: 30, ancla: "izquierda" },
  },
  {
    id: "color",
    titulo: "Color café",
    corto: "Color",
    texto: "Del café claro al casi negro, según el ejemplar.",
    punto: { x: 33, y: 45 },
    rotulo: { x: 26, y: 18, ancla: "izquierda" },
  },
  {
    id: "patas",
    titulo: "Patas traseras fuertes",
    corto: "Patas traseras",
    texto: "Gruesas y fuertes, adaptadas para saltar.",
    punto: { x: 77, y: 68 },
    rotulo: { x: 96, y: 86, ancla: "derecha" },
  },
  {
    id: "canto",
    titulo: "El canto",
    corto: "Alas",
    texto:
      "Los machos frotan las alas y cantan, sobre todo al caer la tarde y en la noche.",
    punto: { x: 60, y: 44 },
    rotulo: { x: 62, y: 18, ancla: "izquierda" },
  },
];

/**
 * Grillo o saltamontes: la duda más común. Rasgo por rasgo, con lo que ya
 * dicen el asistente y la guía; no se agregan rasgos nuevos.
 */
export const GRILLO_O_SALTAMONTES: {
  rasgo: string;
  grillo: string;
  saltamontes: string;
}[] = [
  {
    rasgo: "Antenas",
    grillo: "Muy largas, casi tan largas como el cuerpo. Las mueve todo el tiempo.",
    saltamontes: "Cortas y gruesas.",
  },
  {
    rasgo: "Cuerpo",
    grillo: "Más achatado.",
    saltamontes: "Más alargado.",
  },
  {
    rasgo: "Cómo se mueve",
    grillo: "Camina.",
    saltamontes: "Salta lejos.",
  },
];

/** Lo más fácil de mirar primero. */
export const GRILLO_O_SALTAMONTES_CLAVE =
  "Lo más fácil de mirar son las antenas.";

/** Hembra y macho, rasgo por rasgo. */
export const MACHO_HEMBRA: { rasgo: string; hembra: string; macho: string }[] = [
  {
    rasgo: "Aguja al final del cuerpo",
    hembra:
      "Sí: una aguja larga y recta, el ovipositor. Con ella pone los huevos en la tierra.",
    macho: "No la tiene.",
  },
  {
    rasgo: "Canto",
    hembra: "No canta.",
    macho: "Canta frotando las alas.",
  },
];

/** Etapas del crecimiento, en orden. */
export const CRECIMIENTO: { etapa: string; texto: string }[] = [
  {
    etapa: "Huevo",
    texto: "La hembra lo pone en la tierra con su ovipositor.",
  },
  {
    etapa: "Ninfa",
    texto: "Del huevo sale un grillo pequeño, parecido al adulto pero sin alas.",
  },
  {
    etapa: "Mudas",
    texto: "Cambia de piel varias veces, y en cada muda crece.",
  },
  {
    etapa: "Adulto",
    texto: "Las alas aparecen al final.",
  },
];

export const CRECIMIENTO_NOTA =
  "No pasa por una etapa de capullo, como sí ocurre con las mariposas.";

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

/**
 * ¿Cuáles sirven para la cría? Lo que el productor encuentra al salir a
 * buscar, separado en lo que sí puede llevar a la colonia y lo que no.
 *
 * Contenido de Catalina Clavijo-Agudelo (octubre de 2026). Las "señas" son
 * rasgos de forma que distinguen cada grupo a simple vista.
 */
export interface InsectoCria {
  id: string;
  sirve: boolean;
  nombre: string;
  /** Familia o grupo, en latín. */
  grupo?: string;
  texto: string;
  sena: string;
  imagen: string;
  alt: string;
}

export const CUALES_SIRVEN: InsectoCria[] = [
  {
    id: "grillos",
    sirve: true,
    nombre: "Grillos",
    grupo: "Familia Gryllidae",
    texto:
      "Antenas muy largas, cuerpo robusto y patas traseras fuertes. Las especies que más se crían en el mundo, como *Acheta domesticus* y *Gryllodes sigillatus*, pertenecen a esta familia.",
    sena: "Antenas más largas que el cuerpo y dos colitas al final del abdomen.",
    imagen: "/acuarelas/grillo.webp",
    alt: "Grillo café visto de lado, con antenas muy largas.",
  },
  {
    id: "saltamontes",
    sirve: true,
    nombre: "Saltamontes de colores discretos",
    grupo: "Familia Acrididae",
    texto: "Antenas cortas y colores discretos, verdes o cafés.",
    sena: "Antenas cortas y gruesas; salta lejos en vez de caminar.",
    imagen: "/acuarelas/saltamontes.webp",
    alt: "Saltamontes verde y café visto de lado, con antenas cortas y patas traseras largas.",
  },
  {
    id: "llamativos",
    sirve: false,
    nombre: "Saltamontes de colores llamativos",
    texto:
      "Rojos, azules, amarillos o fucsias intensos: en la naturaleza estos colores suelen advertir que el insecto es tóxico.",
    sena: "Colores vivos y contrastados que se ven de lejos.",
    imagen: "/acuarelas/saltamontes-llamativo.webp",
    alt: "Saltamontes de cuerpo rojo intenso con franjas azules y amarillas.",
  },
  {
    id: "esperanzas",
    sirve: false,
    nombre: "Esperanzas y grillos de cueva",
    grupo: "Tettigoniidae y Rhaphidophoridae",
    texto:
      "No corresponden a las especies de cría del proyecto; no se recolectan para la colonia.",
    sena: "La esperanza es verde como una hoja y sus alas cierran como un techo; el grillo de cueva es jorobado y no tiene alas.",
    imagen: "/acuarelas/esperanza.webp",
    alt: "Esperanza verde vista de lado, con alas en forma de hoja y antenas muy largas.",
  },
];
