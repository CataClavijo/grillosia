import { cn } from "@/lib/utils";

/**
 * Composicion de una comida en estudio como barra apilada: 50 % ingrediente
 * principal, 30 % harina de maiz, 20 % avena molida.
 *
 * Reemplaza los dibujos de ingredientes: la proporcion se entiende de un
 * vistazo, es nitida en cualquier pantalla y crece al entrar (clase
 * `barra-crece`, dentro de un <Revelar>). Cada tramo lleva su nombre y su
 * porcentaje en texto, no solo el color.
 */
export function BarraComposicion({
  principal,
  base,
  mainPct,
  compacta = false,
  className,
}: {
  /** Nombre del ingrediente principal: "Harina de bore". */
  principal: string;
  base: ReadonlyArray<{ name: string; pct: number }>;
  mainPct: number;
  compacta?: boolean;
  className?: string;
}) {
  const tramos = [
    { nombre: principal, pct: mainPct, clase: "bg-primary" },
    ...base.map((b, i) => ({
      nombre: b.name,
      pct: b.pct,
      clase: i === 0 ? "bg-vegetal" : "bg-chart-3",
    })),
  ];
  return (
    <figure className={cn("w-full", className)}>
      <div
        className={cn(
          "barra-crece flex w-full gap-[3px] overflow-hidden rounded-sm",
          compacta ? "h-2" : "h-3",
        )}
        role="img"
        aria-label={tramos.map((t) => `${t.nombre} ${t.pct} %`).join(", ")}
      >
        {tramos.map((t) => (
          <span key={t.nombre} className={cn("h-full", t.clase)} style={{ width: `${t.pct}%` }} />
        ))}
      </div>
      {!compacta && (
        <figcaption className="mt-3 flex w-full gap-[3px] text-[13px] leading-snug" aria-hidden>
          {tramos.map((t) => (
            <span key={t.nombre} className="min-w-0" style={{ width: `${t.pct}%` }}>
              <span className="block font-mono font-medium tabular-nums">{t.pct}&nbsp;%</span>
              <span className="block pr-1 leading-tight text-subtle">{t.nombre}</span>
            </span>
          ))}
        </figcaption>
      )}
    </figure>
  );
}
