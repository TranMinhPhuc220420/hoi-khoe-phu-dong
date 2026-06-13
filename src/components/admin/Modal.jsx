/**
 * @param {{
 *   open: boolean
 *   title: string
 *   children: import('react').ReactNode
 *   onClose: () => void
 *   footer?: import('react').ReactNode
 *   wide?: boolean
 * }} props
 */
export function Modal({ open, title, children, onClose, footer, wide = false }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        aria-label="Đóng"
        className="absolute inset-0 bg-primary/40"
        onClick={onClose}
      />
      <div
        className={`relative z-10 max-h-[90vh] w-full overflow-y-auto rounded-lg bg-surface shadow-xl ${
          wide ? 'max-w-2xl' : 'max-w-md'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="border-b border-secondary/20 px-6 py-4">
          <h2 id="modal-title" className="text-lg font-bold text-primary">
            {title}
          </h2>
        </div>
        <div className="px-6 py-4">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 border-t border-secondary/20 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
