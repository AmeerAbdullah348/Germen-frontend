// Shared completion check for CEFR-leveled content lists whose "topic" shape
// is { exercises: [{ itemId }] } — used by Listening/Speaking/Writing so each
// doesn't need its own near-identical isXComplete function (mirrors
// isGrammarTopicComplete/isUnitComplete, generalized by item_type).
export function isContentComplete(content, state, itemType) {
  return content.exercises.every((exercise) => Boolean(state.items?.[`${itemType}:${exercise.itemId}`]))
}
