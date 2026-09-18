// Shared track+fill progress bar — glowing dark cyan gradient fill
export default function ProgressBar({
  value,
  max = 100,
  colorClassName = 'bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_10px_rgba(6,182,212,0.6)]',
  trackClassName = 'bg-slate-800/80 border border-white/5',
  heightClassName = 'h-2.5',
  className = '',
}) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0

  return (
    <div
      className={['rounded-full overflow-hidden', heightClassName, trackClassName, className]
        .filter(Boolean)
        .join(' ')}
    >
      <div className={`h-full transition-all duration-300 rounded-full ${colorClassName}`} style={{ width: `${pct}%` }} />
    </div>
  )
}
