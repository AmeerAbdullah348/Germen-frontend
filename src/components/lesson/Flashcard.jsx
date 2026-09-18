import { useState } from 'react'
import Button from '../ui/Button'

export default function Flashcard({ exercise, onResult }) {
  const [flipped, setFlipped] = useState(false)

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm">
      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        className="w-full h-64 rounded-3xl bg-gradient-to-b from-slate-900/90 to-blue-950/60 border border-white/15 shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-2xl flex flex-col items-center justify-center text-center p-6 text-2xl font-extrabold text-white active:scale-[0.98] transition-all cursor-pointer relative overflow-hidden group hover:border-cyan-400/40"
      >
        <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-3">
          {flipped ? 'Translation' : 'German'}
        </span>
        <span className="drop-shadow-md">{flipped ? exercise.back : exercise.front}</span>
      </button>
      <p className="text-xs text-slate-400 font-medium">Tap the card to flip it</p>

      {flipped && (
        <div className="flex gap-3 w-full">
          <Button variant="outline-danger" className="flex-1" onClick={() => onResult(false)}>
            Didn't know it
          </Button>
          <Button variant="success" className="flex-1" onClick={() => onResult(true)}>
            Knew it
          </Button>
        </div>
      )}
    </div>
  )
}
