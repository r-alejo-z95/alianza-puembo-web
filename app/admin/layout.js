
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Home, Calendar, BookOpen, HandHelping } from "lucide-react";

const navLinks = [
  { href: "/admin", label: "Inicio", icon: Home },
  { href: "/admin/eventos", label: "Eventos", icon: Calendar },
  { href: "/admin/lom", label: "Devocionales", icon: BookOpen },
  { href: "/admin/oracion", label: "Peticiones", icon: HandHelping },
];

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-gray-800 text-white p-4 flex flex-col">
        <h1 className="text-2xl font-bold mb-8">Admin Dashboard</h1>
        <nav className="flex flex-col space-y-2 flex-grow">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-700 transition-colors">
              <link.icon className="h-5 w-5" />
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-4">
          <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-700 transition-colors">
            <Home className="h-5 w-5" />
            Ir a Página Principal
          </Link>
          <UserButton signOutFallbackRedirectUrl="/" />
        </div>
      </aside>
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
