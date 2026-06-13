import { getStarLimit } from '../constants/star-limits.js'

/**
 * @param {string} userId
 * @param {import('../types/index.js').MatchStage} stage
 * @param {import('../types/index.js').Prediction[]} predictionsInStage Predictions for this user in the same stage (excluding current if updating)
 * @param {{ wantsStar?: boolean, excludePredictionId?: string }} [options]
 * @returns {{ ok: boolean, reason?: string, used?: number, limit?: number }}
 */
export function canUseStar(userId, stage, predictionsInStage, options = {}) {
  const { wantsStar = false, excludePredictionId } = options

  if (stage === 'final') {
    if (wantsStar) {
      return { ok: false, reason: 'Chung kết tự động x2, không cần chọn sao' }
    }
    return { ok: true, used: 0, limit: 0 }
  }

  const used = predictionsInStage.filter(
    (p) => p.userId === userId && p.isStar && p.id !== excludePredictionId,
  ).length

  const limit = getStarLimit(stage)

  if (!wantsStar) {
    return { ok: true, used, limit }
  }

  if (used >= limit) {
    return {
      ok: false,
      reason: `Đã dùng hết ${limit} sao cho vòng này`,
      used,
      limit,
    }
  }

  return { ok: true, used, limit }
}

/**
 * @param {import('../types/index.js').Prediction[]} predictionsInStage
 * @param {string} userId
 * @param {string} [excludePredictionId]
 * @returns {number}
 */
export function countStarsUsed(predictionsInStage, userId, excludePredictionId) {
  return predictionsInStage.filter(
    (p) => p.userId === userId && p.isStar && p.id !== excludePredictionId,
  ).length
}
