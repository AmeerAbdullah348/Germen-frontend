import { ChevronRight, Lock } from 'lucide-react'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { isContentComplete } from '../lib/contentProgress'
import { getThemeForPath } from '../lib/designSystem'
import { getLevelGroups } from '../lib/levels'
import { getState } from '../lib/progress'
import Card from './ui/Card'

export default function ContentTopicList({ title, description, topics, itemType, basePath, unitLabel = 'topics' }) {
  const navigate = useNavigate()
  const state = getState()
  const theme = getThemeForPath(basePath)

  const levelGroups = useMemo(
    () => getLevelGroups(topics, state, { isComplete: (topic, s) => isContentComplete(topic, s, itemType) }),
    [topics, state, itemType]
  )

  return (
    <div className="px-5 pt-8 flex flex-col gap-6 pb-8 text-slate-100">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold tracking-tight text-white">{title}</h1>
        <p className="text-slate-400 text-xs">{description}</p>
      </div>

      {levelGroups.map((group) => (
        <div key={group.level} className="flex flex-col gap-3">
          <div className="flex items-baseline gap-2">
            <h2 className="text-base font-bold text-white">
              {group.level} <span className="text-slate-400 font-normal">· {group.label}</span>
            </h2>
            <span className="ml-auto text-xs font-bold text-cyan-400">
              {group.completedCount}/{group.totalCount} {unitLabel}
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
              onClick={() => navigate(`${basePath}/${topic.id}`)}
              className={`text-left flex items-center gap-3.5 p-4 ${
                !group.unlocked
                  ? 'opacity-50 cursor-not-allowed border-white/5 bg-slate-900/40'
                  : 'bg-slate-900/80 border-white/10 hover:border-cyan-500/40 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]'
              }`}
            >
              <div className="min-w-0 flex-1">
                <p className={`font-bold text-sm ${!group.unlocked ? 'text-slate-500' : 'text-white'}`}>
                  {topic.title}
                </p>
                {topic.description && (
                  <p className={`text-xs mt-0.5 truncate ${!group.unlocked ? 'text-slate-600' : 'text-slate-400'}`}>
                    {topic.description}
                  </p>
                )}
              </div>
              {!group.unlocked ? (
                <Lock className="shrink-0 text-slate-600" size={18} />
              ) : (
                <ChevronRight className="shrink-0 text-cyan-400" size={18} />
              )}
            </Card>
          ))}
        </div>
      ))}
    </div>
  )
}
