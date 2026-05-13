"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { revalidateProfiles, revalidateSettings } from "@/lib/actions/cache";
import { updateTeamProfileField } from "@/lib/actions/admin-profiles";

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

  const updateProfileField = async (profileId, field, value) => {
    console.log(`Updating profile ${profileId}: ${field} = ${value}`);

    const result = await updateTeamProfileField(profileId, field, value);

    if (!result.ok) {
      console.error("Error updating profile:", result.error);
      toast.error(`Error: ${result.error}`);
      return false;
    }

    setProfiles(prev => prev.map(p => p.id === profileId ? { ...p, [field]: result.value } : p));
    toast.success("Cambio guardado en la base de datos.");
    await revalidateProfiles(); // Revalidate server cache
    return true;
  };

  const updateSiteSettings = async (updates) => {
    console.log("Updating site settings:", updates);
    
    const { error, status } = await supabase
      .from("site_settings")
      .update(updates)
      .eq("id", 1);

    if (error) {
      console.error("Supabase Error updating settings:", error);
      toast.error(`Error: ${error.message}`);
      return false;
    }

    if (status === 204 || status === 200) {
      setSiteSettings(prev => ({ ...prev, ...updates }));
      toast.success("Ajustes globales actualizados.");
      await revalidateSettings(); // Revalidate server cache
      return true;
    }
    
    return false;
  };

  return {
    profiles,
    siteSettings,
    loading,
    updateProfileField,
    updateSiteSettings,
    refetch: () => Promise.all([fetchProfiles(), fetchSettings()])
  };
}
