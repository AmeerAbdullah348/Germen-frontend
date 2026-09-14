import ContentTopicList from '../components/ContentTopicList'
import { SPEAKING_TOPICS } from '../data/speaking'

export default function Speaking() {
  return (
    <ContentTopicList
      title="Speaking"
      description="Repeat-after-me and sentence-level pronunciation practice."
      topics={SPEAKING_TOPICS}
      itemType="speaking"
      basePath="/speaking"
      unitLabel="topics"
    />
  )
}
