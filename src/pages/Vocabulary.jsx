import { ChevronRight, LibraryBig } from 'lucide-react'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../components/ui/Card'
import { groupVocabByCategory } from '../lib/vocabulary'

export default function Vocabulary() {
  const navigate = useNavigate()
  const groups = useMemo(() => groupVocabByCategory(), [])

  return (
    <div className="px-5 pt-8 flex flex-col gap-6 pb-8 text-slate-100">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 flex items-center justify-center">
            <LibraryBig size={16} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Vocabulary</h1>
        </div>
        <p className="text-slate-400 text-xs">Browse and practice words by category.</p>
      </div>

      <div className="grid grid-cols-2 gap-3.5">
        {Object.entries(groups).map(([category, words]) => (
          <Card
            key={category}
            as="button"
            type="button"
            disabled={words.length === 0}
            interactive
            onClick={() => navigate(`/vocabulary/${encodeURIComponent(category)}`)}
            className="text-left flex flex-col gap-1.5 p-4 bg-gradient-to-b from-slate-900/90 to-blue-950/40 border-white/10 hover:border-blue-400/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.25)] transition-all"
          >
            <div className="flex items-center justify-between">
              <p className={`font-bold text-sm truncate ${words.length === 0 ? 'text-slate-600' : 'text-white'}`}>{category}</p>
              <ChevronRight size={15} className="text-blue-400 shrink-0" />
            </div>
            <p className="text-xs text-blue-300/80 font-medium">{words.length} words</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
