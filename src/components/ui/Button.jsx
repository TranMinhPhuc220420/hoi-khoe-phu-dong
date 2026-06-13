const variants = {
  primary:
    'bg-tertiary text-on-primary hover:opacity-90 focus-visible:ring-tertiary/50',
  secondary:
    'border border-secondary text-primary bg-surface hover:bg-neutral focus-visible:ring-secondary/50',
  danger:
    'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500/50',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-3 text-sm',
  lg: 'px-6 py-3.5 text-base',
}

/**
 * @param {import('react').ButtonHTMLAttributes<HTMLButtonElement> & {
 *   variant?: keyof typeof variants
 *   size?: keyof typeof sizes
 * }} props
 */
export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  children,
  ...props
}) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-md font-semibold transition-opacity focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
