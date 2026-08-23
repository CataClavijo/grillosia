/**
 * El camino: cuatro paradas en fila.
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
 * Los pasos 1 y 2 se pueden saltar. Quien ya tiene sus grillos criados no
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
}

export const CAMINO: Parada[] = [
  {
    n: 1,
    href: "/caja",
    titulo: "Arme su caja",
    resumen: "Qué necesita y cómo montarla, paso a paso.",
    siguiente: "Ya tengo mi caja",
  },
  {
    n: 2,
    href: "/grillos",
    titulo: "Conozca sus grillos",
    resumen: "Cuáles criamos y qué cuidados piden.",
    siguiente: "Seguir",
  },
  {
    n: 3,
    href: "/consulta",
    titulo: "Haga su consulta",
    resumen: "Cuatro preguntas sobre su animal y su clima.",
    siguiente: "Ver mi resultado",
  },
  {
    n: 4,
    href: "/resultado",
    titulo: "Vea su resultado",
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
  { href: "/proyecto", titulo: "Sobre el proyecto" },
] as const;
