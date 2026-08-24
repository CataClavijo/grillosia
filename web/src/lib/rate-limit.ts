import { query } from "@/lib/db";

/**
 * Tope de uso del asistente.
 *
 * El endpoint del chat esta abierto a internet y cada pregunta cuesta plata.
 * Esto no es una medida de seguridad contra un atacante decidido: es un tope
 * de gasto contra el scripteo casual, que es el riesgo real.
 *
 * Cuando alguien pasa el tope NO se le devuelve un error. El chat cae a las
 * respuestas guionadas, asi que el productor recibe una respuesta mas corta
 * en vez de una pantalla rota. Eso importa: quien pregunta puede tener los
 * grillos muriendose.
 */

/** Preguntas al asistente por ventana. */
const TOPE = Number(process.env.CHAT_TOPE_POR_VENTANA ?? 20);

/** Duracion de la ventana, en minutos. */
const VENTANA_MIN = Number(process.env.CHAT_VENTANA_MINUTOS ?? 60);

/** Respaldo en memoria para cuando no hay base de datos configurada. */
const enMemoria = new Map<string, { conteo: number; abre: number }>();

/**
 * Identifica a quien pregunta.
 *
 * Detras de Vercel la IP real viene en `x-forwarded-for`; el primer valor de
 * la lista es el cliente. `x-real-ip` es el respaldo. Si no hay ninguna, se
 * agrupa todo bajo la misma clave, que es conservador a proposito: mejor
 * limitar de mas que dejar el grifo abierto.
 */
export function identificar(request: Request): string {
  const reenviada = request.headers.get("x-forwarded-for");
  if (reenviada) return reenviada.split(",")[0].trim();
  return request.headers.get("x-real-ip")?.trim() || "desconocido";
}

function permitirEnMemoria(clave: string, tope: number): boolean {
  const ahora = Date.now();
  const ventanaMs = VENTANA_MIN * 60_000;
  const actual = enMemoria.get(clave);

  if (!actual || ahora - actual.abre >= ventanaMs) {
    enMemoria.set(clave, { conteo: 1, abre: ahora });
    return true;
  }
  actual.conteo += 1;
  return actual.conteo <= tope;
}

/**
 * Cuenta una pregunta y dice si se permite.
 *
 * Ante cualquier fallo devuelve `true`. Es deliberado: si la base de datos
 * esta caida, la consecuencia de equivocarse hacia el lado permisivo es
 * gastar de mas un rato; hacia el lado restrictivo, dejar sin asistente a
 * todo el mundo. El tope de gasto de OpenAI es la red de seguridad de abajo.
 */
/**
 * @param tope Cuantas peticiones se permiten en la ventana. La voz usa uno
 * mas alto que el chat: lo que cuesta dinero son los caracteres, no las
 * peticiones, y al leer por frases los mismos caracteres se reparten en
 * varias llamadas mas pequenas. Contar peticiones siempre fue una
 * aproximacion; si se trocea, la aproximacion hay que ajustarla o se corta a
 * la gente a mitad de una respuesta.
 */
export async function permitirPregunta(
  clave: string,
  tope: number = TOPE,
): Promise<boolean> {
  if (!process.env.DATABASE_URL) return permitirEnMemoria(clave, tope);

  try {
    // Una sola sentencia para que no haya carrera entre dos peticiones
    // simultaneas: el UPDATE reinicia la ventana si ya vencio, y en cualquier
    // caso devuelve el conteo que quedo.
    const filas = await query<{ conteo: number }>(
      `INSERT INTO rate_limit (clave, conteo, ventana_abre)
            VALUES ($1, 1, now())
       ON CONFLICT (clave) DO UPDATE
            SET conteo = CASE
                  WHEN rate_limit.ventana_abre < now() - ($2::text || ' minutes')::interval
                  THEN 1
                  ELSE rate_limit.conteo + 1
                END,
                ventana_abre = CASE
                  WHEN rate_limit.ventana_abre < now() - ($2::text || ' minutes')::interval
                  THEN now()
                  ELSE rate_limit.ventana_abre
                END
         RETURNING conteo`,
      [clave, String(VENTANA_MIN)],
    );

    return (filas[0]?.conteo ?? 1) <= tope;
  } catch (error) {
    // Fallar hacia el lado permisivo es lo correcto, pero callarlo no: si la
    // tabla no existe o la base cambio, el tope queda desactivado sin que
    // nadie se entere. Esto ya paso una vez en desarrollo.
    console.error(
      "[rate-limit] no se pudo contar, se permite la pregunta:",
      error instanceof Error ? error.message : error,
    );
    return true;
  }
}
