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
  "trampa-vaso",
  "atrapar-mano",
  "trampa-carton",
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
    src: "/acuarelas/caja-recipiente.webp",
    titulo: "La caja y su tapa, limpias y listas",
    alt: "Una caja plástica rectangular transparente con su tapa.",
    cuando: "Cuando pregunten qué caja sirve, de qué tamaño, o cómo empezar.",
  },
  {
    // La caja YA MONTADA, con todo dentro. Es otra cosa que `caja`, que es el
    // recipiente vacio: esta responde a "¿como se ve un grillero?", que se
    // pregunta antes de saber que hace falta cada pieza por separado.
    id: "grillero",
    src: "/acuarelas/caja-cria.webp",
    titulo: "Un grillero montado, con todo dentro",
    alt: "Corte de una caja de cría vista por dentro: hueveras de cartón paradas como acordeón, un bebedero, un plato con alimento y cama en el fondo. Al lado, la tapa perforada.",
    cuando:
      "Cuando pregunten cómo se ve un grillero, cómo queda la caja una vez armada, o pidan un ejemplo del montaje completo antes de entrar en cada pieza.",
  },
  {
    id: "ventilacion",
    src: "/acuarelas/caja-ventilacion.webp",
    titulo: "La ventana de ventilación en la tapa",
    alt: "La tapa de la caja vista desde arriba, con una ventana rectangular cubierta de malla fina.",
    cuando:
      "Cuando pregunten por la ventilación, el calor, la humedad encerrada, el mal olor o cómo evitar que se escapen.",
  },
  {
    id: "sustrato",
    src: "/acuarelas/caja-sustrato.webp",
    titulo: "La cama pareja en el fondo",
    alt: "Un montón pequeño de sustrato seco de viruta y cartón picado.",
    cuando: "Cuando pregunten por la cama, el sustrato o qué poner en el fondo.",
  },
  {
    id: "refugios",
    src: "/acuarelas/caja-refugios.webp",
    titulo: "Las hueveras paradas, como un acordeón",
    alt: "Dos hueveras de cartón puestas de pie, una junto a la otra.",
    cuando:
      "Cuando pregunten por los refugios, las hueveras, el espacio o dónde se esconden los grillos.",
  },
  {
    id: "agua",
    src: "/acuarelas/caja-agua.webp",
    titulo: "El alimento y el agua, cada uno en lo suyo",
    alt: "Un bebedero pequeño con algodón húmedo en el plato y, al lado, un pedazo de manzana.",
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
    id: "trampa-vaso",
    src: "/acuarelas/trampa-vaso.webp",
    titulo: "Trampa de vaso enterrado",
    alt: "Corte del suelo: un vaso plástico enterrado a ras de tierra con un pedazo de fruta dentro, y encima una teja apoyada en dos piedras que deja un hueco de entrada y tapa la lluvia.",
    cuando:
      "Cuando pregunten cómo atrapar grillos, qué trampa poner, cómo hacer una trampa casera o cómo conseguirlos sin comprarlos.",
  },
  {
    id: "atrapar-mano",
    src: "/acuarelas/atrapar-mano.webp",
    titulo: "Atraparlos a mano, sin apretar",
    alt: "Dos manos: una baja ahuecada sobre un grillo posado en el suelo y la otra espera al lado para cerrar el hueco entre ambas.",
    cuando:
      "Cuando pregunten cómo cogerlos con la mano, cómo agarrarlos sin lastimarlos o si se pueden tomar con los dedos.",
  },
  {
    id: "trampa-carton",
    src: "/acuarelas/trampa-carton.webp",
    titulo: "Cartón enrollado y huevera como refugio",
    alt: "Un pedazo de cartón corrugado enrollado y una huevera de cartón, con grillos metidos entre los pliegues.",
    cuando:
      "Cuando pregunten por trampas de refugio, cómo juntarlos con cartón o huevera, o cómo atraerlos a un sitio para recogerlos.",
  },
  {
    id: "identificar",
    src: "/acuarelas/identificar.webp",
    titulo: "Grillo arriba, saltamontes abajo: mire las antenas",
    alt: "Dos insectos de perfil: arriba un grillo con antenas muy largas; abajo un saltamontes con antenas cortas.",
    cuando:
      "Cuando pregunten cómo saber si lo que atraparon es un grillo, o en qué se diferencia de un saltamontes o una langosta.",
  },
  {
    id: "macho-hembra",
    src: "/acuarelas/macho-hembra.webp",
    titulo: "La hembra lleva una aguja atrás; el macho no",
    alt: "Dos grillos de perfil: arriba una hembra con un ovipositor largo y recto saliendo del abdomen; abajo un macho sin él.",
    cuando:
      "Cuando pregunten cómo distinguir macho de hembra, cuáles ponen huevos o cómo armar la proporción de la cría.",
  },
  {
    id: "ciclo",
    src: "/acuarelas/ciclo.webp",
    titulo: "Huevo, ninfa y adulto",
    alt: "Tres etapas en fila: un huevo ovalado, una ninfa pequeña sin alas y un grillo adulto con alas.",
    cuando:
      "Cuando pregunten cuánto tardan en crecer, por qué los pequeños no tienen alas, o en qué etapa van sus grillos.",
  },
  {
    id: "cosecha",
    src: "/acuarelas/cosecha.webp",
    titulo: "Un cedazo para separar, un frasco para guardar",
    alt: "Un cedazo circular de marco de madera sobre una mesa y, al lado, un frasco de vidrio con tapa perforada.",
    cuando:
      "Cuando pregunten cómo cosechar, cómo separar los grillos del sustrato o en qué guardarlos.",
  },
  {
    id: "dieta-bore",
    src: "/acuarelas/ing-bore.webp",
    titulo: "D1: harina de bore",
    alt: "Una hoja grande de bore con un trozo de tallo y, al lado, un cuenco con harina fina.",
    cuando:
      "Cuando pregunten por la dieta D1, por el bore, o pidan ver de qué está hecha esa comida.",
  },
  {
    id: "dieta-boton-oro",
    src: "/acuarelas/ing-boton-oro.webp",
    titulo: "D2: harina de botón de oro",
    alt: "Una rama de botón de oro con dos flores y hojas lobuladas y, al lado, un cuenco con harina.",
    cuando:
      "Cuando pregunten por la dieta D2, por el botón de oro, o pidan ver de qué está hecha esa comida.",
  },
  {
    id: "dieta-salvado",
    src: "/acuarelas/ing-salvado.webp",
    titulo: "D3: salvado de trigo",
    alt: "Un cuenco con salvado de trigo en escamas y, al lado, dos espigas de trigo.",
    cuando:
      "Cuando pregunten por la dieta D3, por el salvado de trigo, o pidan ver de qué está hecha esa comida.",
  },
  {
    id: "clima",
    src: "/acuarelas/caja-clima.webp",
    titulo: "El termómetro colgado adentro",
    alt: "Un termómetro-higrómetro digital pequeño.",
    cuando:
      "Cuando pregunten por la temperatura, la humedad o dónde poner el termómetro.",
  },
];

