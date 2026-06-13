import { formatCurrency, formatTransactionDate } from '../../utils/format.js'
import {
  aggregateFinance,
  getMemberBalance,
  getMemberCredit,
  getMemberDebt,
} from '../../utils/finance.js'
import { StatCard } from './StatCard.jsx'
import { Button } from '../ui/Button.jsx'

/**
 * @param {{ users: import('../../types/index.js').User[] }} props
 */
export function PenaltySummaryCards({ users }) {
  const { totalPenalty, totalPaid, totalDebt, totalCredit } = aggregateFinance(users)

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard title="Tổng quỹ phạt" value={formatCurrency(totalPenalty)} />
      <StatCard title="Đã thu" value={formatCurrency(totalPaid)} />
      <StatCard title="Còn nợ" value={formatCurrency(totalDebt)} highlight={totalDebt > 0 ? 'red' : 'none'} />
      <StatCard title="Dư trả trước" value={formatCurrency(totalCredit)} />
    </div>
  )
}

/**
 * @param {import('../../types/index.js').User} user
 */
export function PaymentProgress({ user }) {
  if (user.totalPenalty <= 0) return null

  const pct = Math.min(100, (user.paidAmount / user.totalPenalty) * 100)

  return (
    <div className="mt-2">
      <div className="mb-1 flex justify-between text-xs text-secondary">
        <span>Đã trả {Math.round(pct)}%</span>
        <span>
          {formatCurrency(user.paidAmount)} / {formatCurrency(user.totalPenalty)}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-neutral">
        <div
          className="h-full rounded-full bg-tertiary transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

/**
 * @param {{ user: import('../../types/index.js').User & { balance?: number, debt?: number, credit?: number } }} props
 */
export function MemberPaymentStatusBadge({ user }) {
  const credit = user.credit ?? getMemberCredit(user)
  const balance = user.balance ?? getMemberBalance(user)
  const debt = user.debt ?? getMemberDebt(user)

  if (credit > 0) {
    return (
      <span className="rounded-sm bg-neutral px-2 py-0.5 text-xs font-semibold text-tertiary">
        Dư {formatCurrency(credit)}
      </span>
    )
  }

  if (balance === 0 && user.totalPenalty > 0) {
    return (
      <span className="rounded-sm bg-neutral px-2 py-0.5 text-xs font-semibold text-primary">
        Đã xong
      </span>
    )
  }

  if (debt > 0) {
    return (
      <span className="rounded-sm border border-secondary/30 px-2 py-0.5 text-xs font-semibold text-primary">
        Còn nợ
      </span>
    )
  }

  if (user.totalPenalty <= 0) {
    return (
      <span className="rounded-sm px-2 py-0.5 text-xs font-semibold text-secondary">
        Chưa có phạt
      </span>
    )
  }

  return null
}

/**
 * @param {{ user: import('../../types/index.js').User & { debt?: number, credit?: number } }} props
 */
function MemberBalanceCell({ user }) {
  const debt = user.debt ?? getMemberDebt(user)
  const credit = user.credit ?? getMemberCredit(user)

  if (credit > 0) {
    return <span className="font-semibold text-tertiary">Dư {formatCurrency(credit)}</span>
  }

  return <span className="font-semibold">{formatCurrency(debt)}</span>
}

/**
 * @param {{
 *   users: import('../../types/index.js').User[]
 *   showProgress?: boolean
 *   onViewDetails?: (user: import('../../types/index.js').User) => void
 * }} props
 */
export function MemberPenaltyTable({ users, showProgress = false, onViewDetails, onViewPenaltyDetails }) {
  const handleViewDetails = onViewDetails ?? onViewPenaltyDetails
  const rows = [...users]
    .map((u) => ({
      ...u,
      balance: getMemberBalance(u),
      debt: getMemberDebt(u),
      credit: getMemberCredit(u),
    }))
    .sort((a, b) => b.balance - a.balance)

  const maxDebt = Math.max(0, ...rows.map((r) => r.debt))

  if (!rows.length) {
    return <p className="text-sm text-secondary">Chưa có dữ liệu quỹ phạt.</p>
  }

  return (
    <>
      <div className="hidden sm:block">
        <div className="overflow-x-auto rounded-lg border border-secondary/20 bg-surface">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead className="border-b border-secondary/20 bg-neutral">
              <tr>
                <th className="px-4 py-3 text-[0.72rem] font-semibold uppercase tracking-wide text-secondary">
                  Thành viên
                </th>
                <th className="px-4 py-3 text-[0.72rem] font-semibold uppercase tracking-wide text-secondary">
                  Tổng phạt
                </th>
                <th className="px-4 py-3 text-[0.72rem] font-semibold uppercase tracking-wide text-secondary">
                  Đã trả
                </th>
                <th className="px-4 py-3 text-[0.72rem] font-semibold uppercase tracking-wide text-secondary">
                  Còn nợ
                </th>
                {showProgress && (
                  <th className="px-4 py-3 text-[0.72rem] font-semibold uppercase tracking-wide text-secondary">
                    Tiến độ
                  </th>
                )}
                {handleViewDetails && (
                  <th className="px-4 py-3 text-[0.72rem] font-semibold uppercase tracking-wide text-secondary">
                    Chi tiết
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary/10">
              {rows.map((user) => (
                <tr
                  key={user.id}
                  className={user.debt === maxDebt && maxDebt > 0 ? 'bg-red-50/60' : undefined}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-primary">{user.name}</span>
                      <MemberPaymentStatusBadge user={user} />
                    </div>
                  </td>
                  <td className="px-4 py-3">{formatCurrency(user.totalPenalty)}</td>
                  <td className="px-4 py-3">{formatCurrency(user.paidAmount)}</td>
                  <td className="px-4 py-3">
                    <MemberBalanceCell user={user} />
                  </td>
                  {showProgress && (
                    <td className="min-w-[140px] px-4 py-3">
                      <PaymentProgress user={user} />
                    </td>
                  )}
                  {handleViewDetails && (
                    <td className="px-4 py-3">
                      {user.totalPenalty > 0 && (
                        <button
                          type="button"
                          onClick={() => handleViewDetails(user)}
                          className="text-sm font-semibold text-tertiary hover:underline"
                        >
                          Xem lịch sử
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-2 sm:hidden">
        {rows.map((user) => (
          <div
            key={user.id}
            className={`rounded-lg border border-secondary/20 bg-surface p-4 ${
              user.debt === maxDebt && maxDebt > 0 ? 'bg-red-50/60' : ''
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="font-semibold text-primary">{user.name}</p>
              <MemberPaymentStatusBadge user={user} />
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-secondary">Tổng phạt</p>
                <p className="font-medium">{formatCurrency(user.totalPenalty)}</p>
              </div>
              <div>
                <p className="text-secondary">Đã trả</p>
                <p className="font-medium">{formatCurrency(user.paidAmount)}</p>
              </div>
              <div className="col-span-2">
                <p className="text-secondary">Còn nợ</p>
                <p className="font-bold text-primary">
                  <MemberBalanceCell user={user} />
                </p>
              </div>
            </div>
            {showProgress && <PaymentProgress user={user} />}
            {handleViewDetails && user.totalPenalty > 0 && (
              <Button
                variant="secondary"
                size="sm"
                className="mt-3"
                onClick={() => handleViewDetails(user)}
              >
                Xem lịch sử
              </Button>
            )}
          </div>
        ))}
      </div>
    </>
  )
}

/**
 * @param {{
 *   transactions: import('../../types/index.js').Transaction[]
 *   usersById: Record<string, import('../../types/index.js').User>
 *   emptyMessage?: string
 * }} props
 */
export function TransactionLog({ transactions, usersById, emptyMessage = 'Chưa có giao dịch.' }) {
  if (!transactions.length) {
    return <p className="text-sm text-secondary">{emptyMessage}</p>
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-secondary/20 bg-surface">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <thead className="border-b border-secondary/20 bg-neutral">
          <tr>
            <th className="px-4 py-3 text-[0.72rem] font-semibold uppercase tracking-wide text-secondary">
              Ngày
            </th>
            <th className="px-4 py-3 text-[0.72rem] font-semibold uppercase tracking-wide text-secondary">
              Thành viên
            </th>
            <th className="px-4 py-3 text-[0.72rem] font-semibold uppercase tracking-wide text-secondary">
              Loại
            </th>
            <th className="px-4 py-3 text-[0.72rem] font-semibold uppercase tracking-wide text-secondary">
              Số tiền
            </th>
            <th className="px-4 py-3 text-[0.72rem] font-semibold uppercase tracking-wide text-secondary">
              Ghi chú
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-secondary/10">
          {transactions.map((tx) => (
            <tr key={tx.id}>
              <td className="px-4 py-3 text-secondary">
                {tx.createdAt ? formatTransactionDate(tx.createdAt) : '—'}
              </td>
              <td className="px-4 py-3">{usersById[tx.userId]?.name ?? tx.userId}</td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-sm px-2 py-0.5 text-xs font-semibold ${
                    tx.type === 'penalty'
                      ? 'border border-secondary/30 text-primary'
                      : 'bg-neutral text-tertiary'
                  }`}
                >
                  {tx.type === 'penalty' ? 'Phạt' : 'Thanh toán'}
                </span>
              </td>
              <td className="px-4 py-3 font-medium">{formatCurrency(tx.amount)}</td>
              <td className="max-w-[200px] truncate px-4 py-3 text-secondary">{tx.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
