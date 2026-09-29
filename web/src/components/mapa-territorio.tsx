import { mapaData } from "@/lib/content/mapa-data";
import { cn } from "@/lib/utils";

/**
 * Donde se hace el proyecto: Colombia -> Meta -> Cubarral y Granada.
 *
 * Dos paneles con las formas oficiales del DANE (no dibujadas a mano).
 * Primero el pais con el Meta resaltado; luego el Meta con los dos
 * municipios en terracota. Villavicencio va como punto de referencia, sin
 * resaltar.
 *
 * Las etiquetas llevan un halo del color del fondo (`paint-order: stroke`)
 * para leerse encima de cualquier forma, y su tamano esta pensado para que
 * en celular sigan por encima de 12 px.
 *
 * Los colores salen de los tokens de la pagina: se ve igual en claro y en
 * oscuro.
 */
export function MapaTerritorio({ className }: { className?: string }) {
  const { colombia, meta } = mapaData;
  const destacados = new Set([meta.cubarral, meta.granada]);
  const et = meta.etiquetas;

  const etiquetas = [
    { codigo: meta.cubarral, nombre: "Cubarral", dx: -4, dy: -14, fuerte: true },
    { codigo: meta.granada, nombre: "Granada", dx: 12, dy: 6, fuerte: true },
    { codigo: meta.villavicencio, nombre: "Villavicencio", dx: 9, dy: -9, fuerte: false },
  ];

  return (
    <figure className={cn("w-full", className)}>
      {/* En celular los paneles se apilan: lado a lado, el del Meta quedaba
          tan pequeno que los nombres bajaban de 9 px. */}
      <div className="grid items-end gap-6 sm:grid-cols-[0.75fr_1.25fr] sm:gap-8">
        {/* Panel 1: Colombia */}
        <div className="mx-auto w-full max-w-[150px] sm:max-w-none">
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
                    : "fill-accent stroke-background"
                }
                strokeWidth={0.9}
                strokeLinejoin="round"
              />
            ))}
          </svg>
          <p className="t-eyebrow mt-3 text-center text-subtle">Colombia · Meta</p>
        </div>

        {/* Panel 2: Meta */}
        <div>
          <svg
            viewBox={meta.viewBox}
            role="img"
            aria-labelledby="mapa-meta-titulo"
            className="h-auto w-full overflow-visible"
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
                    : "fill-accent stroke-background"
                }
                strokeWidth={1.3}
                strokeLinejoin="round"
              />
            ))}
            {etiquetas.map(({ codigo, nombre, dx, dy, fuerte }) => {
              const p = et[codigo];
              if (!p) return null;
              return (
                <g key={codigo}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={fuerte ? 3.6 : 3}
                    className={fuerte ? "fill-background" : "fill-foreground/70"}
                  />
                  <text
                    x={p.x + dx}
                    y={p.y + dy}
                    className={cn(
                      "stroke-background",
                      fuerte ? "fill-foreground font-semibold" : "fill-subtle",
                    )}
                    style={{
                      fontSize: fuerte ? 19 : 15,
                      paintOrder: "stroke",
                      strokeWidth: 4,
                      strokeLinejoin: "round",
                    }}
                  >
                    {nombre}
                  </text>
                </g>
              );
            })}
          </svg>
          <p className="t-eyebrow mt-3 text-center text-subtle">Meta · Cubarral y Granada</p>
        </div>
      </div>
      <figcaption className="t-caption mt-5">
        Límites: DANE, Marco Geoestadístico Nacional 2025 (CC BY 4.0). Formas
        simplificadas.
      </figcaption>
    </figure>
  );
}
