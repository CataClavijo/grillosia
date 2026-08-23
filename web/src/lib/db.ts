import { Pool } from "pg";

/**
 * Pool de conexiones a Postgres.
 *
 * En desarrollo Next.js recarga los módulos en caliente, lo que crearía un
 * pool nuevo en cada recarga hasta agotar las conexiones del servidor. Por eso
 * el pool se guarda en el ámbito global.
 *
 * El pool se crea de forma perezosa: si la aplicación corre sin base de datos
 * (el modo por defecto, sin inicio de sesión), este módulo nunca llega a
 * abrir una conexión.
 */
declare global {
  // eslint-disable-next-line no-var
  var __grillosiaPool: Pool | undefined;
}

export function getPool(): Pool {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "Falta DATABASE_URL. Es obligatoria cuando NEXT_PUBLIC_ENABLE_AUTH está en 'true'.",
    );
  }

  if (!global.__grillosiaPool) {
    global.__grillosiaPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      // Railway y la mayoría de proveedores administrados exigen TLS, pero
      // presentan certificados de una CA que Node no trae. En local no hay TLS.
      ssl: process.env.DATABASE_URL.includes("localhost")
        ? false
        : { rejectUnauthorized: false },
      max: 5,
      idleTimeoutMillis: 30_000,
    });
  }

  return global.__grillosiaPool;
}

/** Atajo para una consulta suelta. */
export async function query<T extends Record<string, unknown>>(
  text: string,
  params?: unknown[],
): Promise<T[]> {
  const result = await getPool().query(text, params);
  return result.rows as T[];
}
