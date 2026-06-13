import { Card } from '../../components/ui/Card.jsx'
import { EmptyState } from '../../components/shared/EmptyState.jsx'
import { CompetitionSubNav } from '../../components/public/CompetitionSubNav.jsx'
import { LeaderboardTable } from '../../components/public/LeaderboardTable.jsx'
import { PageLoading, PageError } from '../../components/public/PageStatus.jsx'
import { isConfigValid } from '../../services/firebase.js'
import { useUsers } from '../../hooks/usePublicData.js'

const firebaseConfigured = isConfigValid()

export function LeaderboardPage() {
  const { users, loading, error, refresh } = useUsers()

  const avgPoints =
    users.length > 0
      ? (users.reduce((s, u) => s + u.totalPoints, 0) / users.length).toFixed(1)
      : '0'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Thi đấu</h1>
        <p className="mt-1 text-secondary">Bảng xếp hạng điểm dự đoán</p>
      </div>

      <CompetitionSubNav />

      {!firebaseConfigured && (
        <EmptyState title="Firebase chưa được cấu hình" description="Thêm VITE_FIREBASE_* vào .env.local." />
      )}

      {firebaseConfigured && loading && <PageLoading />}

      {error && !loading && <PageError message={error} onRetry={refresh} />}

      {!loading && !error && firebaseConfigured && users.length === 0 && (
        <EmptyState
          title="Chưa có điểm số"
          description="Bảng xếp hạng sẽ cập nhật sau khi có kết quả trận đấu."
        />
      )}

      {!loading && !error && users.length > 0 && (
        <>
          <Card>
            <p className="text-sm text-secondary">
              Điểm trung bình: <span className="font-bold text-primary">{avgPoints} điểm</span>
            </p>
          </Card>
          <LeaderboardTable users={users} />
        </>
      )}
    </div>
  )
}
