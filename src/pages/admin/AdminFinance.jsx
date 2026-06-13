import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button } from '../../components/ui/Button.jsx'
import { Card } from '../../components/ui/Card.jsx'
import { StatCard } from '../../components/public/StatCard.jsx'
import { PageLoading, PageError } from '../../components/public/PageStatus.jsx'
import { PaymentFormModal } from '../../components/admin/PaymentFormModal.jsx'
import { AdminTransactionLog } from '../../components/admin/AdminTransactionLog.jsx'
import { MemberTransactionModal } from '../../components/shared/MemberTransactionModal.jsx'
import { useToast } from '../../hooks/useToast.js'
import { formatCurrency } from '../../utils/format.js'
import {
  aggregateFinance,
  getMemberBalance,
  getMemberCredit,
  getMemberDebt,
} from '../../utils/finance.js'
import { isConfigValid } from '../../services/firebase.js'
import * as usersService from '../../services/users.service.js'
import * as transactionsService from '../../services/transactions.service.js'
import { recordPayment } from '../../services/finance.service.js'
import { useDataStore } from '../../stores/data.store.js'

const firebaseConfigured = isConfigValid()

export function AdminFinance() {
  const toast = useToast()
  const [users, setUsers] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(firebaseConfigured)
  const [error, setError] = useState(firebaseConfigured ? '' : 'Firebase chưa được cấu hình')

  const [paymentUser, setPaymentUser] = useState(
    /** @type {import('../../types/index.js').User | null} */ (null),
  )
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [historyUser, setHistoryUser] = useState(
    /** @type {import('../../types/index.js').User | null} */ (null),
  )

  const invalidatePublicCache = () => {
    useDataStore.getState().fetchUsers(true)
    useDataStore.getState().fetchTransactions(true)
  }

  const reload = useCallback(() => {
    setLoading(true)
    setError('')
    return Promise.all([usersService.getAll(), transactionsService.getAll()])
      .then(([u, tx]) => {
        setUsers(u)
        setTransactions(tx)
        invalidatePublicCache()
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu')
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!firebaseConfigured) return
    let cancelled = false

    Promise.all([usersService.getAll(), transactionsService.getAll()])
      .then(([u, tx]) => {
        if (cancelled) return
        setUsers(u)
        setTransactions(tx)
        invalidatePublicCache()
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const summary = useMemo(() => aggregateFinance(users), [users])

  const rows = useMemo(
    () =>
      [...users]
        .map((u) => ({
          ...u,
          balance: getMemberBalance(u),
          debt: getMemberDebt(u),
          credit: getMemberCredit(u),
        }))
        .sort((a, b) => b.balance - a.balance),
    [users],
  )

  const maxDebt = useMemo(() => Math.max(0, ...rows.map((r) => r.debt)), [rows])

  const openPayment = (user = null) => {
    setPaymentUser(user)
    setPaymentOpen(true)
  }

  const handlePayment = async (userId, amount, note) => {
    await recordPayment(userId, amount, note)
    toast.success('Đã ghi nhận thanh toán')
    await reload()
  }

  if (loading) return <PageLoading />
  if (error) return <PageError message={error} onRetry={reload} />

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-end gap-2">
        <Button onClick={() => openPayment()}>Ghi nhận thanh toán</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Tổng phạt" value={formatCurrency(summary.totalPenalty)} />
        <StatCard title="Đã thu" value={formatCurrency(summary.totalPaid)} />
        <StatCard
          title="Còn nợ"
          value={formatCurrency(summary.totalDebt)}
          highlight={summary.totalDebt > 0 ? 'red' : 'none'}
        />
        <StatCard title="Dư trả trước" value={formatCurrency(summary.totalCredit)} />
      </div>

      <Card title="Công nợ thành viên">
        <div className="overflow-x-auto rounded-lg border border-secondary/20">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead className="border-b border-secondary/20 bg-neutral">
              <tr>
                <th className="px-4 py-3 text-[0.72rem] font-semibold uppercase tracking-wide text-secondary">
                  Thành viên
                </th>
                <th className="px-4 py-3 text-[0.72rem] font-semibold uppercase tracking-wide text-secondary">
                  Phạt
                </th>
                <th className="px-4 py-3 text-[0.72rem] font-semibold uppercase tracking-wide text-secondary">
                  Đã trả
                </th>
                <th className="px-4 py-3 text-[0.72rem] font-semibold uppercase tracking-wide text-secondary">
                  Nợ / Dư
                </th>
                <th className="px-4 py-3 text-[0.72rem] font-semibold uppercase tracking-wide text-secondary">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary/10 bg-surface">
              {rows.map((user) => (
                <tr
                  key={user.id}
                  className={user.debt === maxDebt && maxDebt > 0 ? 'bg-red-50/60' : undefined}
                >
                  <td className="px-4 py-3 font-medium text-primary">{user.name}</td>
                  <td className="px-4 py-3">{formatCurrency(user.totalPenalty)}</td>
                  <td className="px-4 py-3">{formatCurrency(user.paidAmount)}</td>
                  <td className="px-4 py-3 font-semibold">
                    {user.credit > 0 ? (
                      <span className="text-green-700">Dư {formatCurrency(user.credit)}</span>
                    ) : (
                      formatCurrency(user.debt)
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      <Button variant="secondary" size="sm" onClick={() => openPayment(user)}>
                        Ghi nhận TT
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => setHistoryUser(user)}>
                        Lịch sử
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <AdminTransactionLog transactions={transactions} users={users} />

      <PaymentFormModal
        open={paymentOpen}
        users={rows}
        preselectedUser={paymentUser}
        onClose={() => {
          setPaymentOpen(false)
          setPaymentUser(null)
        }}
        onSubmit={handlePayment}
      />

      <MemberTransactionModal
        open={Boolean(historyUser)}
        user={historyUser}
        transactions={transactions}
        typeFilter="all"
        onClose={() => setHistoryUser(null)}
      />
    </div>
  )
}
