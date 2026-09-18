import { Link } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { getCorrectAnswerText, recordMistake } from '../lib/mistakes'
import { bumpStreak, recordItemAnswer } from '../lib/progress'
import { flushPendingSync } from '../lib/remoteSync'
import ExerciseRunner from './ExerciseRunner'

export default function ContentLessonRunner({
  topic,
  itemType,
  exitTo,
  notFoundBackPath,
  notFoundBackLabel,
  finishedTitle,
}) {
  const { user } = useAuth()

  if (!topic) {
    return (
      <div className="px-5 pt-8 flex flex-col gap-4 items-center justify-center text-center text-slate-100 min-h-svh bg-[#070b19]">
        <p className="text-slate-400">This couldn't be loaded.</p>
        <Link to={notFoundBackPath} className="text-cyan-400 font-bold hover:underline">
          {notFoundBackLabel}
        </Link>
      </div>
    )
  }

  function handleResult(exercise, isCorrect, userAnswer) {
    recordItemAnswer(itemType, exercise.itemId, isCorrect)
    if (!isCorrect) {
      recordMistake({
        itemType,
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
      exitTo={exitTo}
      finishedTitle={finishedTitle}
      backLabel="Back"
    />
  )
}
