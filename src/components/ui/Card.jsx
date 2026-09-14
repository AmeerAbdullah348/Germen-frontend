// Shared card shell — consolidates the `rounded-2xl bg-white border
// border-gray-200 shadow-sm` pattern that was duplicated across Dashboard,
// Profile, and elsewhere. `padding` is a prop (not baked into `className`)
// because Tailwind utility overrides via class-string concatenation aren't
// reliable — callers that need different padding pass their own value.
export default function Card({
  as: As = 'div',
  interactive = false,
  disabled = false,
  padding = 'p-4',
  className = '',
  children,
  ...props
}) {
  const tone = disabled
    ? 'bg-gray-50 border-gray-100'
    : 'bg-white border-gray-200 shadow-sm'
  const interactiveClasses =
    interactive && !disabled
      ? 'hover:shadow-md hover:border-primary-200 active:scale-[0.99] transition-all'
      : ''

  return (
    <As
      className={['rounded-2xl border', tone, padding, interactiveClasses, className]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </As>
  )
}
