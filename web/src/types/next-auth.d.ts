import type { DefaultSession } from "next-auth";

/**
 * El identificador del usuario se añade a la sesión en el callback de
 * `auth.ts`. Sin esta declaración TypeScript no lo conoce y las rutas de datos
 * no podrían filtrar por dueño.
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}
