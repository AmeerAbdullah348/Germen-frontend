// Mirrors progress.js's isUnitComplete, generalized to grammar topics: a
// topic is "complete" once every one of its exercises has an item_progress
// record (state.items), i.e. it's been attempted at least once.
export function isGrammarTopicComplete(topic, state) {
  return topic.exercises.every((exercise) => Boolean(state.items?.[`grammar:${exercise.itemId}`]))
}
