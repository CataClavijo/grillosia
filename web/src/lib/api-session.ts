import { auth } from "@/auth";
import { AUTH_ENABLED } from "@/lib/auth-flag";

/**
 * Resuelve el usuario de la petición.
 *
 * Devuelve una respuesta de error en vez de lanzar, para que cada ruta decida
 * qué hacer sin envolverse en try/catch. Los mensajes van en español porque
 * pueden acabar mostrándose al usuario.
 */
export async function requireUserId(): Promise<
  { userId: string } | { error: Response }
> {
  if (!AUTH_ENABLED) {
    return {
      error: Response.json(
        { error: "La cuenta en la nube no está activada." },
        { status: 503 },
      ),
    };
  }

  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return {
      error: Response.json({ error: "Debe iniciar sesión." }, { status: 401 }),
    };
  }

  return { userId };
}
