import { ArrowRight } from 'lucide-react'

// Redesigned LearningCard with dark glass container, glowing circular icon badge, and arrow
export default function LearningCard({ icon: Icon, title, description, onClick, disabled = false, badge, theme }) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-disabled={disabled || undefined}
      onClick={disabled ? undefined : onClick}
      className={[
        'text-left w-full rounded-2xl border p-4 flex flex-col gap-3 transition-all duration-200',
        disabled
          ? 'border-white/5 bg-slate-900/40 opacity-60 cursor-not-allowed'
          : theme?.gradient
          ? `${theme.gradient} ${theme.glow} border-white/20 active:scale-[0.99]`
          : 'border-white/10 bg-slate-900/80 backdrop-blur-xl shadow-xl shadow-black/30 hover:border-cyan-500/40 hover:shadow-[0_4px_20px_rgba(6,182,212,0.2)] active:scale-[0.99]',
      ].join(' ')}
    >
      <div className="flex items-center justify-between">
        <div
          className={`h-11 w-11 rounded-full flex items-center justify-center border shadow-inner ${
            disabled
              ? 'bg-slate-800 border-white/5 text-slate-500'
              : theme?.iconBg
              ? theme.iconBg
              : 'bg-cyan-500/20 border-cyan-400/30 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
          }`}
        >
          <Icon className={disabled ? 'text-slate-500' : theme?.iconColor || 'text-cyan-300'} size={20} />
        </div>
        <div className="flex items-center gap-2">
          {badge}
          <span
            className={`shrink-0 h-8 w-8 rounded-full border flex items-center justify-center transition-transform ${
              disabled
                ? 'border-white/5 text-slate-600'
                : 'border-white/20 bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <ArrowRight size={15} />
          </span>
        </div>
      </div>
      <div className="min-w-0">
        <p className={`font-bold truncate ${disabled ? 'text-slate-500' : theme?.textColor || 'text-white'}`}>{title}</p>
        {description && (
          <p className={`text-xs mt-0.5 truncate ${disabled ? 'text-slate-600' : theme?.subtitleColor || 'text-slate-300'}`}>{description}</p>
        )}
      </div>
    </button>
  )
}
