const STOP_WORDS = new Set([
  "a",
  "al",
  "de",
  "del",
  "el",
  "en",
  "formulario",
  "la",
  "las",
  "los",
  "para",
  "por",
  "un",
  "una",
  "y",
  "con",
]);

export function normalizeFormShortCode(input) {
  return String(input || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeMinimumLength(code) {
  if (!code) return "form";
  if (code.length >= 3) return code;
  return `${code}-form`;
}

export function generateFormShortCode(title) {
  const words = normalizeFormShortCode(title)
    .split("-")
    .filter((word) => word && !STOP_WORDS.has(word));

  const parts = words.map((word) => {
    if (/^\d+$/.test(word)) return word;
    if (word.length <= 3) return word;
    return word.slice(0, 3);
  });

  const code = normalizeMinimumLength(parts.join("-"));
  return code.slice(0, 40).replace(/-+$/g, "");
}

export function isValidFormShortCode(code) {
  return (
    typeof code === "string" &&
    code.length >= 3 &&
    code.length <= 40 &&
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(code)
  );
}

export function applyShortCodeSuffix(base, suffix) {
  if (!Number.isInteger(suffix) || suffix < 2) {
    throw new Error("El sufijo debe ser un entero mayor o igual a 2.");
  }

  const suffixText = `-${suffix}`;
  const normalizedBase = normalizeMinimumLength(normalizeFormShortCode(base));
  const maxBaseLength = 40 - suffixText.length;
  const trimmedBase = normalizedBase.slice(0, maxBaseLength).replace(/-+$/g, "");
  return `${trimmedBase}${suffixText}`;
}

export function getFormShortUrl(shortCode, origin) {
  const cleanOrigin = String(origin || "").replace(/\/+$/g, "");
  return `${cleanOrigin}/f/${normalizeFormShortCode(shortCode)}`;
}

export async function findAvailableFormShortCode(supabase, titleOrCode, options = {}) {
  const base = options.inputIsCode
    ? normalizeFormShortCode(titleOrCode)
    : generateFormShortCode(titleOrCode);

  if (!isValidFormShortCode(base)) {
    throw new Error("El codigo corto debe tener entre 3 y 40 caracteres: letras minusculas, numeros y guiones.");
  }

  for (let attempt = 1; attempt <= 100; attempt += 1) {
    const candidate = attempt === 1 ? base : applyShortCodeSuffix(base, attempt);
    let query = supabase
      .from("forms")
      .select("id")
      .eq("short_code", candidate)
      .limit(1);

    if (options.excludeId) {
      query = query.neq("id", options.excludeId);
    }

    const { data, error } = await query.maybeSingle();
    if (error) throw error;
    if (!data) return candidate;
  }

  throw new Error("No se pudo encontrar un codigo corto disponible.");
}
