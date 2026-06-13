import { Card } from '../../components/ui/Card.jsx'
import { EmptyState } from '../../components/shared/EmptyState.jsx'
import { StatCard } from '../../components/public/StatCard.jsx'
import { UpcomingMatchesList } from '../../components/public/MatchRow.jsx'
import { LeaderboardTable } from '../../components/public/LeaderboardTable.jsx'
import { PageLoading, PageError } from '../../components/public/PageStatus.jsx'
import { isConfigValid } from '../../services/firebase.js'
import {
  useUsers,
  useMatches,
  useTeams,
  getTopScorer,
  getHighestDebtUser,
  getUpcomingMatches,
} from '../../hooks/usePublicData.js'
import { formatCurrency } from '../../utils/format.js'

const firebaseConfigured = isConfigValid()

export function DashboardPage() {
  const { users, loading: usersLoading, error: usersError, refresh: refreshUsers } = useUsers()
  const { matches, loading: matchesLoading, error: matchesError, refresh: refreshMatches } = useMatches()
  const { teamsById, loading: teamsLoading, error: teamsError, refresh: refreshTeams } = useTeams()

  const loading = firebaseConfigured && (usersLoading || matchesLoading || teamsLoading)
  const error = usersError || matchesError || teamsError

  const finishedCount = matches.filter((m) => m.isFinished).length
  const topScorer = getTopScorer(users)
  const highestDebt = getHighestDebtUser(users)
  const upcoming = getUpcomingMatches(matches, 5)
  const hasData = users.length > 0 || matches.length > 0

  const handleRetry = () => {
    refreshUsers()
    refreshMatches()
    refreshTeams()
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
        <p className="mt-1 text-secondary">Tổng quan World Cup 2026 — dự đoán & quỹ phạt</p>
      </div>

      {!firebaseConfigured && (
        <EmptyState
          title="Firebase chưa được cấu hình"
          description="Thêm VITE_FIREBASE_* vào .env.local để xem dữ liệu."
        />
      )}

      {loading && <PageLoading />}

      {error && !loading && <PageError message={error} onRetry={handleRetry} />}

      {!loading && !error && firebaseConfigured && !hasData && (
        <EmptyState
          title="Chưa có dữ liệu"
          description="Admin cần seed dữ liệu thành viên và lịch thi đấu."
        />
      )}

      {!loading && !error && hasData && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              title="Trận đấu"
              value={`${finishedCount} / ${matches.length}`}
              description="Đã kết thúc / Tổng số"
            />
            <StatCard
              title="Top scorer"
              value={topScorer ? `${topScorer.name} (${topScorer.totalPoints}đ)` : '—'}
              highlight={topScorer ? 'gold' : 'none'}
            />
            <StatCard
              title="Nợ cao nhất"
              value={
                highestDebt && highestDebt.balance > 0
                  ? `${highestDebt.name} (${formatCurrency(highestDebt.balance)})`
                  : '—'
              }
              highlight={highestDebt && highestDebt.balance > 0 ? 'red' : 'none'}
              className="sm:col-span-2 lg:col-span-1"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card title="Trận sắp tới">
              <UpcomingMatchesList matches={upcoming} teamsById={teamsById} />
            </Card>
            <Card title="Bảng xếp hạng">
              <LeaderboardTable users={users} limit={5} compact showLink />
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
