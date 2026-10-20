/**
 * Borrador del asistente: lo que el usuario lleva contestado antes de que la
 * consulta se guarde. Vive en sessionStorage para que recargar la página no
 * pierda el avance.
 *
 * Está en su propio módulo porque la lista de consultas también necesita
 * limpiarlo al empezar una consulta nueva.
 */

const DRAFT_KEY = "grillia-wizard-draft";

export interface WizardDraft {
  /**
   * Peces, aves o cerdos. Solo hace falta mientras no se ha elegido el
   * animal: despues se deduce de el. Opcional para leer borradores viejos.
   */
  categoryId?: string;
  animalId: string;
  stageId: string;
  temp: number | null;
  humidity: number | null;
  /**
   * La consulta guardada que se esta corrigiendo. Con el, terminar de nuevo
   * actualiza esa consulta en vez de crear otra repetida (por ejemplo al
   * volver desde el resultado con la flecha del navegador).
   */
  proyectoId?: string;
}

export function loadWizardDraft(): WizardDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as WizardDraft) : null;
  } catch {
    return null;
  }
}

export function saveWizardDraft(d: WizardDraft) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(d));
  } catch {
    /* noop */
  }
}

export function clearWizardDraft() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    /* noop */
  }
}
