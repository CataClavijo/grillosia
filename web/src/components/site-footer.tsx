"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Pie del sitio con la atribución institucional obligatoria.
 *
 * No se renderiza en /chat ni en /reset: son pantallas de alto completo
 * (el chat tiene composer fijo abajo) y el pie les rompe la distribución.
 * La atribución sigue visible en el resto de rutas.
 */
const SIN_FOOTER = ["/chat", "/reset"];

export function SiteFooter() {
  const pathname = usePathname();
  if (SIN_FOOTER.some((r) => pathname?.startsWith(r))) return null;

  return (
    <footer className="mt-auto border-t bg-card/40">
      <div className="mx-auto flex w-full max-w-[520px] flex-col items-center gap-2 px-6 py-6 text-center">
        <p className="text-[13px] text-muted-foreground">
          Universidad de los Llanos · Minciencias 963 de 2025 · GrillIA 2026 ·
          En pruebas
        </p>
        <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[13px]">
          <Link
            href="/metodologia"
            className="text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            Cómo lo hacemos
          </Link>
          <Link
            href="/contacto"
            className="text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            Dejar sus datos
          </Link>
          <a
            href="/reset"
            className="text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            Restablecer
          </a>
        </p>
      </div>
    </footer>
  );
}
