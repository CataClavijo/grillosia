import { requireUserId } from "@/lib/api-session";
import { appendMessage, clearMessages } from "@/lib/consultas-repo";

const ROLES = new Set(["user", "assistant", "system"]);

/** Añade un mensaje a la conversación de una consulta. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireUserId();
  if ("error" in session) return session.error;

  const { id } = await params;

  let body: { role?: unknown; text?: unknown; links?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Petición mal formada." }, { status: 400 });
  }

  const role = typeof body.role === "string" ? body.role : "";
  const text = typeof body.text === "string" ? body.text.trim() : "";

  if (!ROLES.has(role) || !text) {
    return Response.json(
      { error: "El mensaje necesita un remitente y un texto." },
      { status: 400 },
    );
  }

  try {
    const message = await appendMessage(session.userId, id, {
      role: role as "user" | "assistant" | "system",
      text,
      links: Array.isArray(body.links)
        ? (body.links as { label: string; href: string }[])
        : undefined,
    });

    if (!message) {
      return Response.json(
        { error: "No encontramos esa consulta." },
        { status: 404 },
      );
    }
    return Response.json({ message }, { status: 201 });
  } catch {
    return Response.json(
      { error: "No pudimos guardar el mensaje." },
      { status: 500 },
    );
  }
}

/** Borra la conversación de una consulta, dejando la consulta en pie. */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireUserId();
  if ("error" in session) return session.error;

  const { id } = await params;

  try {
    await clearMessages(session.userId, id);
    return Response.json({ ok: true });
  } catch {
    return Response.json(
      { error: "No pudimos borrar la conversación." },
      { status: 500 },
    );
  }
}
