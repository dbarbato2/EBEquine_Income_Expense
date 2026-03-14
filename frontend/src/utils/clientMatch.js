/**
 * Normalizes a string for comparison:
 * lowercase, trimmed, collapse whitespace, remove common punctuation.
 */
const normalize = (str) =>
  (str || '').toLowerCase().trim().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ');

/**
 * Returns true if every word in the shorter string appears in the longer string.
 */
const wordOverlap = (a, b) => {
  const wordsA = a.split(' ').filter(Boolean);
  const wordsB = b.split(' ').filter(Boolean);
  const [shorter, longer] = wordsA.length <= wordsB.length ? [wordsA, wordsB] : [wordsB, wordsA];
  return shorter.every((w) => longer.includes(w));
};

/**
 * Finds a high-confidence matching client by comparing the revenue `Client`
 * field (which contains a horse name) against each client's `HorseName`.
 *
 * Confidence tiers (all case-insensitive):
 *   1. Exact match after normalization
 *   2. One is a substring of the other
 *   3. Full word overlap (all words of the shorter appear in the longer)
 *
 * Returns the matching client object, or null if no high-confidence match found.
 */
export const findClientByHorseName = (clients = [], revClientField = '') => {
  const query = normalize(revClientField);
  if (!query) return null;

  // Tier 1 — exact
  let match = clients.find((c) => normalize(c.HorseName) === query);
  if (match) return match;

  // Tier 2 — substring
  match = clients.find((c) => {
    const horse = normalize(c.HorseName);
    return horse && (horse.includes(query) || query.includes(horse));
  });
  if (match) return match;

  // Tier 3 — full word overlap (only meaningful if query has ≥1 word)
  match = clients.find((c) => {
    const horse = normalize(c.HorseName);
    return horse && wordOverlap(query, horse);
  });
  return match || null;
};
