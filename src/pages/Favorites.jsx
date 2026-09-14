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
      <div className="px-5 pt-8 flex flex-col gap-4 items-center text-center">
        <Star className="text-gray-300" size={40} />
        <p className="text-gray-500">No favorites yet — tap the star on any word to save it here.</p>
      </div>
    )
  }

  return (
    <div className="px-5 pt-8 flex flex-col gap-6 pb-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Favorites</h1>
        <p className="text-gray-500 text-sm">{visibleWords.length} saved words</p>
      </div>

      <Button onClick={() => navigate('/favorites/practice')}>Practice favorites</Button>

      <div className="flex flex-col gap-2">
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
