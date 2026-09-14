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
    <div className="px-5 pt-8 flex flex-col gap-6 pb-6">
      <div>
        <Link to="/vocabulary" className="text-sm text-gray-400">
          &larr; Vocabulary
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 mt-1">{decoded}</h1>
        <p className="text-gray-500 text-sm">{words.length} words</p>
      </div>

      {words.length > 0 && (
        <Button onClick={() => navigate(`/vocabulary/${category}/practice`)}>Practice this category</Button>
      )}

      <div className="flex flex-col gap-2">
        {words.map((word) => (
          <WordRow key={word.id} word={word} onClick={() => navigate(`/dictionary/${word.id}`)} />
        ))}
      </div>
    </div>
  )
}
