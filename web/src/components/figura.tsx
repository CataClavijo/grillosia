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

/**
 * Dos estilos de ilustracion, a proposito.
 *
 *   TRAZO   — lo que se HACE: cortar la tapa, poner la malla, tamizar. Es
 *             esquematico porque el detalle estorba cuando lo que importa es
 *             donde va cada cosa.
 *   LAMINA  — lo que se RECONOCE: los bichos, los lugares. Aqui el detalle es
 *             la informacion: nadie identifica un grillo con un esquema.
 *
 * Es la misma logica de un manual de taller, que lleva diagramas para armar y
 * fotografias para reconocer piezas. Al agregar una figura, la pregunta es
 * cual de las dos cosas hace, no cual se ve mejor.
 */

/**
 * Aviso de procedencia para las laminas de biologia.
 *
 * Son ilustraciones genericas de la familia Gryllidae, no retratos del grillo
 * que cria el proyecto: su identificacion taxonomica todavia no esta
 * confirmada. El catalogo usa fotografias con credito justamente por eso, y
 * estas laminas no pueden ocupar su lugar.
 */
export const LAMINAS_GENERICAS = new Set([
  "identificar",
  "macho-hembra",
  "ciclo",
]);

export interface DefinicionFigura {
  id: string;
  /**
   * Ruta propia, para lo que no vive en /figuras: las fotografias y las
   * laminas grabadas de /arte. El resto se resuelve por convencion desde
   * /figuras/<id>.webp.
   */
  src?: string;
  /**
   * Autor de la fotografia. Cuando existe se muestra SIEMPRE bajo la imagen:
   * es una atribucion, no un adorno, y omitirla no es una opcion.
   */
  credito?: string;
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
    // La caja YA MONTADA, con todo dentro. Es otra cosa que `caja`, que es el
    // recipiente vacio: esta responde a "¿como se ve un grillero?", que se
    // pregunta antes de saber que hace falta cada pieza por separado.
    id: "grillero",
    src: "/arte/caja-cria.webp",
    titulo: "Un grillero montado, con todo dentro",
    alt: "Corte de una caja de cría vista por dentro: hueveras de cartón paradas como acordeón, un bebedero, un plato con alimento y cama en el fondo. Al lado, la tapa perforada.",
    cuando:
      "Cuando pregunten cómo se ve un grillero, cómo queda la caja una vez armada, o pidan un ejemplo del montaje completo antes de entrar en cada pieza.",
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
    id: "grillo-real",
    src: "/grillos/grillo-2.webp",
    credito: "Sebastián Berrío",
    titulo: "Un grillo del proyecto, visto de lado",
    alt: "Grillo de la familia Gryllidae visto de lado, de color café oscuro, con las antenas largas hacia adelante.",
    cuando:
      "Cuando pregunten cómo se ven los grillos del proyecto, qué aspecto tienen o pidan una foto de verdad en vez de un dibujo.",
  },
  {
    id: "grillo-antenas",
    src: "/grillos/grillo-4.webp",
    credito: "Catalina Clavijo-Agudelo",
    titulo: "Las antenas pueden ser más largas que el cuerpo",
    alt: "Grillo de la familia Gryllidae visto desde arriba sobre fondo blanco, con las antenas muy largas extendidas.",
    cuando:
      "Cuando pregunten por las antenas, o cuando una foto real ayude más que el dibujo comparativo para reconocer un grillo.",
  },
  {
    id: "donde-buscar",
    titulo: "Dónde buscarlos: hojarasca, leña y piedra",
    alt: "Un rincón de patio con hojarasca acumulada, leña vieja apilada y un muro bajo de piedra, alumbrado por una linterna.",
    cuando:
      "Cuando pregunten dónde conseguir grillos, dónde buscarlos, cómo atraparlos o a qué hora salen.",
  },
  {
    id: "identificar",
    titulo: "Grillo arriba, saltamontes abajo: mire las antenas",
    alt: "Dos insectos de perfil: arriba un grillo con antenas muy largas; abajo un saltamontes con antenas cortas.",
    cuando:
      "Cuando pregunten cómo saber si lo que atraparon es un grillo, o en qué se diferencia de un saltamontes o una langosta.",
  },
  {
    id: "macho-hembra",
    titulo: "La hembra lleva una aguja atrás; el macho no",
    alt: "Dos grillos de perfil: arriba una hembra con un ovipositor largo y recto saliendo del abdomen; abajo un macho sin él.",
    cuando:
      "Cuando pregunten cómo distinguir macho de hembra, cuáles ponen huevos o cómo armar la proporción de la cría.",
  },
  {
    id: "ciclo",
    titulo: "Huevo, ninfa y adulto",
    alt: "Tres etapas en fila: un huevo ovalado, una ninfa pequeña sin alas y un grillo adulto con alas.",
    cuando:
      "Cuando pregunten cuánto tardan en crecer, por qué los pequeños no tienen alas, o en qué etapa van sus grillos.",
  },
  {
    id: "cosecha",
    titulo: "Un cedazo para separar, un frasco para guardar",
    alt: "Un cedazo circular de marco de madera sobre una mesa y, al lado, un frasco de vidrio con tapa perforada.",
    cuando:
      "Cuando pregunten cómo cosechar, cómo separar los grillos del sustrato o en qué guardarlos.",
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
      <div
        className={cn(
          "overflow-hidden rounded-2xl border",
          figura.credito
            ? "border-border"
            : "border-[#E2DDCB] bg-[#FBF9F2] dark:border-[#2C3A2E]",
        )}
      >
        <Image
          src={figura.src ?? `/figuras/${figura.id}.webp`}
          alt={figura.alt}
          width={900}
          height={600}
          className={cn(
            "h-auto w-full",
            !figura.credito && "dark:brightness-[0.88] dark:contrast-[1.03]",
          )}
          priority={prioridad}
          loading={prioridad ? "eager" : "lazy"}
          sizes="(max-width: 520px) 100vw, 520px"
        />
      </div>
      <figcaption className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
        {figura.titulo}
        {figura.credito && (
          <span className="mt-1 block text-[12.5px]">
            Fotografía: {figura.credito}
          </span>
        )}
        {LAMINAS_GENERICAS.has(figura.id) && (
          <span className="mt-1 block text-[12.5px]">
            Ilustración general de la familia Gryllidae. No corresponde a una
            especie identificada.
          </span>
        )}
      </figcaption>
    </figure>
  );
}
