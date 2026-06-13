/** @type {Record<import('../types/index.js').MatchStage, number>} */
export const PENALTY_RATES = {
  group: 10_000,
  round32: 15_000,
  round16: 20_000,
  quarter: 25_000,
  semi: 30_000,
  third: 35_000,
  final: 50_000,
}

/**
 * @param {import('../types/index.js').MatchStage} stage
 * @returns {number}
 */
export function getPenaltyByStage(stage) {
  return PENALTY_RATES[stage] ?? 0
}
