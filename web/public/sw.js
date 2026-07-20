/**
 * Service Worker de GrillIA — cache offline-first para el shell estático.
 * Deliberadamente pequeño: no queremos cachear respuestas del chat o
 * proyectos personales del usuario. Solo el shell.
 */

const CACHE_NAME = "grillia-shell-v1";
const SHELL = ["/", "/tutorial", "/catalogo", "/como-armar", "/wizard", "/chat", "/proyectos", "/metodologia", "/proyecto", "/manifest.json", "/icon-192.png", "/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(SHELL))
      .catch(() => {
        // Falla silenciosa: si una ruta aún no existe en el build no bloqueamos la instalación.
      })
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Solo GET del mismo origen; el resto pasa directo a la red.
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) {
    return;
  }

  // Estrategia: network-first para HTML (para no servir versiones vencidas del shell),
  // cache-first para el resto de estáticos.
  const accept = req.headers.get("accept") ?? "";
  const isHTML = accept.includes("text/html");

  if (isHTML) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((m) => m ?? caches.match("/"))),
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        if (!res || res.status !== 200 || res.type !== "basic") return res;
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        return res;
      });
    }),
  );
});
