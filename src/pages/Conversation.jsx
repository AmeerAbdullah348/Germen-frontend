import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../components/ui/Card'
import { SCENARIOS } from '../data/conversation/scenarios'

export default function Conversation() {
  const navigate = useNavigate()
  const [level, setLevel] = useState('beginner')

  return (
    <div className="px-5 pt-8 flex flex-col gap-6 pb-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Conversation Practice</h1>
        <p className="text-gray-500 text-sm">Pick a scenario and practice real German conversation.</p>
      </div>

      <div className="flex rounded-xl bg-white border border-gray-200 p-1">
        <button
          type="button"
          onClick={() => setLevel('beginner')}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
            level === 'beginner' ? 'bg-primary-600 text-white' : 'text-gray-600'
          }`}
        >
          Beginner
        </button>
        <button
          type="button"
          onClick={() => setLevel('advanced')}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
            level === 'advanced' ? 'bg-primary-600 text-white' : 'text-gray-600'
          }`}
        >
          Advanced
        </button>
      </div>
      <p className="text-xs text-gray-400 -mt-4">
        {level === 'beginner'
          ? 'Mistakes explained in English when needed.'
          : 'German only — no English, even for corrections.'}
      </p>

      <div className="flex flex-col gap-3">
        {SCENARIOS.map((scenario) => (
          <Card
            key={scenario.id}
            as="button"
            type="button"
            interactive
            onClick={() => navigate(`/conversation/${scenario.id}`, { state: { level } })}
            className="text-left flex items-center gap-3"
          >
            <div className="min-w-0 flex-1">
              <p className="font-medium text-gray-900">{scenario.label}</p>
              <p className="text-sm text-gray-500 truncate">{scenario.description}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
