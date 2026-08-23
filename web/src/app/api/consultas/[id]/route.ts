import { requireUserId } from "@/lib/api-session";
import { deleteProject, updateProject } from "@/lib/consultas-repo";

/** Cambia el nombre o las respuestas de una consulta. */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireUserId();
  if ("error" in session) return session.error;

  const { id } = await params;

  let body: { name?: unknown; selection?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Petición mal formada." }, { status: 400 });
  }

  try {
    const ok = await updateProject(session.userId, id, {
      name: typeof body.name === "string" ? body.name : undefined,
      selection:
        typeof body.selection === "object" && body.selection
          ? body.selection
          : undefined,
    });

    if (!ok) {
      return Response.json(
        { error: "No encontramos esa consulta." },
        { status: 404 },
      );
    }
    return Response.json({ ok: true });
  } catch {
    return Response.json(
      { error: "No pudimos guardar el cambio." },
      { status: 500 },
    );
  }
}

/** Borra una consulta con sus mensajes. */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireUserId();
  if ("error" in session) return session.error;

  const { id } = await params;

  try {
    const ok = await deleteProject(session.userId, id);
    if (!ok) {
      return Response.json(
        { error: "No encontramos esa consulta." },
        { status: 404 },
      );
    }
    return Response.json({ ok: true });
  } catch {
    return Response.json(
      { error: "No pudimos borrar la consulta." },
      { status: 500 },
    );
  }
}
