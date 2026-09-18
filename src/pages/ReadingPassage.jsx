import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Button from '../components/ui/Button'
import { READING_PASSAGES_BY_ID } from '../data/reading'
import { lookupWord } from '../lib/vocabulary'

export default function ReadingPassage() {
  const { passageId } = useParams()
  const navigate = useNavigate()
  const passage = READING_PASSAGES_BY_ID[passageId]
  const [lookup, setLookup] = useState(null)

  if (!passage) {
    return (
      <div className="px-5 pt-8 flex flex-col gap-4 items-center justify-center text-center text-slate-100 min-h-svh bg-[#070b19]">
        <p className="text-slate-400">This passage couldn't be loaded.</p>
        <Link to="/reading" className="text-cyan-400 font-bold hover:underline">
          Back to Reading
        </Link>
      </div>
    )
  }

  function handleWordTap(token) {
    const word = lookupWord(token)
    setLookup({ de: token, en: word?.en ?? null })
  }

  return (
    <div className="px-5 pt-8 flex flex-col gap-6 pb-10 text-slate-100">
      <div>
        <Link to="/reading" className="text-xs text-slate-400 hover:text-white font-medium">
          &larr; Back to Reading
        </Link>
        <h1 className="text-2xl font-extrabold tracking-tight text-white mt-1">{passage.title}</h1>
        <p className="text-slate-400 text-xs">{passage.titleEn}</p>
      </div>

      <div className="rounded-3xl bg-slate-900/90 border border-white/10 p-5.5 flex flex-col gap-4 backdrop-blur-xl shadow-xl">
        {passage.paragraphs.map((line, i) => (
          <p key={i} className="text-base leading-relaxed text-slate-100 font-medium">
            {line.split(' ').map((token, j) => (
              <span
                key={j}
                onClick={() => handleWordTap(token)}
                className="cursor-pointer hover:bg-cyan-500/20 hover:text-cyan-300 rounded px-1 transition-colors inline-block"
              >
                {token}{' '}
              </span>
            ))}
          </p>
        ))}
      </div>

      <p className="text-xs text-slate-400 -mt-3">Tap any word for a quick translation.</p>

      {lookup && (
        <div className="rounded-2xl bg-cyan-500/10 border border-cyan-400/30 p-4 shadow-lg">
          <p className="font-extrabold text-cyan-300 text-base">{lookup.de}</p>
          <p className="text-xs text-slate-300 mt-0.5">{lookup.en ?? 'No definition available for this word yet.'}</p>
        </div>
      )}

      <Button onClick={() => navigate(`/reading/${passage.id}/questions`)}>Start comprehension questions</Button>
    </div>
  )
}
