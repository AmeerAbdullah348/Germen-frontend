import { useState } from 'react'
import Button from '../ui/Button'

export default function WritingPrompt({ exercise, onResult }) {
  const [value, setValue] = useState('')
  const [revealed, setRevealed] = useState(false)

  function handleReveal() {
    if (!value.trim()) return
    setRevealed(true)
  }

  return (
    <div className="flex flex-col gap-5 w-full max-w-sm">
      <p className="text-xl font-extrabold text-white leading-snug">{exercise.prompt}</p>

      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={revealed}
        placeholder="Write your answer in German..."
        rows={4}
        className={`rounded-2xl border px-4 py-3 text-base resize-none font-medium outline-none transition-all shadow-inner text-white ${
          revealed ? 'border-white/10 bg-slate-900/50 text-slate-400' : 'border-white/10 bg-slate-900/90 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500'
        }`}
      />

      {!revealed ? (
        <Button onClick={handleReveal} disabled={!value.trim()}>
          Show model answer
        </Button>
      ) : (
        <>
          <div className="rounded-2xl bg-cyan-500/10 border border-cyan-400/30 p-4">
            <p className="text-xs text-cyan-400 font-bold uppercase tracking-wider mb-1">One possible answer</p>
            <p className="text-slate-100 font-medium text-sm leading-relaxed">{exercise.sampleAnswer}</p>
          </div>
          <p className="text-xs text-slate-400 font-medium text-center">How did you do?</p>
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
