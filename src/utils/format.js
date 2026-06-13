/**
 * @param {import('firebase/firestore').Timestamp | Date | string | null | undefined} value
 * @returns {Date | null}
 */
export function parseMatchTime(value) {
  if (!value) return null
  if (typeof value === 'object' && value !== null && 'toDate' in value && typeof value.toDate === 'function') {
    return value.toDate()
  }
  if (value instanceof Date) return value
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

/**
 * @param {import('firebase/firestore').Timestamp | Date | string | null | undefined} value
 * @returns {string}
 */
export function formatMatchDateTime(value) {
  const date = parseMatchTime(value)
  if (!date) return '—'
  return date.toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * @param {import('firebase/firestore').Timestamp | Date | string | null | undefined} value
 * @returns {string}
 */
export function formatTransactionDate(value) {
  const date = parseMatchTime(value)
  if (!date) return '—'
  return date.toLocaleDateString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

/**
 * @param {number} amount
 * @returns {string}
 */
export function formatCurrency(amount) {
  return `${new Intl.NumberFormat('vi-VN').format(amount)} ₫`
}

/**
 * @param {number | null | undefined} home
 * @param {number | null | undefined} away
 * @returns {string}
 */
export function formatScore(home, away) {
  if (home == null || away == null) return '—'
  return `${home} - ${away}`
}

/**
 * @param {number} predictedHome
 * @param {number} predictedAway
 * @param {boolean} [isStar]
 * @returns {string}
 */
export function formatPrediction(predictedHome, predictedAway, isStar = false) {
  const score = `${predictedHome} - ${predictedAway}`
  return isStar ? `${score} ⭐` : score
}
