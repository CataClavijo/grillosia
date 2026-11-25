import { NextResponse } from "next/server";

import { identificar, permitirPregunta } from "@/lib/rate-limit";

/**
 * Pasa a texto lo que dijo el productor, cuando su navegador no puede.
 *
 * El dictado normal lo hace el propio navegador (Chrome en Android, Safari en
 * iPhone) y no pasa por aqui. Esta ruta es el respaldo para los navegadores
 * que no traen ese servicio o lo bloquean, como Brave o Firefox: el telefono
 * graba la pregunta y el servidor la transcribe con OpenAI.
 *
 *  - Tope por IP, aparte del chat: cada minuto de audio cuesta.
 *  - Tope de tamano: una pregunta dura segundos; un archivo grande no es una
 *    pregunta.
 *  - Sin llave de OpenAI responde 503 y el cliente avisa que el dictado no
 *    esta disponible; la persona puede escribir.
 */

/** Unos dos minutos de voz comprimida; una pregunta real pesa mucho menos. */
const MAX_BYTES = 2_500_000;
const TOPE_DICTADO = Number(process.env.DICTADO_TOPE_POR_VENTANA ?? 60);
const MODELO = process.env.OPENAI_TRANSCRIBE_MODEL ?? "gpt-4o-mini-transcribe";

/**
 * Vocabulario del proyecto. Le dice al modelo como se escriben las palabras
 * que mas se van a oir y que un transcriptor general suele confundir.
 */
const VOCABULARIO =
  "Pregunta de un productor del Piedemonte Llanero sobre cría de grillos: " +
  "grillos, grillero, hueveras, fibra de coco, bore, botón de oro, salvado de trigo, " +
  "harina de grillo, tilapia, cachama, pollo, cerdo, Granada, Cubarral, Villavicencio.";

export async function POST(request: Request) {
  const llave = process.env.OPENAI_API_KEY;
  if (!llave) {
    return NextResponse.json({ motivo: "sin-servicio" }, { status: 503 });
  }

  if (!(await permitirPregunta(`dictado:${identificar(request)}`, TOPE_DICTADO))) {
    return NextResponse.json({ motivo: "tope" }, { status: 429 });
  }

  let audio: File;
  try {
    const datos = await request.formData();
    const campo = datos.get("audio");
    if (!(campo instanceof File)) throw new Error("sin audio");
    audio = campo;
  } catch {
    return NextResponse.json({ error: "Petición inválida." }, { status: 400 });
  }

  if (audio.size === 0 || audio.size > MAX_BYTES || !audio.type.startsWith("audio/")) {
    return NextResponse.json({ error: "Audio inválido." }, { status: 400 });
  }

  const envio = new FormData();
  envio.append("file", audio, audio.name || "pregunta.webm");
  envio.append("model", MODELO);
  envio.append("language", "es");
  envio.append("prompt", VOCABULARIO);
  envio.append("response_format", "json");

  try {
    const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${llave}` },
      body: envio,
      signal: AbortSignal.timeout(20_000),
    });
    if (!res.ok) {
      console.warn("[transcribir] OpenAI respondio", res.status);
      return NextResponse.json({ motivo: "sin-servicio" }, { status: 503 });
    }
    const cuerpo = (await res.json()) as { text?: string };
    return NextResponse.json({ texto: (cuerpo.text ?? "").trim() });
  } catch (e) {
    console.warn("[transcribir] fallo la transcripcion:", e);
    return NextResponse.json({ motivo: "sin-servicio" }, { status: 503 });
  }
}
