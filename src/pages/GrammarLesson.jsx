import { Link, useParams } from 'react-router-dom'
import ExerciseRunner from '../components/ExerciseRunner'
import { GRAMMAR_TOPICS_BY_ID } from '../data/grammar'
import { useAuth } from '../lib/AuthContext'
import { getCorrectAnswerText, recordMistake } from '../lib/mistakes'
import { bumpStreak, recordItemAnswer } from '../lib/progress'
import { flushPendingSync } from '../lib/remoteSync'

export default function GrammarLesson() {
  const { topicId } = useParams()
  const { user } = useAuth()
  const topic = GRAMMAR_TOPICS_BY_ID[topicId]

  if (!topic) {
    return (
      <div className="px-5 pt-8 flex flex-col gap-4 items-center text-center">
        <p className="text-gray-600">This topic couldn't be loaded.</p>
        <Link to="/grammar" className="text-primary-600 font-medium">
          Back to Grammar
        </Link>
      </div>
    )
  }

  function handleResult(exercise, isCorrect, userAnswer) {
    recordItemAnswer('grammar', exercise.itemId, isCorrect)
    if (!isCorrect) {
      recordMistake({
        itemType: 'grammar',
        itemId: exercise.itemId,
        unitOrTopicId: topic.id,
        userAnswer: userAnswer ?? null,
        correctAnswer: getCorrectAnswerText(exercise),
      })
    }
    flushPendingSync(user?.id)
  }

  function handleFinish() {
    bumpStreak()
    flushPendingSync(user?.id)
  }

  return (
    <ExerciseRunner
      exercises={topic.exercises}
      onResult={handleResult}
      onFinish={handleFinish}
      exitTo={`/grammar/${topic.id}`}
      finishedTitle="Topic practice complete! 🎉"
      backLabel="Back to Topic"
    />
  )
}
