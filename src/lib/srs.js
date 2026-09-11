// SM-2 spaced repetition algorithm (open source / public domain).
// https://en.wikipedia.org/wiki/SuperMemo#Description_of_SM-2_algorithm
//
// quality: 0-5 rating of how well the answer was recalled.
//   We derive it from a simple correct/incorrect result:
//     correct   -> 4 ("correct, some hesitation")
//     incorrect -> 2 ("incorrect, but recognized once shown")

export function gradeToQuality(isCorrect) {
  return isCorrect ? 4 : 2
}

// card: { repetitions, easeFactor, intervalDays, dueDate } | undefined for a new card
export function initCard(now) {
  return {
    repetitions: 0,
    easeFactor: 2.5,
    intervalDays: 0,
    dueDate: now,
  }
}

export function reviewCard(card, quality, now) {
  const c = card ?? initCard(now)
  let { repetitions, easeFactor, intervalDays } = c

  if (quality < 3) {
    repetitions = 0
    intervalDays = 1
  } else {
    repetitions += 1
    if (repetitions === 1) intervalDays = 1
    else if (repetitions === 2) intervalDays = 6
    else intervalDays = Math.round(intervalDays * easeFactor)

    easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    if (easeFactor < 1.3) easeFactor = 1.3
  }

  const dueDate = new Date(now)
  dueDate.setDate(dueDate.getDate() + intervalDays)

  return {
    repetitions,
    easeFactor: Number(easeFactor.toFixed(2)),
    intervalDays,
    dueDate: dueDate.toISOString(),
  }
}

export function isDue(card, now) {
  if (!card) return true
  return new Date(card.dueDate).getTime() <= new Date(now).getTime()
}
