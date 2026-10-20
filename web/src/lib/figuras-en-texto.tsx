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

/**
 * Un rotulo suelto antes de una figura ("D1", "**D2:**"). El pie de la
 * figura ya lo dice, y solo en su renglon se veia como un "D1" perdido.
 */
const ROTULO = /^[*_\s]*[A-Za-zÁÉÍÓÚáéíóúñ0-9]{1,10}[*_:\s]*$/;

export function textoConFiguras(texto: string): React.ReactNode {
  // Primero se parte en texto y figuras; despues las figuras seguidas (con
  // a lo sumo un rotulo corto entre ellas) se juntan en una fila.
  const partes: ({ tipo: "texto"; v: string } | { tipo: "figuras"; ids: string[] })[] = [];
  let ultimo = 0;
  for (const m of texto.matchAll(MARCADOR)) {
    const inicio = m.index ?? 0;
    let antes = texto.slice(ultimo, inicio).trim();
    // Un rotulo corto en el ultimo renglon antes de la figura sobra.
    const renglones = antes.split("\n");
    if (ROTULO.test(renglones[renglones.length - 1] ?? "")) {
      renglones.pop();
      antes = renglones.join("\n").trim();
    }
    const previa = partes[partes.length - 1];
    if (!antes && previa?.tipo === "figuras") {
      previa.ids.push(m[1]);
    } else {
      if (antes) partes.push({ tipo: "texto", v: antes });
      partes.push({ tipo: "figuras", ids: [m[1]] });
    }
    ultimo = inicio + m[0].length;
  }
  const resto = texto.slice(ultimo).trim();
  if (resto) partes.push({ tipo: "texto", v: resto });

  return (
    <>
      {partes.map((p, i) =>
        p.tipo === "texto" ? (
          <p key={i} className="whitespace-pre-wrap">
            {inlineMarkdown(p.v)}
          </p>
        ) : p.ids.length === 1 ? (
          <Figura key={i} id={p.ids[0]} className="my-3" />
        ) : (
          <div key={i} className="my-3 grid grid-cols-2 gap-2 min-[440px]:grid-cols-3">
            {p.ids.map((id, j) => (
              <Figura key={j} id={id} enFila />
            ))}
          </div>
        ),
      )}
    </>
  );
}
