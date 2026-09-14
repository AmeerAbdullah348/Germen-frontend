// Shared pill label — consolidates the `text-xs font-semibold px-2.5 py-1
// rounded-full` pattern duplicated for the Dashboard "N due" pill and
// Profile's mastery labels.
const TONES = {
  gray: 'bg-gray-100 text-gray-500',
  accent: 'bg-accent-100 text-accent-600',
  success: 'bg-green-50 text-success',
  danger: 'bg-red-50 text-danger',
  primary: 'bg-primary-50 text-primary-600',
}

export default function Badge({ tone = 'gray', className = '', children }) {
  return (
    <span
      className={['text-xs font-semibold px-2.5 py-1 rounded-full', TONES[tone] ?? TONES.gray, className]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </span>
  )
}
