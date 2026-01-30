"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

/**
 * Hook para gestionar perfiles de equipo y ajustes globales (Solo Super Admin)
 */
export function useAdminProfiles() {
  const [profiles, setProfiles] = useState([]);
  const [siteSettings, setSiteSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchProfiles = useCallback(async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("full_name", { ascending: true });

    if (error) {
      console.error("Error fetching profiles:", error);
      toast.error("Error al cargar el equipo.");
    } else {
      setProfiles(data);
    }
  }, [supabase]);

  const fetchSettings = useCallback(async () => {
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .eq("id", 1)
      .single();

    if (error) {
      console.error("Error fetching site settings:", error);
    } else {
      setSiteSettings(data);
    }
  }, [supabase]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      await Promise.all([fetchProfiles(), fetchSettings()]);
      setLoading(false);
    }
    loadData();
  }, [fetchProfiles, fetchSettings]);

  const updateProfilePermission = async (profileId, permission, value) => {
    const { error } = await supabase
      .from("profiles")
      .update({ [permission]: value })
      .eq("id", profileId);

    if (error) {
      toast.error("Error al actualizar permiso.");
      return false;
    }
    
    setProfiles(prev => prev.map(p => p.id === profileId ? { ...p, [permission]: value } : p));
    toast.success("Permiso actualizado.");
    return true;
  };

  const updateSiteSettings = async (updates) => {
    const { error } = await supabase
      .from("site_settings")
      .update(updates)
      .eq("id", 1);

    if (error) {
      toast.error("Error al actualizar ajustes globales.");
      return false;
    }

    setSiteSettings(prev => ({ ...prev, ...updates }));
    toast.success("Ajustes globales actualizados.");
    return true;
  };

  return {
    profiles,
    siteSettings,
    loading,
    updateProfilePermission,
    updateSiteSettings,
    refetch: () => Promise.all([fetchProfiles(), fetchSettings()])
  };
}
