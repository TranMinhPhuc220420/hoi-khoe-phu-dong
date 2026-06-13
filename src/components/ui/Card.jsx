/**
 * @param {import('react').HTMLAttributes<HTMLDivElement> & {
 *   title?: string
 *   description?: string
 * }} props
 */
export function Card({ title, description, className = '', children, ...props }) {
  return (
    <div
      className={`rounded-lg bg-surface p-6 text-primary shadow-sm ${className}`}
      {...props}
    >
      {(title || description) && (
        <div className="mb-4">
          {title && <h3 className="text-lg font-bold">{title}</h3>}
          {description && <p className="mt-1 text-sm text-secondary">{description}</p>}
        </div>
      )}
      {children}
    </div>
  )
}
