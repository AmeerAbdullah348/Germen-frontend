import { useRef, useState } from 'react'
import { isAnswerCorrect } from '../../lib/answerCheck'

const SPECIAL_CHARS = ['ä', 'ö', 'ü', 'ß', 'Ä', 'Ö', 'Ü']

export default function FillBlank({ exercise, onResult }) {
  const [value, setValue] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const inputRef = useRef(null)

  const isCorrect = isAnswerCorrect(value, exercise.answer)

  function insertChar(char) {
    const input = inputRef.current
    if (!input) return
    const start = input.selectionStart ?? value.length
    const end = input.selectionEnd ?? value.length
    const next = value.slice(0, start) + char + value.slice(end)
    setValue(next)
    requestAnimationFrame(() => {
      input.focus()
      input.setSelectionRange(start + 1, start + 1)
    })
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (submitted || !value.trim()) return // guard: empty answer / double-submit
    setSubmitted(true)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm">
      <p className="text-lg font-medium text-gray-800">{exercise.prompt}</p>

      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={submitted}
        placeholder="Type your answer..."
        className={[
          'rounded-xl border px-4 py-3 text-lg',
          submitted && isCorrect && 'border-success bg-green-50',
          submitted && !isCorrect && 'border-danger bg-red-50',
          !submitted && 'border-gray-200',
        ]
          .filter(Boolean)
          .join(' ')}
      />

      {!submitted && (
        <div className="flex gap-2 flex-wrap">
          {SPECIAL_CHARS.map((char) => (
            <button
              key={char}
              type="button"
              onClick={() => insertChar(char)}
              className="w-10 h-10 rounded-lg border border-gray-200 bg-white font-medium text-gray-700"
            >
              {char}
            </button>
          ))}
        </div>
      )}

      {submitted && !isCorrect && (
        <p className="text-sm text-gray-500">
          Correct answer: <span className="font-medium text-gray-700">{Array.isArray(exercise.answer) ? exercise.answer[0] : exercise.answer}</span>
        </p>
      )}

      {!submitted ? (
        <button
          type="submit"
          disabled={!value.trim()}
          className="rounded-xl bg-primary-600 disabled:bg-gray-300 text-white py-3 font-medium"
        >
          Check
        </button>
      ) : (
        <button
          type="button"
          onClick={() => onResult(isCorrect)}
          className="rounded-xl bg-primary-600 text-white py-3 font-medium"
        >
          Continue
        </button>
      )}
    </form>
  )
}
