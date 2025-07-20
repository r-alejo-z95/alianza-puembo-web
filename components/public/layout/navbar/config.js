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
        href: "/ministerios/cuidado",
        description: "Un abrazo para el alma: ministerios donde recibes",
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
        href: "/ministerios/servicio",
        description: "Manos que transforman: ministerios donde das",
        subroutes: [
          {
            name: "Conexión",
            subroutes: [
              {
                name: "Eventos",
                subroutes: [
                  { name: "Alma (Matrimonios)", href: "/ministerios/servicio/conexion/eventos/alma", description: "Uniendo corazones" },
                  { name: "Legado (Varones)", href: "/ministerios/servicio/conexion/eventos/legado", description: "Hombres con propósito" },
                  { name: "Cautivante (Mujeres)", href: "/ministerios/servicio/conexion/eventos/cautivante", description: "Descubre tu valor" },
                  { name: "Eje (Jóvenes)", href: "/ministerios/servicio/conexion/eventos/eje", description: "El punto de encuentro de la nueva generación" },
                ],
              },
              {
                name: "Amor en Acción",
                subroutes: [
                  { name: "Misión Dignidad", href: "/ministerios/servicio/conexion/amor-en-accion/mision-dignidad", description: "Nuestro brazo social principal" },
                  { name: "Brigadas Médicas", href: "/ministerios/servicio/conexion/amor-en-accion/brigadas-medicas", description: "Salud y esperanza para comunidades" },
                  { name: "Ropero", href: "/ministerios/servicio/conexion/amor-en-accion/ropero", description: "Vistiendo con dignidad" },
                  { name: "Navidad Digna", href: "/ministerios/servicio/conexion/amor-en-accion/navidad-digna", description: "Compartiendo la alegría navideña" },
                  { name: "Canasta de Amor", href: "/ministerios/servicio/conexion/amor-en-accion/canasta-de-amor", description: "Alimentando la esperanza" },
                  { name: "Hogar Digno", href: "/ministerios/servicio/conexion/amor-en-accion/hogar-digno", description: "Construyendo esperanza en hogares" },
                ],
              },
              {
                name: "Redes de Amor (Evangelismo)",
                subroutes: [
                  { name: "Pescadores", href: "/ministerios/servicio/conexion/redes-de-amor/pescadores", description: "Sembrando la Palabra" },
                  { name: "Punto de Conexión", href: "/ministerios/servicio/conexion/redes-de-amor/punto-de-conexion", description: "Creando oportunidades" },
                ],
              },
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
              {
                name: "MDA (Ministerios de Apoyo)",
                subroutes: [
                  { name: "Anfitriones", href: "/ministerios/servicio/compromiso/mda/anfitriones", description: "La primera impresión" },
                  { name: "Mesa de Información", href: "/ministerios/servicio/compromiso/mda/mesa-de-informacion", description: "Tu centro de ayuda" },
                  { name: "Santa Cena", href: "/ministerios/servicio/compromiso/mda/santa-cena", description: "Un servicio de reverencia" },
                  { name: "Bautizos", href: "/ministerios/servicio/compromiso/mda/bautizos", description: "Celebrando un nuevo comienzo" },
                  { name: "Visitación y Funerales", href: "/ministerios/servicio/compromiso/mda/visitacion-y-funerales", description: "Acompañando en todo momento" },
                ],
              },
              {
                name: "Oración",
                subroutes: [
                  { name: "Círculos de Oración", href: "/ministerios/servicio/compromiso/oracion/circulos-de-oracion", description: "Orando con propósito" },
                  { name: "Intercesores", href: "/ministerios/servicio/compromiso/oracion/intercesores", description: "Clamando por el Reino" },
                  { name: "Miércoles de Oración", href: "/ministerios/servicio/compromiso/oracion/miercoles-de-oracion", description: "Un tiempo sagrado" },
                ],
              },
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
