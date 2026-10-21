/**
 * Pinta en cursiva lo que va entre asteriscos: "*Acheta domesticus*".
 *
 * Sirve para los nombres en latín y para los títulos de libros y revistas en
 * las citas, sin tener que escribir HTML dentro de los textos.
 */
export function conCursivas(texto: string): React.ReactNode[] {
  return texto.split(/\*([^*]+)\*/g).map((parte, i) => (i % 2 === 1 ? <em key={i}>{parte}</em> : parte));
}
