"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Loader2,
  Plus,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getFormResponseAdminPreferences,
  grantFormResponseAdmin,
  revokeFormResponseAdmin,
} from "@/lib/actions/form-response-admins";

export default function FormResponseAccessManager() {
  const [forms, setForms] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfiles, setSelectedProfiles] = useState({});
  const [savingKey, setSavingKey] = useState(null);

  const loadPreferences = async () => {
    setLoading(true);
    const result = await getFormResponseAdminPreferences();
    if (!result.ok) {
      toast.error(result.error || "No se pudo cargar el acceso por formulario.");
      setLoading(false);
      return;
    }

    setForms(result.forms || []);
    setProfiles(result.profiles || []);
    setLoading(false);
  };

  useEffect(() => {
    loadPreferences();
  }, []);

  const profilesById = useMemo(
    () => new Map(profiles.map((profile) => [profile.id, profile])),
    [profiles],
  );

  const getAssignedIds = (form) =>
    new Set(
      (form.form_response_admins || [])
        .map((entry) => entry.profile_id)
        .filter(Boolean),
    );

  const getAssignableProfiles = (form) => {
    const assignedIds = getAssignedIds(form);
    return profiles.filter(
      (profile) => profile.id !== form.user_id && !assignedIds.has(profile.id),
    );
  };

  const handleGrant = async (form) => {
    const profileId = selectedProfiles[form.id];
    if (!profileId) {
      toast.error("Escoge un admin para asignar.");
      return;
    }

    setSavingKey(`${form.id}:${profileId}:grant`);
    const result = await grantFormResponseAdmin(form.id, profileId);
    setSavingKey(null);

    if (!result.ok) {
      toast.error(result.error || "No se pudo asignar el acceso.");
      return;
    }

    toast.success("Acceso asignado.");
    setSelectedProfiles((current) => ({ ...current, [form.id]: "" }));
    await loadPreferences();
  };

  const handleRevoke = async (formId, profileId) => {
    setSavingKey(`${formId}:${profileId}:revoke`);
    const result = await revokeFormResponseAdmin(formId, profileId);
    setSavingKey(null);

    if (!result.ok) {
      toast.error(result.error || "No se pudo quitar el acceso.");
      return;
    }

    toast.success("Acceso removido.");
    await loadPreferences();
  };

  return (
    <Card className="border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden">
      <div className="bg-black p-8">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-5 h-5 text-[var(--puembo-green)]" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60">
            Acceso a analíticas por formulario
          </span>
        </div>
      </div>
      <CardContent className="p-8 md:p-10">
        {loading ? (
          <div className="flex items-center justify-center py-10 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : (
          <div className="space-y-5">
            {forms.map((form) => {
              const assignableProfiles = getAssignableProfiles(form);

              return (
                <div
                  key={form.id}
                  className="rounded-[2rem] border border-gray-100 bg-gray-50/40 p-5 space-y-4"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="space-y-2">
                      <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest">
                        {form.title}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        <Badge
                          variant="secondary"
                          className="rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest"
                        >
                          <UserRound className="w-3 h-3 mr-1" />
                          Creador:{" "}
                          {form.profiles?.full_name ||
                            form.profiles?.email ||
                            "Sin perfil"}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex gap-2 w-full lg:w-auto">
                      <select
                        value={selectedProfiles[form.id] || ""}
                        onChange={(event) =>
                          setSelectedProfiles((current) => ({
                            ...current,
                            [form.id]: event.target.value,
                          }))
                        }
                        className="min-w-0 flex-1 lg:w-64 h-11 rounded-xl bg-white border border-gray-200 px-3 text-xs font-bold text-gray-700 outline-none"
                      >
                        <option value="">Seleccionar admin</option>
                        {assignableProfiles.map((profile) => (
                          <option key={profile.id} value={profile.id}>
                            {profile.full_name || profile.email}
                          </option>
                        ))}
                      </select>
                      <Button
                        type="button"
                        variant="green"
                        className="h-11 rounded-xl px-4"
                        onClick={() => handleGrant(form)}
                        disabled={savingKey?.startsWith(`${form.id}:`)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {(form.form_response_admins || []).length === 0 ? (
                      <span className="text-[11px] font-medium text-gray-400">
                        Sin admins delegados.
                      </span>
                    ) : (
                      form.form_response_admins.map((entry) => {
                        const profile =
                          entry.profiles || profilesById.get(entry.profile_id);
                        const key = `${form.id}-${entry.profile_id}`;

                        return (
                          <span
                            key={key}
                            className="inline-flex items-center gap-2 rounded-full bg-white border border-gray-200 pl-3 pr-1 py-1"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-[var(--puembo-green)]" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">
                              {profile?.full_name || profile?.email || "Admin"}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                handleRevoke(form.id, entry.profile_id)
                              }
                              disabled={
                                savingKey ===
                                `${form.id}:${entry.profile_id}:revoke`
                              }
                              className="h-7 w-7 inline-flex items-center justify-center rounded-full text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                              title="Quitar acceso"
                            >
                              {savingKey ===
                              `${form.id}:${entry.profile_id}:revoke` ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Trash2 className="w-3 h-3" />
                              )}
                            </button>
                          </span>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
