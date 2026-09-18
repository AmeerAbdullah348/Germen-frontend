import { Star } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import WordRow from '../components/WordRow'
import { getFavoriteIds } from '../lib/favorites'
import { getAllVocab } from '../lib/vocabulary'

export default function Favorites() {
  const navigate = useNavigate()
  const [removedIds, setRemovedIds] = useState(() => new Set())

  const favoriteWords = useMemo(() => {
    const ids = new Set(getFavoriteIds())
    return getAllVocab().filter((word) => ids.has(word.id))
  }, [])

  const visibleWords = favoriteWords.filter((word) => !removedIds.has(word.id))

  function handleToggleFavorite(wordId, nowFavorite) {
    if (!nowFavorite) setRemovedIds((prev) => new Set(prev).add(wordId))
  }

  if (visibleWords.length === 0) {
    return (
      <div className="px-5 pt-12 flex flex-col gap-4 items-center justify-center text-center text-slate-100 min-h-[60vh]">
        <div className="h-16 w-16 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.3)]">
          <Star size={32} fill="currentColor" />
        </div>
        <h2 className="text-xl font-bold text-white">No favorites yet</h2>
        <p className="text-slate-400 text-xs max-w-xs leading-relaxed">
          Tap the star icon on any word across lessons or dictionary to save it here for quick review.
        </p>
      </div>
    )
  }

  return (
    <div className="px-5 pt-8 flex flex-col gap-6 pb-8 text-slate-100">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 flex items-center justify-center">
            <Star size={16} fill="currentColor" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Favorites</h1>
        </div>
        <p className="text-amber-400 text-xs font-bold">{visibleWords.length} saved words</p>
      </div>

      <Button onClick={() => navigate('/favorites/practice')}>Practice favorites</Button>

      <div className="flex flex-col gap-2.5">
        {visibleWords.map((word) => (
          <WordRow
            key={word.id}
            word={word}
            onClick={() => navigate(`/dictionary/${word.id}`)}
            onToggleFavorite={handleToggleFavorite}
          />
        ))}
      </div>
    </div>
  )
}
