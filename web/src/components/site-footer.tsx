"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";

/**
 * Pie del sitio.
 *
 * Ya no lleva enlaces. Antes tenia tres —metodologia, contacto y /reset— y
 * aparecian en diez de las once pantallas, compitiendo con la tarea. Los dos
 * primeros viven ahora en el menu; /reset se dejo de enlazar del todo: es la
 * herramienta de emergencia para reparar la aplicacion, sigue funcionando
 * escribiendo la direccion y eso es lo que necesita quien da soporte, no el
 * productor.
 *
 * Lo que queda es la atribucion institucional, obligatoria, y la vineta de
 * cierre: el cul-de-lampe con que los libros naturalistas rematan capitulo.
 */
const SIN_PIE = ["/chat", "/reset", "/consulta"];

export function SiteFooter() {
  const pathname = usePathname();
  if (SIN_PIE.some((r) => pathname?.startsWith(r))) return null;

  return (
    <footer className="mt-auto">
      <div className="mx-auto flex w-full max-w-[520px] flex-col items-center gap-1 px-6 pb-8 pt-4 text-center">
        <Image
          src="/arte/vineta.webp"
          alt=""
          width={420}
          height={140}
          aria-hidden
          className="lamina h-auto w-full max-w-[300px]"
        />
        <p className="rotulo text-muted-foreground">
          Universidad de los Llanos · Minciencias 963 · En pruebas
        </p>
      </div>
    </footer>
  );
}
