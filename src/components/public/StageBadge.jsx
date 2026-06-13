import { Badge } from '../ui/Badge.jsx'

/**
 * @param {{ stage: import('../../types/index.js').MatchStage, className?: string }} props
 */
export function StageBadge({ stage, className }) {
  return <Badge stage={stage} className={className} />
}
