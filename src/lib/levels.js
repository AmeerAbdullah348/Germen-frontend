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

// Groups any CEFR-leveled content list (units, grammar topics, ...) by level
// (in LEVEL_ORDER) and marks each level unlocked once every item in the
// previous level has been completed at least once. The first level with any
// items is always unlocked. `isComplete` defaults to unit completion so the
// Dashboard's existing call site (getLevelGroups(UNITS, state)) is unchanged.
//
// A placement test result additionally unlocks every level up to and
// including the estimated level, independent of real completion — so a
// placement-tested user can jump straight to B1 content without grinding
// through A1/A2 first. This never revokes access earned through real
// completion, and levels beyond the placement estimate still require it.
export function getLevelGroups(items, state, { isComplete = isUnitComplete, placementLevel = state.placementLevel } = {}) {
  const byLevel = new Map()
  for (const item of items) {
    const level = item.level || 'A1'
    if (!byLevel.has(level)) byLevel.set(level, [])
    byLevel.get(level).push(item)
  }

  const placementIndex = placementLevel ? LEVEL_ORDER.indexOf(placementLevel) : -1

  const groups = []
  let previousComplete = true
  for (const level of LEVEL_ORDER) {
    const levelItems = byLevel.get(level)
    if (!levelItems || levelItems.length === 0) continue

    const completedCount = levelItems.filter((item) => isComplete(item, state)).length
    const levelIndex = LEVEL_ORDER.indexOf(level)
    const unlockedByPlacement = placementIndex >= 0 && levelIndex <= placementIndex
    const unlocked = previousComplete || unlockedByPlacement

    groups.push({
      level,
      label: LEVEL_LABELS[level] || level,
      units: levelItems,
      completedCount,
      totalCount: levelItems.length,
      unlocked,
    })
    previousComplete = completedCount === levelItems.length
  }
  return groups
}
