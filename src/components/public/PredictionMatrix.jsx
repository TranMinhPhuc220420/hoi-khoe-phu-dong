import { useEffect, useState } from 'react'
import * as predictionsService from '../../services/predictions.service.js'
import { formatPrediction } from '../../utils/format.js'
import { Spinner } from '../ui/Spinner.jsx'
import { Table, TableHead, TableBody, TableHeaderCell, TableCell } from '../ui/Table.jsx'

/**
 * @param {{
 *   matchId: string
 *   usersById: Record<string, import('../../types/index.js').User>
 * }} props
 */
function PredictionMatrixContent({ matchId, usersById }) {
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

  if (!predictions.length) {
    return <p className="py-4 text-sm text-secondary">Chưa có dự đoán cho trận này.</p>
  }

  const sorted = [...predictions].sort((a, b) => {
    const userA = usersById[a.userId]
    const userB = usersById[b.userId]
    const orderA = typeof userA?.sortOrder === 'number' ? userA.sortOrder : Number.MAX_SAFE_INTEGER
    const orderB = typeof userB?.sortOrder === 'number' ? userB.sortOrder : Number.MAX_SAFE_INTEGER
    if (orderA !== orderB) return orderA - orderB
    const nameA = userA?.name ?? ''
    const nameB = userB?.name ?? ''
    return nameA.localeCompare(nameB, 'vi')
  })

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
          {sorted.map((p) => (
            <tr key={p.id}>
              <TableCell>{usersById[p.userId]?.name ?? p.userId}</TableCell>
              <TableCell>
                {formatPrediction(p.predictedHome, p.predictedAway, p.isStar)}
              </TableCell>
              <TableCell className="font-semibold">
                {p.pointsEarned != null ? p.pointsEarned : '—'}
              </TableCell>
            </tr>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

/**
 * @param {{
 *   matchId: string
 *   usersById: Record<string, import('../../types/index.js').User>
 *   isExpanded: boolean
 * }} props
 */
export function PredictionMatrix({ matchId, usersById, isExpanded }) {
  if (!isExpanded) return null
  return <PredictionMatrixContent key={matchId} matchId={matchId} usersById={usersById} />
}
