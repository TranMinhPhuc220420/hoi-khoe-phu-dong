/** @type {Record<import('../../types/index.js').MatchStage, string>} */
const stageStyles = {
  group: 'bg-blue-50 text-blue-800',
  round32: 'bg-cyan-50 text-cyan-800',
  round16: 'bg-teal-50 text-teal-800',
  quarter: 'bg-purple-50 text-purple-800',
  semi: 'bg-orange-50 text-orange-800',
  third: 'bg-gray-100 text-gray-700',
  final: 'bg-primary/10 text-primary font-semibold',
}

/** @type {Record<import('../../types/index.js').MatchStage, string>} */
const stageLabels = {
  group: 'Vòng bảng',
  round32: 'Vòng 32',
  round16: 'Vòng 16',
  quarter: 'Tứ kết',
  semi: 'Bán kết',
  third: 'Hạng 3',
  final: 'Chung kết',
}

/**
 * @param {{ stage?: import('../../types/index.js').MatchStage, children?: import('react').ReactNode, className?: string }} props
 */
export function Badge({ stage, children, className = '' }) {
  const style = stage ? stageStyles[stage] : 'bg-neutral text-secondary'
  const label = children ?? (stage ? stageLabels[stage] : '')

  return (
    <span
      className={`inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-semibold ${style} ${className}`}
    >
      {label}
    </span>
  )
}
