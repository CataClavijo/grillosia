/**
 * Abrir el asistente desde cualquier parte de la plataforma.
 *
 * El asistente vive en un panel lateral global (ver `AsistenteFlotante`).
 * Cualquier componente lo abre con `abrirAsistente()`, opcionalmente con una
 * pregunta ya escrita, sin tener que conocer el panel: se comunican por un
 * evento del navegador.
 */
export const EVENTO_ABRIR_ASISTENTE = "grillosia:abrir-asistente";

export interface OpcionesAsistente {
  /** Pregunta que se envia en cuanto se abre el panel. */
  pregunta?: string;
}

export function abrirAsistente(opciones: OpcionesAsistente = {}) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<OpcionesAsistente>(EVENTO_ABRIR_ASISTENTE, { detail: opciones }),
  );
}
