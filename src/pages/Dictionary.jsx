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
    <div className="px-5 pt-8 flex flex-col gap-6 pb-8 text-slate-100">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 flex items-center justify-center">
            <Search size={16} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Dictionary</h1>
        </div>
        <p className="text-slate-400 text-xs">Search every word across the app.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a German or English word…"
          className="w-full rounded-2xl bg-slate-900/90 border border-white/10 pl-11 pr-10 py-3.5 text-sm text-white placeholder:text-slate-400 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 shadow-inner"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Clear search"
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2.5">
        {results.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-8">No words found.</p>
        ) : (
          results.map((word) => <WordRow key={word.id} word={word} onClick={() => navigate(`/dictionary/${word.id}`)} />)
        )}
      </div>

      {!query && allVocab.length > PREVIEW_COUNT && (
        <p className="text-xs text-slate-500 text-center">
          Showing {PREVIEW_COUNT} of {allVocab.length} words — search to find more.
        </p>
      )}
    </div>
  )
}
