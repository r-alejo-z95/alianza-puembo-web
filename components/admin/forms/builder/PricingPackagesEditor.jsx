"use client";

import { Plus, Trash2, Users } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const PARTICIPANT_FIELD_TYPES = [
  { value: "text", label: "Texto" },
  { value: "number", label: "Numero" },
  { value: "date", label: "Fecha" },
  { value: "textarea", label: "Texto largo" },
];

export default function PricingPackagesEditor({
  packages = [],
  onPackagesChange,
  collectParticipantDetails = false,
  onCollectParticipantDetailsChange,
  participantTemplate = [],
  onParticipantTemplateChange,
  compact = false,
}) {
  const safePackages = Array.isArray(packages) ? packages : [];
  const safeTemplate = Array.isArray(participantTemplate) ? participantTemplate : [];

  const updatePackage = (index, patch) => {
    onPackagesChange(
      safePackages.map((pkg, currentIndex) =>
        currentIndex === index ? { ...pkg, ...patch } : pkg,
      ),
    );
  };

  const addPackage = () => {
    onPackagesChange([
      ...safePackages,
      {
        id: uuidv4(),
        label: `Opcion ${safePackages.length + 1}`,
        amount: null,
        participant_count: null,
        enabled: true,
      },
    ]);
  };

  const removePackage = (index) => {
    const pkg = safePackages[index];
    if (pkg?.used) {
      updatePackage(index, { enabled: false });
      return;
    }
    onPackagesChange(safePackages.filter((_, currentIndex) => currentIndex !== index));
  };

  const updateTemplateField = (index, patch) => {
    onParticipantTemplateChange(
      safeTemplate.map((field, currentIndex) =>
        currentIndex === index ? { ...field, ...patch } : field,
      ),
    );
  };

  const addTemplateField = () => {
    onParticipantTemplateChange([
      ...safeTemplate,
      {
        id: uuidv4(),
        label: "",
        type: "text",
        required: true,
        placeholder: "",
      },
    ]);
  };

  return (
    <div className={cn("space-y-4", compact ? "text-xs" : "text-sm")}>
      <div className="space-y-3 rounded-2xl border border-amber-100 bg-amber-50/40 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <Label className="text-[10px] font-black uppercase tracking-widest text-amber-800">
              Paquetes de precio
            </Label>
            <p className="mt-1 text-[10px] leading-relaxed text-amber-700/80">
              Cada opcion define el valor esperado de la inscripcion.
            </p>
          </div>
          <Button type="button" size="sm" variant="outline" className="rounded-xl" onClick={addPackage}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Agregar
          </Button>
        </div>

        <div className="space-y-2">
          {safePackages.map((pkg, index) => (
            <div
              key={pkg.id || index}
              className="grid grid-cols-1 gap-2 rounded-xl border border-white bg-white p-3 md:grid-cols-[1fr_8rem_7rem_auto] md:items-center"
            >
              <Input
                value={pkg.label || ""}
                placeholder="Ej: 2 ninos"
                onChange={(event) => updatePackage(index, { label: event.target.value })}
                className="h-10 rounded-xl border-gray-200 text-xs font-semibold"
              />
              <Input
                type="number"
                min={0}
                step="0.01"
                value={pkg.amount ?? ""}
                placeholder="Monto"
                onChange={(event) =>
                  updatePackage(index, { amount: event.target.value ? Number(event.target.value) : null })
                }
                className="h-10 rounded-xl border-gray-200 text-xs font-semibold"
              />
              <Input
                type="number"
                min={1}
                value={pkg.participant_count ?? ""}
                placeholder="Personas"
                onChange={(event) =>
                  updatePackage(index, {
                    participant_count: event.target.value ? Number(event.target.value) : null,
                  })
                }
                className="h-10 rounded-xl border-gray-200 text-xs font-semibold"
              />
              <div className="flex items-center justify-between gap-2 md:justify-end">
                <Switch
                  checked={pkg.enabled !== false}
                  onCheckedChange={(checked) => updatePackage(index, { enabled: checked })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-xl text-red-500"
                  onClick={() => removePackage(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3 rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-start gap-2">
            <Users className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
            <div>
              <Label className="text-[10px] font-black uppercase tracking-widest text-blue-800">
                Pedir datos por participante
              </Label>
              <p className="mt-1 text-[10px] leading-relaxed text-blue-700/80">
                Repite esta plantilla segun la cantidad de personas del paquete.
              </p>
            </div>
          </div>
          <Switch
            checked={!!collectParticipantDetails}
            onCheckedChange={onCollectParticipantDetailsChange}
            className="data-[state=checked]:bg-blue-600"
          />
        </div>

        {collectParticipantDetails && (
          <div className="space-y-2">
            {safeTemplate.map((field, index) => (
              <div
                key={field.id || index}
                className="grid grid-cols-1 gap-2 rounded-xl bg-white p-3 md:grid-cols-[1fr_8rem_auto] md:items-center"
              >
                <Input
                  value={field.label || ""}
                  placeholder="Ej: Nombre completo"
                  onChange={(event) => updateTemplateField(index, { label: event.target.value })}
                  className="h-10 rounded-xl border-gray-200 text-xs font-semibold"
                />
                <select
                  value={field.type || "text"}
                  onChange={(event) => updateTemplateField(index, { type: event.target.value })}
                  className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold"
                >
                  {PARTICIPANT_FIELD_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <div className="flex items-center justify-between gap-2 md:justify-end">
                  <Label className="text-[10px] font-bold text-gray-500">Req.</Label>
                  <Switch
                    checked={field.required !== false}
                    onCheckedChange={(checked) => updateTemplateField(index, { required: checked })}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-xl text-red-500"
                    onClick={() =>
                      onParticipantTemplateChange(
                        safeTemplate.filter((_, currentIndex) => currentIndex !== index),
                      )
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="ghost"
              className="h-10 w-full rounded-xl border border-dashed border-blue-200 text-xs font-black uppercase tracking-widest text-blue-700"
              onClick={addTemplateField}
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Agregar campo de participante
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
