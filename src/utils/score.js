/**
 * @param {number} home
 * @param {number} away
 * @returns {'home' | 'away' | 'draw'}
 */
export function getMatchOutcome(home, away) {
  if (home > away) return 'home'
  if (home < away) return 'away'
  return 'draw'
}

/**
 * @param {{ predictedHome: number, predictedAway: number }} prediction
 * @param {{ homeScore: number, awayScore: number }} result
 * @returns {boolean}
 */
export function isSameOutcome(prediction, result) {
  return (
    getMatchOutcome(prediction.predictedHome, prediction.predictedAway) ===
    getMatchOutcome(result.homeScore, result.awayScore)
  )
}

/**
 * Base points before star/final multiplier (0, 3, or 5).
 * @param {{ predictedHome: number, predictedAway: number }} prediction
 * @param {{ homeScore: number, awayScore: number }} result
 * @returns {number}
 */
export function calculateBasePoints(prediction, result) {
  const exactScore =
    prediction.predictedHome === result.homeScore &&
    prediction.predictedAway === result.awayScore

  if (exactScore) return 5
  if (isSameOutcome(prediction, result)) return 3
  return 0
}

/**
 * @param {{ predictedHome: number, predictedAway: number, isStar: boolean }} prediction
 * @param {{ homeScore: number, awayScore: number }} result
 * @param {import('../types/index.js').MatchStage} stage
 * @returns {number}
 */
export function calculateScore(prediction, result, stage) {
  const basePoints = calculateBasePoints(prediction, result)

  if (stage === 'final') {
    return basePoints * 2
  }

  if (prediction.isStar) {
    if (basePoints === 0) return -3
    return basePoints * 2
  }

  return basePoints
}
