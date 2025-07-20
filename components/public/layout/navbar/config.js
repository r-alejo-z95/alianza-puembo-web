// Configuración de enlaces sociales y elementos del menú

import { Facebook, Instagram, Youtube } from "lucide-react";

export const socialLinks = [
  {
    name: "Facebook",
    href: "https://www.facebook.com/iglesiaalianzapuembo/",
    icon: Facebook,
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/iglesiaalianza_puembo/",
    icon: Instagram,
  },
  {
    name: "YouTube",
    href: "https://www.youtube.com/c/IglesiaAlianzaPuembo",
    icon: Youtube,
  },
];

export const menuItems = [
  {
    name: "Conócenos",
    subroutes: [
      { name: "Equipo", href: "/conocenos/equipo", description: "Pastores y líderes que te acompañan" },
      { name: "¿En qué creemos?", href: "/conocenos/que-creemos", description: "Nuestras creencias fundamentales" },
    ],
  },
  {
    name: "Eventos",
    subroutes: [
      { name: "Próximos eventos", href: "/eventos/proximos-eventos", description: "No te pierdas lo que viene" },
      { name: "Calendario", href: "/eventos/calendario", description: "Consulta todas las fechas importantes" },
    ],
  },
  {
    name: "Ministerios",
    subroutes: [
      {
        name: "Cuidado",
        subroutes: [
          {
            name: "Grupos Pequeños",
            subroutes: [
              { name: "GP Familiares", href: "/ministerios/cuidado/grupos-pequenos/familiar", description: "Creciendo juntos en familia" },
              { name: "GP Legado (Varones)", href: "/ministerios/cuidado/grupos-pequenos/legado", description: "Forjando hombres de valor" },
              { name: "GP Juntas (Mujeres)", href: "/ministerios/cuidado/grupos-pequenos/juntas", description: "Creciendo en comunidad femenina" },
              { name: "GP Ministeriales", href: "/ministerios/cuidado/grupos-pequenos/ministeriales", description: "Cuidando a los que cuidan" },
            ],
          },
          { name: "Jóvenes", href: "/ministerios/cuidado/jovenes", description: "Espacio para adolescentes y jóvenes" },
          { name: "Puembo Kids", href: "/ministerios/cuidado/puembo-kids", description: "Iglesia para los más pequeños" },
        ],
      },
      {
        name: "Servicio",
        subroutes: [
          {
            name: "Conexión",
            subroutes: [
              { name: "Eventos", href: "/ministerios/servicio/conexion/eventos", description: "Eventos que conectan y transforman" },
              { name: "Amor en Acción", href: "/ministerios/servicio/conexion/amor-en-accion", description: "Manos que sirven a la comunidad" },
              { name: "Redes de Amor (Evangelismo)", href: "/ministerios/servicio/conexion/redes-de-amor", description: "Compartiendo la buena noticia" },
            ],
          },
          {
            name: "Crecimiento",
            subroutes: [
              { name: "Academia Bíblica", href: "/ministerios/servicio/crecimiento/academia-biblica", description: "Profundizando en la Palabra" },
              { name: "Celebra", href: "/ministerios/servicio/crecimiento/celebra", description: "Restauración y nueva vida" },
              { name: "Cultura Financiera", href: "/ministerios/servicio/crecimiento/cultura-financiera", description: "Administrando con sabiduría" },
              { name: "Sanidad", href: "/ministerios/servicio/crecimiento/sanidad", description: "Restaurando el corazón" },
            ],
          },
          {
            name: "Compromiso",
            subroutes: [
              { name: "MAT (Música, Artes y Tecnología)", href: "/ministerios/servicio/compromiso/mat", description: "Adoración, arte y tecnología" },
              { name: "MDA (Ministerios de Apoyo)", href: "/ministerios/servicio/compromiso/mda", description: "El corazón del servicio" },
              { name: "Oración", href: "/ministerios/servicio/compromiso/oracion", description: "El motor espiritual de la iglesia" },
            ],
          },
        ],
      },
    ],
  },
  {
    name: "Noticias",
    href: "/noticias",
  },
  {
    name: "Recursos",
    subroutes: [
      {
        name: "Prédicas",
        href: "https://www.youtube.com/@IglesiaAlianzaPuembo/playlists",
        description: "Escucha mensajes que transforman",
        external: true,
      },
      {
        name: "Lee, Ora, Medita",
        href: "/recursos/lom",
        description: "Guías diarias para tu devoción personal"
      },
      {
        name: "Galería",
        href: "https://iglesiaalianzapuembo.pixieset.com/",
        description: "Revive los mejores momentos en imágenes",
        external: true,
      },
    ],
  },
  { name: "Donaciones", href: "/donaciones" },
  { name: "Oración", href: "/oracion" },
  { name: "Contacto", href: "/contacto" },
];
