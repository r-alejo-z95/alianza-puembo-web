'use client';

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

export default function AdminHomePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    fetchUser();
  }, []);

  if (loading) {
    return <p>Cargando...</p>;
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Hola, {user?.user_metadata?.full_name || user?.email || 'Admin'}!</h2>
      <p className="text-lg">
        Desde aquí podrás gestionar el contenido de la página web.
      </p>
      <p className="mt-4">Selecciona una opción del menú de la izquierda para comenzar.</p>
    </div>
  );
}