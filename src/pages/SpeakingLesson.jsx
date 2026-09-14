import { useParams } from 'react-router-dom'
import ContentLessonRunner from '../components/ContentLessonRunner'
import { SPEAKING_TOPICS_BY_ID } from '../data/speaking'

export default function SpeakingLesson() {
  const { topicId } = useParams()

  return (
    <ContentLessonRunner
      topic={SPEAKING_TOPICS_BY_ID[topicId]}
      itemType="speaking"
      exitTo="/speaking"
      notFoundBackPath="/speaking"
      notFoundBackLabel="Back to Speaking"
      finishedTitle="Speaking practice complete! 🎉"
    />
  )
}
