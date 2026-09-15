import { ArrowRight } from 'lucide-react'

// Bordered card with a small black icon box and a circular arrow button —
// the reusable building block for "Continue Learning", Daily Challenge,
// the placement-test prompt, and the CEFR unit list, so the redesigned
// Dashboard shares one consistent visual language instead of each section
// inventing its own card shape.
export default function LearningCard({ icon: Icon, title, description, onClick, disabled = false, badge }) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-disabled={disabled || undefined}
      onClick={disabled ? undefined : onClick}
      className={[
        'text-left w-full rounded-2xl border p-4 flex flex-col gap-3',
        disabled
          ? 'border-gray-100 bg-gray-50 cursor-not-allowed'
          : 'border-gray-200 bg-white active:scale-[0.99] transition-transform',
      ].join(' ')}
    >
      <div className="flex items-center justify-between">
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${disabled ? 'bg-gray-200' : 'bg-black'}`}>
          <Icon className={disabled ? 'text-gray-400' : 'text-white'} size={18} />
        </div>
        <div className="flex items-center gap-2">
          {badge}
          <span
            className={`shrink-0 h-8 w-8 rounded-full border flex items-center justify-center ${
              disabled ? 'border-gray-200 text-gray-300' : 'border-gray-200 text-black'
            }`}
          >
            <ArrowRight size={15} />
          </span>
        </div>
      </div>
      <div className="min-w-0">
        <p className={`font-semibold truncate ${disabled ? 'text-gray-400' : 'text-black'}`}>{title}</p>
        {description && (
          <p className={`text-sm mt-0.5 truncate ${disabled ? 'text-gray-400' : 'text-gray-500'}`}>{description}</p>
        )}
      </div>
    </button>
  )
}
