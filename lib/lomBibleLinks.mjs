const BIBLE_BOOKS = [
  ["genesis", "GEN"],
  ["exodo", "EXO"],
  ["levitico", "LEV"],
  ["numeros", "NUM"],
  ["deuteronomio", "DEU"],
  ["josue", "JOS"],
  ["jueces", "JDG"],
  ["rut", "RUT"],
  ["1 samuel", "1SA"],
  ["2 samuel", "2SA"],
  ["1 reyes", "1KI"],
  ["2 reyes", "2KI"],
  ["1 cronicas", "1CH"],
  ["2 cronicas", "2CH"],
  ["esdras", "EZR"],
  ["nehemias", "NEH"],
  ["ester", "EST"],
  ["job", "JOB"],
  ["salmos", "PSA"],
  ["proverbios", "PRO"],
  ["eclesiastes", "ECC"],
  ["cantares", "SNG"],
  ["isaias", "ISA"],
  ["jeremias", "JER"],
  ["lamentaciones", "LAM"],
  ["ezequiel", "EZK"],
  ["daniel", "DAN"],
  ["oseas", "HOS"],
  ["joel", "JOL"],
  ["amos", "AMO"],
  ["abdias", "OBA"],
  ["jonas", "JON"],
  ["miqueas", "MIC"],
  ["nahum", "NAM"],
  ["habacuc", "HAB"],
  ["sofonias", "ZEP"],
  ["hageo", "HAG"],
  ["zacarias", "ZEC"],
  ["malaquias", "MAL"],
  ["mateo", "MAT"],
  ["marcos", "MRK"],
  ["lucas", "LUK"],
  ["juan", "JHN"],
  ["hechos", "ACT"],
  ["romanos", "ROM"],
  ["1 corintios", "1CO"],
  ["2 corintios", "2CO"],
  ["galatas", "GAL"],
  ["efesios", "EPH"],
  ["filipenses", "PHP"],
  ["colosenses", "COL"],
  ["1 tesalonicenses", "1TH"],
  ["2 tesalonicenses", "2TH"],
  ["1 timoteo", "1TI"],
  ["2 timoteo", "2TI"],
  ["tito", "TIT"],
  ["filemon", "PHM"],
  ["hebreos", "HEB"],
  ["santiago", "JAS"],
  ["1 pedro", "1PE"],
  ["2 pedro", "2PE"],
  ["1 juan", "1JN"],
  ["2 juan", "2JN"],
  ["3 juan", "3JN"],
  ["judas", "JUD"],
  ["apocalipsis", "REV"],
].map(([name, abbr]) => ({ name, abbr }));

const SORTED_BOOKS = [...BIBLE_BOOKS].sort(
  (a, b) => b.name.length - a.name.length,
);

function normalizeText(input) {
  return String(input ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function flexibleCharPattern(char) {
  if (/\s/.test(char)) return "\\s+";

  switch (char) {
    case "a":
      return "[aá]";
    case "e":
      return "[eé]";
    case "i":
      return "[ií]";
    case "o":
      return "[oó]";
    case "u":
      return "[uúü]";
    case "n":
      return "[nñ]";
    default:
      return escapeRegExp(char);
  }
}

function flexibleBookPattern(bookName) {
  return [...bookName].map(flexibleCharPattern).join("");
}

const BOOK_PATTERN = SORTED_BOOKS.map((book) =>
  flexibleBookPattern(book.name),
).join("|");

const REFERENCE_PATTERN = new RegExp(
  `(^|[^\\p{L}\\p{N}])(${BOOK_PATTERN})\\s*:?\\s*\\d{1,3}(?:\\s*[:.]\\s*\\d{1,3}(?:\\s*[-–—]\\s*\\d{1,3})?|\\s*(?:[-–—]|al)\\s*\\d{1,3})?`,
  "giu",
);

function findBook(reference) {
  const normalized = normalizeText(reference);

  return SORTED_BOOKS.find((book) => {
    if (!normalized.startsWith(book.name)) return false;
    const nextChar = normalized[book.name.length] ?? "";
    return nextChar === "" || /[^a-z0-9]/.test(nextChar);
  });
}

export function getBibleLink(reference) {
  const book = findBook(reference);

  if (!book) {
    return `https://www.bible.com/search/bible?q=${encodeURIComponent(reference)}`;
  }

  const normalized = normalizeText(reference);
  const chapterPart = normalized.slice(book.name.length);
  const match = chapterPart.match(/(\d{1,3})(?:\s*[:.]\s*(\d{1,3}))?/);

  if (!match) {
    return `https://www.bible.com/bible/127/${book.abbr}.1.NTV`;
  }

  const chapter = match[1];
  const verse = match[2];
  return `https://www.bible.com/bible/127/${book.abbr}.${chapter}${verse ? `.${verse}` : ""}.NTV`;
}

function linkReferencesInText(text) {
  return text.replace(REFERENCE_PATTERN, (fullMatch, prefix) => {
    const reference = fullMatch.slice(prefix.length);
    const href = getBibleLink(reference);

    if (href.includes("/search/bible")) return fullMatch;

    return `${prefix}<a href="${href}" target="_blank" rel="noopener noreferrer">${reference}</a>`;
  });
}

export function linkBibleReferences(html) {
  if (!html) return "";

  const parts = String(html).split(/(<[^>]+>)/g);
  let insideAnchor = false;

  return parts
    .map((part) => {
      if (/^<[^>]+>$/.test(part)) {
        if (/^<a[\s>]/i.test(part)) insideAnchor = true;
        if (/^<\/a\s*>/i.test(part)) insideAnchor = false;
        return part;
      }

      return insideAnchor ? part : linkReferencesInText(part);
    })
    .join("");
}
