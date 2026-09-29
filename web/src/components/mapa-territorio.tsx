"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { mapaData, type Caja } from "@/lib/content/mapa-data";
import { cn } from "@/lib/utils";

/**
 * Donde se hace el proyecto: Colombia -> Meta -> Cubarral y Granada.
 *
 * Un solo SVG con todas las capas en el mismo sistema de coordenadas; el
 * "acercamiento" es el viewBox animado. Al entrar en pantalla:
 *   1. Colombia completa y el Meta se resalta.
 *   2. La vista se acerca al Meta: aparecen sus municipios, el relieve y los
 *      rios.
 *   3. Se acerca al piedemonte: Cubarral y Granada, sus cabeceras,
 *      Villavicencio y Bogota de referencia.
 * Con "reducir movimiento" se muestra directamente el estado final. Los
 * botones de abajo vuelven a cualquiera de las tres vistas.
 *
 * Los bordes y rios no engordan al acercarse (`vector-effect`), y las
 * etiquetas se escriben en pixeles reales (se convierten segun el viewBox).
 *
 * Todo dato de las fichas viene del DANE (MGN 2025); la distancia es una
 * linea recta calculada entre cabeceras, y la ficha lo dice.
 */

type Vista = "pais" | "meta" | "piedemonte";

const VISTAS: { id: Vista; titulo: string }[] = [
  { id: "pais", titulo: "Colombia" },
  { id: "meta", titulo: "Meta" },
  { id: "piedemonte", titulo: "Cubarral y Granada" },
];

/** Codigos DANE de los municipios del proyecto. */
const PROYECTO = { cubarral: "50223", granada: "50313" } as const;

/**
 * Fichas con datos verificados. Fuente: DANE, Marco Geoestadistico Nacional
 * 2025 (capa Municipio, campos MPIO_NAREA y MPIO_CRSLCION; capa Zona Urbana,
 * campo ZU_NALTD, altura media de la cabecera). Distancia: linea recta entre
 * los centroides de las cabeceras, calculada (haversine).
 */
const FICHAS = {
  cubarral: {
    nombre: "Cubarral",
    altura: 591,
    area: "1.156",
    creacion: "Ordenanza 23 del 28 de noviembre de 1960",
    km: mapaData.distanciaVillavicencioKm.cubarral,
  },
  granada: {
    nombre: "Granada",
    altura: 372,
    area: "348",
    creacion: "Documento de creación de 1956",
    km: mapaData.distanciaVillavicencioKm.granada,
  },
} as const;
type Muni = keyof typeof FICHAS;

/** Escalas graficas "redondas" en km (1 unidad del mapa ~ 1,011 km). */
const KM_POR_UNIDAD = 1.011;
const ESCALAS = [10, 20, 25, 50, 100, 200, 250, 500, 1000];

/** Rotulos de rio que se muestran, con su desplazamiento en pixeles. */
const RIOS_ROTULO: Record<string, { dx: number; dy: number }> = {
  Ariari: { dx: 16, dy: 44 },
  Güejar: { dx: 6, dy: 12 },
  Guayuriba: { dx: 6, dy: 2 },
  Guatiquía: { dx: 10, dy: -6 },
  Meta: { dx: 6, dy: -4 },
};

function ajustar(caja: Caja, aspecto: number): Caja {
  const [x, y, w, h] = caja;
  if (w / h > aspecto) {
    const nh = w / aspecto;
    return [x, y - (nh - h) / 2, w, nh];
  }
  const nw = h * aspecto;
  return [x - (nw - w) / 2, y, nw, h];
}

const suave = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

