/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  compress: true,
  reactStrictMode: true,
  async rewrites() {
    return [
      // Categorías Principales
      { source: '/ministerios/cuidado', destination: '/involucrate/ministerios/cuidado' },
      { source: '/ministerios/servicio', destination: '/involucrate/ministerios/servicio' },
      
      // Cuidado Pastoral
      { source: '/ministerios/gp-familiar', destination: '/involucrate/ministerios/cuidado/grupos-pequenos/familiar' },
      { source: '/ministerios/gp-legado', destination: '/involucrate/ministerios/cuidado/grupos-pequenos/legado' },
      { source: '/ministerios/gp-juntas', destination: '/involucrate/ministerios/cuidado/grupos-pequenos/juntas' },
      { source: '/ministerios/gp-ministeriales', destination: '/involucrate/ministerios/cuidado/grupos-pequenos/ministeriales' },
      { source: '/ministerios/jovenes', destination: '/involucrate/ministerios/cuidado/jovenes' },
      { source: '/ministerios/puembo-kids', destination: '/involucrate/ministerios/cuidado/puembo-kids' },

      // Servicio - Conexión -> Eventos
      { source: '/ministerios/alma', destination: '/involucrate/ministerios/servicio/conexion/eventos/alma' },
      { source: '/ministerios/legado', destination: '/involucrate/ministerios/servicio/conexion/eventos/legado' },
      { source: '/ministerios/cautivante', destination: '/involucrate/ministerios/servicio/conexion/eventos/cautivante' },
      { source: '/ministerios/eje', destination: '/involucrate/ministerios/servicio/conexion/eventos/eje' },

      // Servicio - Conexión -> Amor en Acción
      { source: '/ministerios/mision-dignidad', destination: '/involucrate/ministerios/servicio/conexion/amor-en-accion/mision-dignidad' },
      { source: '/ministerios/brigadas-medicas', destination: '/involucrate/ministerios/servicio/conexion/amor-en-accion/brigadas-medicas' },
      { source: '/ministerios/boutique', destination: '/involucrate/ministerios/servicio/conexion/amor-en-accion/ropero' },
      { source: '/ministerios/navidad-digna', destination: '/involucrate/ministerios/servicio/conexion/amor-en-accion/navidad-digna' },
      { source: '/ministerios/canasta-de-amor', destination: '/involucrate/ministerios/servicio/conexion/amor-en-accion/canasta-de-amor' },
      { source: '/ministerios/hogar-digno', destination: '/involucrate/ministerios/servicio/conexion/amor-en-accion/hogar-digno' },

      // Servicio - Conexión -> Redes de Amor
      { source: '/ministerios/pescadores', destination: '/involucrate/ministerios/servicio/conexion/redes-de-amor/pescadores' },
      { source: '/ministerios/punto-conexion', destination: '/involucrate/ministerios/servicio/conexion/redes-de-amor/punto-de-conexion' },

      // Servicio - Crecimiento
      { source: '/ministerios/academia-biblica', destination: '/involucrate/ministerios/servicio/crecimiento/academia-biblica' },
      { source: '/ministerios/decisiones', destination: '/involucrate/ministerios/servicio/crecimiento/celebra' },
      { source: '/ministerios/cultura-financiera', destination: '/involucrate/ministerios/servicio/crecimiento/cultura-financiera' },
      { source: '/ministerios/sanidad', destination: '/involucrate/ministerios/servicio/crecimiento/sanidad' },

      // Servicio - Compromiso
      { source: '/ministerios/mat', destination: '/involucrate/ministerios/servicio/compromiso/mat' },
      { source: '/ministerios/anfitriones', destination: '/involucrate/ministerios/servicio/compromiso/mda/anfitriones' },
      { source: '/ministerios/punto-informacion', destination: '/involucrate/ministerios/servicio/compromiso/mda/mesa-de-informacion' },
      { source: '/ministerios/santa-cena', destination: '/involucrate/ministerios/servicio/compromiso/mda/santa-cena' },
      { source: '/ministerios/bautizos', destination: '/involucrate/ministerios/servicio/compromiso/mda/bautizos' },
      { source: '/ministerios/acompanamiento', destination: '/involucrate/ministerios/servicio/compromiso/mda/visitacion-y-funerales' },

      // Servicio - Oración
      { source: '/ministerios/circulos-oracion', destination: '/involucrate/ministerios/servicio/compromiso/oracion/circulos-de-oracion' },
      { source: '/ministerios/intercesores', destination: '/involucrate/ministerios/servicio/compromiso/oracion/intercesores' },
      { source: '/ministerios/miercoles-oracion', destination: '/involucrate/ministerios/servicio/compromiso/oracion/miercoles-de-oracion' },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'gxziassnnbwnbzfrzcnx.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/event-posters/**',
      },
      {
        protocol: 'https',
        hostname: 'gxziassnnbwnbzfrzcnx.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/public-images/**',
      },
      {
        protocol: 'https',
        hostname: 'gxziassnnbwnbzfrzcnx.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/form-images/**',
      },
      {
        protocol: 'https',
        hostname: 'gxziassnnbwnbzfrzcnx.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/news-images/**',
      },
    ],
  },
};

export default nextConfig;
