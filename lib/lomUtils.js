import { ECUADOR_TZ } from "./date-utils";

export const getWeekDateRange = (startDate) => {
  if (!startDate) return "";
  const start = new Date(startDate);
  
  // Obtenemos el día en la zona horaria de Ecuador
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: ECUADOR_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  
  const startParts = formatter.formatToParts(start);
  const getPart = (p, t) => p.find(x => x.type === t).value;
  
  const startDay = parseInt(getPart(startParts, 'day'));
  const month = new Intl.DateTimeFormat('es-ES', { 
    timeZone: ECUADOR_TZ, 
    month: 'long' 
  }).format(start);

  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 4); // Monday to Friday (assuming start is Monday)
  
  const endParts = formatter.formatToParts(end);
  const endDay = parseInt(getPart(endParts, 'day'));

  return `${startDay}-${endDay} de ${month}`;
};

export const getBibleLink = (reference) => {
  // YouVersion mapping for Spanish books
  const bookMapping = {
    genesis: "GEN",
    exodo: "EXO",
    levitico: "LEV",
    numeros: "NUM",
    deuteronomio: "DEU",
    josue: "JOS",
    jueces: "JDG",
    rut: "RUT",
    "1 samuel": "1SA",
    "2 samuel": "2SA",
    "1 reyes": "1KI",
    "2 reyes": "2KI",
    "1 cronicas": "1CH",
    "2 cronicas": "2CH",
    esdras: "EZR",
    nehemias: "NEH",
    ester: "EST",
    job: "JOB",
    salmos: "PSA",
    proverbios: "PRO",
    eclesiastes: "ECC",
    cantares: "SNG",
    isaias: "ISA",
    jeremias: "JER",
    lamentaciones: "LAM",
    ezequiel: "EZK",
    daniel: "DAN",
    oseas: "HOS",
    joel: "JOL",
    amos: "AMO",
    abdias: "OBA",
    jonas: "JON",
    miqueas: "MIC",
    nahum: "NAM",
    habacuc: "HAB",
    sofonias: "ZEP",
    hageo: "HAG",
    zacarias: "ZEC",
    malaquias: "MAL",
    mateo: "MAT",
    marcos: "MRK",
    lucas: "LUK",
    juan: "JHN",
    hechos: "ACT",
    romanos: "ROM",
    "1 corintios": "1CO",
    "2 corintios": "2CO",
    galatas: "GAL",
    efesios: "EPH",
    filipenses: "PHP",
    colosenses: "COL",
    "1 tesalonicenses": "1TH",
    "2 tesalonicenses": "2TH",
    "1 timoteo": "1TI",
    "2 timoteo": "2TI",
    tito: "TIT",
    filemon: "PHM",
    hebreos: "HEB",
    santiago: "JAS",
    "1 pedro": "1PE",
    "2 pedro": "2PE",
    "1 juan": "1JN",
    "2 juan": "2JN",
    "3 juan": "3JN",
    judas: "JUD",
    apocalipsis: "REV",
  };

  // Clean reference and try to match book
  const cleanRef = reference
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // Remove accents

  let bookAbbr = "";
  let chapterPart = "";

  for (const [name, abbr] of Object.entries(bookMapping)) {
    if (cleanRef.startsWith(name)) {
      bookAbbr = abbr;
      chapterPart = reference.substring(name.length).trim();
      break;
    }
  }

  if (!bookAbbr)
    return `https://www.bible.com/search/bible?q=${encodeURIComponent(reference)}`;

  // Parse chapter and verse
  // Format: GEN.1.1.NTV or GEN.1.NTV
  const match = chapterPart.match(/(\d+)(?::(\d+))?/);
  if (match) {
    const chapter = match[1];
    const verse = match[2];
    return `https://www.bible.com/bible/127/${bookAbbr}.${chapter}${verse ? "." + verse : ""}.NTV`;
  }

  return `https://www.bible.com/bible/127/${bookAbbr}.1.NTV`;
};
