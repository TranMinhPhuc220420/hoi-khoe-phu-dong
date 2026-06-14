import { useEffect, useMemo, useState } from 'react'
import * as predictionsService from '../../services/predictions.service.js'
import { formatPrediction } from '../../utils/format.js'
import { Spinner } from '../ui/Spinner.jsx'
import { Table, TableHead, TableBody, TableHeaderCell, TableCell } from '../ui/Table.jsx'

/**
 * @param {Record<string, import('../../types/index.js').User>} usersById
 */
function sortUsers(usersById) {
  return Object.values(usersById).sort((a, b) => {
    const orderA = typeof a.sortOrder === 'number' ? a.sortOrder : Number.MAX_SAFE_INTEGER
    const orderB = typeof b.sortOrder === 'number' ? b.sortOrder : Number.MAX_SAFE_INTEGER
    if (orderA !== orderB) return orderA - orderB
    return a.name.localeCompare(b.name, 'vi')
  })
}

/**
 * @param {{
 *   matchId: string
 *   usersById: Record<string, import('../../types/index.js').User>
 *   isFinished: boolean
 * }} props
 */
function PredictionMatrixContent({ matchId, usersById, isFinished }) {
  const [predictions, setPredictions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    predictionsService
      .getByMatch(matchId)
      .then(setPredictions)
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Không thể tải dự đoán')
      })
      .finally(() => setLoading(false))
  }, [matchId])

  const predictionsByUser = useMemo(
    () => Object.fromEntries(predictions.map((p) => [p.userId, p])),
    [predictions],
  )

  const sortedUsers = useMemo(() => sortUsers(usersById), [usersById])

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <Spinner />
      </div>
    )
  }

  if (error) {
    return <p className="py-4 text-sm text-red-600">{error}</p>
  }

  if (!isFinished && predictions.length === 0) {
    return <p className="py-4 text-sm text-secondary">Chưa có dự đoán cho trận này.</p>
  }

  if (isFinished && sortedUsers.length === 0 && predictions.length === 0) {
    return <p className="py-4 text-sm text-secondary">Chưa có dữ liệu dự đoán.</p>
  }

  const rows = isFinished
    ? sortedUsers
    : sortedUsers.filter((user) => predictionsByUser[user.id])

  if (rows.length === 0) {
    return <p className="py-4 text-sm text-secondary">Chưa có dự đoán cho trận này.</p>
  }

  return (
    <div className="border-t border-secondary/10 bg-neutral/50 px-2 py-3">
      <Table>
        <TableHead>
          <tr>
            <TableHeaderCell>Thành viên</TableHeaderCell>
            <TableHeaderCell>Dự đoán</TableHeaderCell>
            <TableHeaderCell>Điểm</TableHeaderCell>
          </tr>
        </TableHead>
        <TableBody>
          {rows.map((user) => {
            const prediction = predictionsByUser[user.id]
            return (
              <tr key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>
                  {prediction ? (
                    formatPrediction(prediction.predictedHome, prediction.predictedAway, prediction.isStar)
                  ) : (
                    <span className="text-secondary">Không dự đoán</span>
                  )}
                </TableCell>
                <TableCell className="font-semibold">
                  {prediction
                    ? prediction.pointsEarned != null
                      ? prediction.pointsEarned
                      : '—'
                    : isFinished
                      ? 0
                      : '—'}
                </TableCell>
              </tr>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

/**
 * @param {{
 *   matchId: string
 *   usersById: Record<string, import('../../types/index.js').User>
 *   isFinished: boolean
 *   isExpanded: boolean
 * }} props
 */
export function PredictionMatrix({ matchId, usersById, isFinished, isExpanded }) {
  if (!isExpanded) return null
  return (
    <PredictionMatrixContent
      key={matchId}
      matchId={matchId}
      usersById={usersById}
      isFinished={isFinished}
    />
  )
}
