import { requireUserId } from "@/lib/api-session";
import { createProject, listProjects } from "@/lib/consultas-repo";

/** Las consultas del usuario, con sus mensajes. */
export async function GET() {
  const session = await requireUserId();
  if ("error" in session) return session.error;

  try {
    return Response.json({ projects: await listProjects(session.userId) });
  } catch {
    return Response.json(
      { error: "No pudimos cargar sus consultas." },
      { status: 500 },
    );
  }
}

/** Crea una consulta. */
export async function POST(request: Request) {
  const session = await requireUserId();
  if ("error" in session) return session.error;

  let body: { name?: unknown; selection?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Petición mal formada." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) {
    return Response.json(
      { error: "La consulta necesita un nombre." },
      { status: 400 },
    );
  }

  try {
    const project = await createProject(
      session.userId,
      name,
      typeof body.selection === "object" && body.selection
        ? body.selection
        : {},
    );
    return Response.json({ project }, { status: 201 });
  } catch {
    return Response.json(
      { error: "No pudimos guardar la consulta." },
      { status: 500 },
    );
  }
}
