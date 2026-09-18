import { Target } from 'lucide-react'
import { useState } from 'react'
import Card from '../components/ui/Card'
import ProgressBar from '../components/ui/ProgressBar'
import { claimMission, getMissionsWithProgress } from '../lib/missions'

function MissionRow({ mission, period, onClaimed }) {
  function handleClaim() {
    if (claimMission(mission.id, period)) onClaimed()
  }

  return (
    <Card className="flex flex-col gap-2.5 p-4 bg-gradient-to-r from-purple-950/60 to-slate-900/90 border-purple-500/30">
      <div className="flex items-center justify-between gap-3">
        <p className="text-white font-bold text-sm">{mission.label}</p>
        <span className="text-xs text-purple-300 font-semibold shrink-0">
          {mission.progress}/{mission.target}
        </span>
      </div>
      <ProgressBar
        value={mission.progress}
        max={mission.target}
        colorClassName="bg-gradient-to-r from-purple-400 to-indigo-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"
        heightClassName="h-2"
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-amber-300 font-extrabold">+{mission.xp} XP</span>
        {mission.complete && !mission.claimed && (
          <button
            type="button"
            onClick={handleClaim}
            className="rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-3.5 py-1.5 text-xs font-bold shadow-[0_0_12px_rgba(168,85,247,0.4)] cursor-pointer"
          >
            Claim
          </button>
        )}
        {mission.claimed && <span className="text-xs text-emerald-400 font-bold">Claimed</span>}
      </div>
    </Card>
  )
}

export default function Missions() {
  const [refreshKey, setRefreshKey] = useState(0)
  const dailyMissions = getMissionsWithProgress('daily')
  const weeklyMissions = getMissionsWithProgress('weekly')
  void refreshKey

  return (
    <div className="px-5 pt-8 flex flex-col gap-6 pb-8 text-slate-100">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 flex items-center justify-center">
            <Target size={16} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Missions</h1>
        </div>
        <p className="text-slate-400 text-xs">Complete missions for bonus XP.</p>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-xs font-bold text-purple-400 uppercase tracking-wider">Daily</h2>
        {dailyMissions.map((mission) => (
          <MissionRow
            key={mission.id}
            mission={mission}
            period="daily"
            onClaimed={() => setRefreshKey((k) => k + 1)}
          />
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-xs font-bold text-purple-400 uppercase tracking-wider">Weekly</h2>
        {weeklyMissions.map((mission) => (
          <MissionRow
            key={mission.id}
            mission={mission}
            period="weekly"
            onClaimed={() => setRefreshKey((k) => k + 1)}
          />
        ))}
      </div>
    </div>
  )
}
