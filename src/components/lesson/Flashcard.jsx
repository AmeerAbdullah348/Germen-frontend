import { useState } from 'react'

export default function Flashcard({ exercise, onResult }) {
  const [flipped, setFlipped] = useState(false)

  return (
    <div className="flex flex-col items-center gap-6">
      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        className="w-full max-w-sm h-56 rounded-2xl bg-white border border-primary-200 shadow-sm flex items-center justify-center text-center p-6 text-2xl font-medium text-gray-800 active:scale-[0.98] transition-transform"
      >
        {flipped ? exercise.back : exercise.front}
      </button>
      <p className="text-sm text-gray-500">Tap the card to flip it</p>

      {flipped && (
        <div className="flex gap-3 w-full max-w-sm">
          <button
            type="button"
            onClick={() => onResult(false)}
            className="flex-1 rounded-xl border border-danger text-danger py-3 font-medium"
          >
            Didn't know it
          </button>
          <button
            type="button"
            onClick={() => onResult(true)}
            className="flex-1 rounded-xl bg-success text-white py-3 font-medium"
          >
            Knew it
          </button>
        </div>
      )}
    </div>
  )
}
