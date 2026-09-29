import { mapaData } from "@/lib/content/mapa-data";
import { cn } from "@/lib/utils";

/**
 * Donde se hace el proyecto: Colombia -> Meta -> Cubarral y Granada.
 *
 * Dos paneles pequenos con las formas oficiales del DANE (no dibujadas a
 * mano). Primero el pais con el Meta resaltado; luego el Meta con los dos
 * municipios. Villavicencio va como punto de referencia, sin resaltar.
 *
 * Los colores salen de los tokens de la pagina, asi el mapa se ve igual en
 * claro y en oscuro.
 */
export function MapaTerritorio({ className }: { className?: string }) {
  const { colombia, meta } = mapaData;
  const destacados = new Set([meta.cubarral, meta.granada]);
  const et = meta.etiquetas;

  return (
    <figure className={cn("w-full", className)}>
      <div className="grid items-center gap-6 sm:grid-cols-[0.8fr_1.2fr]">
        {/* Panel 1: Colombia. En celular va pequeno y centrado, arriba. */}
        <div className="mx-auto w-full max-w-[180px] sm:max-w-none">
          <svg
            viewBox={colombia.viewBox}
            role="img"
            aria-labelledby="mapa-col-titulo"
            className="h-auto w-full"
          >
            <title id="mapa-col-titulo">
              Mapa de Colombia con el departamento del Meta resaltado
            </title>
            {colombia.departamentos.map((d) => (
              <path
                key={d.id}
                d={d.d}
                className={
                  d.id === colombia.metaId
                    ? "fill-primary stroke-background"
                    : "fill-muted stroke-background"
                }
                strokeWidth={0.8}
                strokeLinejoin="round"
              />
            ))}
          </svg>
          <p className="mt-2 text-center text-[13px] text-muted-foreground">
            <span className="font-semibold text-foreground">Colombia</span> ·
            Meta
          </p>
        </div>

        {/* Panel 2: Meta */}
        <div>
          <svg
            viewBox={meta.viewBox}
            role="img"
            aria-labelledby="mapa-meta-titulo"
            className="h-auto w-full"
          >
            <title id="mapa-meta-titulo">
              Mapa del Meta con los municipios de Cubarral y Granada resaltados
            </title>
            {meta.municipios.map((m) => (
              <path
                key={m.codigo}
                d={m.d}
                className={
                  destacados.has(m.codigo)
                    ? "fill-primary stroke-background"
                    : "fill-muted stroke-background"
                }
                strokeWidth={1.2}
                strokeLinejoin="round"
              />
            ))}
            {[
              { codigo: meta.cubarral, nombre: "Cubarral", dx: -6, dy: -10, fuerte: true },
              { codigo: meta.granada, nombre: "Granada", dx: 10, dy: 4, fuerte: true },
              { codigo: meta.villavicencio, nombre: "Villavicencio", dx: 8, dy: -8, fuerte: false },
            ].map(({ codigo, nombre, dx, dy, fuerte }) => {
              const p = et[codigo];
              if (!p) return null;
              return (
                <g key={codigo}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={fuerte ? 3.4 : 2.6}
                    className={fuerte ? "fill-background" : "fill-foreground/70"}
                  />
                  <text
                    x={p.x + dx}
                    y={p.y + dy}
                    className={cn(
                      "fill-foreground",
                      fuerte ? "font-semibold" : "fill-muted-foreground",
                    )}
                    style={{ fontSize: fuerte ? 17 : 14 }}
                  >
                    {nombre}
                  </text>
                </g>
              );
            })}
          </svg>
          <p className="mt-2 text-center text-[13px] text-muted-foreground">
            <span className="font-semibold text-foreground">Meta</span> ·
            Cubarral y Granada
          </p>
        </div>
      </div>
      <figcaption className="mt-3 text-[12px] text-muted-foreground">
        Fuente de los límites: DANE, Marco Geoestadístico Nacional 2025 (CC BY
        4.0). Formas simplificadas.
      </figcaption>
    </figure>
  );
}
