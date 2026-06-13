import * as transactionsService from './transactions.service.js'
import * as usersService from './users.service.js'

/**
 * @param {string} userId
 * @param {number} amount
 * @param {string} [note]
 * @returns {Promise<string>} Transaction id
 */
export async function recordPayment(userId, amount, note = '') {
  if (amount <= 0) throw new Error('Số tiền phải lớn hơn 0')

  const txId = await transactionsService.create({
    userId,
    amount,
    type: 'payment',
    note: note.trim() || 'Thanh toán quỹ phạt',
  })

  await usersService.incrementPaidAmount(userId, amount)
  return txId
}

/**
 * @returns {Promise<{ totalPenalty: number, totalPaid: number, totalDebt: number }>}
 */
export function getFinancialSummary() {
  return usersService.getFinancialSummary()
}
