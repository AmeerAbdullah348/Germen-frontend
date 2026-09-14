import { Lock } from 'lucide-react'
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
    <div className="px-5 pt-8 flex flex-col gap-6 pb-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Grammar</h1>
        <p className="text-gray-500 text-sm">Learn German grammar, one topic at a time.</p>
      </div>

      {levelGroups.map((group) => (
        <div key={group.level} className="flex flex-col gap-3">
          <div className="flex items-baseline gap-2">
            <h2 className="text-lg font-medium text-gray-800">
              {group.level} <span className="text-gray-400 font-normal">· {group.label}</span>
            </h2>
            <span className="ml-auto text-xs font-medium text-gray-400">
              {group.completedCount}/{group.totalCount} topics
            </span>
          </div>
          {!group.unlocked && (
            <p className="text-xs text-gray-400 -mt-1.5">Complete the previous level to unlock</p>
          )}
          {group.units.map((topic) => (
            <Card
              key={topic.id}
              as="button"
              type="button"
              disabled={!group.unlocked}
              interactive
              onClick={() => navigate(`/grammar/${topic.id}`)}
              className={`text-left flex items-center gap-3 ${!group.unlocked ? 'cursor-not-allowed' : ''}`}
            >
              <div className="min-w-0 flex-1">
                <p className={`font-medium truncate ${!group.unlocked ? 'text-gray-400' : 'text-gray-900'}`}>
                  {topic.title}
                </p>
              </div>
              {!group.unlocked && <Lock className="shrink-0 text-gray-300" size={18} />}
            </Card>
          ))}
        </div>
      ))}
    </div>
  )
}
