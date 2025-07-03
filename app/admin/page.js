
'use client';

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { adminPageSection, adminPageHeaderContainer, pageTitle, pageDescription } from "@/lib/styles";

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
    <section className={adminPageSection}>
      <div className={adminPageHeaderContainer}>
      <h1 className={pageTitle}>
        Bienvenido al Panel de Administración
      </h1>
      <p className={pageDescription}>
        Hola, {user?.user_metadata?.full_name || user?.email || 'Admin'}! Desde aquí podrás gestionar el contenido de la página web.<br />
        Selecciona una opción del menú de la izquierda para comenzar.
      </p>
      </div>
    </section>
    );
}
