/**
 * @param {unknown} value
 * @returns {value is number}
 */
export function isFilledPredictionScore(value) {
  return Number.isInteger(value) && value >= 0 && value <= 99
}

/**
 * @param {{ predictedHome?: number | null, predictedAway?: number | null }} row
 * @returns {boolean}
 */
export function isFilledPredictionRow(row) {
  return isFilledPredictionScore(row.predictedHome) && isFilledPredictionScore(row.predictedAway)
}
