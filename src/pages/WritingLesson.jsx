import { useParams } from 'react-router-dom'
import ContentLessonRunner from '../components/ContentLessonRunner'
import { WRITING_TOPICS_BY_ID } from '../data/writing'

export default function WritingLesson() {
  const { topicId } = useParams()

  return (
    <ContentLessonRunner
      topic={WRITING_TOPICS_BY_ID[topicId]}
      itemType="writing"
      exitTo="/writing"
      notFoundBackPath="/writing"
      notFoundBackLabel="Back to Writing"
      finishedTitle="Writing practice complete! 🎉"
    />
  )
}
