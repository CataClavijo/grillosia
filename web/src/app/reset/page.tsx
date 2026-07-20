export const dynamic = "force-static";
export const revalidate = false;

export const metadata = {
  title: "Restableciendo GrillIA",
  robots: { index: false, follow: false, nocache: true },
};

/**
 * Página de rescate.
 *
 * Deliberadamente NO usa componentes del proyecto, ni Tailwind, ni hooks:
 * todo el trabajo lo hace un script inline y los estilos van embebidos. Así
 * sigue funcionando aunque el bundle de la aplicación esté roto, que es
 * justamente el escenario en el que alguien necesita esta página.
 *
 * La ruta además se sirve con Clear-Site-Data desde vercel.json.
 */
const RESET_SCRIPT = `
(async function () {
  try {
    if ("serviceWorker" in navigator) {
      var regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(function (r) { return r.unregister().catch(function () {}); }));
    }
  } catch (e) {}
  try {
    if ("caches" in window) {
      var keys = await caches.keys();
      await Promise.all(keys.map(function (k) { return caches.delete(k).catch(function () {}); }));
    }
  } catch (e) {}
  try { localStorage.clear(); } catch (e) {}
  try { sessionStorage.clear(); } catch (e) {}
  window.location.replace("/?fresh=" + Date.now());
})();
`;

export default function ResetPage() {
  return (
    <main
      style={{
        fontFamily: "system-ui, -apple-system, sans-serif",
        minHeight: "70vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.75rem",
        padding: "2rem 1.5rem",
        textAlign: "center",
        color: "#20301f",
        background: "#f4f1e7",
      }}
    >
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>
        Restableciendo GrillIA
      </h1>
      <p style={{ maxWidth: "24rem", lineHeight: 1.6, opacity: 0.8, margin: 0 }}>
        Estamos limpiando los datos que su navegador tenía guardados. Esto
        tarda unos segundos y luego lo llevamos al inicio.
      </p>
      <p style={{ fontSize: "0.9rem", opacity: 0.7, marginTop: "1rem" }}>
        Si no lo lleva solo,{" "}
        <a href="/?fresh=1" style={{ color: "#2f5d3c", fontWeight: 600 }}>
          toque aquí para volver al inicio
        </a>
        .
      </p>
      <script dangerouslySetInnerHTML={{ __html: RESET_SCRIPT }} />
    </main>
  );
}
