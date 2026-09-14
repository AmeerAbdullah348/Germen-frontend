// Shared track+fill progress bar — consolidates the pattern duplicated for
// the Dashboard XP bar, Dashboard daily-goal bar, and Lesson's exercise
// progress bar.
export default function ProgressBar({
  value,
  max = 100,
  colorClassName = 'bg-primary-500',
  trackClassName = 'bg-gray-100',
  heightClassName = 'h-2',
  className = '',
}) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0

  return (
    <div
      className={['rounded-full overflow-hidden', heightClassName, trackClassName, className]
        .filter(Boolean)
        .join(' ')}
    >
      <div className={`h-full transition-all ${colorClassName}`} style={{ width: `${pct}%` }} />
    </div>
  )
}
