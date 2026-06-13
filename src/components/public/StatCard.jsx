import { Card } from '../ui/Card.jsx'

/**
 * @param {{
 *   title: string
 *   value: import('react').ReactNode
 *   description?: string
 *   highlight?: 'gold' | 'red' | 'none'
 *   className?: string
 * }} props
 */
export function StatCard({ title, value, description, highlight = 'none', className = '' }) {
  const highlightClass = {
    gold: 'ring-2 ring-amber-300 bg-amber-50/50',
    red: 'ring-2 ring-red-200 bg-red-50/50',
    none: '',
  }[highlight]

  return (
    <Card className={`${highlightClass} ${className}`} title={title} description={description}>
      <p className="text-2xl font-bold text-primary sm:text-3xl">{value}</p>
    </Card>
  )
}
