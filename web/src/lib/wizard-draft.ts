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
  animalId: string;
  stageId: string;
  temp: number | null;
  humidity: number | null;
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
