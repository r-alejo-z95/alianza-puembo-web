import RootLayoutClient from "./root-layout-client";

export const metadata = {
  title: "Alianza Puembo",
  description: "Sitio web oficial de la iglesia Alianza Puembo",
};

export default function RootLayout({ children }) {
  return <RootLayoutClient>{children}</RootLayoutClient>;
}
