import { getStarLimit } from '../../constants/star-limits.js'
import { canUseStar } from '../../utils/star.js'

/**
 * @param {{
 *   checked: boolean
 *   onChange: (checked: boolean) => void
 *   disabled?: boolean
 *   stage: import('../../types/index.js').MatchStage
 *   userId: string
 *   predictionsInStage: import('../../types/index.js').Prediction[]
 *   excludePredictionId?: string
 * }} props
 */
export function StarCheckbox({
  checked,
  onChange,
  disabled,
  stage,
  userId,
  predictionsInStage,
  excludePredictionId,
}) {
  const isFinal = stage === 'final'
  const check = canUseStar(userId, stage, predictionsInStage, {
    wantsStar: !checked,
    excludePredictionId,
  })
  const limit = getStarLimit(stage)
  const used = check.used ?? 0
  const starDisabled = disabled || isFinal || (!checked && !check.ok)

  return (
    <div className="flex flex-col gap-0.5">
      <label className="flex cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          checked={checked}
          disabled={starDisabled}
          onChange={(e) => onChange(e.target.checked)}
          className="rounded border-secondary text-tertiary focus:ring-tertiary disabled:opacity-50"
        />
        <span className="text-sm">⭐</span>
      </label>
      {!isFinal && (
        <span className="text-xs text-secondary">
          {used}/{limit}
        </span>
      )}
      {isFinal && <span className="text-xs text-secondary">Auto x2</span>}
    </div>
  )
}
