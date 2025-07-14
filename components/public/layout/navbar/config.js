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
      { name: "Puembo Kids", href: "/ministerios/puembo-kids", description: "Iglesia para los más pequeños" },
      { name: "Jóvenes", href: "/ministerios/jovenes", description: "Espacio para adolescentes y jóvenes" },
      { name: "Música, artes, tecnología", href: "/ministerios/mat", description: "Expresiones creativas al servicio de Dios" },
      { name: "Grupos Pequeños", href: "/ministerios/gp", description: "Conéctate en comunidad más cerca" },
      { name: "Misión Dignidad", href: "/ministerios/mision-dignidad", description: "Ayudamos a personas en situación vulnerable" },
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
        description: "Escucha mensajes que transforman"
      },
      {
        name: "Lee, Ora, Medita",
        href: "/recursos/lom",
        description: "Guías diarias para tu devoción personal"
      },
      {
        name: "Galería",
        href: "https://iglesiaalianzapuembo.pixieset.com/",
        description: "Revive los mejores momentos en imágenes"
      },
    ],
  },
  { name: "Donaciones", href: "/donaciones" },
  { name: "Oración", href: "/oracion" },
  { name: "Contacto", href: "/contacto" },
];
