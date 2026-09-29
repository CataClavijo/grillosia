import { DatoPendiente } from "@/components/dato-pendiente";
import { OrigenDato } from "@/components/origen-dato";
import { formatoProteina, type Etapa } from "@/lib/animals";
import { cn } from "@/lib/utils";

/**
 * Cuanta proteina necesita el animal en una etapa: el rango con su origen
 * (literatura), o "Dato aun no disponible" si todavia no hay una referencia
 * verificada. Nunca un numero sin fuente.
 *
 * La cifra y la unidad van separadas: el numero en condensada, el "%" mas
 * pequeno y en gris, como en una ficha tecnica.
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
  const numero = formatoProteina(p).replace(/\s*%$/, "");
  return (
    <span className="flex flex-col items-start gap-2">
      <span
        className={cn(
          "t-cifra text-foreground",
          grande ? "text-[3rem] sm:text-[3.5rem]" : "text-[1.35rem]",
        )}
      >
        {numero}
        <span className="t-unidad">%</span>
        {!grande && (
          <span className="ml-1.5 font-sans text-[13px] font-normal text-subtle">
            de proteína
          </span>
        )}
      </span>
      {!compacto && <OrigenDato origen="literatura" />}
      {!compacto && p.nota && (
        <span className="max-w-[44ch] text-[13px] leading-snug text-subtle">
          {p.nota}
        </span>
      )}
    </span>
  );
}
