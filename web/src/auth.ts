import NextAuth, { type NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import PostgresAdapter from "@auth/pg-adapter";

import { AUTH_ENABLED } from "@/lib/auth-flag";
import { getPool } from "@/lib/db";

/**
 * Configuración de inicio de sesión con Google.
 *
 * Toda la configuración vive detrás del interruptor: con el interruptor
 * apagado no se registra ningún proveedor ni se abre la base de datos, de modo
 * que la aplicación arranca sin credenciales y sin Postgres. Es el estado por
 * defecto y el que corre hoy en producción.
 *
 * Las sesiones se guardan en la base de datos y no en una cookie firmada. Pesa
 * una consulta más por petición, pero permite cerrar la sesión de un
 * dispositivo desde el servidor, que es lo que se espera de una cuenta.
 */
const config: NextAuthConfig = {
  providers: AUTH_ENABLED
    ? [
        Google({
          clientId: process.env.GOOGLE_CLIENT_ID ?? process.env.AUTH_GOOGLE_ID,
          clientSecret:
            process.env.GOOGLE_CLIENT_SECRET ?? process.env.AUTH_GOOGLE_SECRET,
        }),
      ]
    : [],

  // getPool() lanza si falta DATABASE_URL; el ternario impide llamarla cuando
  // el interruptor está apagado.
  ...(AUTH_ENABLED ? { adapter: PostgresAdapter(getPool()) } : {}),

  session: { strategy: AUTH_ENABLED ? "database" : "jwt" },

  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,

  // Vercel sirve tras un proxy: sin esto Auth.js rechaza el host reenviado.
  trustHost: true,

  pages: {
    signIn: "/entrar",
    error: "/entrar",
  },

  callbacks: {
    /**
     * Recorta lo que sale hacia el navegador.
     *
     * Con sesiones en base de datos, el objeto que llega aquí trae la fila
     * entera de `sessions`, incluido el `sessionToken`. Devolverlo por
     * `/api/auth/session` no se lo entrega a nadie que no lo tenga ya en su
     * cookie, pero sí lo expone al JavaScript de la página y a cualquier
     * registro intermedio. Salen solo la fecha de expiración y el usuario.
     *
     * El identificador del usuario se añade a mano: no viaja por defecto y las
     * rutas de datos lo necesitan para no mezclar las consultas de una persona
     * con las de otra.
     */
    session({ session, user }) {
      return {
        expires: session.expires,
        user: {
          id: String(user.id),
          name: user.name,
          email: user.email,
          image: user.image,
        },
      };
    },
  },
};

export const { handlers, signIn, signOut, auth } = NextAuth(config);
