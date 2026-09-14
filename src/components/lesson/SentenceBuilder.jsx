import { useState } from 'react'
import Button from '../ui/Button'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function SentenceBuilder({ exercise, onResult }) {
  const [bank, setBank] = useState(() => shuffle(exercise.words))
  const [built, setBuilt] = useState([])
  const [submitted, setSubmitted] = useState(false)

  const sentence = built.join(' ')
  const isCorrect = sentence.trim().toLowerCase() === exercise.answer.trim().toLowerCase()

  function addWord(index) {
    if (submitted) return
    setBuilt((b) => [...b, bank[index]])
    setBank((b) => b.filter((_, i) => i !== index))
  }

  function removeWord(index) {
    if (submitted) return
    setBank((b) => [...b, built[index]])
    setBuilt((b) => b.filter((_, i) => i !== index))
  }

  function handleSubmit() {
    if (submitted || built.length === 0) return // guard: empty / double-submit
    setSubmitted(true)
  }

  return (
    <div className="flex flex-col gap-4 w-full max-w-sm">
      <p className="text-lg font-medium text-gray-800">{exercise.prompt}</p>

      <div className="min-h-14 rounded-xl border border-gray-200 bg-white p-2 flex flex-wrap gap-2">
        {built.map((word, i) => (
          <button
            key={`${word}-${i}`}
            type="button"
            onClick={() => removeWord(i)}
            disabled={submitted}
            className="rounded-lg bg-primary-100 text-primary-700 px-3 py-2 font-medium"
          >
            {word}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {bank.map((word, i) => (
          <button
            key={`${word}-${i}`}
            type="button"
            onClick={() => addWord(i)}
            disabled={submitted}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 font-medium text-gray-700"
          >
            {word}
          </button>
        ))}
      </div>

      {submitted && !isCorrect && (
        <p className="text-sm text-gray-500">
          Correct answer: <span className="font-medium text-gray-700">{exercise.answer}</span>
        </p>
      )}

      {!submitted ? (
        <Button onClick={handleSubmit} disabled={built.length === 0}>
          Check
        </Button>
      ) : (
        <Button onClick={() => onResult(isCorrect, sentence)}>Continue</Button>
      )}
    </div>
  )
}
