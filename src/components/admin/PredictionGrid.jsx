import { useMemo, useState } from 'react'
import { Button } from '../ui/Button.jsx'
import { StarCheckbox } from './StarCheckbox.jsx'
import { UserAvatar } from '../shared/UserAvatar.jsx'
import { getStarLimit } from '../../constants/star-limits.js'
import { isFilledPredictionRow } from '../../utils/prediction-input.js'

/**
 * @typedef {Object} PredictionRow
 * @property {string} userId
 * @property {string} userName
 * @property {string | null} [avatarUrl]
 * @property {string} [predictionId]
 * @property {boolean} hasParticipated
 * @property {number | null} predictedHome
 * @property {number | null} predictedAway
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
    const nonParticipating = new Set(match.nonParticipatingUserIds ?? [])
    return users.map((user) => {
      const existing = byUser[user.id]
      return {
        userId: user.id,
        userName: user.name,
        avatarUrl: user.avatarUrl ?? null,
        predictionId: existing?.id,
        hasParticipated: existing ? true : !nonParticipating.has(user.id),
        predictedHome: existing?.predictedHome ?? null,
        predictedAway: existing?.predictedAway ?? null,
        isStar: existing?.isStar ?? false,
      }
    })
  }, [users, existingPredictions, match.nonParticipatingUserIds])

  const [rows, setRows] = useState(initialRows)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const nonParticipatingCount = rows.filter((row) => !row.hasParticipated).length

  const updateRow = (userId, patch) => {
    setRows((prev) => prev.map((r) => (r.userId === userId ? { ...r, ...patch } : r)))
  }

  const parseScoreInput = (value) => {
    if (value === '') return null
    const parsed = Number(value)
    return Number.isNaN(parsed) ? null : parsed
  }

  const handleSave = async () => {
    setError('')

    for (const row of rows) {
      if (row.hasParticipated && !isFilledPredictionRow(row)) {
        setError(`Nhập đủ tỉ số cho ${row.userName} (đã chọn tham gia dự đoán)`)
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
      {nonParticipatingCount > 0 && (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {nonParticipatingCount}/{users.length} thành viên không tham gia — sẽ bị phạt khi cập
          nhật kết quả
        </p>
      )}

      {match.isFinished && (
        <p className="rounded-md bg-blue-50 px-3 py-2 text-sm text-blue-800">
          Trận đã kết thúc — lưu sẽ tự động tính lại điểm và phạt.
        </p>
      )}

      <div className="overflow-x-auto rounded-lg border border-secondary/20 bg-surface">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead className="border-b border-secondary/20 bg-neutral">
            <tr>
              <th className="px-3 py-2 text-xs font-semibold uppercase text-secondary">
                Thành viên
              </th>
              <th className="px-3 py-2 text-xs font-semibold uppercase text-secondary">Tham gia</th>
              <th className="px-3 py-2 text-xs font-semibold uppercase text-secondary">Nhà</th>
              <th className="px-3 py-2 text-xs font-semibold uppercase text-secondary">Khách</th>
              <th className="px-3 py-2 text-xs font-semibold uppercase text-secondary">Sao</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary/10">
            {rows.map((row) => {
              const inputsDisabled = submitting || !row.hasParticipated
              return (
                <tr
                  key={row.userId}
                  className={!row.hasParticipated ? 'bg-amber-50/50' : undefined}
                >
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2 font-medium">
                      <UserAvatar name={row.userName} avatarUrl={row.avatarUrl} size="sm" />
                      <span>{row.userName}</span>
                      {!row.hasParticipated && (
                        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-800">
                          Không tham gia
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={row.hasParticipated}
                        disabled={submitting}
                        onChange={(e) =>
                          updateRow(row.userId, { hasParticipated: e.target.checked })
                        }
                        className="rounded border-secondary text-tertiary focus:ring-tertiary disabled:opacity-50"
                      />
                    </label>
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min={0}
                      max={99}
                      value={row.predictedHome ?? ''}
                      placeholder="—"
                      onChange={(e) =>
                        updateRow(row.userId, { predictedHome: parseScoreInput(e.target.value) })
                      }
                      className="w-16 rounded border border-secondary/40 px-2 py-1 disabled:bg-neutral disabled:opacity-60"
                      disabled={inputsDisabled}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min={0}
                      max={99}
                      value={row.predictedAway ?? ''}
                      placeholder="—"
                      onChange={(e) =>
                        updateRow(row.userId, { predictedAway: parseScoreInput(e.target.value) })
                      }
                      className="w-16 rounded border border-secondary/40 px-2 py-1 disabled:bg-neutral disabled:opacity-60"
                      disabled={inputsDisabled}
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
                      disabled={
                        inputsDisabled || isFinal || !isFilledPredictionRow(row)
                      }
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {!isFinal && (
        <p className="text-xs text-secondary">Giới hạn sao vòng này: {starLimit} / thành viên</p>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button onClick={handleSave} disabled={submitting}>
        {submitting ? 'Đang lưu...' : 'Lưu dự đoán'}
      </Button>
    </div>
  )
}
