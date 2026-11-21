import type { NextConfig } from "next";

/**
 * Las rutas se renombraron para que coincidan con el camino: cada direccion
 * dice ahora en que parada esta. Las viejas siguen funcionando con
 * redireccion permanente, porque estan escritas en los manuales en PDF y en
 * los enlaces que ya se compartieron.
 */
const nextConfig: NextConfig = {
  // Solo aplica en desarrollo: deja abrir el servidor local desde otros
  // equipos de la misma red (por ejemplo un celular) usando la IP del
  // computador en vez de localhost.
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*"],
  // El boton redondo "N" de Next en desarrollo tapaba el "Atras" de la
  // barra de abajo en las vistas previas por la red.
  devIndicators: false,
  // Las fotos y acuarelas se sirven en AVIF cuando el navegador lo acepta:
  // pesan bastante menos que WebP a la misma calidad visible, y la pagina la
  // abren productores con datos moviles contados. 60 es la calidad de las
  // fotos grandes de campo; 75, la de todo lo demas.
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [60, 75],
  },
  async redirects() {
    return [
      { source: "/como-armar", destination: "/caja", permanent: true },
      { source: "/tutorial", destination: "/caja", permanent: true },
      { source: "/catalogo", destination: "/grillos", permanent: true },
      { source: "/wizard", destination: "/consulta", permanent: true },
      { source: "/proyectos", destination: "/consultas", permanent: true },
      { source: "/metodologia", destination: "/proyecto", permanent: true },
      { source: "/contacto", destination: "/proyecto", permanent: true },
    ];
  },
};

export default nextConfig;
