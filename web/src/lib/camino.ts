/**
 * El camino: cinco paradas en fila.
 *
 * Antes habia once rutas y la pantalla de inicio ofrecia nueve salidas. De
 * once pantallas, solo una tenia un paso siguiente claro: desde la guia de la
 * caja, el catalogo o el tutorial solo se podia volver al inicio. Cada pagina
 * era un callejon.
 *
 * Esto lo reemplaza por una fila numerada. La regla que lo sostiene: UNA
 * PANTALLA, UNA ACCION. Si una pantalla ofrece dos caminos hacia adelante,
 * uno sobra o pertenece a la biblioteca.
 *
 * Los pasos 1, 2 y 3 (la guia de cria) se pueden saltar. Quien ya tiene sus grillos criados no
 * tiene por que pasar por la guia de la caja para preguntar que darles de
 * comer; obligarlo seria justo la friccion que estamos quitando.
 */

export interface Parada {
  n: number;
  href: string;
  titulo: string;
  /** Lo que el productor va a hacer aqui, en sus palabras. */
  resumen: string;
  /** Texto del unico boton que lleva adelante. */
  siguiente: string;
  /** Nombre corto para la cabecera, donde los titulos largos no caben. */
  corto: string;
}

export const CAMINO: Parada[] = [
  {
    n: 1,
    href: "/caja",
    titulo: "Arme su caja",
    corto: "Su caja",
    resumen: "Qué necesita y cómo montarla, paso a paso.",
    siguiente: "Ya tengo mi caja",
  },
  {
    n: 2,
    href: "/grillos",
    titulo: "Conozca sus grillos",
    corto: "Sus grillos",
    resumen: "Cómo reconocerlos y cuáles sirven para la cría.",
    siguiente: "Seguir",
  },
  {
    // Los lugares van aparte de los grillos: antes estaban en la misma
    // pagina y se mezclaban (Catalina, 2026-11-21).
    n: 3,
    href: "/recoleccion",
    titulo: "Busque sus grillos",
    corto: "Dónde buscarlos",
    resumen: "Dónde se encuentran y cómo sacarlos vivos.",
    siguiente: "Seguir",
  },
  {
    n: 4,
    href: "/consulta",
    titulo: "Haga su consulta",
    corto: "Consulta",
    resumen: "Cuatro preguntas sobre su animal y su clima.",
    siguiente: "Ver mi resultado",
  },
  {
    n: 5,
    href: "/resultado",
    titulo: "Vea su resultado",
    corto: "Resultado",
    resumen: "Las tres comidas comparadas para su caso.",
    siguiente: "Preguntar sobre esto",
  },
];

export const TOTAL_PARADAS = CAMINO.length;

export function paradaDe(href: string): Parada | undefined {
  return CAMINO.find((p) => p.href === href);
}

/** La parada que sigue, o `undefined` si es la ultima. */
export function siguienteParada(n: number): Parada | undefined {
  return CAMINO.find((p) => p.n === n + 1);
}

/**
 * La biblioteca. Se llega desde el menu, nunca desde el camino, y por eso no
 * lleva numero: no son pasos, son consultas sueltas.
 */
export const BIBLIOTECA = [
  { href: "/consultas", titulo: "Mis consultas" },
  { href: "/proyecto", titulo: "Sobre GrillosIA" },
] as const;
