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
    position: "left",
    name: "Conócenos",
    subroutes: [
      { name: "Equipo", href: "/conocenos/equipo" },
      { name: "¿En qué creemos?", href: "/conocenos/que-creemos" },
    ],
  },
  {
    position: "left",
    name: "Eventos",
    subroutes: [
      { name: "Próximos eventos", href: "/eventos/proximos-eventos" },
      { name: "Calendario", href: "/eventos/calendario" },
    ],
  },
  {
    position: "left",
    name: "Ministerios",
    subroutes: [
      { name: "Puembo Kids", href: "/ministerios/puembo-kids" },
      { name: "Jóvenes", href: "/ministerios/jovenes" },
      { name: "Música, artes, tecnología", href: "/ministerios/mat" },
      { name: "Grupos Pequeños", href: "/ministerios/gp" },
      { name: "Misión Dignidad", href: "/ministerios/mision-dignidad" },
    ],
  },
  {
    position: "left",
    name: "Noticias",
    href: "/noticias",
  },
  {
    position: "right",
    name: "Recursos",
    subroutes: [
      {
        name: "Prédicas",
        href: "https://www.youtube.com/@IglesiaAlianzaPuembo/playlists",
      },
      { name: "Lee, Ora, Medita", href: "/recursos/lom" },
      { name: "Galería", href: "https://iglesiaalianzapuembo.pixieset.com/" },
    ],
  },
  { position: "right", name: "Donaciones", href: "/donaciones" },
  { position: "right", name: "Oración", href: "/oracion" },
  { position: "right", name: "Contacto", href: "/contacto" },
];
