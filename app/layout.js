import Navbar from "@/components/navbar";
import "./globals.css";
import { Poppins } from "next/font/google";
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-poppins",
});
export const metadata = {
  title: "Iglesia Alianza Puembo",
  description: "Somos una familia de familias",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={poppins.variable}>
      <body className="font-poppins">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