export function MapaTerritorio({ className }: { className?: string }) {
  const caja = useRef<HTMLDivElement>(null);
  const [ancho, setAncho] = useState(560);
  const [aspecto, setAspecto] = useState(4 / 3);
  const [vista, setVista] = useState<Vista>("pais");
  const [metaResaltado, setMetaResaltado] = useState(false);
  const [vb, setVb] = useState<Caja>(() => ajustar(mapaData.vistas.pais, 4 / 3));
  const [activo, setActivo] = useState<Muni | null>(null);
  const [iniciado, setIniciado] = useState(false);
  const anim = useRef<number | null>(null);
  const vbRef = useRef(vb);
  vbRef.current = vb;

  // Tamano real del mapa: la escala de etiquetas y la forma del recuadro.
  useEffect(() => {
    const el = caja.current;
    if (!el) return;
    const medir = () => {
      const w = el.clientWidth;
      setAncho(w);
      setAspecto(w < 520 ? 1 : 4 / 3);
    };
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const irA = useCallback(
    (v: Vista, ms = 900) => {
      setVista(v);
      const destino = ajustar(mapaData.vistas[v], aspecto);
      if (anim.current) cancelAnimationFrame(anim.current);
      const reducir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reducir || ms === 0) {
        setVb(destino);
        return;
      }
      const origen = vbRef.current;
      const t0 = performance.now();
      const paso = (t: number) => {
        const k = suave(Math.min(1, (t - t0) / ms));
        setVb(origen.map((o, i) => o + (destino[i] - o) * k) as Caja);
        if (k < 1) anim.current = requestAnimationFrame(paso);
      };
      anim.current = requestAnimationFrame(paso);
    },
    [aspecto],
  );

  // Si cambia la forma del recuadro, se reencuadra sin animar.
  useEffect(() => {
    setVb(ajustar(mapaData.vistas[vista], aspecto));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aspecto]);

  // Secuencia de entrada, una sola vez, cuando el mapa se ve.
  const timers = useRef<number[]>([]);
  useEffect(() => {
    const el = caja.current;
    if (!el || iniciado) return;
    const empezar = () => {
      setIniciado(true);
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setMetaResaltado(true);
        irA("piedemonte", 0);
        return;
      }
      timers.current = [
        window.setTimeout(() => setMetaResaltado(true), 350),
        window.setTimeout(() => irA("meta", 1100), 1100),
        window.setTimeout(() => irA("piedemonte", 1100), 2700),
      ];
    };
    if (typeof IntersectionObserver === "undefined") {
      empezar();
      return;
    }
    const obs = new IntersectionObserver(
      (e) => {
        if (e[0]?.isIntersecting) {
          obs.disconnect();
          empezar();
        }
      },
      { threshold: 0.4 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [iniciado, irA]);

  useEffect(
    () => () => {
      if (anim.current) cancelAnimationFrame(anim.current);
      timers.current.forEach(clearTimeout);
    },
    [],
  );

  /** Elegir una vista a mano cancela la secuencia de entrada. */
  const elegir = (v: Vista) => {
    timers.current.forEach(clearTimeout);
    setIniciado(true);
    setMetaResaltado(true);
    irA(v);
  };

  // Pixeles de pantalla -> unidades del mapa.
  const u = vb[2] / Math.max(ancho, 1);
  const px = (n: number) => n * u;
  // Cuanto se ha acercado: 0 = pais completo, 1 = vista del Meta o mas cerca.
  const altoPais = ajustar(mapaData.vistas.pais, aspecto)[3];
  const altoMeta = ajustar(mapaData.vistas.meta, aspecto)[3];
  const zoom = Math.max(0, Math.min(1, (altoPais - vb[3]) / (altoPais - altoMeta)));
  const cerca = vb[3] < altoMeta * 0.8;

  // Escala grafica: la distancia redonda que ocupe al menos 60 px.
  const kmPorPx = KM_POR_UNIDAD * u;
  const km = ESCALAS.find((k) => k / kmPorPx >= 60) ?? ESCALAS[ESCALAS.length - 1];
  const barra = km / kmPorPx;
  // El pais se apaga y el detalle entra en la segunda mitad del acercamiento,
  // cuando el recuadro del detalle ya ocupa toda la vista.
  const opPais = 1 - Math.max(0, Math.min(1, (zoom - 0.35) / 0.45)) * 0.9;
  const opDetalle = Math.max(0, Math.min(1, (zoom - 0.5) / 0.4));

  const L = mapaData.lugares;
  const lugares = [
    { id: "cubarral", p: L.cubarral, texto: "Cubarral", fuerte: true, dx: -10, dy: -10, ancla: "end" },
    { id: "granada", p: L.granada, texto: "Granada", fuerte: true, dx: 10, dy: 16, ancla: "start" },
    { id: "villavicencio", p: L.villavicencio, texto: "Villavicencio", fuerte: false, dx: -8, dy: -7, ancla: "end" },
    { id: "bogota", p: L.bogota, texto: "Bogotá", fuerte: false, dx: 9, dy: 4, ancla: "start" },
  ] as const;

  return (
    <figure
      className={cn(
        "grid w-full gap-6 lg:grid-cols-12 lg:items-start lg:gap-10",
        className,
      )}
    >
      {/* Columna del mapa: grande, con las vistas pegadas encima. */}
      <div className="lg:col-span-7">
      <div
        ref={caja}
        className="relative w-full overflow-hidden rounded-lg bg-surface-2"
        style={{ aspectRatio: String(aspecto) }}
      >
        <svg
          viewBox={vb.map((n) => n.toFixed(2)).join(" ")}
          role="img"
          aria-labelledby="mapa-titulo mapa-desc"
          className="absolute inset-0 size-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <title id="mapa-titulo">
            Mapa de Colombia, el Meta y los municipios de Cubarral y Granada
          </title>
          <desc id="mapa-desc">
            Cubarral y Granada estan en el piedemonte del Meta, al sur de
            Villavicencio, donde la Cordillera Oriental baja a la llanura.
          </desc>

          {/* Pais: se desvanece al acercarse, cuando entra el detalle. */}
          <g style={{ opacity: opPais }}>
            {mapaData.pais.map((d) => {
              const esMeta = d.codigo === mapaData.metaCodigo;
              return (
                <path
                  key={d.codigo}
                  d={d.d}
                  vectorEffect="non-scaling-stroke"
                  strokeWidth={0.8}
                  strokeLinejoin="round"
                  className={cn(
                    "stroke-surface-2 transition-[fill] duration-500",
                    esMeta && metaResaltado ? "fill-primary" : "fill-accent",
                  )}
                />
              );
            })}
          </g>

          {/* Detalle: vecinos, municipios del Meta, relieve, limites. */}
          <g style={{ opacity: opDetalle }}>
            {mapaData.deptos.map((d) => (
              <path key={d.codigo} d={d.d} className="fill-accent/70" />
            ))}
            {mapaData.municipios.map((m) => (
              <path key={m.codigo} d={m.d} className="fill-background" />
            ))}
            {mapaData.relieve.map((c, i) => (
              <path
                key={c.nivel}
                d={c.d}
                fillRule="evenodd"
                className="fill-vegetal"
                style={{ fillOpacity: [0.12, 0.13, 0.15, 0.18][i] ?? 0.15 }}
              />
            ))}
            {mapaData.deptos.map((d) => (
              <path
                key={`b-${d.codigo}`}
                d={d.d}
                fill="none"
                vectorEffect="non-scaling-stroke"
                strokeWidth={1}
                strokeLinejoin="round"
                className="stroke-border-strong"
              />
            ))}
            {mapaData.municipios.map((m) => {
              const muni = (Object.keys(PROYECTO) as Muni[]).find((k) => PROYECTO[k] === m.codigo);
              return (
                <path
                  key={`m-${m.codigo}`}
                  d={m.d}
                  vectorEffect="non-scaling-stroke"
                  strokeLinejoin="round"
                  strokeWidth={muni ? 1.5 : 0.6}
                  onPointerEnter={muni ? () => setActivo(muni) : undefined}
                  onClick={muni ? () => setActivo(muni) : undefined}
                  className={
                    muni
                      ? "cursor-pointer fill-primary stroke-background transition-[fill-opacity] duration-300"
                      : "fill-none stroke-border-strong/80"
                  }
                  style={
                    muni
                      ? { fillOpacity: cerca ? (activo === muni ? 0.95 : 0.78) : 0 }
                      : undefined
                  }
                />
              );
            })}
          </g>

          {/* Rios: se dibujan al acercarse al Meta. */}
          <g
            className="stroke-[#5f87a3] dark:stroke-[#86aac4]"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {mapaData.rios.map((r) => (
              <path
                key={r.nombre}
                d={r.d}
                vectorEffect="non-scaling-stroke"
                pathLength={1}
                strokeWidth={["Meta", "Ariari", "Guaviare"].includes(r.nombre) ? 1.6 : 1.1}
                strokeDasharray="1 1"
                className="transition-[stroke-dashoffset] duration-[1600ms] ease-[var(--ease-natural)] motion-reduce:transition-none"
                style={{ strokeDashoffset: zoom > 0.85 ? 0 : 1 }}
              />
            ))}
          </g>

          {/* Rotulo del Meta en la vista del pais */}
          {!cerca && (
            <text
              x={mapaData.rotuloMeta.x}
              y={mapaData.rotuloMeta.y + px(5)}
              textAnchor="middle"
              className={cn(
                "font-semibold transition-opacity duration-500",
                // Sobre el Meta en terracota, en claro; ya en la vista del Meta
                // (municipios en blanco), en tinta.
                zoom > 0.6 ? "fill-foreground uppercase" : "fill-primary-foreground",
                metaResaltado ? "opacity-100" : "opacity-0",
              )}
              style={{
                fontSize: px(zoom > 0.6 ? 13 : 14),
                letterSpacing: zoom > 0.6 ? px(3) : undefined,
              }}
            >
              Meta
            </text>
          )}

          {/* Rotulos del piedemonte */}
          <g
            className="transition-opacity duration-500"
            style={{ opacity: cerca ? 1 : 0 }}
            aria-hidden={!cerca}
          >
            <text
              x={mapaData.cordillera.x}
              y={mapaData.cordillera.y}
              textAnchor="middle"
              transform={`rotate(-58 ${mapaData.cordillera.x} ${mapaData.cordillera.y})`}
              className="fill-vegetal font-semibold uppercase"
              style={{ fontSize: px(11), letterSpacing: px(2.2) }}
            >
              Cordillera Oriental
            </text>
            {mapaData.rios
              .filter((r) => r.rotulo && RIOS_ROTULO[r.nombre])
              .map((r) => (
                <text
                  key={`t-${r.nombre}`}
                  x={r.rotulo!.x + px(RIOS_ROTULO[r.nombre].dx)}
                  y={r.rotulo!.y + px(RIOS_ROTULO[r.nombre].dy)}
                  className="fill-[#4c7390] stroke-surface-2 italic dark:fill-[#9cbdd4]"
                  style={{
                    fontSize: px(11.5),
                    paintOrder: "stroke",
                    strokeWidth: px(3),
                    strokeLinejoin: "round",
                  }}
                >
                  {r.nombre === "Meta" ? "Río Meta" : r.nombre}
                </text>
              ))}
            {lugares.map((l) => (
              <g key={l.id}>
                <circle
                  cx={l.p.x}
                  cy={l.p.y}
                  r={px(l.fuerte ? 4.2 : 3.2)}
                  strokeWidth={px(1.6)}
                  className={
                    l.fuerte ? "fill-background stroke-foreground" : "fill-foreground stroke-background"
                  }
                />
                <text
                  x={l.p.x + px(l.dx)}
                  y={l.p.y + px(l.dy)}
                  textAnchor={l.ancla}
                  className={cn(
                    "stroke-surface-2",
                    l.fuerte ? "fill-foreground font-semibold" : "fill-subtle",
                  )}
                  style={{
                    fontSize: px(l.fuerte ? 15 : 12.5),
                    paintOrder: "stroke",
                    strokeWidth: px(4),
                    strokeLinejoin: "round",
                  }}
                >
                  {l.texto}
                </text>
              </g>
            ))}
          </g>
        </svg>

        {/* Norte y escala, en pixeles reales. */}
        <div
          aria-hidden
          className="pointer-events-none absolute top-3 right-3 flex flex-col items-center text-subtle"
        >
          <svg viewBox="0 0 12 16" className="h-4 w-3">
            <path d="M6 0 L11 15 L6 11 L1 15 Z" className="fill-foreground/70" />
          </svg>
          <span className="t-eyebrow mt-0.5 text-[10px]">N</span>
        </div>
        <div aria-hidden className="pointer-events-none absolute bottom-3 left-3 text-subtle">
          <div
            className="h-1.5 border-x border-b border-foreground/60"
            style={{ width: barra }}
          />
          <span className="t-eyebrow mt-1 block text-[10px]">{km} km</span>
        </div>
        {/* Vistas: volver a cualquiera de los tres niveles, pegadas al mapa. */}
        <div role="group" aria-label="Vista del mapa" className="absolute top-3 left-3 flex flex-wrap gap-1 rounded-md bg-background/85 p-1 ring-1 ring-border backdrop-blur-sm">
          {VISTAS.map((v) => (
            <button
              key={v.id}
              type="button"
              aria-pressed={vista === v.id}
              onClick={() => elegir(v.id)}
              className={cn(
                "inline-flex h-8 items-center rounded-[5px] px-2.5 text-[13.5px] font-medium transition-colors duration-150",
                vista === v.id
                  ? "bg-foreground text-background"
                  : "text-subtle hover:bg-surface-2 hover:text-foreground",
              )}
            >
              {v.titulo}
            </button>
          ))}
        </div>
      </div>
      </div>

      {/* Panel: las dos fichas, la leyenda y las fuentes. */}
      <div className="flex flex-col gap-5 lg:col-span-5">
      {/* Fichas de los dos municipios: tambien por teclado y en celular. */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
        {(Object.keys(FICHAS) as Muni[]).map((k) => {
          const f = FICHAS[k];
          const sel = activo === k;
          return (
            <button
              key={k}
              type="button"
              aria-pressed={sel}
              onClick={() => {
                setActivo(k);
                if (vista !== "piedemonte") elegir("piedemonte");
              }}
              onPointerEnter={() => setActivo(k)}
              className={cn(
                "rounded-lg p-4 text-left transition-[background-color,box-shadow] duration-200",
                sel
                  ? "bg-surface ring-1 ring-primary/50"
                  : "bg-surface-2/60 ring-1 ring-border hover:bg-surface",
              )}
            >
              <span className="flex items-center gap-2">
                <span aria-hidden className="size-2.5 rounded-full bg-primary" />
                <span className="font-display text-[1.4rem] font-semibold leading-none">{f.nombre}</span>
                <span className="t-caption">· Meta</span>
              </span>
              <dl className="mt-3 grid grid-cols-[max-content_1fr] gap-x-5 gap-y-1.5 text-[14.5px]">
                <dt className="text-subtle">Altura de la cabecera</dt>
                <dd className="tabular-nums">{f.altura}&nbsp;m s.&nbsp;n.&nbsp;m.</dd>
                <dt className="text-subtle">Área del municipio</dt>
                <dd className="tabular-nums">{f.area}&nbsp;km²</dd>
                <dt className="text-subtle">Creación</dt>
                <dd>{f.creacion}</dd>
                <dt className="text-subtle">A Villavicencio</dt>
                <dd className="tabular-nums">
                  {f.km}&nbsp;km{" "}
                  <span className="text-subtle">en línea recta (calculado)</span>
                </dd>
              </dl>
            </button>
          );
        })}
      </div>

      {/* Leyenda */}
      <ul className="flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-subtle">
        <li className="flex items-center gap-2">
          <span aria-hidden className="size-3 rounded-[2px] bg-primary" />
          Municipios del proyecto
        </li>
        <li className="flex items-center gap-2">
          <span aria-hidden className="flex">
            {[0.12, 0.25, 0.4, 0.58].map((o) => (
              <span key={o} className="h-3 w-2 bg-vegetal" style={{ opacity: o }} />
            ))}
          </span>
          Relieve: 500 · 1000 · 2000 · 3000 m
        </li>
        <li className="flex items-center gap-2">
          <span aria-hidden className="h-[2px] w-5 rounded-full bg-[#5f87a3] dark:bg-[#86aac4]" />
          Ríos principales
        </li>
        <li className="flex items-center gap-2">
          <span
            aria-hidden
            className="size-2.5 rounded-full border-[1.5px] border-foreground bg-background"
          />
          Cabecera municipal
        </li>
      </ul>

      <figcaption className="t-caption max-w-[80ch]">
        Límites, cabeceras, alturas, áreas y fechas de creación: DANE, Marco
        Geoestadístico Nacional 2025 (CC BY 4.0), formas simplificadas.
        Relieve: Terrain Tiles de AWS Open Data (SRTM). Ríos: © colaboradores
        de OpenStreetMap (ODbL). Distancias en línea recta, calculadas entre
        cabeceras.
      </figcaption>
      </div>
    </figure>
  );
}
