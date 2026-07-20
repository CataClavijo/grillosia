import { NextResponse, type NextRequest } from "next/server";

/**
 * Permite rescatar a un usuario desde cualquier ruta agregando ?reset=1.
 * Soporte puede enviar https://grilliaa.vercel.app/?reset=1 y el navegador
 * queda limpio en un solo toque, sin importar qué página esté rota.
 */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.json|api/).*)",
  ],
};

const KILL_VERSION = "4";

export default function proxy(req: NextRequest) {
  if (req.nextUrl.searchParams.get("reset") === "1") {
    const res = NextResponse.redirect(new URL("/reset", req.url));
    res.headers.set(
      "Clear-Site-Data",
      '"cache", "storage", "executionContexts"',
    );
    return res;
  }

  const res = NextResponse.next();
  res.headers.set("X-SW-Kill-Version", KILL_VERSION);
  return res;
}
