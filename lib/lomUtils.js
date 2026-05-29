import { parseLiteralDate } from "./date-utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  getBibleLink as getBibleLinkFromReference,
  linkBibleReferences,
} from "./lomBibleLinks.mjs";

/**
 * Converts WhatsApp-style markdown within HTML content into proper HTML elements.
 * Only processes text nodes (between HTML tags), leaving tag attributes untouched.
 *
 * Supported markers:
 *   *bold*        → <strong>
 *   _italic_      → <em>  (requires word boundaries)
 *   ~strikethrough~ → <del>
 *   `inline code` → <code>
 *   ```block```   → <pre><code>
 */
export function parseWhatsAppFormatting(html) {
  if (!html) return "";

  // Split into HTML tags and text segments, process only text segments
  const parts = html.split(/(<[^>]+>)/);

  return parts
    .map((part) => {
      if (/^<[^>]+>$/.test(part)) return part; // leave HTML tags intact

      let text = part;

      // Triple-backtick code block (may span multiple lines)
      text = text.replace(
        /```([\s\S]*?)```/g,
        (_, code) => `<pre><code>${code.trim()}</code></pre>`,
      );

      // Inline code: `text`
      text = text.replace(/`([^`\n]+)`/g, "<code>$1</code>");

      // Bold: *text* (no asterisks inside, no newlines)
      text = text.replace(/\*([^*\n]+)\*/g, "<strong>$1</strong>");

      // Italic: _text_ — only when surrounded by whitespace/punctuation or at line edges
      text = text.replace(
        /(^|[\s,.:;!?¡¿(])_([^_\n]+)_([\s,.:;!?¡¿)]|$)/gm,
        "$1<em>$2</em>$3",
      );

      // Strikethrough: ~text~
      text = text.replace(/~([^~\n]+)~/g, "<del>$1</del>");

      return text;
    })
    .join("");
}

export const getWeekDateRange = (startDate) => {
  const start = parseLiteralDate(startDate);
  if (!start) return "";

  const startDay = start.getDate();
  const monthName = format(start, "MMMM", { locale: es });

  const end = new Date(start);
  end.setDate(start.getDate() + 4); // Lunes a Viernes
  const endDay = end.getDate();

  return `${startDay}-${endDay} de ${monthName}`;
};

export const getBibleLink = getBibleLinkFromReference;
export { linkBibleReferences };
