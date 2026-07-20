/**
 * Kill-switch para el service worker anterior.
 *
 * La versión previa interceptaba HTML con network-first + fallback a cache;
 * en algunos navegadores (Safari en particular) devolver undefined desde
 * respondWith rompía la navegación con "This page couldn't load".
 *
 * Esta versión se autodesregistra en install, borra todos los caches del
 * origen y recarga los clientes activos. La próxima navegación ya no
 * tiene service worker.
 */

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    (async () => {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      } catch {
        /* noop */
      }
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      try {
        await self.registration.unregister();
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
