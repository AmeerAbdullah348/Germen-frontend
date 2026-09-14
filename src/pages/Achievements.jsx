import { Award, Lock } from 'lucide-react'
import { useMemo } from 'react'
import Card from '../components/ui/Card'
import { ACHIEVEMENTS, checkAndUnlockAchievements, getUnlockedAchievementIds } from '../lib/achievements'

export default function Achievements() {
  // Opportunistically evaluate on every visit so achievements earned since
  // the last check show up unlocked immediately.
  const unlockedIds = useMemo(() => {
    checkAndUnlockAchievements()
    return new Set(getUnlockedAchievementIds())
  }, [])

  return (
    <div className="px-5 pt-8 flex flex-col gap-6 pb-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Achievements</h1>
        <p className="text-gray-500 text-sm">
          {unlockedIds.size}/{ACHIEVEMENTS.length} unlocked
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {ACHIEVEMENTS.map((achievement) => {
          const unlocked = unlockedIds.has(achievement.id)
          return (
            <Card key={achievement.id} disabled={!unlocked} className="flex items-center gap-3">
              <div
                className={`shrink-0 h-11 w-11 rounded-full flex items-center justify-center ${
                  unlocked ? 'bg-accent-50' : 'bg-gray-100'
                }`}
              >
                {unlocked ? (
                  <Award className="text-accent-500" size={22} />
                ) : (
                  <Lock className="text-gray-300" size={20} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`font-medium ${unlocked ? 'text-gray-900' : 'text-gray-400'}`}>{achievement.label}</p>
                <p className={`text-sm ${unlocked ? 'text-gray-500' : 'text-gray-300'}`}>{achievement.description}</p>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
