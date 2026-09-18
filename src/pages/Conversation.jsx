import { ChevronRight, MessageCircleHeart } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../components/ui/Card'
import { SCENARIOS } from '../data/conversation/scenarios'

export default function Conversation() {
  const navigate = useNavigate()
  const [level, setLevel] = useState('beginner')

  return (
    <div className="px-5 pt-8 flex flex-col gap-6 pb-8 text-slate-100">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 flex items-center justify-center">
            <MessageCircleHeart size={16} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Conversation Practice</h1>
        </div>
        <p className="text-slate-400 text-xs">Pick a scenario and practice real German conversation.</p>
      </div>

      <div className="flex rounded-2xl bg-slate-900/90 border border-white/10 p-1.5 backdrop-blur-xl">
        <button
          type="button"
          onClick={() => setLevel('beginner')}
          className={`flex-1 rounded-xl py-2.5 text-xs font-bold transition-all cursor-pointer ${
            level === 'beginner'
              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-[0_0_12px_rgba(99,102,241,0.4)]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Beginner
        </button>
        <button
          type="button"
          onClick={() => setLevel('advanced')}
          className={`flex-1 rounded-xl py-2.5 text-xs font-bold transition-all cursor-pointer ${
            level === 'advanced'
              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-[0_0_12px_rgba(99,102,241,0.4)]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Advanced
        </button>
      </div>
      <p className="text-xs text-indigo-300 -mt-3.5 font-medium">
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
            className="text-left flex items-center gap-3.5 p-4 bg-gradient-to-r from-indigo-950/60 to-slate-900/90 border-indigo-500/30 hover:border-indigo-400/60 hover:shadow-[0_0_20px_rgba(99,102,241,0.2)] transition-all"
          >
            <div className="min-w-0 flex-1">
              <p className="font-bold text-white text-sm">{scenario.label}</p>
              <p className="text-xs text-slate-400 truncate mt-0.5">{scenario.description}</p>
            </div>
            <ChevronRight size={18} className="text-indigo-400 shrink-0" />
          </Card>
        ))}
      </div>
    </div>
  )
}
