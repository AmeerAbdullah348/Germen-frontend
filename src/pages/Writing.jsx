import ContentTopicList from '../components/ContentTopicList'
import { WRITING_TOPICS } from '../data/writing'

export default function Writing() {
  return (
    <ContentTopicList
      title="Writing"
      description="Translate, complete, fix, and rearrange German sentences."
      topics={WRITING_TOPICS}
      itemType="writing"
      basePath="/writing"
      unitLabel="topics"
    />
  )
}
