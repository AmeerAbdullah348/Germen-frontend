import adjectives from './adjectives.json'
import articles from './articles.json'
import dativ from './dativ.json'
import genitiv from './genitiv.json'
import modalVerbs from './modal-verbs.json'
import negation from './negation.json'
import nominativAkkusativ from './nominativ-akkusativ.json'
import prepositions from './prepositions.json'
import separableVerbs from './separable-verbs.json'
import tenses from './tenses.json'
import verbConjugation from './verb-conjugation.json'
import wordOrder from './word-order.json'

export const GRAMMAR_TOPICS = [
  articles,
  nominativAkkusativ,
  verbConjugation,
  modalVerbs,
  separableVerbs,
  wordOrder,
  negation,
  prepositions,
  dativ,
  tenses,
  adjectives,
  genitiv,
].sort((a, b) => a.order - b.order)

export const GRAMMAR_TOPICS_BY_ID = Object.fromEntries(GRAMMAR_TOPICS.map((t) => [t.id, t]))
