import type { NextConfig } from "next";

/**
 * Las rutas se renombraron para que coincidan con el camino: cada direccion
 * dice ahora en que parada esta. Las viejas siguen funcionando con
 * redireccion permanente, porque estan escritas en los manuales en PDF y en
 * los enlaces que ya se compartieron.
 */
const nextConfig: NextConfig = {
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
