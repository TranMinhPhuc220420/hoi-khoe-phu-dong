import { Modal } from './Modal.jsx'
import { TransactionLog } from '../public/PenaltySection.jsx'
import { formatCurrency } from '../../utils/format.js'
import { filterTransactions } from '../../utils/exportCsv.js'
import { getMemberCredit, getMemberDebt } from '../../utils/finance.js'

/**
 * @param {{
 *   open: boolean
 *   user: import('../../types/index.js').User | null
 *   transactions: import('../../types/index.js').Transaction[]
 *   typeFilter?: 'all' | 'penalty' | 'payment'
 *   onClose: () => void
 * }} props
 */
export function MemberTransactionModal({
  open,
  user,
  transactions,
  typeFilter = 'all',
  onClose,
}) {
  if (!open || !user) return null

  const debt = getMemberDebt(user)
  const credit = getMemberCredit(user)
  const filtered = filterTransactions(transactions, {
    userId: user.id,
    type: typeFilter === 'all' ? undefined : typeFilter,
  })

  const title =
    typeFilter === 'penalty'
      ? `Chi tiết phạt — ${user.name}`
      : `Lịch sử giao dịch — ${user.name}`

  return (
    <Modal open={open} title={title} onClose={onClose} wide>
      <div className="mb-4 grid gap-2 text-sm sm:grid-cols-3">
        <div>
          <p className="text-secondary">Tổng phạt</p>
          <p className="font-semibold text-primary">{formatCurrency(user.totalPenalty)}</p>
        </div>
        <div>
          <p className="text-secondary">Đã trả</p>
          <p className="font-semibold text-primary">{formatCurrency(user.paidAmount)}</p>
        </div>
        <div>
          <p className="text-secondary">{credit > 0 ? 'Dư trả trước' : 'Còn nợ'}</p>
          <p className={`font-semibold ${credit > 0 ? 'text-tertiary' : 'text-primary'}`}>
            {credit > 0 ? formatCurrency(credit) : formatCurrency(debt)}
          </p>
        </div>
      </div>

      {user.totalPenalty > 0 && (
        <div className="mb-4">
          <div className="mb-1 flex justify-between text-xs text-secondary">
            <span>Tiến độ thanh toán</span>
            <span>
              {Math.round(Math.min(100, (user.paidAmount / user.totalPenalty) * 100))}%
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-neutral">
            <div
              className="h-full rounded-full bg-tertiary transition-all"
              style={{
                width: `${Math.min(100, (user.paidAmount / user.totalPenalty) * 100)}%`,
              }}
            />
          </div>
        </div>
      )}

      <TransactionLog
        transactions={filtered}
        usersById={{ [user.id]: user }}
        emptyMessage={
          typeFilter === 'penalty' ? 'Chưa có khoản phạt nào.' : 'Chưa có giao dịch.'
        }
      />
    </Modal>
  )
}
