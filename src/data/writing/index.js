import writingCompletion from './writing-completion.json'
import writingCorrection from './writing-correction.json'
import writingMissingWord from './writing-missing-word.json'
import writingPrompts from './writing-prompts.json'
import writingTranslation from './writing-translation.json'

export const WRITING_TOPICS = [
  writingTranslation,
  writingCompletion,
  writingMissingWord,
  writingCorrection,
  writingPrompts,
].sort((a, b) => a.order - b.order)

export const WRITING_TOPICS_BY_ID = Object.fromEntries(WRITING_TOPICS.map((t) => [t.id, t]))
