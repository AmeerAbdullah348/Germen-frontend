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
      <div className="px-5 pt-8 flex flex-col gap-4 items-center text-center">
        <p className="text-gray-600">This passage couldn't be loaded.</p>
        <Link to="/reading" className="text-primary-600 font-medium">
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
    <div className="px-5 pt-8 flex flex-col gap-6 pb-10">
      <div>
        <Link to="/reading" className="text-sm text-gray-400">
          &larr; Reading
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 mt-1">{passage.title}</h1>
        <p className="text-gray-500 text-sm">{passage.titleEn}</p>
      </div>

      <div className="rounded-2xl bg-white border border-gray-200 p-5 flex flex-col gap-3">
        {passage.paragraphs.map((line, i) => (
          <p key={i} className="text-lg leading-relaxed text-gray-800">
            {line.split(' ').map((token, j) => (
              <span
                key={j}
                onClick={() => handleWordTap(token)}
                className="cursor-pointer hover:bg-primary-50 rounded px-0.5"
              >
                {token}{' '}
              </span>
            ))}
          </p>
        ))}
      </div>

      <p className="text-xs text-gray-400 -mt-3">Tap any word for a quick translation.</p>

      {lookup && (
        <div className="rounded-xl bg-primary-50 border border-primary-100 px-4 py-3">
          <p className="font-medium text-primary-700">{lookup.de}</p>
          <p className="text-sm text-gray-600">{lookup.en ?? 'No definition available for this word yet.'}</p>
        </div>
      )}

      <Button onClick={() => navigate(`/reading/${passage.id}/questions`)}>Start comprehension questions</Button>
    </div>
  )
}
