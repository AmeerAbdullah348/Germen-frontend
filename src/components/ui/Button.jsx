// Shared button — consolidates the `rounded-xl ... py-3 font-medium` variants
// duplicated across the lesson exercise components and Lesson.jsx's finished
// screen (primary CTA, outline success/danger self-report actions).
const VARIANTS = {
  primary: 'bg-primary-600 disabled:bg-gray-300 text-white',
  success: 'bg-success text-white',
  'outline-success': 'border border-success text-success',
  'outline-danger': 'border border-danger text-danger',
  outline: 'border border-primary-500 text-primary-600',
  ghost: 'border border-gray-200 text-gray-500',
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
      className={['rounded-xl py-3 font-medium text-center', VARIANTS[variant] ?? VARIANTS.primary, className]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </As>
  )
}
