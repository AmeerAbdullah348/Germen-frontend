// Deterministic placement scoring — no AI. The learner's estimated level is
// the highest CEFR level they "cleared" (>=50% correct), stopping at the
// first level they didn't clear, so a strong-A1/weak-A2 result estimates A1
// rather than averaging across everything.
const LEVEL_ORDER = ['A1', 'A2', 'B1']
const PASS_THRESHOLD = 0.5

// answers: array of { section, level, isCorrect }
export function estimateLevel(answers) {
  const byLevel = Object.fromEntries(LEVEL_ORDER.map((level) => [level, { correct: 0, total: 0 }]))
  for (const answer of answers) {
    if (!byLevel[answer.level]) continue
    byLevel[answer.level].total++
    if (answer.isCorrect) byLevel[answer.level].correct++
  }

  let estimate = 'A1'
  for (const level of LEVEL_ORDER) {
    const { correct, total } = byLevel[level]
    if (total === 0) break
    if (correct / total >= PASS_THRESHOLD) {
      estimate = level
    } else {
      break
    }
  }

  return { estimate, byLevel }
}

export function summarizeBySection(answers) {
  const bySection = {}
  for (const answer of answers) {
    if (!bySection[answer.section]) bySection[answer.section] = { correct: 0, total: 0 }
    bySection[answer.section].total++
    if (answer.isCorrect) bySection[answer.section].correct++
  }
  return bySection
}
