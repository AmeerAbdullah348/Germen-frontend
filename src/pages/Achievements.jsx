import { Award, Lock } from 'lucide-react'
import { useMemo } from 'react'
import Card from '../components/ui/Card'
import { ACHIEVEMENTS, checkAndUnlockAchievements, getUnlockedAchievementIds } from '../lib/achievements'

export default function Achievements() {
  const unlockedIds = useMemo(() => {
    checkAndUnlockAchievements()
    return new Set(getUnlockedAchievementIds())
  }, [])

  return (
    <div className="px-5 pt-8 flex flex-col gap-6 pb-8 text-slate-100">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 flex items-center justify-center">
            <Award size={16} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Achievements</h1>
        </div>
        <p className="text-amber-400 text-xs font-bold">
          {unlockedIds.size}/{ACHIEVEMENTS.length} unlocked
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {ACHIEVEMENTS.map((achievement) => {
          const unlocked = unlockedIds.has(achievement.id)
          return (
            <Card
              key={achievement.id}
              disabled={!unlocked}
              className={`flex items-center gap-3.5 p-4 transition-all ${
                unlocked
                  ? 'bg-gradient-to-r from-amber-950/70 to-slate-900/90 border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                  : 'opacity-50 border-white/5 bg-slate-900/40'
              }`}
            >
              <div
                className={`shrink-0 h-11 w-11 rounded-full flex items-center justify-center ${
                  unlocked
                    ? 'bg-amber-500/20 border border-amber-400/40 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                    : 'bg-white/5 border border-white/10 text-slate-600'
                }`}
              >
                {unlocked ? (
                  <Award className="text-amber-400 fill-amber-400/20" size={22} />
                ) : (
                  <Lock size={18} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`font-bold text-sm ${unlocked ? 'text-white' : 'text-slate-500'}`}>
                  {achievement.label}
                </p>
                <p className={`text-xs mt-0.5 ${unlocked ? 'text-slate-300' : 'text-slate-600'}`}>
                  {achievement.description}
                </p>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
