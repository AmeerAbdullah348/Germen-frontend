import { Flame } from 'lucide-react'

// Big hero streak card — redesigned with glowing fiery gradient matching the premium theme
export default function StreakCard({ streakCount, weekActivity }) {
  const activeDays = weekActivity.filter(Boolean).length

  return (
    <div className="rounded-3xl bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 text-white p-5 flex flex-col gap-4 shadow-[0_10px_30px_rgba(245,158,11,0.35)] border border-amber-400/40 relative overflow-hidden">
      {/* Background subtle radial light */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-yellow-300/30 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between relative z-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-100/90">Current Streak</p>
          <p className="text-3xl font-extrabold mt-0.5 tracking-tight text-white drop-shadow-md">
            {streakCount} {streakCount === 1 ? 'Day' : 'Days'}
          </p>
        </div>
        <div className="shrink-0 h-12 w-12 rounded-full bg-white/25 border border-white/40 flex items-center justify-center backdrop-blur-md shadow-lg">
          <Flame className="text-yellow-300 fill-yellow-300 animate-bounce" size={24} />
        </div>
      </div>

      <div className="flex flex-col gap-2 relative z-10">
        <div className="flex gap-1.5">
          {weekActivity.map((active, i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                active
                  ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]'
                  : 'bg-white/20'
              }`}
            />
          ))}
        </div>
        <p className="text-xs font-medium text-amber-100/90">{activeDays} of 7 days active this week</p>
      </div>
    </div>
  )
}
