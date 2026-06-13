import { useMemo, useState } from 'react'
import { Card } from '../../components/ui/Card.jsx'
import { EmptyState } from '../../components/shared/EmptyState.jsx'
import { MemberTransactionModal } from '../../components/shared/MemberTransactionModal.jsx'
import { PenaltySummaryCards, TransactionLog } from '../../components/public/PenaltySection.jsx'
import { FinanceStatusSummary } from '../../components/public/FinanceStatusSummary.jsx'
import { MemberFinanceGrid } from '../../components/public/MemberFinanceGrid.jsx'
import { PageLoading, PageError } from '../../components/public/PageStatus.jsx'
import { PaymentQrFloat } from '../../components/public/PaymentQrFloat.jsx'
import { isConfigValid } from '../../services/firebase.js'
import { useUsers, useTransactions } from '../../hooks/usePublicData.js'
import { getMemberDebt } from '../../utils/finance.js'

const firebaseConfigured = isConfigValid()

export function DashboardPage() {
  const [detailUser, setDetailUser] = useState(
    /** @type {import('../../types/index.js').User | null} */ (null),
  )

  const { users, loading: usersLoading, error: usersError, refresh: refreshUsers } = useUsers()
  const {
    transactions,
    loading: txLoading,
    error: txError,
    refresh: refreshTx,
  } = useTransactions()

  const loading = firebaseConfigured && (usersLoading || txLoading)
  const error = usersError || txError

  const usersById = useMemo(
    () => Object.fromEntries(users.map((u) => [u.id, u])),
    [users],
  )

  const handleRetry = () => {
    refreshUsers()
    refreshTx()
  }

  const handleViewDetails = (user) => {
    setDetailUser(user)
    if (transactions.length === 0) {
      refreshTx()
    }
  }

  const showPaymentQr = useMemo(
    () => !loading && !error && users.some((u) => getMemberDebt(u) > 0),
    [loading, error, users],
  )

  return (
    <div className="space-y-8">
      {/* <div>
        <h1 className="text-2xl font-bold text-primary">Quỹ phạt</h1>
        <p className="mt-1 text-secondary">
          Theo dõi số tiền đã đóng và còn nợ của từng thành viên
        </p>
      </div> */}

      {!firebaseConfigured && (
        <EmptyState
          title="Firebase chưa được cấu hình"
          description="Thêm VITE_FIREBASE_* vào .env.local để xem dữ liệu."
        />
      )}

      {loading && <PageLoading />}

      {error && !loading && <PageError message={error} onRetry={handleRetry} />}

      {!loading && !error && firebaseConfigured && users.length === 0 && (
        <EmptyState
          title="Chưa có dữ liệu"
          description="Thông tin phạt và thanh toán sẽ hiển thị tại đây."
        />
      )}

      {!loading && !error && users.length > 0 && (
        <>
          {/* <PenaltySummaryCards users={users} /> */}

          <FinanceStatusSummary users={users} />

          <Card title="Công nợ theo thành viên">
            <MemberFinanceGrid users={users} onViewDetails={handleViewDetails} />
          </Card>

          <Card title="Lịch sử giao dịch gần nhất">
            <TransactionLog
              transactions={transactions.slice(0, 20)}
              usersById={usersById}
            />
          </Card>
        </>
      )}

      <MemberTransactionModal
        open={Boolean(detailUser)}
        user={detailUser}
        transactions={transactions}
        typeFilter="all"
        onClose={() => setDetailUser(null)}
      />

      <PaymentQrFloat visible={showPaymentQr} />
    </div>
  )
}
