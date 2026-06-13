/** @type {Record<import('../types/index.js').MatchStage, number>} */
export const STAR_LIMITS = {
  group: 4,
  round32: 2,
  round16: 2,
  quarter: 1,
  semi: 1,
  third: 1,
  final: 0,
}

/**
 * @param {import('../types/index.js').MatchStage} stage
 * @returns {number}
 */
export function getStarLimit(stage) {
  return STAR_LIMITS[stage] ?? 0
}

/** Final always applies 2x multiplier without selecting a star. */
export const FINAL_AUTO_MULTIPLIER = 2
