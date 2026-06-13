/**
 * @param {import('react').InputHTMLAttributes<HTMLInputElement> & {
 *   label?: string
 *   error?: string
 * }} props
 */
export function Input({ label, error, className = '', id, ...props }) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-[0.72rem] font-semibold uppercase tracking-wide text-secondary"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`rounded-md border border-secondary/40 bg-surface px-3 py-2.5 text-primary placeholder:text-secondary/60 focus:border-tertiary focus:outline-none focus:ring-2 focus:ring-tertiary/20 disabled:opacity-50 ${className}`}
        {...props}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
