// KILL-SWITCH PERMANENTE — GRILLIA_SW_KILL_VERSION=4
//
// NO agregar lógica aquí. NO agregar fetch handler. NUNCA.
//
// Historia: la v1 de este archivo interceptaba navegaciones con
//   event.respondWith(caches.match(req).then(r => r || caches.match("/")))
// y cuando ninguno de los dos estaba en caché el respondWith resolvía a
// undefined → Chrome y Safari muestran "This page couldn't load".
//
// La v3 intentó arreglarlo con un fetch handler de passthrough
//   event.respondWith(fetch(req).catch(() => Response.error()))
// pero Response.error() en una navegación produce EXACTAMENTE el mismo
// síntoma cuando la red parpadea. Un service worker sin fetch handler es
// funcionalmente equivalente a no tener service worker: el navegador va
// directo a la red y no hay superficie de fallo.
//
// Para reintroducir un service worker real algún día, leer primero
// docs/sw-strategy.md.

const KILL_VERSION = "4";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // 1. Borrar todas las cachés heredadas de versiones anteriores.
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      } catch {
        /* noop */
      }

      // 2. Tomar control de los clientes ya abiertos.
      try {
        await self.clients.claim();
      } catch {
        /* noop */
      }

      // 3. Desregistrar. No libera las pestañas ya controladas, pero impide
      //    que este service worker controle navegaciones futuras.
      try {
        await self.registration.unregister();
      } catch {
        /* noop */
      }

      // 4. Avisar a los clientes. El cliente decide si recarga (ver
      //    SwKillBoot). Nunca llamamos clients.navigate() desde aquí: esa
      //    carrera es la que reintroduce el bug.
      try {
        const all = await self.clients.matchAll({ type: "window" });
        for (const client of all) {
          try {
            client.postMessage({ type: "SW_KILLED", version: KILL_VERSION });
          } catch {
            /* noop */
          }
        }
      } catch {
        /* noop */
      }
    })(),
  );
});

// Sin fetch handler: passthrough real del navegador.
