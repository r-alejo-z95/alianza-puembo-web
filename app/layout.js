import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import "./globals.css";
import { Poppins, Merriweather } from "next/font/google";

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
    <html lang="es" className={`${poppins.variable} ${merriweather.variable}`}>
      <body className="font-poppins">
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
