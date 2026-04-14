import { normalizeFormKey } from "@/lib/form-response-history";

/**
 * @description Centralized utility to extract the most likely name of a subscriber from form submission data.
 */
export function findNameInSubmission(input: any): string {
  if (!input) return "Inscrito";

  const data = input?.data && typeof input.data === "object" ? input.data : input;
  const answers = Array.isArray(input?.answers)
    ? input.answers
    : Array.isArray(data?.answers)
      ? data.answers
      : [];

  const cleanEntries = [
    ...answers.map((answer: any, idx: number) => ({
      key: answer?.label || answer?.key || `answer-${idx}`,
      cleanKey: normalizeFormKey(answer?.label || answer?.key || "")
        .replace(/_/g, " ")
        .replace(/[^a-z0-9 ]/g, "")
        .trim(),
      value: String(answer?.value ?? "").trim(),
    })),
    ...Object.keys(data ?? {}).map((k) => ({
      key: k,
      cleanKey: normalizeFormKey(k).replace(/_/g, " ").replace(/[^a-z0-9 ]/g, "").trim(),
      value: String(data[k] || "").trim(),
    })),
  ].filter((e) => e.value.length > 2);

  const isLikelyName = (val: string) => {
    if (!val || val.includes('@') || val.includes('http')) return false;
    const digits = val.replace(/\D/g, '');
    if (digits.length > val.length * 0.5) return false;
    return val.split(' ').length >= 1; 
  };

  const identityPatterns = [
    "nombre completo", 
    "nombres y apellidos", 
    "nombre del participante", 
    "nombre del inscrito", 
    "participante", 
    "inscrito", 
    "full name"
  ];

  for (const p of identityPatterns) {
    const found = cleanEntries.find(e => (e.cleanKey === p || e.cleanKey.includes(p)) && isLikelyName(e.value));
    if (found) return found.value;
  }

  const genericFound = cleanEntries.find(e => 
    e.cleanKey.includes("nombre") && 
    !["emergencia", "contacto", "padre", "madre", "representante", "cedula", "email", "banco", "oficina", "papá", "mamá", "amigo", "amiga", "familiar"].some(noise => e.cleanKey.includes(noise)) &&
    isLikelyName(e.value)
  );

  return genericFound ? genericFound.value : "Inscrito";
}
