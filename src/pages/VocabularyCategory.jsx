import { useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Button from '../components/ui/Button'
import WordRow from '../components/WordRow'
import { groupVocabByCategory } from '../lib/vocabulary'

export default function VocabularyCategory() {
  const navigate = useNavigate()
  const { category } = useParams()
  const decoded = decodeURIComponent(category)
  const groups = useMemo(() => groupVocabByCategory(), [])
  const words = groups[decoded] ?? []

  return (
    <div className="px-5 pt-8 flex flex-col gap-6 pb-8 text-slate-100">
      <div>
        <Link to="/vocabulary" className="text-xs text-slate-400 hover:text-white font-medium">
          &larr; Back to Vocabulary
        </Link>
        <h1 className="text-2xl font-extrabold tracking-tight text-white mt-1">{decoded}</h1>
        <p className="text-blue-400 text-xs font-bold">{words.length} words</p>
      </div>

      {words.length > 0 && (
        <Button onClick={() => navigate(`/vocabulary/${category}/practice`)}>Practice this category</Button>
      )}

      <div className="flex flex-col gap-2.5">
        {words.map((word) => (
          <WordRow key={word.id} word={word} onClick={() => navigate(`/dictionary/${word.id}`)} />
        ))}
      </div>
    </div>
  )
}
