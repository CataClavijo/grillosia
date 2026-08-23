import { query } from "@/lib/db";
import type { ChatMessage, Project, ProjectSelection } from "@/lib/projects-store";

/**
 * Acceso a las consultas guardadas en Postgres.
 *
 * Devuelve exactamente la misma forma que el almacén del navegador
 * (`Project`, `ChatMessage`), de modo que las páginas no distinguen si los
 * datos vienen del dispositivo o de la nube.
 *
 * Toda función recibe `userId` y lo lleva al WHERE. Es la única barrera que
 * impide que una persona lea las consultas de otra, así que ninguna consulta
 * SQL de este archivo debe quedarse sin él.
 */

interface ProjectRow extends Record<string, unknown> {
  id: string;
  name: string;
  animal_id: string | null;
  stage_id: string | null;
  temp: number | null;
  humidity: number | null;
  created_at: Date;
  updated_at: Date;
}

interface MessageRow extends Record<string, unknown> {
  id: string;
  project_id: string;
  role: ChatMessage["role"];
  text: string;
  links: ChatMessage["links"] | null;
  created_at: Date;
}

function toSelection(row: ProjectRow): ProjectSelection {
  return {
    animalId: row.animal_id ?? undefined,
    stageId: row.stage_id ?? undefined,
    temp: row.temp ?? undefined,
    humidity: row.humidity ?? undefined,
  };
}

function toMessage(row: MessageRow): ChatMessage {
  return {
    id: row.id,
    role: row.role,
    text: row.text,
    links: row.links ?? undefined,
    createdAt: row.created_at.getTime(),
  };
}

/** Todas las consultas del usuario, con sus mensajes, de la más reciente. */
export async function listProjects(userId: string): Promise<Project[]> {
  const rows = await query<ProjectRow>(
    `SELECT id, name, animal_id, stage_id, temp, humidity, created_at, updated_at
       FROM projects
      WHERE user_id = $1
      ORDER BY updated_at DESC`,
    [userId],
  );

  if (rows.length === 0) return [];

  // Una sola consulta para los mensajes de todas: con una por proyecto, una
  // lista de veinte consultas serían veintiún viajes a la base.
  const messages = await query<MessageRow>(
    `SELECT m.id, m.project_id, m.role, m.text, m.links, m.created_at
       FROM chat_messages m
       JOIN projects p ON p.id = m.project_id
      WHERE p.user_id = $1
      ORDER BY m.created_at ASC`,
    [userId],
  );

  const byProject = new Map<string, ChatMessage[]>();
  for (const m of messages) {
    const list = byProject.get(m.project_id) ?? [];
    list.push(toMessage(m));
    byProject.set(m.project_id, list);
  }

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    createdAt: row.created_at.getTime(),
    updatedAt: row.updated_at.getTime(),
    selection: toSelection(row),
    chat: byProject.get(row.id) ?? [],
  }));
}

export async function createProject(
  userId: string,
  name: string,
  selection: ProjectSelection = {},
): Promise<Project> {
  const [row] = await query<ProjectRow>(
    `INSERT INTO projects (user_id, name, animal_id, stage_id, temp, humidity)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, name, animal_id, stage_id, temp, humidity, created_at, updated_at`,
    [
      userId,
      name,
      selection.animalId ?? null,
      selection.stageId ?? null,
      selection.temp ?? null,
      selection.humidity ?? null,
    ],
  );

  return {
    id: row.id,
    name: row.name,
    createdAt: row.created_at.getTime(),
    updatedAt: row.updated_at.getTime(),
    selection: toSelection(row),
    chat: [],
  };
}

/**
 * Actualiza nombre o selección. Los campos ausentes se dejan como están, y un
 * `null` explícito borra el valor: así el asistente puede limpiar la etapa
 * cuando el usuario cambia de animal.
 */
export async function updateProject(
  userId: string,
  projectId: string,
  patch: { name?: string; selection?: Partial<ProjectSelection> },
): Promise<boolean> {
  const sets: string[] = [];
  const values: unknown[] = [];

  const push = (column: string, value: unknown) => {
    values.push(value);
    sets.push(`${column} = $${values.length}`);
  };

  if (patch.name !== undefined) push("name", patch.name);
  if (patch.selection) {
    const s = patch.selection;
    if ("animalId" in s) push("animal_id", s.animalId ?? null);
    if ("stageId" in s) push("stage_id", s.stageId ?? null);
    if ("temp" in s) push("temp", s.temp ?? null);
    if ("humidity" in s) push("humidity", s.humidity ?? null);
  }

  if (sets.length === 0) return true;

  values.push(projectId, userId);
  const rows = await query(
    `UPDATE projects SET ${sets.join(", ")}
      WHERE id = $${values.length - 1} AND user_id = $${values.length}
      RETURNING id`,
    values,
  );

  return rows.length > 0;
}

export async function deleteProject(
  userId: string,
  projectId: string,
): Promise<boolean> {
  const rows = await query(
    `DELETE FROM projects WHERE id = $1 AND user_id = $2 RETURNING id`,
    [projectId, userId],
  );
  return rows.length > 0;
}

export async function appendMessage(
  userId: string,
  projectId: string,
  message: Omit<ChatMessage, "id" | "createdAt">,
): Promise<ChatMessage | null> {
  // El SELECT dentro del INSERT hace de comprobación de dueño: si la consulta
  // no es de este usuario no se inserta ninguna fila.
  const [row] = await query<MessageRow>(
    `INSERT INTO chat_messages (project_id, role, text, links)
     SELECT p.id, $3, $4, $5
       FROM projects p
      WHERE p.id = $1 AND p.user_id = $2
     RETURNING id, project_id, role, text, links, created_at`,
    [
      projectId,
      userId,
      message.role,
      message.text,
      message.links ? JSON.stringify(message.links) : null,
    ],
  );

  if (!row) return null;

  // Un mensaje nuevo cuenta como actividad: sin esto la consulta caería al
  // final de la lista aunque el usuario acabe de escribir en ella.
  await query(`UPDATE projects SET name = name WHERE id = $1 AND user_id = $2`, [
    projectId,
    userId,
  ]);

  return toMessage(row);
}

export async function clearMessages(
  userId: string,
  projectId: string,
): Promise<boolean> {
  const rows = await query(
    `DELETE FROM chat_messages m
      USING projects p
      WHERE m.project_id = p.id AND p.id = $1 AND p.user_id = $2
     RETURNING m.id`,
    [projectId, userId],
  );
  return rows.length >= 0;
}

/**
 * Sube al servidor las consultas que el usuario tenía en el navegador antes de
 * iniciar sesión. Se llama una sola vez, justo después del primer inicio.
 */
export async function importProjects(
  userId: string,
  projects: Project[],
): Promise<number> {
  let imported = 0;

  for (const p of projects) {
    const created = await createProject(userId, p.name, p.selection);
    for (const m of p.chat) {
      if (m.role === "system") continue;
      await appendMessage(userId, created.id, {
        role: m.role,
        text: m.text,
        links: m.links,
      });
    }
    imported += 1;
  }

  return imported;
}
