const identityPatterns = [
  "nombre y apellido",
  "nombre completo",
  "nombres y apellidos",
  "nombre del participante",
  "nombre del inscrito",
  "participante",
  "inscrito",
  "full name",
];

const noisePatterns = [
  "emergencia",
  "contacto",
  "padre",
  "madre",
  "representante",
  "cedula",
  "email",
  "banco",
  "oficina",
  "papa",
  "mama",
  "amigo",
  "amiga",
  "familiar",
];

function normalizeNameKey(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeNameScalar(value) {
  if (typeof value !== "string" && typeof value !== "number") return "";

  const text = String(value).trim();
  if (
    !text ||
    text === "[object Object]" ||
    text.includes("@") ||
    /https?:\/\//i.test(text)
  ) {
    return "";
  }

  const digits = text.replace(/\D/g, "");
  if (text.length <= 2 || digits.length > text.length * 0.5) return "";

  return text;
}

function isFileLikeValue(value) {
  return Boolean(
    value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      (value._type === "file" || value.financial_receipt_path || value.receipt_path),
  );
}

function uniqueNames(values) {
  const seen = new Set();
  const names = [];

  for (const value of values) {
    const name = normalizeNameScalar(value);
    const key = normalizeNameKey(name);
    if (!name || !key || seen.has(key)) continue;
    seen.add(key);
    names.push(name);
  }

  return names;
}

function findCandidatesInAnswers(answers) {
  const entries = Object.entries(answers || {}).map(([key, value]) => ({
    cleanKey: normalizeNameKey(key),
    value,
  }));

  for (const pattern of identityPatterns) {
    const preferred = entries.find(
      (entry) =>
        (entry.cleanKey === pattern || entry.cleanKey.includes(pattern)) &&
        extractNameCandidates(entry.value).length > 0,
    );
    if (preferred) return extractNameCandidates(preferred.value);
  }

  const generic = entries.find(
    (entry) =>
      entry.cleanKey.includes("nombre") &&
      !noisePatterns.some((noise) => entry.cleanKey.includes(noise)) &&
      extractNameCandidates(entry.value).length > 0,
  );

  return generic ? extractNameCandidates(generic.value) : [];
}

function extractNameCandidates(value) {
  const scalar = normalizeNameScalar(value);
  if (scalar) return [scalar];

  if (Array.isArray(value)) {
    return uniqueNames(value.flatMap(extractNameCandidates));
  }

  if (!value || typeof value !== "object" || isFileLikeValue(value)) return [];

  if (value.answers && typeof value.answers === "object" && !Array.isArray(value.answers)) {
    const answerCandidates = findCandidatesInAnswers(value.answers);
    if (answerCandidates.length > 0) return answerCandidates;
  }

  for (const key of ["nombre", "full_name", "fullName", "value"]) {
    const candidates = extractNameCandidates(value[key]);
    if (candidates.length > 0) return candidates;
  }

  return [];
}

export function findNamesInSubmission(input) {
  if (!input || typeof input !== "object") return [];

  const participantNames = uniqueNames(
    (Array.isArray(input.participant_details) ? input.participant_details : []).flatMap(
      extractNameCandidates,
    ),
  );
  if (participantNames.length > 0) return participantNames;

  const data = input.data && typeof input.data === "object" && !Array.isArray(input.data)
    ? input.data
    : input;
  const answers = Array.isArray(input.answers)
    ? input.answers
    : Array.isArray(data.answers)
      ? data.answers
      : [];
  const entries = [
    ...answers.map((answer, index) => ({
      cleanKey: normalizeNameKey(answer?.label || answer?.key || `answer-${index}`),
      value: answer?.value,
    })),
    ...Object.entries(data).map(([key, value]) => ({
      cleanKey: normalizeNameKey(key),
      value,
    })),
  ];

  for (const pattern of identityPatterns) {
    const preferred = entries.find(
      (entry) =>
        (entry.cleanKey === pattern || entry.cleanKey.includes(pattern)) &&
        extractNameCandidates(entry.value).length > 0,
    );
    if (preferred) return uniqueNames(extractNameCandidates(preferred.value));
  }

  const generic = entries.find(
    (entry) =>
      entry.cleanKey.includes("nombre") &&
      !noisePatterns.some((noise) => entry.cleanKey.includes(noise)) &&
      extractNameCandidates(entry.value).length > 0,
  );

  return generic ? uniqueNames(extractNameCandidates(generic.value)) : [];
}

export function findNameInSubmission(input, options = {}) {
  const { fallback = "Inscrito", separator = ", " } = options;
  return findNamesInSubmission(input).join(separator) || fallback;
}
