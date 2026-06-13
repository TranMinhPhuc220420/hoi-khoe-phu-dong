import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button } from '../../components/ui/Button.jsx'
import { StageBadge } from '../../components/public/StageBadge.jsx'
import { PageLoading, PageError } from '../../components/public/PageStatus.jsx'
import { MatchFormModal } from '../../components/admin/MatchFormModal.jsx'
import { ResultFormModal } from '../../components/admin/ResultFormModal.jsx'
import { ConfirmDialog } from '../../components/admin/ConfirmDialog.jsx'
import { useToast } from '../../hooks/useToast.js'
import { formatMatchDateTime, formatScore } from '../../utils/format.js'
import * as matchesService from '../../services/matches.service.js'
import * as predictionsService from '../../services/predictions.service.js'
import { useDataStore } from '../../stores/data.store.js'
import { Table, TableHead, TableBody, TableHeaderCell, TableCell } from '../../components/ui/Table.jsx'

export function AdminMatches() {
  const toast = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [formOpen, setFormOpen] = useState(false)
  const [editMatch, setEditMatch] = useState(/** @type {import('../../types/index.js').Match | null} */ (null))
  const [resultMatch, setResultMatch] = useState(/** @type {import('../../types/index.js').Match | null} */ (null))
  const [resultPredCount, setResultPredCount] = useState(0)
  const [deleteMatch, setDeleteMatch] = useState(/** @type {import('../../types/index.js').Match | null} */ (null))
  const [deleting, setDeleting] = useState(false)
  const [createActionSeen, setCreateActionSeen] = useState(false)

  const refresh = useCallback(() => {
    setLoading(true)
    setError('')
    return matchesService
      .getAll()
      .then((data) => {
        setMatches(data)
        useDataStore.getState().fetchMatches(true)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Không thể tải trận đấu')
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    let cancelled = false

    matchesService
      .getAll()
      .then((data) => {
        if (cancelled) return
        setMatches(data)
        useDataStore.getState().fetchMatches(true)
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Không thể tải trận đấu')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const createAction = searchParams.get('action')
  if (createAction === 'create' && !createActionSeen) {
    setCreateActionSeen(true)
    setEditMatch(null)
    setFormOpen(true)
    setSearchParams({}, { replace: true })
  }

  const openCreate = () => {
    setEditMatch(null)
    setFormOpen(true)
  }

  const openEdit = (match) => {
    if (match.isFinished) {
      toast.error('Không thể sửa trận đã kết thúc')
      return
    }
    setEditMatch(match)
    setFormOpen(true)
  }

  const openResult = async (match) => {
    const preds = await predictionsService.getByMatch(match.id)
    setResultPredCount(preds.length)
    setResultMatch(match)
  }

  const handleSaveMatch = async (data) => {
    if (editMatch) {
      await matchesService.update(editMatch.id, {
        homeTeam: data.homeTeam,
        awayTeam: data.awayTeam,
        homeTeamId: data.homeTeamId,
        awayTeamId: data.awayTeamId,
        matchTime: data.matchTime,
        stage: data.stage,
      })
      toast.success('Đã cập nhật trận đấu')
    } else {
      await matchesService.create(data)
      toast.success('Đã thêm trận mới')
    }
    await refresh()
  }

  const handleUpdateResult = async (homeScore, awayScore) => {
    if (!resultMatch) return
    await matchesService.updateResult(resultMatch.id, homeScore, awayScore)
    toast.success('Đã cập nhật kết quả & tính điểm')
    await refresh()
    useDataStore.getState().fetchUsers(true)
  }

  const handleDelete = async () => {
    if (!deleteMatch) return
    setDeleting(true)
    try {
      const preds = await predictionsService.getByMatch(deleteMatch.id)
      if (preds.length > 0) {
        toast.error('Không thể xóa trận đã có dự đoán')
        return
      }
      await matchesService.remove(deleteMatch.id)
      toast.success('Đã xóa trận đấu')
      setDeleteMatch(null)
      await refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Xóa thất bại')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <PageLoading />
  if (error) return <PageError message={error} onRetry={refresh} />

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={openCreate}>Thêm trận mới</Button>
      </div>

      <Table>
        <TableHead>
          <tr>
            <TableHeaderCell>Thời gian</TableHeaderCell>
            <TableHeaderCell>Trận</TableHeaderCell>
            <TableHeaderCell>Vòng</TableHeaderCell>
            <TableHeaderCell>Kết quả</TableHeaderCell>
            <TableHeaderCell>Trạng thái</TableHeaderCell>
            <TableHeaderCell>Thao tác</TableHeaderCell>
          </tr>
        </TableHead>
        <TableBody>
          {matches.map((match) => (
            <tr key={match.id}>
              <TableCell className="whitespace-nowrap text-secondary">
                {formatMatchDateTime(match.matchTime)}
              </TableCell>
              <TableCell className="font-medium">
                {match.homeTeam} vs {match.awayTeam}
              </TableCell>
              <TableCell>
                <StageBadge stage={match.stage} />
              </TableCell>
              <TableCell>{formatScore(match.homeScore, match.awayScore)}</TableCell>
              <TableCell>{match.isFinished ? 'Đã xong' : 'Chưa xong'}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  <Button variant="secondary" size="sm" onClick={() => openEdit(match)}>
                    Sửa
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => openResult(match)}>
                    Kết quả
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => setDeleteMatch(match)}>
                    Xóa
                  </Button>
                </div>
              </TableCell>
            </tr>
          ))}
        </TableBody>
      </Table>

      <MatchFormModal
        open={formOpen}
        match={editMatch}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSaveMatch}
      />

      <ResultFormModal
        open={Boolean(resultMatch)}
        match={resultMatch}
        predictionCount={resultPredCount}
        onClose={() => setResultMatch(null)}
        onSubmit={handleUpdateResult}
      />

      <ConfirmDialog
        open={Boolean(deleteMatch)}
        title="Xóa trận đấu"
        message={`Xóa trận ${deleteMatch?.homeTeam} vs ${deleteMatch?.awayTeam}? Hành động không thể hoàn tác.`}
        confirmLabel="Xóa"
        variant="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteMatch(null)}
      />
    </div>
  )
}
