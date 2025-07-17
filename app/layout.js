import RootLayoutClient from "@/components/public/layout/RootLayoutClient";
import "@/app/globals.css";
import { poppins, merriweather } from '@/lib/fonts';




export const metadata = {
  metadataBase: new URL("https://www.alianzapuembo.org"),
  title: {
    template: "%s | Alianza Puembo",
    default: "Alianza Puembo - Una Familia de Familias",
  },
  description:
    "Somos una comunidad cristiana en Puembo, Ecuador, comprometida con el amor, la enseñanza bíblica y el servicio a quienes nos rodean.",
  openGraph: {
    title: {
      template: "%s | Alianza Puembo",
      default: "Alianza Puembo - Una Familia de Familias",
    },
    description:
      "Somos una comunidad cristiana en Puembo, Ecuador, comprometida con el amor, la enseñanza bíblica y el servicio a quienes nos rodean.",
    url: "https://www.alianzapuembo.org",
    siteName: "Alianza Puembo",
    images: [
      {
        url: "/brand/logo-puembo.png", // Relative to metadataBase
        width: 1200,
        height: 630,
        alt: "Logo de Alianza Puembo",
      },
    ],
    locale: "es_EC",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: {
      template: "%s | Alianza Puembo",
      default: "Alianza Puembo - Una Familia de Familias",
    },
    description:
      "Somos una comunidad cristiana en Puembo, Ecuador, comprometida con el amor, la enseñanza bíblica y el servicio a quienes nos rodean.",
    images: ["/brand/logo-puembo.png"], // Relative to metadataBase
  },
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/icons/apple-touch-icon.png", // Assuming you have this icon
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${poppins.variable} ${merriweather.variable}`}>
      <body className="font-sans">
        <RootLayoutClient>{children}</RootLayoutClient>
        </body>
    </html>
  );
}
