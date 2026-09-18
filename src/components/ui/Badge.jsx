// Shared pill label — updated for dark theme visual language
const TONES = {
  gray: 'bg-slate-800 text-slate-300 border border-slate-700',
  accent: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
  success: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  danger: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
  primary: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]',
}

export default function Badge({ tone = 'gray', className = '', children }) {
  return (
    <span
      className={['text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm', TONES[tone] ?? TONES.gray, className]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </span>
  )
}
