import { Spinner } from '../ui/Spinner.jsx'
import { Button } from '../ui/Button.jsx'

/**
 * @param {{ message?: string }} props
 */
export function PageLoading({ message = 'Đang tải...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <Spinner size="lg" />
      <p className="text-sm text-secondary">{message}</p>
    </div>
  )
}

/**
 * @param {{ message: string, onRetry?: () => void }} props
 */
export function PageError({ message, onRetry }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-6 text-center">
      <p className="text-sm text-red-700">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" className="mt-4" onClick={onRetry}>
          Thử lại
        </Button>
      )}
    </div>
  )
}
