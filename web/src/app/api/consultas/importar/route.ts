import { requireUserId } from "@/lib/api-session";
import { importProjects, listProjects } from "@/lib/consultas-repo";
import type { Project } from "@/lib/projects-store";

/**
 * Sube las consultas que el usuario tenía guardadas en el navegador antes de
 * iniciar sesión.
 *
 * Solo importa si la cuenta está vacía. Sin esa condición, cada visita desde
 * un dispositivo con datos locales duplicaría las consultas en la nube.
 */
export async function POST(request: Request) {
  const session = await requireUserId();
  if ("error" in session) return session.error;

  let body: { projects?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Petición mal formada." }, { status: 400 });
  }

  if (!Array.isArray(body.projects) || body.projects.length === 0) {
    return Response.json({ imported: 0 });
  }

  try {
    const existing = await listProjects(session.userId);
    if (existing.length > 0) {
      return Response.json({ imported: 0, reason: "la cuenta ya tiene consultas" });
    }

    const imported = await importProjects(
      session.userId,
      body.projects as Project[],
    );
    return Response.json({ imported });
  } catch {
    return Response.json(
      { error: "No pudimos subir sus consultas." },
      { status: 500 },
    );
  }
}