const POR_ID = new Map(FIGURAS.map((f) => [f.id, f]));

/**
 * Una figura dentro de la conversacion.
 *
 * Va chica, como ficha: el dibujo a un lado y su pie al otro. A todo el
 * ancho del panel una hoja de bore ocupaba la pantalla entera y tapaba la
 * respuesta. Con `enFila` (varias figuras seguidas, por ejemplo las tres
 * comidas) va en vertical para caber tres por renglon.
 */
export function Figura({
  id,
  className,
  enFila = false,
}: {
  id: string;
  className?: string;
  enFila?: boolean;
}) {
  const figura = POR_ID.get(id);
  // Si el asistente se inventa un identificador, no se pinta nada. Mejor un
  // hueco que un dibujo roto.
  if (!figura) return null;
  const foto = !!figura.credito;

  return (
    <figure
      className={cn(
        "rounded-lg bg-surface p-2.5 ring-1 ring-border",
        enFila ? "flex flex-col gap-2" : "flex max-w-[380px] items-center gap-3.5",
        className,
      )}
    >
      {/* Las laminas se tratan igual que en el resto del sitio (`.lamina`);
          las fotografias van recortadas, con esquinas suaves. */}
      <div
        className={cn(
          "relative shrink-0 overflow-hidden",
          enFila ? "h-20 w-full" : "size-24",
          foto && "rounded-md",
        )}
      >
        <Image
          src={figura.src ?? `/figuras/${figura.id}.webp`}
          alt={figura.alt}
          fill
          className={foto ? "object-cover" : "lamina object-contain"}
          sizes="200px"
        />
      </div>
      <figcaption className={cn("min-w-0 leading-snug", enFila ? "text-[12.5px]" : "text-[13.5px]")}>
        <span className="font-medium text-foreground">{figura.titulo}</span>
        {figura.credito && (
          <span className="mt-1 block text-[12px] text-subtle">Fotografía: {figura.credito}</span>
        )}
        {LAMINAS_GENERICAS.has(figura.id) && (
          <span className="mt-1 block text-[12px] text-subtle">
            Ilustración general de la familia Gryllidae, no una especie identificada.
          </span>
        )}
      </figcaption>
    </figure>
  );
}
