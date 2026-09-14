import { Star } from 'lucide-react'
import { useState } from 'react'
import { isFavorite, toggleFavorite } from '../lib/favorites'

// Shared word row used by Dictionary search results, Vocabulary category
// lists, and the Favorites list — a plain de/en row with a favorite-star
// toggle, matching the existing `rounded-xl bg-white border border-gray-200
// px-4 py-3` list-row pattern used elsewhere (Profile/Review word rows).
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
      className={`flex items-center justify-between rounded-xl bg-white border border-gray-200 px-4 py-3 ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="min-w-0 flex-1">
        <p className="font-medium text-gray-900 truncate">{word.de}</p>
        <p className="text-sm text-gray-500 truncate">{word.en}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {badge}
        <button type="button" onClick={handleToggle} aria-label="Toggle favorite">
          <Star size={18} className={favorite ? 'fill-accent-400 text-accent-400' : 'text-gray-300'} />
        </button>
      </div>
    </div>
  )
}
