import { createHash } from "crypto";

import { NextResponse } from "next/server";

import { identificar, permitirPregunta } from "@/lib/rate-limit";

/**
 * Leer en voz alta la respuesta del asistente.
 *
 * Para este publico la voz no es un adorno: alguien que no lee con soltura
 * puede oir. Por eso vale la pena pagar una voz natural en vez de dejar la
 * del sistema, que en Android suena robotica y cuesta entender.
 *
 * Tres protecciones, las mismas que el chat:
 *  - Tope por IP: el endpoint queda abierto a internet y cada minuto cuesta.
 *  - Cache en memoria: las respuestas guionadas son finitas y se repiten;
 *    esas se pagan una sola vez por instancia.
 *  - Si ElevenLabs falla o se acaba el cupo, se responde 503 y el navegador
 *    lee con su propia voz. Nadie se queda sin oir.
 */

/** Voz multilingue de ElevenLabs. */
const VOZ = process.env.ELEVENLABS_VOICE_ID ?? "21m00Tcm4TlvDq8ikWAM";

/** Tope de caracteres por peticion: una respuesta del asistente son ~600. */
const MAX_CARACTERES = 900;

/**
 * Cache por instancia. No es un cache de verdad —en Vercel cada instancia
 * tiene el suyo y se pierde al reciclarse— pero cubre justo el caso que
 * importa: la misma respuesta guionada pedida muchas veces seguidas.
 */
const cache = new Map<string, ArrayBuffer>();
const CACHE_MAX = 40;

function recordar(clave: string, audio: ArrayBuffer) {
  if (cache.size >= CACHE_MAX) {
    const primera = cache.keys().next().value;
    if (primera) cache.delete(primera);
  }
  cache.set(clave, audio);
}

function respuestaAudio(audio: ArrayBuffer, cacheado: boolean) {
  return new NextResponse(audio, {
    status: 200,
    headers: {
      "content-type": "audio/mpeg",
      "cache-control": "public, max-age=86400",
      "x-cache": cacheado ? "hit" : "miss",
    },
  });
}

export async function POST(request: Request) {
  const llave = process.env.ELEVENLABS_API_KEY;
  // Sin llave no es un error: el cliente lee con la voz del navegador.
  if (!llave) {
    return NextResponse.json({ motivo: "sin-servicio" }, { status: 503 });
  }

  let texto: string;
  try {
    const cuerpo = await request.json();
    texto = String(cuerpo?.texto ?? "").trim();
  } catch {
    return NextResponse.json({ error: "Petición inválida." }, { status: 400 });
  }

  if (!texto) {
    return NextResponse.json({ error: "Sin texto." }, { status: 400 });
  }
  if (texto.length > MAX_CARACTERES) {
    texto = texto.slice(0, MAX_CARACTERES);
  }

  const clave = createHash("sha1").update(`${VOZ}:${texto}`).digest("hex");
  const guardado = cache.get(clave);
  if (guardado) return respuestaAudio(guardado, true);

  // El tope se cuenta aparte del chat: oir la misma respuesta dos veces no
  // deberia gastar preguntas.
  if (!(await permitirPregunta(`voz:${identificar(request)}`))) {
    return NextResponse.json({ motivo: "tope" }, { status: 503 });
  }

  try {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOZ}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": llave,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          text: texto,
          model_id: "eleven_multilingual_v2",
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
      },
    );

    if (!res.ok) {
      console.error("[voz] ElevenLabs respondió", res.status);
      return NextResponse.json({ motivo: "proveedor" }, { status: 503 });
    }

    const audio = await res.arrayBuffer();
    recordar(clave, audio);
    return respuestaAudio(audio, false);
  } catch (error) {
    console.error(
      "[voz] no se pudo sintetizar:",
      error instanceof Error ? error.message : error,
    );
    return NextResponse.json({ motivo: "error" }, { status: 503 });
  }
}
