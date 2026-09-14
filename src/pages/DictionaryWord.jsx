import { Star, Volume2 } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Badge from '../components/ui/Badge'
import { toggleFavorite, isFavorite } from '../lib/favorites'
import { speak } from '../lib/speech'
import { getRelatedVocab, getVocabById } from '../lib/vocabulary'

export default function DictionaryWord() {
  const { wordId } = useParams()
  const word = getVocabById(wordId)
  const [favorite, setFavorite] = useState(() => (word ? isFavorite(word.id) : false))

  if (!word) {
    return (
      <div className="px-5 pt-8 flex flex-col gap-4 items-center text-center">
        <p className="text-gray-600">Word not found.</p>
        <Link to="/dictionary" className="text-primary-600 font-medium">
          Back to Dictionary
        </Link>
      </div>
    )
  }

  const related = getRelatedVocab(word)

  return (
    <div className="px-5 pt-8 flex flex-col gap-6 pb-10">
      <Link to="/dictionary" className="text-sm text-gray-400">
        &larr; Dictionary
      </Link>

      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">{word.de}</h1>
          <p className="text-lg text-gray-500">{word.en}</p>
        </div>
        <button
          type="button"
          onClick={() => setFavorite(toggleFavorite(word.id))}
          aria-label="Toggle favorite"
          className="shrink-0"
        >
          <Star size={24} className={favorite ? 'fill-accent-400 text-accent-400' : 'text-gray-300'} />
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge tone="primary">{word.category}</Badge>
        {word.wordType && <Badge tone="gray">{word.wordType}</Badge>}
        {word.article && <Badge tone="gray">article: {word.article}</Badge>}
      </div>

      <button
        type="button"
        onClick={() => speak(word.de)}
        className="flex items-center gap-2 text-primary-600 font-medium w-fit"
      >
        <Volume2 size={20} /> Listen
      </button>

      {word.plural && (
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-1">Plural</p>
          <p className="text-gray-800">{word.plural}</p>
        </div>
      )}

      {word.pronunciation && (
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-1">Pronunciation</p>
          <p className="text-gray-800">{word.pronunciation}</p>
        </div>
      )}

      {word.exampleDe && (
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-1">Example</p>
          <p className="text-gray-800">{word.exampleDe}</p>
          <p className="text-sm text-gray-500">{word.exampleEn}</p>
        </div>
      )}

      {related.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-gray-500">Related words</p>
          {related.map((relatedWord) => (
            <Link
              key={relatedWord.id}
              to={`/dictionary/${relatedWord.id}`}
              className="rounded-xl bg-white border border-gray-200 px-4 py-3 flex items-center justify-between"
            >
              <span className="font-medium text-gray-900">{relatedWord.de}</span>
              <span className="text-sm text-gray-500">{relatedWord.en}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
