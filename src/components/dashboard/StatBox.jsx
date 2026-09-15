// Compact bordered stat box — no shadow, no fill, matches the reference's
// Lessons/Time/Accuracy trio. Deliberately not built on top of the shared
// Card component: Card always adds shadow-sm, and stacking an override class
// on it isn't a reliable way to remove a Tailwind utility that's already applied.
export default function StatBox({ value, label }) {
  return (
    <div className="flex-1 rounded-2xl border border-gray-200 p-3 flex flex-col items-center justify-center gap-0.5 text-center min-w-0">
      <p className="text-xl font-bold text-black truncate w-full">{value}</p>
      <p className="text-[10px] font-semibold tracking-wide text-gray-400 uppercase">{label}</p>
    </div>
  )
}
