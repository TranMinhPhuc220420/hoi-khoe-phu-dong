import { useState } from 'react'
import { EmptyState } from '../../components/shared/EmptyState.jsx'
import { MatchesTable } from '../../components/public/MatchesTable.jsx'
import { PageLoading, PageError } from '../../components/public/PageStatus.jsx'
import { STAGE_FILTERS } from '../../constants/stages.js'
import { isConfigValid } from '../../services/firebase.js'
import { useUsers, useMatches, useTeams } from '../../hooks/usePublicData.js'

const firebaseConfigured = isConfigValid()

export function MatchesPage() {
  const [stageFilter, setStageFilter] = useState(/** @type {'all' | import('../../types/index.js').MatchStage} */ ('all'))
  const [showUnfinishedOnly, setShowUnfinishedOnly] = useState(false)

  const { users, loading: usersLoading, error: usersError, refresh: refreshUsers } = useUsers()
  const { matches, loading: matchesLoading, error: matchesError, refresh: refreshMatches } = useMatches()
  const { teamsById, loading: teamsLoading, error: teamsError, refresh: refreshTeams } = useTeams()

  const loading = firebaseConfigured && (usersLoading || matchesLoading || teamsLoading)
  const error = usersError || matchesError || teamsError

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Lịch thi đấu</h1>
        <p className="mt-1 text-secondary">Xem lịch thi đấu và dự đoán của các thành viên</p>
      </div>

      {!firebaseConfigured && (
        <EmptyState title="Firebase chưa được cấu hình" description="Thêm VITE_FIREBASE_* vào .env.local." />
      )}

      {loading && <PageLoading />}

      {error && !loading && (
        <PageError
          message={error}
          onRetry={() => {
            refreshUsers()
            refreshMatches()
            refreshTeams()
          }}
        />
      )}

      {!loading && !error && firebaseConfigured && (
        <>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-1">
              {STAGE_FILTERS.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setStageFilter(key)}
                  className={`rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ${
                    stageFilter === key
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface text-secondary hover:bg-neutral'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-secondary">
              <input
                type="checkbox"
                checked={showUnfinishedOnly}
                onChange={(e) => setShowUnfinishedOnly(e.target.checked)}
                className="rounded border-secondary text-tertiary focus:ring-tertiary"
              />
              Chỉ trận chưa kết thúc
            </label>
          </div>

          {matches.length === 0 ? (
            <EmptyState
              title="Chưa có trận đấu"
              description="Lịch thi đấu World Cup 2026 sẽ được cập nhật bởi admin."
            />
          ) : (
            <MatchesTable
              matches={matches}
              users={users}
              teamsById={teamsById}
              stageFilter={stageFilter}
              showUnfinishedOnly={showUnfinishedOnly}
            />
          )}
        </>
      )}
    </div>
  )
}
