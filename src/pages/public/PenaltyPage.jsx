import { useMemo, useState } from 'react'
import { Card } from '../../components/ui/Card.jsx'
import { EmptyState } from '../../components/shared/EmptyState.jsx'
import { MemberTransactionModal } from '../../components/shared/MemberTransactionModal.jsx'
import {
  PenaltySummaryCards,
  MemberPenaltyTable,
  TransactionLog,
} from '../../components/public/PenaltySection.jsx'
import { PageLoading, PageError } from '../../components/public/PageStatus.jsx'
import { isConfigValid } from '../../services/firebase.js'
import { useUsers, useTransactions } from '../../hooks/usePublicData.js'

const firebaseConfigured = isConfigValid()

export function PenaltyPage() {
  const [showTransactions, setShowTransactions] = useState(false)
  const [detailUser, setDetailUser] = useState(
    /** @type {import('../../types/index.js').User | null} */ (null),
  )

  const { users, loading: usersLoading, error: usersError, refresh: refreshUsers } = useUsers()
  const {
    transactions,
    loading: txLoading,
    error: txError,
    refresh: refreshTx,
  } = useTransactions({ autoFetch: false })

  const loading = firebaseConfigured && usersLoading
  const error = usersError

  const usersById = useMemo(
    () => Object.fromEntries(users.map((u) => [u.id, u])),
    [users],
  )

  const handleToggleTransactions = () => {
    const next = !showTransactions
    setShowTransactions(next)
    if (next && transactions.length === 0) {
      refreshTx()
    }
  }

  const handleViewPenaltyDetails = (user) => {
    setDetailUser(user)
    if (transactions.length === 0) {
      refreshTx()
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Quỹ phạt</h1>
        <p className="mt-1 text-secondary">Theo dõi công nợ và thanh toán quỹ phạt</p>
      </div>

      {!firebaseConfigured && (
        <EmptyState title="Firebase chưa được cấu hình" description="Thêm VITE_FIREBASE_* vào .env.local." />
      )}

      {loading && <PageLoading />}

      {error && !loading && <PageError message={error} onRetry={refreshUsers} />}

      {!loading && !error && firebaseConfigured && users.length === 0 && (
        <EmptyState
          title="Chưa có dữ liệu quỹ phạt"
          description="Thông tin phạt và thanh toán sẽ hiển thị tại đây."
        />
      )}

      {!loading && !error && users.length > 0 && (
        <>
          <PenaltySummaryCards users={users} />
          <Card title="Công nợ theo thành viên">
            <MemberPenaltyTable
              users={users}
              showProgress
              onViewPenaltyDetails={handleViewPenaltyDetails}
            />
          </Card>

          <Card title="Lịch sử giao dịch">
            <button
              type="button"
              onClick={handleToggleTransactions}
              className="mb-4 text-sm font-semibold text-tertiary hover:underline"
            >
              {showTransactions ? 'Ẩn lịch sử' : 'Xem 20 giao dịch gần nhất'}
            </button>
            {showTransactions && (
              <>
                {txLoading && <PageLoading message="Đang tải giao dịch..." />}
                {txError && <PageError message={txError} onRetry={refreshTx} />}
                {!txLoading && !txError && (
                  <TransactionLog transactions={transactions.slice(0, 20)} usersById={usersById} />
                )}
              </>
            )}
          </Card>
        </>
      )}

      <MemberTransactionModal
        open={Boolean(detailUser)}
        user={detailUser}
        transactions={transactions}
        typeFilter="penalty"
        onClose={() => setDetailUser(null)}
      />
    </div>
  )
}
