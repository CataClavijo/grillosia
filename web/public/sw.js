/**
 * Kill-switch agresivo para el service worker anterior.
 *
 * La versión previa interceptaba HTML con network-first + fallback a cache;
 * cuando ni la red ni el cache respondían, el respondWith resolvía undefined
 * y Chrome/Safari mostraban "This page couldn't load".
 *
 * Este SW: (1) toma control inmediato de todos los clientes (skipWaiting +
 * clients.claim), (2) borra todos los caches del origen, (3) se desregistra,
 * y (4) recarga las pestañas activas para que el próximo request pase
 * directamente a la red sin service worker.
 *
 * Además tiene un fetch handler que hace passthrough puro — si por cualquier
 * motivo alguna request llega al SW antes de que se desregistre, se responde
 * con fetch(req) directo. Nunca resuelve undefined.
 */

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      } catch {
        /* noop */
      }
      try {
        await self.clients.claim();
      } catch {
        /* noop */
      }
      try {
        await self.registration.unregister();
      } catch {
        /* noop */
      }
      try {
        const clients = await self.clients.matchAll({ type: "window" });
        clients.forEach((client) => {
          try {
            client.navigate(client.url);
          } catch {
            /* noop */
          }
        });
      } catch {
        /* noop */
      }
    })(),
  );
});

// Passthrough total: nunca resolver undefined. Cualquier request que llegue
// mientras el SW aún está registrado se envía a la red tal cual.
self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request).catch(() => Response.error()));
});
