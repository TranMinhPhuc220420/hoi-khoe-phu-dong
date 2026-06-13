/**
 * @typedef {'group' | 'round32' | 'round16' | 'quarter' | 'semi' | 'third' | 'final'} MatchStage
 */

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {number} totalPoints
 * @property {number} totalPenalty
 * @property {number} paidAmount
 * @property {number} [sortOrder]
 */

/**
 * @typedef {Object} Team
 * @property {string} id
 * @property {string} name
 * @property {string | null} group
 * @property {string | null} countryCode
 * @property {string | null} logoUrl
 */

/**
 * @typedef {Object} Match
 * @property {string} id
 * @property {string} homeTeam
 * @property {string} awayTeam
 * @property {string} [homeTeamId]
 * @property {string} [awayTeamId]
 * @property {import('firebase/firestore').Timestamp | Date | string} matchTime
 * @property {MatchStage} stage
 * @property {number | null} homeScore
 * @property {number | null} awayScore
 * @property {boolean} isFinished
 */

/**
 * @typedef {Object} Prediction
 * @property {string} id
 * @property {string} matchId
 * @property {string} userId
 * @property {number} predictedHome
 * @property {number} predictedAway
 * @property {boolean} isStar
 * @property {number} [pointsEarned]
 * @property {number} [penaltyAmount]
 */

/**
 * @typedef {'penalty' | 'payment'} TransactionType
 */

/**
 * @typedef {Object} Transaction
 * @property {string} id
 * @property {string} userId
 * @property {number} amount
 * @property {TransactionType} type
 * @property {string} note
 * @property {string} [matchId]
 * @property {import('firebase/firestore').Timestamp | Date | string} [createdAt]
 */

export {}
