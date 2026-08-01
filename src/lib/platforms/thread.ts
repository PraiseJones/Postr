import { CHAR_LIMITS } from "./types";

// Longest numbering suffix we append (" 10/10" = 6) plus margin.
const NUMBER_RESERVE = 8;

/**
 * Split a post into X-sized chunks for a thread.
 *
 * Breaks at sentence ends where possible, then whitespace, and only splits
 * mid-token for something unbreakable like a very long URL. Each part is
 * numbered "1/3" so readers know where they are.
 *
 * Note: length is measured in UTF-16 units, which matches X's weighted count
 * for Latin text and emoji but overcounts nothing — CJK is the one case where
 * X counts higher than we do.
 */
export function splitIntoThread(
  text: string,
  limit: number = CHAR_LIMITS.x
): string[] {
  const trimmed = text.trim();
  if (trimmed.length <= limit) return [trimmed];

  const size = limit - NUMBER_RESERVE;
  const chunks: string[] = [];
  let rest = trimmed;

  while (rest.length > 0) {
    if (rest.length <= size) {
      chunks.push(rest);
      break;
    }

    const window = rest.slice(0, size + 1);
    let cut = -1;

    // Prefer the last sentence ending inside the window.
    for (const match of Array.from(window.matchAll(/[.!?…]["')\]]?\s/g))) {
      cut = match.index! + match[0].length;
    }

    // Otherwise break on the last whitespace.
    if (cut <= 0) {
      cut = Math.max(window.lastIndexOf(" "), window.lastIndexOf("\n"));
    }

    // Unbreakable token (long URL) — hard split so we always make progress.
    if (cut <= 0) cut = size;

    chunks.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }

  if (chunks.length <= 1) return chunks;

  const total = chunks.length;
  return chunks.map((chunk, i) => `${chunk} ${i + 1}/${total}`);
}

/** How many tweets this text will become. */
export function threadLength(text: string, limit: number = CHAR_LIMITS.x) {
  return splitIntoThread(text, limit).length;
}
