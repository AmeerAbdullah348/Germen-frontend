import { useParams } from 'react-router-dom'
import ContentLessonRunner from '../components/ContentLessonRunner'
import { READING_PASSAGES_BY_ID } from '../data/reading'

export default function ReadingQuestions() {
  const { passageId } = useParams()

  return (
    <ContentLessonRunner
      topic={READING_PASSAGES_BY_ID[passageId]}
      itemType="reading"
      exitTo={`/reading/${passageId}`}
      notFoundBackPath="/reading"
      notFoundBackLabel="Back to Reading"
      finishedTitle="Reading comprehension complete! 🎉"
    />
  )
}
