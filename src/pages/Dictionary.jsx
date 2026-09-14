import { Search, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import WordRow from '../components/WordRow'
import { getAllVocab } from '../lib/vocabulary'

const PREVIEW_COUNT = 30

export default function Dictionary() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const allVocab = useMemo(() => getAllVocab(), [])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return allVocab.slice(0, PREVIEW_COUNT)
    return allVocab.filter((word) => word.de.toLowerCase().includes(q) || word.en.toLowerCase().includes(q))
  }, [query, allVocab])

  return (
    <div className="px-5 pt-8 flex flex-col gap-6 pb-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Dictionary</h1>
        <p className="text-gray-500 text-sm">Search every word across the app.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a German or English word…"
          className="w-full rounded-2xl bg-white border border-gray-200 shadow-sm pl-10 pr-9 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {results.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No words found.</p>
        ) : (
          results.map((word) => <WordRow key={word.id} word={word} onClick={() => navigate(`/dictionary/${word.id}`)} />)
        )}
      </div>

      {!query && allVocab.length > PREVIEW_COUNT && (
        <p className="text-xs text-gray-400 text-center">
          Showing {PREVIEW_COUNT} of {allVocab.length} words — search to find more.
        </p>
      )}
    </div>
  )
}
