import listeningCafe from './listening-cafe.json'
import listeningDaily from './listening-daily.json'
import listeningGreetings from './listening-greetings.json'
import listeningNumbersTime from './listening-numbers-time.json'

export const LISTENING_LESSONS = [listeningGreetings, listeningNumbersTime, listeningCafe, listeningDaily].sort(
  (a, b) => a.order - b.order
)

export const LISTENING_LESSONS_BY_ID = Object.fromEntries(LISTENING_LESSONS.map((l) => [l.id, l]))
