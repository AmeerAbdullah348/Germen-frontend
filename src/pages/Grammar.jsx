import { BookOpen, ChevronRight, Lock } from 'lucide-react'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../components/ui/Card'
import { GRAMMAR_TOPICS } from '../data/grammar'
import { isGrammarTopicComplete } from '../lib/grammar'
import { getLevelGroups } from '../lib/levels'
import { getState } from '../lib/progress'

export default function Grammar() {
  const navigate = useNavigate()
  const state = getState()

  const levelGroups = useMemo(
    () => getLevelGroups(GRAMMAR_TOPICS, state, { isComplete: isGrammarTopicComplete }),
    [state]
  )

  return (
    <div className="px-5 pt-8 flex flex-col gap-6 pb-8 text-slate-100">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 flex items-center justify-center">
            <BookOpen size={16} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Grammar</h1>
        </div>
        <p className="text-slate-400 text-xs">Learn German grammar, one topic at a time.</p>
      </div>

      {levelGroups.map((group) => (
        <div key={group.level} className="flex flex-col gap-3">
          <div className="flex items-baseline gap-2">
            <h2 className="text-base font-bold text-white">
              {group.level} <span className="text-slate-400 font-normal">· {group.label}</span>
            </h2>
            <span className="ml-auto text-xs font-bold text-teal-400">
              {group.completedCount}/{group.totalCount} topics
            </span>
          </div>
          {!group.unlocked && (
            <p className="text-xs text-slate-400 -mt-1.5">Complete the previous level to unlock</p>
          )}
          {group.units.map((topic) => (
            <Card
              key={topic.id}
              as="button"
              type="button"
              disabled={!group.unlocked}
              interactive
              onClick={() => navigate(`/grammar/${topic.id}`)}
              className={`text-left flex items-center gap-3.5 p-4 ${
                !group.unlocked
                  ? 'opacity-50 cursor-not-allowed border-white/5'
                  : 'bg-gradient-to-r from-teal-950/60 to-slate-900/90 border-teal-500/30 hover:border-teal-400/60 hover:shadow-[0_0_20px_rgba(20,184,166,0.2)]'
              }`}
            >
              <div className="min-w-0 flex-1">
                <p className={`font-bold text-sm ${!group.unlocked ? 'text-slate-500' : 'text-white'}`}>
                  {topic.title}
                </p>
              </div>
              {!group.unlocked ? (
                <Lock className="shrink-0 text-slate-600" size={18} />
              ) : (
                <ChevronRight className="shrink-0 text-teal-400" size={18} />
              )}
            </Card>
          ))}
        </div>
      ))}
    </div>
  )
}
