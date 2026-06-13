import { formatCurrency } from '../../utils/format.js'
import { getMemberCredit, getMemberDebt } from '../../utils/finance.js'
import { UserAvatar } from '../shared/UserAvatar.jsx'
import { PaymentProgress, MemberPaymentStatusBadge } from './PenaltySection.jsx'
import { Button } from '../ui/Button.jsx'

/**
 * @param {{
 *   user: import('../../types/index.js').User
 *   onViewDetails?: (user: import('../../types/index.js').User) => void
 * }} props
 */
export function MemberFinanceCard({ user, onViewDetails }) {
  const debt = getMemberDebt(user)
  const credit = getMemberCredit(user)

  const statusKey =
    user.totalPenalty <= 0
      ? 'none'
      : credit > 0
        ? 'credit'
        : debt > 0
          ? 'debt'
          : 'paid'

  const borderClass = {
    none: 'border-secondary/20',
    debt: 'border-secondary/30',
    paid: 'border-secondary/20 bg-neutral/50',
    credit: 'border-tertiary/30',
  }[statusKey]

  const primaryAmount =
    credit > 0 ? credit : debt > 0 ? debt : 0
  const primaryLabel =
    credit > 0 ? 'Dư trả trước' : debt > 0 ? 'Còn nợ' : user.totalPenalty > 0 ? 'Còn nợ' : 'Còn nợ'

  return (
    <div className={`rounded-lg border bg-surface p-4 ${borderClass}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <UserAvatar user={user} size="md" />
          <p className="font-semibold text-primary">{user.name}</p>
        </div>
        <MemberPaymentStatusBadge user={user} />
      </div>

      {user.totalPenalty > 0 ? (
        <>
          <div className="mt-3">
            <p className="text-[0.72rem] font-semibold uppercase tracking-wide text-secondary">
              {primaryLabel}
            </p>
            <p
              className={`text-2xl font-bold ${
                credit > 0 ? 'text-tertiary' : 'text-primary'
              }`}
            >
              {formatCurrency(primaryAmount)}
            </p>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-secondary">Tổng phạt</p>
              <p className="font-medium">{formatCurrency(user.totalPenalty)}</p>
            </div>
            <div>
              <p className="text-secondary">Đã trả</p>
              <p className="font-medium">{formatCurrency(user.paidAmount)}</p>
            </div>
          </div>

          <PaymentProgress user={user} />

          {onViewDetails && (
            <Button
              variant="secondary"
              size="sm"
              className="mt-3 w-full"
              onClick={() => onViewDetails(user)}
            >
              Xem lịch sử
            </Button>
          )}
        </>
      ) : (
        <p className="mt-3 text-sm text-secondary">Chưa có khoản phạt nào.</p>
      )}
    </div>
  )
}
