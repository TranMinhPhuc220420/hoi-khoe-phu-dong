import { useMemo, useState } from 'react'
import { Button } from '../ui/Button.jsx'
import { StarCheckbox } from './StarCheckbox.jsx'
import { getStarLimit } from '../../constants/star-limits.js'

/**
 * @typedef {Object} PredictionRow
 * @property {string} userId
 * @property {string} userName
 * @property {string} [predictionId]
 * @property {number} predictedHome
 * @property {number} predictedAway
 * @property {boolean} isStar
 */

/**
 * @param {{
 *   match: import('../../types/index.js').Match
 *   users: import('../../types/index.js').User[]
 *   existingPredictions: import('../../types/index.js').Prediction[]
 *   stagePredictions: import('../../types/index.js').Prediction[]
 *   onSave: (rows: PredictionRow[]) => Promise<void>
 * }} props
 */
export function PredictionGrid({
  match,
  users,
  existingPredictions,
  stagePredictions,
  onSave,
}) {
  const initialRows = useMemo(() => {
    const byUser = Object.fromEntries(existingPredictions.map((p) => [p.userId, p]))
    return users.map((user) => {
      const existing = byUser[user.id]
      return {
        userId: user.id,
        userName: user.name,
        predictionId: existing?.id,
        predictedHome: existing?.predictedHome ?? 0,
        predictedAway: existing?.predictedAway ?? 0,
        isStar: existing?.isStar ?? false,
      }
    })
  }, [users, existingPredictions])

  const [rows, setRows] = useState(initialRows)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const updateRow = (userId, patch) => {
    setRows((prev) => prev.map((r) => (r.userId === userId ? { ...r, ...patch } : r)))
  }

  const handleSave = async () => {
    setError('')
    for (const row of rows) {
      const home = Number(row.predictedHome)
      const away = Number(row.predictedAway)
      if (
        !Number.isInteger(home) ||
        !Number.isInteger(away) ||
        home < 0 ||
        away < 0 ||
        home > 99 ||
        away > 99
      ) {
        setError(`Tỉ số không hợp lệ cho ${row.userName}`)
        return
      }
    }

    setSubmitting(true)
    try {
      await onSave(rows)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lưu thất bại')
    } finally {
      setSubmitting(false)
    }
  }

  const isFinal = match.stage === 'final'
  const starLimit = getStarLimit(match.stage)

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border border-secondary/20 bg-surface">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead className="border-b border-secondary/20 bg-neutral">
            <tr>
              <th className="px-3 py-2 text-xs font-semibold uppercase text-secondary">
                Thành viên
              </th>
              <th className="px-3 py-2 text-xs font-semibold uppercase text-secondary">Nhà</th>
              <th className="px-3 py-2 text-xs font-semibold uppercase text-secondary">Khách</th>
              <th className="px-3 py-2 text-xs font-semibold uppercase text-secondary">Sao</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary/10">
            {rows.map((row) => (
              <tr key={row.userId}>
                <td className="px-3 py-2 font-medium">{row.userName}</td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    min={0}
                    max={99}
                    value={row.predictedHome}
                    onChange={(e) =>
                      updateRow(row.userId, { predictedHome: Number(e.target.value) })
                    }
                    className="w-16 rounded border border-secondary/40 px-2 py-1"
                    disabled={submitting}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    min={0}
                    max={99}
                    value={row.predictedAway}
                    onChange={(e) =>
                      updateRow(row.userId, { predictedAway: Number(e.target.value) })
                    }
                    className="w-16 rounded border border-secondary/40 px-2 py-1"
                    disabled={submitting}
                  />
                </td>
                <td className="px-3 py-2">
                  <StarCheckbox
                    checked={row.isStar}
                    onChange={(isStar) => updateRow(row.userId, { isStar })}
                    stage={match.stage}
                    userId={row.userId}
                    predictionsInStage={stagePredictions.filter((p) => p.userId === row.userId)}
                    excludePredictionId={row.predictionId}
                    disabled={submitting || isFinal}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!isFinal && (
        <p className="text-xs text-secondary">Giới hạn sao vòng này: {starLimit} / thành viên</p>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button onClick={handleSave} disabled={submitting}>
        {submitting ? 'Đang lưu...' : 'Lưu tất cả dự đoán'}
      </Button>
    </div>
  )
}
