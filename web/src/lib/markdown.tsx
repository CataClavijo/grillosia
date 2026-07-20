import type { ReactNode } from "react";

/**
 * Renderizador mínimo de markdown de una sola línea o de un bloque.
 * Soporta: **negrita**, *cursiva*, `código`. Nada más — con eso alcanza para
 * el copy curado del proyecto sin agregar react-markdown al bundle.
 */
export function inlineMarkdown(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={i}
          className="rounded-md bg-muted px-1.5 py-0.5 text-[0.9em] font-mono text-foreground/90"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

/**
 * Renderiza un bloque markdown en párrafos, listas, encabezados y blockquotes.
 * Se queda deliberadamente simple; no maneja tablas ni imágenes.
 */
export function renderMarkdownBlock(source: string): ReactNode[] {
  const lines = source.split("\n");
  const nodes: ReactNode[] = [];
  let paragraphBuffer: string[] = [];
  let listBuffer: string[] | null = null;
  let quoteBuffer: string[] | null = null;

  const flushParagraph = () => {
    if (paragraphBuffer.length === 0) return;
    nodes.push(
      <p
        key={`p-${nodes.length}`}
        className="text-[15.5px] leading-relaxed text-foreground/85"
      >
        {inlineMarkdown(paragraphBuffer.join(" "))}
      </p>,
    );
    paragraphBuffer = [];
  };

  const flushList = () => {
    if (!listBuffer) return;
    nodes.push(
      <ul
        key={`ul-${nodes.length}`}
        className="ml-4 list-disc space-y-1.5 text-[15.5px] leading-relaxed text-foreground/85 marker:text-primary"
      >
        {listBuffer.map((item, i) => (
          <li key={i}>{inlineMarkdown(item)}</li>
        ))}
      </ul>,
    );
    listBuffer = null;
  };

  const flushQuote = () => {
    if (!quoteBuffer) return;
    nodes.push(
      <blockquote
        key={`bq-${nodes.length}`}
        className="border-l-4 border-primary/40 bg-primary/5 px-4 py-3 text-[15.5px] italic leading-relaxed text-foreground/85"
      >
        {inlineMarkdown(quoteBuffer.join(" "))}
      </blockquote>,
    );
    quoteBuffer = null;
  };

  const flushAll = () => {
    flushParagraph();
    flushList();
    flushQuote();
  };

  for (const raw of lines) {
    const line = raw.trimEnd();

    if (line.trim() === "") {
      flushAll();
      continue;
    }

    if (line.startsWith("## ")) {
      flushAll();
      nodes.push(
        <h3
          key={`h3-${nodes.length}`}
          className="mt-4 text-[16px] font-bold tracking-tight text-foreground"
        >
          {inlineMarkdown(line.slice(3))}
        </h3>,
      );
      continue;
    }

    if (line.startsWith("# ")) {
      flushAll();
      nodes.push(
        <h2
          key={`h2-${nodes.length}`}
          className="mt-4 text-[18px] font-bold tracking-tight text-foreground"
        >
          {inlineMarkdown(line.slice(2))}
        </h2>,
      );
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      flushParagraph();
      flushQuote();
      listBuffer ??= [];
      listBuffer.push(line.replace(/^[-*]\s+/, ""));
      continue;
    }

    if (line.startsWith("> ")) {
      flushParagraph();
      flushList();
      quoteBuffer ??= [];
      quoteBuffer.push(line.slice(2));
      continue;
    }

    flushList();
    flushQuote();
    paragraphBuffer.push(line);
  }

  flushAll();
  return nodes;
}
