import { Flame } from 'lucide-react'

// Big black "hero" card for the current streak — the one deliberately
// colorful (well, monochrome-inverted) departure from the bordered-white
// card language used everywhere else on the redesigned Dashboard, matching
// the reference screenshot's single dark focal card.
export default function StreakCard({ streakCount, weekActivity }) {
  const activeDays = weekActivity.filter(Boolean).length

  return (
    <div className="rounded-3xl bg-black text-white p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">Current Streak</p>
          <p className="text-3xl font-bold mt-1 tracking-tight">
            {streakCount} {streakCount === 1 ? 'Day' : 'Days'}
          </p>
        </div>
        <div className="shrink-0 h-11 w-11 rounded-full bg-white flex items-center justify-center">
          <Flame className="text-black" size={20} fill="black" />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex gap-1.5">
          {weekActivity.map((active, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full ${active ? 'bg-white' : 'bg-white/20'}`} />
          ))}
        </div>
        <p className="text-xs text-gray-400">{activeDays} of 7 days this week</p>
      </div>
    </div>
  )
}
