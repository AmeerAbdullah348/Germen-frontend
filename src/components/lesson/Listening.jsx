import { Volume2 } from 'lucide-react'
import { useState } from 'react'
import { SLOW_RATE, speak } from '../../lib/speech'
import Button from '../ui/Button'

export default function Listening({ exercise, onResult }) {
  const [selected, setSelected] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [played, setPlayed] = useState(false)

  const isCorrect = selected === exercise.answer

  function handlePlay(rate = 1) {
    speak(exercise.audioText, 'de-DE', rate)
    setPlayed(true)
  }

  function handleSelect(option) {
    if (submitted) return
    setSelected(option)
  }

  function handleSubmit() {
    if (submitted || selected === null) return
    setSubmitted(true)
  }

  return (
    <div className="flex flex-col gap-5 w-full max-w-sm">
      <div className="flex flex-col items-center gap-3.5 rounded-3xl bg-slate-900/90 border border-white/10 p-6 backdrop-blur-xl shadow-xl">
        <button
          type="button"
          onClick={() => handlePlay()}
          className="w-18 h-18 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.5)] active:scale-95 transition-all cursor-pointer"
        >
          <Volume2 size={32} />
        </button>
        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-400 font-medium">{played ? 'Tap to replay' : 'Tap to listen'}</span>
          <button
            type="button"
            onClick={() => handlePlay(SLOW_RATE)}
            className="text-xs text-cyan-400 font-bold hover:underline cursor-pointer"
          >
            Slower
          </button>
        </div>
      </div>

      <p className="text-lg font-bold text-white leading-snug">{exercise.prompt}</p>

      <div className="flex flex-col gap-3">
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
                'text-left rounded-2xl border px-4.5 py-3.5 font-bold transition-all text-sm cursor-pointer shadow-md',
                showCorrect && 'border-emerald-500/80 bg-emerald-500/20 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]',
                showWrong && 'border-rose-500/80 bg-rose-500/20 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.3)]',
                !submitted && isSelected && 'border-cyan-400 bg-cyan-500/20 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.3)]',
                !submitted && !isSelected && 'border-white/10 bg-slate-900/80 text-slate-200 hover:border-white/20 hover:bg-slate-800/80',
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
