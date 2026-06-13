import { useMemo, useState } from 'react'
import { Button } from '../ui/Button.jsx'
import { Card } from '../ui/Card.jsx'
import { TransactionLog } from '../public/PenaltySection.jsx'
import { exportTransactionsCsv, filterTransactions } from '../../utils/exportCsv.js'

const PAGE_SIZE = 20

const TYPE_OPTIONS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'penalty', label: 'Phạt' },
  { value: 'payment', label: 'Thanh toán' },
]

/**
 * @param {{
 *   transactions: import('../../types/index.js').Transaction[]
 *   users: import('../../types/index.js').User[]
 * }} props
 */
export function AdminTransactionLog({ transactions, users }) {
  const [typeFilter, setTypeFilter] = useState('all')
  const [userFilter, setUserFilter] = useState('')
  const [page, setPage] = useState(0)

  const usersById = useMemo(
    () => Object.fromEntries(users.map((u) => [u.id, u])),
    [users],
  )

  const filtered = useMemo(() => {
    return filterTransactions(transactions, {
      type: typeFilter === 'all' ? undefined : /** @type {'penalty' | 'payment'} */ (typeFilter),
      userId: userFilter || undefined,
    })
  }, [transactions, typeFilter, userFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages - 1)
  const pageItems = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE)

  const handleTypeChange = (value) => {
    setTypeFilter(value)
    setPage(0)
  }

  const handleUserChange = (value) => {
    setUserFilter(value)
    setPage(0)
  }

  return (
    <Card title="Lịch sử giao dịch">
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-[0.72rem] font-semibold uppercase tracking-wide text-secondary">
            Loại
          </label>
          <select
            value={typeFilter}
            onChange={(e) => handleTypeChange(e.target.value)}
            className="rounded-md border border-secondary/40 bg-surface px-3 py-2 text-sm text-primary"
          >
            {TYPE_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex min-w-[180px] flex-col gap-1.5">
          <label className="text-[0.72rem] font-semibold uppercase tracking-wide text-secondary">
            Thành viên
          </label>
          <select
            value={userFilter}
            onChange={(e) => handleUserChange(e.target.value)}
            className="rounded-md border border-secondary/40 bg-surface px-3 py-2 text-sm text-primary"
          >
            <option value="">Tất cả</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => exportTransactionsCsv(filtered, usersById)}
          disabled={filtered.length === 0}
        >
          Xuất CSV
        </Button>
      </div>

      <TransactionLog
        transactions={pageItems}
        usersById={usersById}
        emptyMessage="Không có giao dịch phù hợp bộ lọc."
      />

      {filtered.length > PAGE_SIZE && (
        <div className="mt-4 flex items-center justify-between text-sm text-secondary">
          <span>
            {safePage * PAGE_SIZE + 1}–{Math.min((safePage + 1) * PAGE_SIZE, filtered.length)} /{' '}
            {filtered.length}
          </span>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={safePage === 0}
            >
              Trước
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={safePage >= totalPages - 1}
            >
              Sau
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}
