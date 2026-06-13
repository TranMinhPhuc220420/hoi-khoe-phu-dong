import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../../components/ui/Card.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { StatCard } from '../../components/public/StatCard.jsx'
import { PageLoading, PageError } from '../../components/public/PageStatus.jsx'
import { MatchRow } from '../../components/public/MatchRow.jsx'
import { formatCurrency, parseMatchTime } from '../../utils/format.js'
import { isConfigValid } from '../../services/firebase.js'
import * as matchesService from '../../services/matches.service.js'
import * as usersService from '../../services/users.service.js'
import * as predictionsService from '../../services/predictions.service.js'
import * as transactionsService from '../../services/transactions.service.js'
import { useDataStore } from '../../stores/data.store.js'

const firebaseConfigured = isConfigValid()

/**
 * @param {import('../../types/index.js').Match[]} matches
 * @param {number} nowMs
 */
function getPendingResultMatches(matches, nowMs) {
  return matches.filter((m) => {
    if (m.isFinished) return false
    const t = parseMatchTime(m.matchTime)
    return t && t.getTime() < nowMs
  })
}

export function AdminDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(firebaseConfigured)
  const [error, setError] = useState(firebaseConfigured ? '' : 'Firebase chưa được cấu hình')

  const invalidateCache = () => {
    useDataStore.getState().fetchUsers(true)
    useDataStore.getState().fetchMatches(true)
  }

  const load = () => {
    if (!firebaseConfigured) return
    setLoading(true)
    setError('')
    Promise.all([
      usersService.getAll(),
      matchesService.getAll(),
      predictionsService.getAll(),
      transactionsService.getAll(),
    ])
      .then(([users, matches, predictions, transactions]) => {
        const nowMs = Date.now()
        setData({
          users,
          matches,
          predictions,
          transactions,
          pendingResult: getPendingResultMatches(matches, nowMs),
        })
        invalidateCache()
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!firebaseConfigured) return
    let cancelled = false

    Promise.all([
      usersService.getAll(),
      matchesService.getAll(),
      predictionsService.getAll(),
      transactionsService.getAll(),
    ])
      .then(([users, matches, predictions, transactions]) => {
        if (cancelled) return
        const nowMs = Date.now()
        setData({
          users,
          matches,
          predictions,
          transactions,
          pendingResult: getPendingResultMatches(matches, nowMs),
        })
        invalidateCache()
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

  if (loading) return <PageLoading />
  if (error) return <PageError message={error} onRetry={load} />
  if (!data) return null

  const { users, matches, predictions, transactions, pendingResult } = data
  const finished = matches.filter((m) => m.isFinished).length
  const totalPenalty = users.reduce((s, u) => s + u.totalPenalty, 0)
  const totalPaid = users.reduce((s, u) => s + u.paidAmount, 0)
  const debt = totalPenalty - totalPaid
  const maxPossiblePredictions = matches.length * users.length

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-3">
        <Link to="/admin/matches?action=create">
          <Button>Thêm trận mới</Button>
        </Link>
        <Link to="/admin/predictions">
          <Button variant="secondary">Nhập dự đoán</Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Trận đấu" value={`${finished} / ${matches.length}`} description="Đã kết thúc / Tổng" />
        <StatCard
          title="Chờ kết quả"
          value={pendingResult.length}
          description="Trận đã diễn ra, chưa cập nhật"
        />
        <StatCard
          title="Dự đoán"
          value={`${predictions.length} / ${maxPossiblePredictions}`}
          description="Đã nhập / Tối đa"
        />
        <StatCard title="Quỹ phạt" value={formatCurrency(totalPenalty)} />
        <StatCard title="Đã thu" value={formatCurrency(totalPaid)} />
        <StatCard title="Còn nợ" value={formatCurrency(debt)} highlight={debt > 0 ? 'red' : 'none'} />
      </div>

      {pendingResult.length > 0 && (
        <Card title="Trận cần cập nhật kết quả">
          <div className="divide-y divide-secondary/10">
            {pendingResult.slice(0, 5).map((match) => (
              <MatchRow key={match.id} match={match} compact />
            ))}
          </div>
          <Link
            to="/admin/matches"
            className="mt-3 inline-block text-sm font-semibold text-tertiary hover:underline"
          >
            Quản lý trận →
          </Link>
        </Card>
      )}

      {transactions.length > 0 && (
        <Card title="Giao dịch gần đây">
          <ul className="space-y-2 text-sm">
            {transactions.slice(0, 5).map((tx) => {
              const user = users.find((u) => u.id === tx.userId)
              return (
                <li key={tx.id} className="flex justify-between gap-2 text-secondary">
                  <span>
                    {user?.name ?? tx.userId} — {tx.type === 'penalty' ? 'Phạt' : 'Thanh toán'}
                  </span>
                  <span className="font-medium text-primary">{formatCurrency(tx.amount)}</span>
                </li>
              )
            })}
          </ul>
        </Card>
      )}
    </div>
  )
}
