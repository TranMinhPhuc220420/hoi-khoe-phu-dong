/**
 * @param {import('../types/index.js').Transaction[]} transactions
 * @param {{ type?: import('../types/index.js').TransactionType, userId?: string }} [filters]
 * @returns {import('../types/index.js').Transaction[]}
 */
export function filterTransactions(transactions, filters = {}) {
  let result = transactions
  if (filters.type) {
    result = result.filter((tx) => tx.type === filters.type)
  }
  if (filters.userId) {
    result = result.filter((tx) => tx.userId === filters.userId)
  }
  return result
}

/**
 * @param {import('../types/index.js').Transaction[]} transactions
 * @param {Record<string, import('../types/index.js').User>} usersById
 * @param {string} [filename='transactions.csv']
 */
export function exportTransactionsCsv(transactions, usersById, filename = 'transactions.csv') {
  const header = 'Date,Member,Type,Amount,Note'
  const rows = transactions.map((tx) => {
    const date = tx.createdAt
      ? (typeof tx.createdAt === 'object' && 'toDate' in tx.createdAt
          ? tx.createdAt.toDate()
          : new Date(tx.createdAt)
        ).toISOString().slice(0, 10)
      : ''
    const member = usersById[tx.userId]?.name ?? tx.userId
    const note = `"${(tx.note ?? '').replace(/"/g, '""')}"`
    return `${date},${member},${tx.type},${tx.amount},${note}`
  })

  const csv = [header, ...rows].join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
