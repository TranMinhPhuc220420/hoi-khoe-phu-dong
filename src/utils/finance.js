/**
 * @param {Pick<import('../types/index.js').User, 'totalPenalty' | 'paidAmount'>} user
 * @returns {number}
 */
export function getMemberBalance(user) {
  return user.totalPenalty - user.paidAmount
}

/**
 * @param {Pick<import('../types/index.js').User, 'totalPenalty' | 'paidAmount'>} user
 * @returns {number}
 */
export function getMemberDebt(user) {
  return Math.max(0, getMemberBalance(user))
}

/**
 * @param {Pick<import('../types/index.js').User, 'totalPenalty' | 'paidAmount'>} user
 * @returns {number}
 */
export function getMemberCredit(user) {
  return Math.max(0, -getMemberBalance(user))
}

/**
 * @param {Pick<import('../types/index.js').User, 'totalPenalty' | 'paidAmount'>[]} users
 * @returns {{ totalPenalty: number, totalPaid: number, totalDebt: number, totalCredit: number }}
 */
export function aggregateFinance(users) {
  const totalPenalty = users.reduce((sum, u) => sum + u.totalPenalty, 0)
  const totalPaid = users.reduce((sum, u) => sum + u.paidAmount, 0)
  const totalDebt = users.reduce((sum, u) => sum + getMemberDebt(u), 0)
  const totalCredit = users.reduce((sum, u) => sum + getMemberCredit(u), 0)
  return { totalPenalty, totalPaid, totalDebt, totalCredit }
}

/**
 * @param {Pick<import('../types/index.js').User, 'name' | 'totalPenalty' | 'paidAmount'>} user
 * @returns {string}
 */
export function formatMemberFinanceOption(user) {
  const debt = getMemberDebt(user)
  const credit = getMemberCredit(user)
  if (debt > 0) return `${user.name} — nợ ${debt.toLocaleString('vi-VN')} ₫`
  if (credit > 0) return `${user.name} — dư ${credit.toLocaleString('vi-VN')} ₫`
  return `${user.name} — 0 ₫`
}
