import { useRef, useState } from 'react'
import { isAnswerCorrect } from '../../lib/answerCheck'
import Button from '../ui/Button'

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
    if (submitted || !value.trim()) return
    setSubmitted(true)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full max-w-sm">
      <p className="text-xl font-extrabold text-white leading-snug drop-shadow-sm">{exercise.prompt}</p>

      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={submitted}
        placeholder="Type your answer..."
        className={[
          'rounded-2xl border px-4.5 py-3.5 text-lg font-semibold text-white bg-slate-900/90 outline-none transition-all shadow-inner',
          submitted && isCorrect && 'border-emerald-500/80 bg-emerald-500/20 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.3)]',
          submitted && !isCorrect && 'border-rose-500/80 bg-rose-500/20 text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.3)]',
          !submitted && 'border-white/10 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500',
        ]
          .filter(Boolean)
          .join(' ')}
      />

      {!submitted && (
        <div className="flex gap-2 flex-wrap justify-center">
          {SPECIAL_CHARS.map((char) => (
            <button
              key={char}
              type="button"
              onClick={() => insertChar(char)}
              className="w-10 h-10 rounded-xl border border-white/10 bg-slate-900/80 font-bold text-white hover:bg-cyan-500/20 hover:border-cyan-400/40 transition-all cursor-pointer"
            >
              {char}
            </button>
          ))}
        </div>
      )}

      {submitted && !isCorrect && (
        <p className="text-xs text-slate-400 font-medium">
          Correct answer: <span className="font-bold text-emerald-400">{Array.isArray(exercise.answer) ? exercise.answer[0] : exercise.answer}</span>
        </p>
      )}

      {!submitted ? (
        <Button type="submit" disabled={!value.trim()}>
          Check
        </Button>
      ) : (
        <Button onClick={() => onResult(isCorrect, value)}>Continue</Button>
      )}
    </form>
  )
}
