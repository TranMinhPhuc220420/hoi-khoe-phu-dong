import { useCallback, useEffect, useMemo, useState } from 'react'
import { Card } from '../../components/ui/Card.jsx'
import { PageLoading, PageError } from '../../components/public/PageStatus.jsx'
import { PredictionGrid } from '../../components/admin/PredictionGrid.jsx'
import { useToast } from '../../hooks/useToast.js'
import { formatMatchDateTime } from '../../utils/format.js'
import { STAGE_LABELS } from '../../constants/stages.js'
import * as matchesService from '../../services/matches.service.js'
import * as usersService from '../../services/users.service.js'
import * as predictionsService from '../../services/predictions.service.js'
import * as scoringService from '../../services/scoring.service.js'
import { useDataStore } from '../../stores/data.store.js'

export function AdminPredictions() {
  const toast = useToast()
  const [matches, setMatches] = useState([])
  const [users, setUsers] = useState([])
  const [allPredictions, setAllPredictions] = useState([])
  const [selectedMatchId, setSelectedMatchId] = useState('')
  const [matchPredictions, setMatchPredictions] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingPreds, setLoadingPreds] = useState(false)
  const [error, setError] = useState('')

  const refresh = useCallback(() => {
    setLoading(true)
    setError('')
    return Promise.all([
      matchesService.getAll(),
      usersService.getAll(),
      predictionsService.getAll(),
    ])
      .then(([m, u, p]) => {
        setMatches(m)
        setUsers(u)
        setAllPredictions(p)
        return m
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu')
        return []
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    let cancelled = false

    Promise.all([
      matchesService.getAll(),
      usersService.getAll(),
      predictionsService.getAll(),
    ])
      .then(([m, u, p]) => {
        if (cancelled) return
        setMatches(m)
        setUsers(u)
        setAllPredictions(p)
        const firstId = m[0]?.id ?? ''
        if (firstId) {
          setSelectedMatchId(firstId)
          setLoadingPreds(true)
          return predictionsService.getByMatch(firstId).then((preds) => {
            if (!cancelled) setMatchPredictions(preds)
          })
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu')
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
          setLoadingPreds(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  const effectiveMatchId = selectedMatchId || matches[0]?.id || ''
  const selectedMatch = matches.find((m) => m.id === effectiveMatchId) ?? null

  const matchesById = useMemo(
    () => Object.fromEntries(matches.map((m) => [m.id, m])),
    [matches],
  )

  const stagePredictions = useMemo(() => {
    if (!selectedMatch) return []
    return allPredictions.filter((p) => matchesById[p.matchId]?.stage === selectedMatch.stage)
  }, [allPredictions, matchesById, selectedMatch])

  const handleMatchChange = (matchId) => {
    setSelectedMatchId(matchId)
    setLoadingPreds(true)
    predictionsService
      .getByMatch(matchId)
      .then(setMatchPredictions)
      .finally(() => setLoadingPreds(false))
  }

  const handleSave = async (rows) => {
    if (!effectiveMatchId || !selectedMatch) return
    await predictionsService.upsertBatch(effectiveMatchId, rows)
    if (selectedMatch.isFinished) {
      await scoringService.recalculateMatch(effectiveMatchId)
      useDataStore.getState().fetchUsers(true)
      toast.success('Đã lưu và tính lại điểm/phạt')
    } else {
      toast.success('Đã lưu dự đoán')
    }
    const [preds, all, updatedMatches] = await Promise.all([
      predictionsService.getByMatch(effectiveMatchId),
      predictionsService.getAll(),
      matchesService.getAll(),
    ])
    setMatchPredictions(preds)
    setAllPredictions(all)
    setMatches(updatedMatches)
  }

  if (loading) return <PageLoading />
  if (error) return <PageError message={error} onRetry={refresh} />

  return (
    <div className="space-y-6">
      <Card title="Chọn trận đấu">
        <select
          value={effectiveMatchId}
          onChange={(e) => handleMatchChange(e.target.value)}
          className="w-full rounded-md border border-secondary/40 bg-surface px-3 py-2.5 text-primary focus:border-tertiary focus:outline-none focus:ring-2 focus:ring-tertiary/20"
        >
          {matches.map((match) => (
            <option key={match.id} value={match.id}>
              {match.homeTeam} vs {match.awayTeam} — {STAGE_LABELS[match.stage]} —{' '}
              {formatMatchDateTime(match.matchTime)}
            </option>
          ))}
        </select>
      </Card>

      {selectedMatch && !loadingPreds && (
        <Card
          title={`Dự đoán: ${selectedMatch.homeTeam} vs ${selectedMatch.awayTeam}`}
          description={STAGE_LABELS[selectedMatch.stage]}
        >
          <PredictionGrid
            key={`${effectiveMatchId}-${(selectedMatch.nonParticipatingUserIds ?? []).join(',')}-${matchPredictions.length}`}
            match={selectedMatch}
            users={users}
            existingPredictions={matchPredictions}
            stagePredictions={stagePredictions}
            onSave={handleSave}
          />
        </Card>
      )}

      {loadingPreds && <PageLoading message="Đang tải dự đoán..." />}
    </div>
  )
}
