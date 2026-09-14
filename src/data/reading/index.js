import readingMorningRoutine from './reading-morning-routine.json'
import readingCafeOrder from './reading-cafe-order.json'
import readingAskingDirections from './reading-asking-directions.json'
import readingMyFamily from './reading-my-family.json'

export const READING_PASSAGES = [
  readingMorningRoutine,
  readingCafeOrder,
  readingAskingDirections,
  readingMyFamily,
].sort((a, b) => a.order - b.order)

export const READING_PASSAGES_BY_ID = Object.fromEntries(READING_PASSAGES.map((p) => [p.id, p]))
