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
    gold: 'border border-secondary/30 bg-neutral',
    red: 'border border-secondary/40 bg-neutral',
    none: '',
  }[highlight]

  return (
    <Card className={`${highlightClass} ${className}`} title={title} description={description}>
      <p className="text-2xl font-bold text-primary sm:text-3xl">{value}</p>
    </Card>
  )
}
