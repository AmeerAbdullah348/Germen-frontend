import speakingCafeOrders from './speaking-cafe-orders.json'
import speakingDailyPhrases from './speaking-daily-phrases.json'
import speakingDirections from './speaking-directions.json'
import speakingGreetingsIntro from './speaking-greetings-intro.json'

export const SPEAKING_TOPICS = [
  speakingGreetingsIntro,
  speakingCafeOrders,
  speakingDailyPhrases,
  speakingDirections,
].sort((a, b) => a.order - b.order)

export const SPEAKING_TOPICS_BY_ID = Object.fromEntries(SPEAKING_TOPICS.map((t) => [t.id, t]))
