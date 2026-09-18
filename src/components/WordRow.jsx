import { Star } from 'lucide-react'
import { useState } from 'react'
import { isFavorite, toggleFavorite } from '../lib/favorites'

export default function WordRow({ word, onClick, badge, onToggleFavorite }) {
  const [favorite, setFavorite] = useState(() => isFavorite(word.id))

  function handleToggle(e) {
    e.stopPropagation()
    const next = toggleFavorite(word.id)
    setFavorite(next)
    onToggleFavorite?.(word.id, next)
  }

  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between rounded-xl bg-slate-900/80 border border-white/10 px-4 py-3 shadow-md hover:border-cyan-500/40 transition-all ${
        onClick ? 'cursor-pointer active:scale-[0.99]' : ''
      }`}
    >
      <div className="min-w-0 flex-1">
        <p className="font-bold text-white text-sm truncate">{word.de}</p>
        <p className="text-xs text-slate-400 truncate">{word.en}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {badge}
        <button type="button" onClick={handleToggle} aria-label="Toggle favorite" className="p-1 cursor-pointer">
          <Star size={18} className={favorite ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]' : 'text-slate-600 hover:text-slate-400'} />
        </button>
      </div>
    </div>
  )
}
