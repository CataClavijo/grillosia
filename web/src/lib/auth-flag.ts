/**
 * Interruptor de la persistencia en la nube.
 *
 * Con el interruptor apagado la aplicación se comporta como hasta ahora: sin
 * inicio de sesión y guardando todo en el navegador. Encenderlo exige que
 * existan las credenciales de Google y la base de datos; si falta alguna, la
 * aplicación seguiría en pie pero el inicio de sesión fallaría, así que el
 * valor se lee en un solo lugar y desde ahí decide toda la aplicación.
 *
 * Se evalúa en compilación: `NEXT_PUBLIC_*` se sustituye textualmente en el
 * cliente, de modo que no puede leerse con `process.env[nombre]`.
 */
export const AUTH_ENABLED = process.env.NEXT_PUBLIC_ENABLE_AUTH === "true";
