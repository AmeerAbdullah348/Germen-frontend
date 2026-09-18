import { Star, Volume2 } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Badge from '../components/ui/Badge'
import { isFavorite, toggleFavorite } from '../lib/favorites'
import { speak } from '../lib/speech'
import { getRelatedVocab, getVocabById } from '../lib/vocabulary'

export default function DictionaryWord() {
  const { wordId } = useParams()
  const word = getVocabById(wordId)
  const [favorite, setFavorite] = useState(() => (word ? isFavorite(word.id) : false))

  if (!word) {
    return (
      <div className="px-5 pt-8 flex flex-col gap-4 items-center justify-center text-center text-slate-100 min-h-svh bg-[#070b19]">
        <p className="text-slate-400">Word not found.</p>
        <Link to="/dictionary" className="text-cyan-400 font-bold hover:underline">
          Back to Dictionary
        </Link>
      </div>
    )
  }

  const related = getRelatedVocab(word)

  return (
    <div className="px-5 pt-8 flex flex-col gap-6 pb-10 text-slate-100">
      <Link to="/dictionary" className="text-xs text-slate-400 hover:text-white font-medium">
        &larr; Back to Dictionary
      </Link>

      <div className="flex items-start justify-between gap-3 p-5 rounded-3xl bg-slate-900/90 border border-white/10 shadow-xl backdrop-blur-xl">
        <div>
          <h1 className="text-3xl font-black text-white drop-shadow-md">{word.de}</h1>
          <p className="text-base font-bold text-cyan-300 mt-0.5">{word.en}</p>
        </div>
        <button
          type="button"
          onClick={() => setFavorite(toggleFavorite(word.id))}
          aria-label="Toggle favorite"
          className="shrink-0 p-1 cursor-pointer"
        >
          <Star size={24} className={favorite ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]' : 'text-slate-600 hover:text-slate-400'} />
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
        className="flex items-center gap-2 text-cyan-400 font-bold w-fit hover:underline text-sm cursor-pointer"
      >
        <Volume2 size={20} /> Listen
      </button>

      {word.plural && (
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10">
          <p className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">Plural</p>
          <p className="text-white font-bold text-sm">{word.plural}</p>
        </div>
      )}

      {word.pronunciation && (
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10">
          <p className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">Pronunciation</p>
          <p className="text-white font-bold text-sm">{word.pronunciation}</p>
        </div>
      )}

      {word.exampleDe && (
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 flex flex-col gap-1">
          <p className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-0.5">Example</p>
          <p className="text-white font-bold text-sm leading-relaxed">{word.exampleDe}</p>
          <p className="text-xs text-slate-400 font-medium">{word.exampleEn}</p>
        </div>
      )}

      {related.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Related words</p>
          {related.map((relatedWord) => (
            <Link
              key={relatedWord.id}
              to={`/dictionary/${relatedWord.id}`}
              className="rounded-xl bg-slate-900/80 border border-white/10 px-4 py-3 flex items-center justify-between hover:border-cyan-500/40 transition-all"
            >
              <span className="font-bold text-white text-sm">{relatedWord.de}</span>
              <span className="text-xs text-slate-400">{relatedWord.en}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
