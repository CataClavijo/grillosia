/**
 * Catálogo de grillos considerados en el proyecto. Información orientativa
 * mientras se documenta la selección definitiva. Nombres comunes, no
 * científicos.
 */

export interface Cricket {
  id: string;
  common_name: string;
  size_cm: string;
  activity: "Nocturno" | "Crepuscular" | "Diurno";
  habitat: string;
  recognition: string;
  capture_tip: string;
  suitability: string;
}

export const CATALOG_INTRO =
  "En esta página le mostramos los tipos de grillos nativos del Piedemonte Llanero que estamos considerando dentro del proyecto. Es información orientativa mientras avanzamos con los ensayos: le ayuda a reconocer los grillos que puede encontrar en su finca y a entender cuáles resultan más prometedores para producir harina.";

export const CATALOG_NOTE =
  "La selección definitiva de los grillos que se usarán en la cría todavía se está documentando. Los nombres que verá aquí son comunes y descriptivos, pensados para que usted los reconozca en el campo; no son nombres científicos.";

export const CRICKETS: Cricket[] = [
  {
    id: "grillo-comun-campo",
    common_name: "Grillo común de campo",
    size_cm: "1.8 a 2.5 cm",
    activity: "Nocturno",
    habitat:
      "Vive en potreros, cultivos y patios, escondido entre hojarasca, piedras o grietas del suelo.",
    recognition:
      "Cuerpo café oscuro, casi negro, con antenas largas y patas traseras fuertes. Su canto es un chirrido continuo y parejo que se escucha al caer la tarde y en la noche.",
    capture_tip:
      "Búsquelo de noche con linterna cerca de hojarasca húmeda. Use un frasco con tapa perforada y un poco de pasto adentro.",
    suitability: "Apto: es el más conocido y de manejo sencillo en cría.",
  },
  {
    id: "grillo-cabeza-redonda-llano",
    common_name: "Grillo cabeza redonda del llano",
    size_cm: "1.5 a 2.2 cm",
    activity: "Crepuscular",
    habitat:
      "Prefiere zonas de sabana y bordes de cultivo, entre pastos altos y matas bajas del Piedemonte Llanero.",
    recognition:
      "Tiene la cabeza notoriamente redondeada y color café claro con tonos amarillentos. Su canto es más suave y entrecortado, se escucha sobre todo al atardecer.",
    capture_tip:
      "Recórralo al atardecer siguiendo el canto. Mueva con cuidado la base de los pastos y recoja con un vaso plástico.",
    suitability:
      "Promisorio: crece bien en clima cálido, pero requiere más estudio en cría controlada.",
  },
  {
    id: "grillo-matorral-piedemonte",
    common_name: "Grillo de matorral del Piedemonte",
    size_cm: "1.2 a 2.0 cm",
    activity: "Nocturno",
    habitat:
      "Se encuentra en matorrales, cercas vivas y zonas con arbustos, cerca de la humedad de quebradas y caños.",
    recognition:
      "Cuerpo más delgado y alargado, de color café con manchas claras en las alas. Su canto es agudo y en tandas cortas, distinto al chirrido continuo del grillo de campo.",
    capture_tip:
      "Revise entre ramas bajas y hojarasca húmeda en la mañana temprano. Use guantes y un recipiente ventilado.",
    suitability:
      "Requiere más estudio: interesante por su rusticidad, aún en fase de observación.",
  },
];
