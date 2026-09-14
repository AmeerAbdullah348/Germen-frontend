import { UNITS } from '../data/units'
import { EXTRA_VOCAB, VOCAB_CATEGORIES } from '../data/vocabulary'

export { VOCAB_CATEGORIES }

// Unit vocab bakes the article into `de` (e.g. "der Kaffee") since unit
// files have no separate article field; extra-vocab entries already carry
// article as its own field. This recovers article for unit-sourced words
// without touching the existing unit JSON shape.
const ARTICLES = ['der', 'die', 'das']

function splitArticle(de) {
  const [first] = de.split(' ')
  return ARTICLES.includes(first) ? first : null
}

let cachedAllVocab = null

// Combines unit vocab (category-tagged) and extra vocabulary into one
// dictionary-shaped list. Fields not available for a given source (e.g.
// pronunciation for unit-sourced words) are left null — the Dictionary UI
// only renders what's present, per "where the existing data supports it."
export function getAllVocab() {
  if (cachedAllVocab) return cachedAllVocab

  const fromUnits = UNITS.flatMap((unit) =>
    unit.vocab
      .filter((word) => word.category)
      .map((word) => ({
        id: word.id,
        de: word.de,
        en: word.en,
        category: word.category,
        article: splitArticle(word.de),
        wordType: null,
        plural: null,
        pronunciation: null,
        exampleDe: null,
        exampleEn: null,
        unitId: unit.id,
        unitTitle: unit.title,
      }))
  )

  const fromExtra = EXTRA_VOCAB.map((word) => ({
    id: word.id,
    de: word.de,
    en: word.en,
    category: word.category,
    article: word.article,
    wordType: word.wordType,
    plural: word.plural,
    pronunciation: word.pronunciation,
    exampleDe: word.exampleDe,
    exampleEn: word.exampleEn,
    unitId: null,
    unitTitle: null,
  }))

  cachedAllVocab = [...fromUnits, ...fromExtra]
  return cachedAllVocab
}

export function getVocabById(id) {
  return getAllVocab().find((word) => word.id === id) ?? null
}

export function groupVocabByCategory() {
  const groups = Object.fromEntries(VOCAB_CATEGORIES.map((c) => [c, []]))
  for (const word of getAllVocab()) {
    if (groups[word.category]) groups[word.category].push(word)
  }
  return groups
}

// Other words in the same category, for the Dictionary's "related words".
export function getRelatedVocab(word, limit = 5) {
  return getAllVocab()
    .filter((w) => w.category === word.category && w.id !== word.id)
    .slice(0, limit)
}

function normalizeToken(token) {
  return token.toLowerCase().replace(/[.,!?;:„"']/g, '')
}

// Best-effort lookup for Reading's tap-a-word-for-help feature — matches a
// tapped token against either the full `de` string or the article-stripped
// bare word, so both "Kaffee" and "der Kaffee" tokens resolve the same entry.
export function lookupWord(token) {
  const normalized = normalizeToken(token)
  if (!normalized) return null

  return (
    getAllVocab().find((word) => {
      const bare = word.article ? word.de.replace(`${word.article} `, '') : word.de
      return normalizeToken(bare) === normalized || normalizeToken(word.de) === normalized
    }) ?? null
  )
}
