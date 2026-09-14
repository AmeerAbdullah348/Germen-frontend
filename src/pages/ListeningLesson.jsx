import { useParams } from 'react-router-dom'
import ContentLessonRunner from '../components/ContentLessonRunner'
import { LISTENING_LESSONS_BY_ID } from '../data/listening'

export default function ListeningLesson() {
  const { lessonId } = useParams()

  return (
    <ContentLessonRunner
      topic={LISTENING_LESSONS_BY_ID[lessonId]}
      itemType="listening"
      exitTo="/listening"
      notFoundBackPath="/listening"
      notFoundBackLabel="Back to Listening"
      finishedTitle="Listening practice complete! 🎉"
    />
  )
}
