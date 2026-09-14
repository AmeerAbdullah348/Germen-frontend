import ContentTopicList from '../components/ContentTopicList'
import { READING_PASSAGES } from '../data/reading'

export default function Reading() {
  return (
    <ContentTopicList
      title="Reading"
      description="Short German stories and dialogues with comprehension questions."
      topics={READING_PASSAGES}
      itemType="reading"
      basePath="/reading"
      unitLabel="passages"
    />
  )
}
