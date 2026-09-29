/**
 * Identificación taxonómica de los grillos del proyecto.
 *
 * REGLA: cada registro se muestra SOLO hasta el nivel que esté confirmado.
 * Si un ejemplar está identificado hasta familia, la tarjeta dice la familia
 * y deja el género y la especie como pendientes. Nunca se completa una
 * tarjeta con un nombre de especie supuesto.
 *
 * Cuando llegue una identificación confirmada, se agrega aquí con su
 * `fuenteIdentificacion` (quién la hizo o con qué clave taxonómica) y la
 * página se actualiza sola.
 */

export type NivelTaxonomico = "familia" | "genero" | "especie";

export interface RegistroTaxonomico {
  id: string;
  /** Hasta qué nivel está confirmada la identificación. */
  nivelConfirmado: NivelTaxonomico;
  familia: string;
  genero?: string;
  especie?: string;
  nombreComun?: string;
  /** Rutas de fotos en /public (ver `catalog.ts`). */
  fotos: string[];
  estado: "pendiente" | "confirmado";
  /** Quién hizo la identificación o con qué clave, cuando exista. */
  fuenteIdentificacion?: string;
}

export const TAXONOMIA: RegistroTaxonomico[] = [
  {
    id: "gryllidae-piedemonte",
    nivelConfirmado: "familia",
    familia: "Gryllidae",
    nombreComun: "Grillos nativos del Piedemonte Llanero",
    fotos: ["/grillos/recorte-3.webp"],
    estado: "pendiente",
  },
];

export const NIVELES: { id: NivelTaxonomico; etiqueta: string }[] = [
  { id: "familia", etiqueta: "Familia" },
  { id: "genero", etiqueta: "Género" },
  { id: "especie", etiqueta: "Especie" },
];

/** ¿El registro llega confirmado hasta este nivel? */
export function nivelConfirmado(
  r: RegistroTaxonomico,
  nivel: NivelTaxonomico,
): boolean {
  const orden: NivelTaxonomico[] = ["familia", "genero", "especie"];
  return orden.indexOf(nivel) <= orden.indexOf(r.nivelConfirmado);
}
