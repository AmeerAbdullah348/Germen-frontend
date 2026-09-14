import { useState } from 'react'
import Button from '../ui/Button'

// Open-ended prompts have no reliable deterministic grader, so — like
// Flashcard's "knew it" and Pronunciation's self-report fallback — the user
// compares their own answer to a model answer and self-grades, rather than
// reaching for AI feedback for something this open-ended.
export default function WritingPrompt({ exercise, onResult }) {
  const [value, setValue] = useState('')
  const [revealed, setRevealed] = useState(false)

  function handleReveal() {
    if (!value.trim()) return // guard: don't reveal on an empty answer
    setRevealed(true)
  }

  return (
    <div className="flex flex-col gap-4 w-full max-w-sm">
      <p className="text-lg font-medium text-gray-800">{exercise.prompt}</p>

      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={revealed}
        placeholder="Write your answer in German..."
        rows={3}
        className={`rounded-xl border px-4 py-3 text-base resize-none ${
          revealed ? 'border-gray-200 bg-gray-50' : 'border-gray-200'
        }`}
      />

      {!revealed ? (
        <Button onClick={handleReveal} disabled={!value.trim()}>
          Show model answer
        </Button>
      ) : (
        <>
          <div className="rounded-xl bg-primary-50 border border-primary-100 px-4 py-3">
            <p className="text-xs text-primary-600 font-medium mb-1">One possible answer</p>
            <p className="text-gray-800">{exercise.sampleAnswer}</p>
          </div>
          <p className="text-sm text-gray-600">How did you do?</p>
          <div className="flex gap-3">
            <Button variant="outline-danger" className="flex-1" onClick={() => onResult(false, value)}>
              Needs practice
            </Button>
            <Button variant="success" className="flex-1" onClick={() => onResult(true, value)}>
              Got it
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
