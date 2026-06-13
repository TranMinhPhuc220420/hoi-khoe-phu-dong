import { getMemberCredit, getMemberDebt } from '../../utils/finance.js'

/**
 * @param {{ users: import('../../types/index.js').User[] }} props
 */
export function FinanceStatusSummary({ users }) {
  let paidOff = 0
  let inDebt = 0
  let credit = 0
  let noPenalty = 0

  for (const user of users) {
    const debt = getMemberDebt(user)
    const userCredit = getMemberCredit(user)

    if (user.totalPenalty <= 0) {
      noPenalty += 1
    } else if (userCredit > 0) {
      credit += 1
    } else if (debt > 0) {
      inDebt += 1
    } else {
      paidOff += 1
    }
  }

  const total = users.length
  const parts = [
    paidOff > 0 && `${paidOff}/${total} đã xong`,
    inDebt > 0 && `${inDebt} còn nợ`,
    credit > 0 && `${credit} dư trả trước`,
    noPenalty > 0 && `${noPenalty} chưa có phạt`,
  ].filter(Boolean)

  if (!parts.length) {
    return null
  }

  return (
    <p className="text-sm text-secondary">
      {parts.join(' · ')}
    </p>
  )
}
