import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../components/ui/Card'
import { groupVocabByCategory } from '../lib/vocabulary'

export default function Vocabulary() {
  const navigate = useNavigate()
  const groups = useMemo(() => groupVocabByCategory(), [])

  return (
    <div className="px-5 pt-8 flex flex-col gap-6 pb-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Vocabulary</h1>
        <p className="text-gray-500 text-sm">Browse and practice words by category.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {Object.entries(groups).map(([category, words]) => (
          <Card
            key={category}
            as="button"
            type="button"
            disabled={words.length === 0}
            interactive
            onClick={() => navigate(`/vocabulary/${encodeURIComponent(category)}`)}
            className="text-left flex flex-col gap-1"
          >
            <p className={`font-medium ${words.length === 0 ? 'text-gray-300' : 'text-gray-900'}`}>{category}</p>
            <p className="text-xs text-gray-400">{words.length} words</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
