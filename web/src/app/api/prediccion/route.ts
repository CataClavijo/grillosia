import { NextResponse } from "next/server";

/**
 * Pasa la consulta al modelo desde el servidor de la pagina.
 *
 * El servicio del modelo (Railway) solo acepta pedidos del navegador que
 * vengan de grillosia.com (CORS). Desde la vista previa de Vercel o desde la
 * red local los rechazaba, y el resultado decia "No pudimos consultar el
 * modelo" aunque el modelo estuviera bien. De servidor a servidor no hay
 * CORS, asi que la consulta funciona desde cualquier direccion.
 */

const API_MODELO = process.env.NEXT_PUBLIC_API_URL;

/** Tres dietas por consulta; un tope holgado evita abusar del servicio. */
const MAX_CONDICIONES = 12;

export async function POST(req: Request) {
  if (!API_MODELO) {
    return NextResponse.json({ motivo: "sin-servicio" }, { status: 503 });
  }

  let cuerpo: unknown;
  try {
    cuerpo = await req.json();
  } catch {
    return NextResponse.json({ motivo: "cuerpo-invalido" }, { status: 400 });
  }
  const condiciones = (cuerpo as { condiciones?: unknown })?.condiciones;
  if (!Array.isArray(condiciones) || condiciones.length === 0 || condiciones.length > MAX_CONDICIONES) {
    return NextResponse.json({ motivo: "cuerpo-invalido" }, { status: 400 });
  }

  try {
    const res = await fetch(`${API_MODELO}/api/v1/predict`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ condiciones }),
      signal: AbortSignal.timeout(20_000),
      cache: "no-store",
    });
    const texto = await res.text();
    return new NextResponse(texto, {
      status: res.status,
      headers: { "content-type": res.headers.get("content-type") ?? "application/json" },
    });
  } catch {
    return NextResponse.json({ motivo: "sin-respuesta" }, { status: 502 });
  }
}
