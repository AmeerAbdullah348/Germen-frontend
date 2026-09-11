// Answer normalization/matching for lesson exercises.
// Handles: case, surrounding whitespace, umlaut ASCII fallback (ae/oe/ue/ss),
// and a list of accepted synonyms per question (see Phase 3 edge cases).

function normalize(input) {
  return input
    .trim()
    .toLowerCase()
    .replaceAll('ä', 'ae')
    .replaceAll('ö', 'oe')
    .replaceAll('ü', 'ue')
    .replaceAll('ß', 'ss')
    .replace(/\s+/g, ' ')
}

// accepted: string | string[] — the canonical answer plus any accepted synonyms
export function isAnswerCorrect(userInput, accepted) {
  if (!userInput || !userInput.trim()) return false
  const candidates = Array.isArray(accepted) ? accepted : [accepted]
  const normalizedInput = normalize(userInput)
  return candidates.some((candidate) => normalize(candidate) === normalizedInput)
}

export { normalize }
