import "./globals.css";

export const metadata = {
  title: "Iglesia Alianza Puembo",
  description: "Somos una familia de familias",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
