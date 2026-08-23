import { Figura } from "@/components/figura";
import { inlineMarkdown } from "@/lib/markdown";

/**
 * Pinta el texto del asistente, sacando los marcadores de figura.
 *
 * El asistente escribe `[figura:ventilacion]` en su propia linea cuando le
 * sirve mostrar un dibujo. Aqui se parte el texto en trozos y ese marcador se
 * cambia por la ilustracion.
 *
 * Si el identificador no existe, `Figura` no pinta nada. Es la misma regla que
 * con las cifras: cuando el modelo se inventa algo, el hueco es preferible al
 * invento.
 */

const MARCADOR = /\[figura:([a-z-]{1,32})\]/g;

export function textoConFiguras(texto: string): React.ReactNode {
  const trozos: React.ReactNode[] = [];
  let ultimo = 0;
  let n = 0;

  for (const m of texto.matchAll(MARCADOR)) {
    const inicio = m.index ?? 0;
    const antes = texto.slice(ultimo, inicio).trim();
    if (antes) {
      trozos.push(
        <p key={`t${n++}`} className="whitespace-pre-wrap">
          {inlineMarkdown(antes)}
        </p>,
      );
    }
    trozos.push(<Figura key={`f${n++}`} id={m[1]} className="my-3" />);
    ultimo = inicio + m[0].length;
  }

  const resto = texto.slice(ultimo).trim();
  if (resto) {
    trozos.push(
      <p key={`t${n++}`} className="whitespace-pre-wrap">
        {inlineMarkdown(resto)}
      </p>,
    );
  }

  return <>{trozos}</>;
}
