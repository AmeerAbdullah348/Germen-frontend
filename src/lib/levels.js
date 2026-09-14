import { isUnitComplete } from './progress'

// CEFR order — levels beyond what currently has content just won't appear
// (or will show as an empty locked section) until units are added for them.
export const LEVEL_ORDER = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

export const LEVEL_LABELS = {
  A1: 'Beginner',
  A2: 'Elementary',
  B1: 'Intermediate',
  B2: 'Upper Intermediate',
  C1: 'Advanced',
  C2: 'Mastery',
}

// Groups units by level (in LEVEL_ORDER) and marks each level unlocked once
// every unit in the previous level has been completed at least once. The
// first level with any units is always unlocked.
export function getLevelGroups(units, state) {
  const byLevel = new Map()
  for (const unit of units) {
    const level = unit.level || 'A1'
    if (!byLevel.has(level)) byLevel.set(level, [])
    byLevel.get(level).push(unit)
  }

  const groups = []
  let previousComplete = true
  for (const level of LEVEL_ORDER) {
    const levelUnits = byLevel.get(level)
    if (!levelUnits || levelUnits.length === 0) continue

    const completedCount = levelUnits.filter((u) => isUnitComplete(u, state)).length
    const unlocked = previousComplete
    groups.push({
      level,
      label: LEVEL_LABELS[level] || level,
      units: levelUnits,
      completedCount,
      totalCount: levelUnits.length,
      unlocked,
    })
    previousComplete = completedCount === levelUnits.length
  }
  return groups
}
