import { cn } from "@/lib/utils";

/**
 * Encabezado de seccion: rotulo monoespaciado, titulo condensado y una
 * entrada opcional. Es la unica forma de abrir una seccion en el sitio, para
 * que todas tengan la misma jerarquia y el mismo aire.
 *
 * `as` permite usar h1 en la cabeza de una pagina y h2 en sus secciones sin
 * cambiar el aspecto.
 */
export function EncabezadoSeccion({
  rotulo,
  titulo,
  entrada,
  as: Etiqueta = "h2",
  tamano = "h2",
  alineacion = "izquierda",
  className,
  children,
}: {
  rotulo?: React.ReactNode;
  titulo: React.ReactNode;
  entrada?: React.ReactNode;
  as?: "h1" | "h2" | "h3";
  /** Escala visual: `display` solo en la portada, `h1` en cabezas de pagina. */
  tamano?: "display" | "h1" | "h2";
  alineacion?: "izquierda" | "centro";
  className?: string;
  /** Acciones o contenido que acompanan al titulo (por ejemplo, un enlace). */
  children?: React.ReactNode;
}) {
  const escala =
    tamano === "display" ? "t-display" : tamano === "h1" ? "t-h1" : "t-h2";
  return (
    <header
      className={cn(
        "flex flex-col gap-3",
        alineacion === "centro" && "items-center text-center",
        className,
      )}
    >
      {rotulo && <p className="t-eyebrow text-subtle">{rotulo}</p>}
      <Etiqueta className={cn(escala, "text-balance")}>{titulo}</Etiqueta>
      {entrada && (
        <p className={cn("t-lead text-pretty", alineacion === "centro" && "mx-auto")}>
          {entrada}
        </p>
      )}
      {children}
    </header>
  );
}
