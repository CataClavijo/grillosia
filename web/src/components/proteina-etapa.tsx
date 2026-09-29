import { DatoPendiente } from "@/components/dato-pendiente";
import { OrigenDato } from "@/components/origen-dato";
import { formatoProteina, type Etapa } from "@/lib/animals";

/**
 * Cuanta proteina necesita el animal en una etapa: el rango con su origen
 * (literatura), o "Dato aun no disponible" si todavia no hay una referencia
 * verificada. Nunca un numero sin fuente.
 */
export function ProteinaEtapa({
  etapa,
  compacto = false,
  grande = false,
}: {
  etapa: Etapa;
  /** Sin etiqueta de origen ni motivo: para listas y resumenes. */
  compacto?: boolean;
  /** Cifra en grande, para el bloque principal del resultado. */
  grande?: boolean;
}) {
  if (!etapa.protein) {
    return (
      <DatoPendiente
        compacto={compacto}
        motivo={
          compacto
            ? undefined
            : "Estamos cargando la referencia científica de esta etapa."
        }
      />
    );
  }
  const p = etapa.protein;
  return (
    <span className="flex flex-col items-start gap-1.5">
      <span
        className={
          grande
            ? "font-display text-[2.6rem] font-medium leading-none tabular-nums text-primary"
            : "font-display text-[1.3rem] font-medium leading-none tabular-nums text-primary"
        }
      >
        {formatoProteina(p)}
        <span className="ml-1.5 font-sans text-[13px] font-normal text-muted-foreground">
          de proteína
        </span>
      </span>
      {!compacto && <OrigenDato origen="literatura" />}
      {!compacto && p.nota && (
        <span className="text-[13px] leading-snug text-muted-foreground">
          {p.nota}
        </span>
      )}
    </span>
  );
}
