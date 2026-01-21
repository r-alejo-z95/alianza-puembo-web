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
    name: "Involúcrate",
    subroutes: [
      { name: "Ruta", href: "/involucrate/ruta", description: "Descubre tu camino en la fe" },
      {
        name: "Ministerios",
        href: "/involucrate/ministerios",
        description: "Encuentra tu lugar para crecer y servir",
        subroutes: [
          {
            name: "Cuidado",
            href: "/ministerios/cuidado",
            description: "Un abrazo para el alma: ministerios donde recibes",
            subroutes: [
              {
                name: "Grupos Pequeños",
                subroutes: [
                  { name: "GP Familiares", href: "/ministerios/gp-familiar", description: "Creciendo juntos en familia" },
                  { name: "GP Legado (Varones)", href: "/ministerios/gp-legado", description: "Forjando hombres de valor" },
                  { name: "GP Juntas (Mujeres)", href: "/ministerios/gp-juntas", description: "Creciendo en comunidad femenina" },
                  { name: "GP Ministeriales", href: "/ministerios/gp-ministeriales", description: "Cuidando a los que cuidan" },
                ],
              },
              { name: "Jóvenes", href: "/ministerios/jovenes", description: "Espacio para adolescentes y jóvenes" },
              { name: "Puembo Kids", href: "/ministerios/puembo-kids", description: "Iglesia para los más pequeños" },
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
                      { name: "Alma (Matrimonios)", href: "/ministerios/alma", description: "Uniendo corazones" },
                      { name: "Legado (Varones)", href: "/ministerios/legado", description: "Hombres con propósito" },
                      { name: "Cautivante (Mujeres)", href: "/ministerios/cautivante", description: "Descubre tu valor" },
                      { name: "Eje (Jóvenes)", href: "/ministerios/eje", description: "El punto de encuentro de la nueva generación" },
                    ],
                  },
                  {
                    name: "Amor en Acción",
                    subroutes: [
                      { name: "Misión Dignidad", href: "/ministerios/mision-dignidad", description: "Nuestro brazo social principal" },
                      { name: "Brigadas Médicas", href: "/ministerios/brigadas-medicas", description: "Salud y esperanza para comunidades" },
                      { name: "Boutique de Moda Circular", href: "/ministerios/boutique", description: "Vistiendo con dignidad" },
                      { name: "Navidad Digna", href: "/ministerios/navidad-digna", description: "Ocurre una vez al año" },
                      { name: "Canasta de Amor", href: "/ministerios/canasta-de-amor", description: "Exclusivo para miembros de la iglesia" },
                      { name: "Hogar Digno", href: "/ministerios/hogar-digno", description: "Construyendo esperanza en hogares" },
                    ],
                  },
                  {
                    name: "Redes de Amor (Evangelismo)",
                    subroutes: [
                      { name: "Pescadores", href: "/ministerios/pescadores", description: "Sembrando la Palabra" },
                      { name: "Punto de Conexión", href: "/ministerios/punto-conexion", description: "Conecta personas nuevas con la comunidad" },
                    ],
                  },
                ],
              },
              {
                name: "Crecimiento",
                subroutes: [
                  { name: "Academia Bíblica", href: "/ministerios/academia-biblica", description: "Profundizando en la Palabra" },
                  { name: "Decisiones", href: "/ministerios/decisiones", description: "Restauración y nueva vida" },
                  { name: "Cultura Financiera", href: "/ministerios/cultura-financiera", description: "Administrando con sabiduría" },
                  { name: "Encuentros de Sanidad para hombres y mujeres", href: "/ministerios/sanidad", description: "Restaurando el corazón" },
                ],
              },
              {
                name: "Compromiso",
                subroutes: [
                  { name: "MAT (Música, Artes y Tecnología)", href: "/ministerios/mat", description: "Adoración, arte y tecnología" },
                  {
                    name: "MDA (Ministerios de Apoyo)",
                    subroutes: [
                      { name: "Anfitriones", href: "/ministerios/anfitriones", description: "La primera impresión" },
                      { name: "Punto de Información", href: "/ministerios/punto-informacion", description: "Tu centro de ayuda" },
                      { name: "Santa Cena", href: "/ministerios/santa-cena", description: "Un servicio de reverencia" },
                      { name: "Bautizos", href: "/ministerios/bautizos", description: "Celebrando un nuevo comienzo" },
                      { name: "Visitación y Acompañamiento", href: "/ministerios/acompanamiento", description: "Acompañando en todo momento" },
                    ],
                  },
                  {
                    name: "Oración",
                    subroutes: [
                      { name: "Círculos de Oración", href: "/ministerios/circulos-oracion", description: "Intercesión comunitaria vía Zoom" },
                      { name: "Intercesores", href: "/ministerios/intercesores", description: "Clamando por el Reino" },
                      { name: "Miércoles de Oración", href: "/ministerios/miercoles-oracion", description: "Cada miércoles a las 06h30" },
                    ],
                  },
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
        description: "Ve y escucha mensajes que transforman",
        external: true,
      },
      {
        name: "LOM: Lee, Ora, Medita",
        href: "/recursos/lom",
        description: "Guías diarias para tu devocional personal"
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
