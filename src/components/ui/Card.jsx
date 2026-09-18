// Shared card shell — updated for dark royal design system
// Consolidates rounded-2xl/3xl glassmorphic cards with subtle glowing borders across all screens.
export default function Card({
  as: As = 'div',
  interactive = false,
  disabled = false,
  padding = 'p-4',
  className = '',
  children,
  onClick,
  ...props
}) {
  const tone = disabled
    ? 'bg-slate-900/40 border-white/5 opacity-60'
    : 'bg-slate-900/80 border-white/10 shadow-xl shadow-black/40 text-slate-100 backdrop-blur-xl'

  const interactiveClasses =
    interactive && !disabled
      ? 'hover:border-cyan-500/40 hover:shadow-[0_8px_30px_rgba(6,182,212,0.2)] active:scale-[0.99] transition-all cursor-pointer'
      : ''

  return (
    <As
      className={['rounded-2xl border', tone, padding, interactiveClasses, className]
        .filter(Boolean)
        .join(' ')}
      disabled={disabled}
      aria-disabled={disabled || undefined}
      onClick={disabled ? undefined : onClick}
      {...props}
    >
      {children}
    </As>
  )
}
