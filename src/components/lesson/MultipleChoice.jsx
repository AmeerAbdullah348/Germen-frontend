import { useState } from 'react'
import Button from '../ui/Button'

export default function MultipleChoice({ exercise, onResult }) {
  const [selected, setSelected] = useState(null)
  const [submitted, setSubmitted] = useState(false)

  const isCorrect = selected === exercise.answer

  function handleSelect(option) {
    if (submitted) return // guard against changing answer after submit
    setSelected(option)
  }

  function handleSubmit() {
    if (submitted || selected === null) return // guard against double-submit / empty submit
    setSubmitted(true)
  }

  return (
    <div className="flex flex-col gap-4 w-full max-w-sm">
      <p className="text-lg font-medium text-gray-800">{exercise.prompt}</p>

      <div className="flex flex-col gap-2">
        {exercise.options.map((option) => {
          const isSelected = selected === option
          const showCorrect = submitted && option === exercise.answer
          const showWrong = submitted && isSelected && option !== exercise.answer

          return (
            <button
              key={option}
              type="button"
              onClick={() => handleSelect(option)}
              disabled={submitted}
              className={[
                'text-left rounded-xl border px-4 py-3 font-medium transition-colors',
                showCorrect && 'border-success bg-green-50 text-success',
                showWrong && 'border-danger bg-red-50 text-danger',
                !submitted && isSelected && 'border-primary-500 bg-primary-50',
                !submitted && !isSelected && 'border-gray-200 bg-white',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {option}
            </button>
          )
        })}
      </div>

      {!submitted ? (
        <Button onClick={handleSubmit} disabled={selected === null}>
          Check
        </Button>
      ) : (
        <Button onClick={() => onResult(isCorrect, selected)}>Continue</Button>
      )}
    </div>
  )
}
