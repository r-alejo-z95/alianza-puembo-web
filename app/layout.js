import NavbarWrapper from "@/components/navbarWrapper";
import Footer from "@/components/footer";
import "./globals.css";
import { Poppins, Merriweather } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { esMX } from "@clerk/localizations";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-poppins",
});

const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-merriweather",
});

export const metadata = {
  title: "Iglesia Alianza Puembo",
  description: "Somos una familia de familias",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider localization={esMX}>
      <html
        lang="es"
        className={`${poppins.variable} ${merriweather.variable}`}
      >
        <body className="font-poppins">
          <NavbarWrapper />
          {children}
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}
