/**
 * Formas compartidas por los dos almacenes de consultas, el del navegador y el
 * de la nube. Ambos devuelven exactamente esto, para que las páginas no sepan
 * de dónde salieron los datos.
 */

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  text: string;
  /** Milisegundos desde epoch. */
  createdAt: number;
  /** Accesos que el asistente ofrece junto a su respuesta. */
  links?: Array<{ label: string; href: string }>;
}

export interface ProjectSelection {
  animalId?: string;
  stageId?: string;
  temp?: number;
  humidity?: number;
}

export interface Project {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  selection: ProjectSelection;
  chat: ChatMessage[];
}

/**
 * Una consulta está completa cuando el usuario contestó las cuatro preguntas
 * del asistente. El chat solo tiene sentido a partir de ahí: existe para
 * conversar sobre un resultado, no por su cuenta.
 */
export function tieneResultado(p: Project): boolean {
  const s = p.selection;
  return Boolean(
    s.animalId && s.stageId && s.temp !== undefined && s.humidity !== undefined,
  );
}

/** Contrato que cumplen los dos almacenes. */
export interface ProjectsApi {
  projects: Project[];
  active: Project | null;
  activeId: string | null;
  /** Cierto mientras la primera carga desde la nube está en camino. */
  loading: boolean;
  /** Crea la consulta y la deja abierta. Devuelve su identificador. */
  create: (name: string, selection?: ProjectSelection) => Promise<string>;
  setActive: (id: string | null) => void;
  rename: (id: string, name: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
  updateSelection: (
    id: string,
    patch: Partial<ProjectSelection>,
  ) => Promise<void>;
  appendMessage: (
    id: string,
    message: Omit<ChatMessage, "id" | "createdAt">,
  ) => Promise<void>;
  clearChat: (id: string) => Promise<void>;
}

/** Clave del identificador de la consulta abierta. Es preferencia de la
 *  pantalla, no un dato del usuario, así que vive en el navegador incluso
 *  cuando las consultas están en la nube. */
export const ACTIVE_KEY = "grillia-active-project";
