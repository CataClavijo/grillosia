"use client";

/**
 * Error boundary de último recurso. Estilos inline a propósito: si llegamos
 * aquí puede que el CSS del proyecto tampoco haya cargado.
 */
export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="es">
      <body
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: "2rem 1.5rem",
          lineHeight: 1.6,
          color: "#1f1b16",
          background: "#fcfaf5",
        }}
      >
        <h1 style={{ fontSize: "1.35rem", fontWeight: 700, margin: 0 }}>
          Algo falló al cargar
        </h1>
        <p style={{ marginTop: "0.75rem", opacity: 0.8 }}>
          Puede intentar de nuevo. Si le vuelve a pasar, entre a{" "}
          <a href="/reset" style={{ color: "#a4451f", fontWeight: 600 }}>
            restablecer la aplicación
          </a>{" "}
          y le limpiamos los datos guardados.
        </p>
        <button
          onClick={reset}
          style={{
            marginTop: "1.25rem",
            minHeight: "48px",
            padding: "0.75rem 1.5rem",
            fontSize: "1rem",
            fontWeight: 600,
            color: "#ffffff",
            background: "#a4451f",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Intentar de nuevo
        </button>
      </body>
    </html>
  );
}
