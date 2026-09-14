import ContentTopicList from '../components/ContentTopicList'
import { LISTENING_LESSONS } from '../data/listening'

export default function Listening() {
  return (
    <ContentTopicList
      title="Listening"
      description="Listen to German words, sentences, and short exchanges."
      topics={LISTENING_LESSONS}
      itemType="listening"
      basePath="/listening"
      unitLabel="lessons"
    />
  )
}
