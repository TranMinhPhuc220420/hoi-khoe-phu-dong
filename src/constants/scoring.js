export const ABSENT_PENALTY_NOTE = '(Không dự đoán)'

/**
 * @param {string | undefined} note
 * @returns {boolean}
 */
export function isAbsentPenaltyNote(note) {
  return note?.includes(ABSENT_PENALTY_NOTE) ?? false
}

/**
 * @param {import('../types/index.js').MatchStage} stage
 * @param {string} homeTeam
 * @param {string} awayTeam
 * @returns {string}
 */
export function formatAbsentPenaltyNote(stage, homeTeam, awayTeam) {
  return `${stage}: ${homeTeam} vs ${awayTeam} ${ABSENT_PENALTY_NOTE}`
}
