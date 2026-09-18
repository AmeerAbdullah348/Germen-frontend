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
    if (submitted || built.length === 0) return
    setSubmitted(true)
  }

  return (
    <div className="flex flex-col gap-5 w-full max-w-sm">
      <p className="text-xl font-extrabold text-white leading-snug">{exercise.prompt}</p>

      {/* Built words drop zone */}
      <div className="min-h-16 rounded-2xl border border-white/10 bg-slate-900/90 p-3 flex flex-wrap gap-2 shadow-inner">
        {built.map((word, i) => (
          <button
            key={`${word}-${i}`}
            type="button"
            onClick={() => removeWord(i)}
            disabled={submitted}
            className="rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-600/30 text-cyan-200 border border-cyan-400/30 px-3.5 py-2 text-sm font-bold shadow-[0_0_10px_rgba(6,182,212,0.2)] cursor-pointer"
          >
            {word}
          </button>
        ))}
      </div>

      {/* Word bank */}
      <div className="flex flex-wrap gap-2 justify-center">
        {bank.map((word, i) => (
          <button
            key={`${word}-${i}`}
            type="button"
            onClick={() => addWord(i)}
            disabled={submitted}
            className="rounded-xl border border-white/10 bg-slate-800/80 px-3.5 py-2 text-sm font-bold text-slate-200 hover:border-white/20 hover:bg-slate-700/80 transition-all cursor-pointer"
          >
            {word}
          </button>
        ))}
      </div>

      {submitted && !isCorrect && (
        <p className="text-xs text-slate-400 font-medium">
          Correct answer: <span className="font-bold text-emerald-400">{exercise.answer}</span>
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
