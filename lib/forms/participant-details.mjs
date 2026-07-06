import { validateFieldValue } from "./field-validation.mjs";

function normalizeScalar(value) {
  if (value === null || value === undefined) return "";
  if (["string", "number", "boolean"].includes(typeof value)) {
    return String(value).trim();
  }
  return "";
}

export function normalizeParticipantDetails(participantDetails = []) {
  return (Array.isArray(participantDetails) ? participantDetails : []).map(
    (participant, index) => ({
      index: Number(participant?.index) > 0 ? Number(participant.index) : index + 1,
      answers: Object.fromEntries(
        Object.entries(
          participant?.answers && typeof participant.answers === "object"
            ? participant.answers
            : {},
        )
          .map(([label, value]) => [String(label).trim(), normalizeScalar(value)])
          .filter(([label]) => label),
      ),
    }),
  );
}

export function validateParticipantDetails({
  participantDetails = [],
  participantTemplate = [],
  expectedCount = 0,
} = {}) {
  const incoming = normalizeParticipantDetails(participantDetails);
  const template = Array.isArray(participantTemplate) ? participantTemplate : [];
  const count = Number(expectedCount) || 0;
  const errors = [];

  if (incoming.length !== count) {
    errors.push(`Se esperaban ${count} participantes y se recibieron ${incoming.length}.`);
  }

  const value = incoming.slice(0, count).map((participant, index) => {
    const answers = Object.fromEntries(
      template.map((field) => [field.label, normalizeScalar(participant.answers?.[field.label])]),
    );

    template.forEach((field) => {
      const validation = validateFieldValue(
        { ...field, required: field.required !== false },
        answers[field.label],
      );
      if (!validation.valid) {
        errors.push(
          validation.error === "Este campo es obligatorio."
            ? `Participante ${index + 1}: falta ${field.label}.`
            : `Participante ${index + 1} - ${field.label}: ${validation.error}`,
        );
      }
    });

    return { index: index + 1, answers };
  });

  return { valid: errors.length === 0, errors, value };
}

export function buildParticipantColumns(participantDetails = [], prefix = "Participante") {
  const output = {};
  normalizeParticipantDetails(participantDetails).forEach((participant, index) => {
    const number = participant.index || index + 1;
    Object.entries(participant.answers).forEach(([label, value]) => {
      output[`${prefix} ${number} - ${label}`] = value;
    });
  });
  return output;
}

export function getParticipantSearchValues(participantDetails = []) {
  return normalizeParticipantDetails(participantDetails)
    .flatMap((participant) => Object.values(participant.answers))
    .filter(Boolean);
}
