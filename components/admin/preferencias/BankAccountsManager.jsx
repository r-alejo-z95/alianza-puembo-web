"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Landmark, Plus, Save, X } from "lucide-react";

const EMPTY_FORM = {
  bank_name: "",
  account_holder: "",
  account_number: "",
  account_type: "",
  ruc: "",
  notes: "",
  is_active: true,
};

export default function BankAccountsManager() {
  const supabase = createClient();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formState, setFormState] = useState(EMPTY_FORM);

  const sortedAccounts = useMemo(
    () =>
      [...accounts].sort((a, b) => {
        if (a.is_active === b.is_active) {
          return (a.bank_name || "").localeCompare(b.bank_name || "");
        }
        return a.is_active ? -1 : 1;
      }),
    [accounts],
  );

  const resetForm = () => {
    setFormState(EMPTY_FORM);
    setCreating(false);
    setEditingId(null);
  };

  const fetchAccounts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("bank_accounts")
      .select("*")
      .order("bank_name", { ascending: true });

    if (error) {
      toast.error("No se pudieron cargar las cuentas bancarias.");
      setAccounts([]);
    } else {
      setAccounts(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const validateForm = () => {
    if (!formState.bank_name.trim()) return "El banco es obligatorio.";
    if (!formState.account_holder.trim()) return "El titular es obligatorio.";
    if (!formState.account_number.trim()) return "El número de cuenta es obligatorio.";
    if (!formState.account_type.trim()) return "El tipo de cuenta es obligatorio.";
    return null;
  };

  const handleCreate = async () => {
    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setSaving(true);
    const payload = {
      bank_name: formState.bank_name.trim(),
      account_holder: formState.account_holder.trim(),
      account_number: formState.account_number.trim(),
      account_type: formState.account_type.trim(),
      ruc: formState.ruc?.trim() || null,
      notes: formState.notes?.trim() || null,
      is_active: !!formState.is_active,
    };

    const { error } = await supabase.from("bank_accounts").insert([payload]);
    setSaving(false);

    if (error) {
      toast.error("No se pudo crear la cuenta bancaria.");
      return;
    }

    toast.success("Cuenta bancaria creada.");
    resetForm();
    fetchAccounts();
  };

  const startEdit = (account) => {
    setCreating(false);
    setEditingId(account.id);
    setFormState({
      bank_name: account.bank_name || "",
      account_holder: account.account_holder || "",
      account_number: account.account_number || "",
      account_type: account.account_type || "",
      ruc: account.ruc || "",
      notes: account.notes || "",
      is_active: !!account.is_active,
    });
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setSaving(true);
    const payload = {
      bank_name: formState.bank_name.trim(),
      account_holder: formState.account_holder.trim(),
      account_number: formState.account_number.trim(),
      account_type: formState.account_type.trim(),
      ruc: formState.ruc?.trim() || null,
      notes: formState.notes?.trim() || null,
      is_active: !!formState.is_active,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("bank_accounts")
      .update(payload)
      .eq("id", editingId);

    setSaving(false);
    if (error) {
      toast.error("No se pudo actualizar la cuenta.");
      return;
    }

    toast.success("Cuenta bancaria actualizada.");
    resetForm();
    fetchAccounts();
  };

  const toggleActive = async (account) => {
    const { error } = await supabase
      .from("bank_accounts")
      .update({ is_active: !account.is_active, updated_at: new Date().toISOString() })
      .eq("id", account.id);

    if (error) {
      toast.error("No se pudo actualizar el estado.");
      return;
    }

    setAccounts((prev) =>
      prev.map((item) =>
        item.id === account.id ? { ...item, is_active: !item.is_active } : item,
      ),
    );
    toast.success(!account.is_active ? "Cuenta habilitada." : "Cuenta deshabilitada.");
  };

  const isEditing = !!editingId;

  return (
    <Card className="border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden">
      <div className="bg-black p-8">
        <div className="flex items-center gap-3">
          <Landmark className="w-5 h-5 text-[var(--puembo-green)]" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60">
            Cuentas Bancarias
          </span>
        </div>
      </div>
      <CardContent className="p-8 md:p-10 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p className="text-[11px] text-gray-500 leading-relaxed max-w-xl">
            Gestiona las cuentas destino usadas en formularios financieros. Solo las cuentas activas aparecen en el wizard de configuración inicial.
          </p>
          {!creating && !isEditing && (
            <Button
              onClick={() => {
                setCreating(true);
                setEditingId(null);
                setFormState(EMPTY_FORM);
              }}
              variant="outline"
              className="rounded-full border-gray-200 text-xs font-black uppercase tracking-widest h-10 px-5"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Nueva Cuenta
            </Button>
          )}
        </div>

        {(creating || isEditing) && (
          <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-gray-400 uppercase">Banco</Label>
                <Input
                  value={formState.bank_name}
                  onChange={(e) => setFormState((p) => ({ ...p, bank_name: e.target.value }))}
                  placeholder="Banco Pichincha"
                  className="h-11 rounded-xl bg-white border-gray-200"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-gray-400 uppercase">Titular</Label>
                <Input
                  value={formState.account_holder}
                  onChange={(e) =>
                    setFormState((p) => ({ ...p, account_holder: e.target.value }))
                  }
                  placeholder="Iglesia Alianza Puembo"
                  className="h-11 rounded-xl bg-white border-gray-200"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-gray-400 uppercase">Número</Label>
                <Input
                  value={formState.account_number}
                  onChange={(e) =>
                    setFormState((p) => ({ ...p, account_number: e.target.value }))
                  }
                  placeholder="2208033009"
                  className="h-11 rounded-xl bg-white border-gray-200"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-gray-400 uppercase">Tipo</Label>
                <Input
                  value={formState.account_type}
                  onChange={(e) =>
                    setFormState((p) => ({ ...p, account_type: e.target.value }))
                  }
                  placeholder="Ahorros / Corriente"
                  className="h-11 rounded-xl bg-white border-gray-200"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-gray-400 uppercase">RUC</Label>
                <Input
                  value={formState.ruc}
                  onChange={(e) =>
                    setFormState((p) => ({ ...p, ruc: e.target.value }))
                  }
                  placeholder="0991263217001"
                  className="h-11 rounded-xl bg-white border-gray-200"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-gray-400 uppercase">Notas</Label>
              <Input
                value={formState.notes}
                onChange={(e) => setFormState((p) => ({ ...p, notes: e.target.value }))}
                placeholder="Opcional"
                className="h-11 rounded-xl bg-white border-gray-200"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
              <span className="text-xs font-bold text-gray-600">Cuenta activa</span>
              <Switch
                checked={formState.is_active}
                onCheckedChange={(checked) =>
                  setFormState((p) => ({ ...p, is_active: checked }))
                }
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                disabled={saving}
                onClick={isEditing ? handleUpdate : handleCreate}
                className="rounded-full text-xs font-black uppercase tracking-widest h-10 px-5"
                variant="green"
              >
                {saving ? (
                  <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5 mr-1" />
                )}
                {isEditing ? "Guardar Cambios" : "Crear Cuenta"}
              </Button>
              <Button
                disabled={saving}
                onClick={resetForm}
                variant="outline"
                className="rounded-full border-gray-200 text-xs font-black uppercase tracking-widest h-10 px-5"
              >
                <X className="w-3.5 h-3.5 mr-1" />
                Cancelar
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs font-bold">Cargando cuentas...</span>
            </div>
          ) : sortedAccounts.length === 0 ? (
            <div className="p-8 bg-gray-50 rounded-[2rem] border border-dashed border-gray-200 text-center">
              <p className="text-[11px] text-gray-500">
                Aún no hay cuentas registradas. Crea una para habilitar formularios financieros.
              </p>
            </div>
          ) : (
            sortedAccounts.map((account) => (
              <div
                key={account.id}
                className="p-5 rounded-2xl border border-gray-100 bg-white shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              >
                <div className="space-y-1">
                  <p className="text-sm font-bold text-gray-900">{account.bank_name}</p>
                  <p className="text-[11px] text-gray-600">
                    {account.account_holder} - {account.account_type}
                  </p>
                  <p className="text-[11px] text-gray-500">Cuenta: {account.account_number}</p>
                  {account.ruc && (
                    <p className="text-[11px] text-gray-500">RUC: {account.ruc}</p>
                  )}
                  {account.notes && (
                    <p className="text-[11px] text-gray-400 italic">{account.notes}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => startEdit(account)}
                    variant="outline"
                    className="rounded-full border-gray-200 text-[10px] font-black uppercase tracking-widest h-9 px-4"
                  >
                    Editar
                  </Button>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-200">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                      {account.is_active ? "Activa" : "Inactiva"}
                    </span>
                    <Switch
                      checked={account.is_active}
                      onCheckedChange={() => toggleActive(account)}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
