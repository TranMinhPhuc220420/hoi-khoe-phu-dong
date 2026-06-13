/**
 * @param {{ size?: 'sm' | 'md' | 'lg', className?: string }} props
 */
export function Spinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-[3px]',
  }

  return (
    <div
      role="status"
      aria-label="Đang tải"
      className={`animate-spin rounded-full border-tertiary border-t-transparent ${sizes[size]} ${className}`}
    />
  )
}
