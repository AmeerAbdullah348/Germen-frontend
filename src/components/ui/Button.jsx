// Shared button — styled with glowing gradients and sleek glass effects
const VARIANTS = {
  primary:
    'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white shadow-[0_4px_20px_rgba(6,182,212,0.35)] hover:shadow-[0_6px_25px_rgba(6,182,212,0.5)] active:scale-[0.98] transition-all',
  secondary:
    'bg-slate-800/90 hover:bg-slate-700/90 text-slate-100 border border-white/10 active:scale-[0.98] transition-all',
  success:
    'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-[0_4px_20px_rgba(16,185,129,0.35)] hover:shadow-[0_6px_25px_rgba(16,185,129,0.5)] active:scale-[0.98] transition-all',
  'outline-success':
    'border border-emerald-500/60 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 active:scale-[0.98] transition-all',
  'outline-danger':
    'border border-rose-500/60 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 active:scale-[0.98] transition-all',
  outline:
    'border border-cyan-500/50 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 active:scale-[0.98] transition-all',
  ghost:
    'border border-white/10 bg-slate-900/60 hover:bg-slate-800/80 text-slate-300 hover:text-white transition-all',
}

export default function Button({
  as: As = 'button',
  variant = 'primary',
  type,
  className = '',
  children,
  ...props
}) {
  return (
    <As
      type={As === 'button' ? (type ?? 'button') : undefined}
      className={['rounded-xl py-3 font-semibold text-center cursor-pointer disabled:cursor-not-allowed', VARIANTS[variant] ?? VARIANTS.primary, className]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </As>
  )
}
