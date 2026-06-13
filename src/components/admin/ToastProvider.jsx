import { useCallback, useMemo, useState } from 'react'
import { ToastContext } from './ToastContext.js'

/** @typedef {{ id: number, message: string, type: 'success' | 'error' }} ToastItem */

/**
 * @param {{ children: import('react').ReactNode }} props
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState(/** @type {ToastItem[]} */ ([]))

  const dismiss = useCallback((id) => {
    setToasts((items) => items.filter((t) => t.id !== id))
  }, [])

  const push = useCallback(
    (message, type) => {
      const id = Date.now() + Math.random()
      setToasts((items) => [...items, { id, message, type }])
      setTimeout(() => dismiss(id), 4000)
    },
    [dismiss],
  )

  const value = useMemo(
    () => ({
      success: (message) => push(message, 'success'),
      error: (message) => push(message, 'error'),
    }),
    [push],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-4 right-4 z-[100] flex max-w-sm flex-col gap-2"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-md px-4 py-3 text-sm font-medium shadow-lg ${
              toast.type === 'success'
                ? 'bg-primary text-on-primary'
                : 'bg-red-600 text-white'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
