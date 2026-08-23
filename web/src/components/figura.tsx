import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * Figuras de la guia para armar la caja.
 *
 * Son ilustraciones generadas, no trazo escrito a mano. Se intento lo segundo
 * y no funciono: un diagrama de lineas representa bien "donde" y "como" (un
 * corte, una malla), pero no representa "que cosa es". Una huevera de carton
 * dibujada con lineas geometricas parecia una escalera.
 *
 * Van sobre fondo claro en los dos temas a proposito: la ilustracion trae su
 * propio fondo blanco, y un recuadro blanco sobre una pagina oscura deslumbra.
 * Enmarcarlas en una tarjeta clara es mas honesto que fingir transparencia.
 */

export interface DefinicionFigura {
  id: string;
  /** Pie de foto, corto. */
  titulo: string;
  /** Descripcion para quien no ve la imagen. */
  alt: string;
  /** En que caso le sirve al asistente mostrarla. */
  cuando: string;
}

export const FIGURAS: DefinicionFigura[] = [
  {
    id: "caja",
    titulo: "La caja y su tapa, limpias y listas",
    alt: "Una caja plástica rectangular transparente y, al lado, su tapa.",
    cuando: "Cuando pregunten qué caja sirve, de qué tamaño, o cómo empezar.",
  },
  {
    id: "ventilacion",
    titulo: "La ventana de ventilación en la tapa",
    alt: "La tapa de la caja con un rectángulo recortado en el centro y malla mosquitero cubriéndolo.",
    cuando:
      "Cuando pregunten por la ventilación, el calor, la humedad encerrada, el mal olor o cómo evitar que se escapen.",
  },
  {
    id: "sustrato",
    titulo: "La cama pareja en el fondo",
    alt: "El fondo de la caja cubierto por una capa delgada y pareja de sustrato.",
    cuando: "Cuando pregunten por la cama, el sustrato o qué poner en el fondo.",
  },
  {
    id: "refugios",
    titulo: "Las hueveras paradas, como un acordeón",
    alt: "Varias hueveras de cartón puestas de canto dentro de la caja, separadas entre sí.",
    cuando:
      "Cuando pregunten por los refugios, las hueveras, el espacio o dónde se esconden los grillos.",
  },
  {
    id: "agua",
    titulo: "El alimento y el agua, cada uno en lo suyo",
    alt: "Dentro de la caja, un plato bajito con alimento y una tapa plástica con agua y un pedazo de manzana.",
    cuando:
      "Cuando pregunten por el agua, los bebederos, la manzana, cómo darles de comer o si se ahogan.",
  },
  {
    id: "clima",
    titulo: "El termómetro colgado adentro",
    alt: "Un termómetro-higrómetro digital pequeño colgado en la pared interior de la caja.",
    cuando:
      "Cuando pregunten por la temperatura, la humedad o dónde poner el termómetro.",
  },
];

const POR_ID = new Map(FIGURAS.map((f) => [f.id, f]));

export function Figura({
  id,
  className,
  prioridad = false,
}: {
  id: string;
  className?: string;
  /** La primera figura de una pagina se carga de una, no en diferido. */
  prioridad?: boolean;
}) {
  const figura = POR_ID.get(id);
  // Si el asistente se inventa un identificador, no se pinta nada. Mejor un
  // hueco que un dibujo roto.
  if (!figura) return null;

  return (
    <figure className={cn("my-4", className)}>
      {/* Claro en los dos temas: la ilustracion trae fondo blanco. En oscuro
          se le baja el brillo, porque un recuadro blanco a pantalla completa
          de noche deslumbra. */}
      <div className="overflow-hidden rounded-2xl border border-[#E2DDCB] bg-[#FBF9F2] dark:border-[#2C3A2E]">
        <Image
          src={`/figuras/${figura.id}.webp`}
          alt={figura.alt}
          width={900}
          height={600}
          className="h-auto w-full dark:brightness-[0.88] dark:contrast-[1.03]"
          priority={prioridad}
          loading={prioridad ? "eager" : "lazy"}
          sizes="(max-width: 520px) 100vw, 520px"
        />
      </div>
      <figcaption className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
        {figura.titulo}
      </figcaption>
    </figure>
  );
}
