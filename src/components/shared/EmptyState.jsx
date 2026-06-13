/**
 * @param {{ title?: string, description?: string, action?: import('react').ReactNode }} props
 */
export function EmptyState({ title = 'Chưa có dữ liệu', description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-secondary/30 bg-surface px-6 py-16 text-center">
      <p className="text-lg font-semibold text-primary">{title}</p>
      {description && <p className="mt-2 max-w-md text-sm text-secondary">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
