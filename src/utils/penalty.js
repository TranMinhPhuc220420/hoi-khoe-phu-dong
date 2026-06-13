import { getPenaltyByStage } from '../constants/penalty-rates.js'

/**
 * @param {number} points Base points before star/final multiplier
 * @param {import('../types/index.js').MatchStage} stage
 * @returns {number}
 */
export function calculatePenalty(points, stage) {
  if (points === 5) return 0
  return getPenaltyByStage(stage)
}
