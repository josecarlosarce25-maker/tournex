import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // La raíz del sitio sirve la landing de AURA (sin cambiar la URL).
  // Para volver a mostrar Tournex en "/", elimina este bloque.
  async rewrites() {
    return [{ source: "/", destination: "/aura" }];
  },
};

export default nextConfig;
