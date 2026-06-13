import { useState } from 'react'
import { Button } from '../ui/Button.jsx'
import { Input } from '../ui/Input.jsx'
import { Modal } from './Modal.jsx'

/**
 * @param {{
 *   match: import('../../types/index.js').Match
 *   predictionCount: number
 *   onClose: () => void
 *   onSubmit: (homeScore: number, awayScore: number) => Promise<void>
 * }} props
 */
function ResultFormFields({ match, predictionCount, onClose, onSubmit }) {
  const [homeScore, setHomeScore] = useState(String(match.homeScore ?? 0))
  const [awayScore, setAwayScore] = useState(String(match.awayScore ?? 0))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const home = Number(homeScore)
    const away = Number(awayScore)

    if (!Number.isInteger(home) || !Number.isInteger(away) || home < 0 || away < 0) {
      setError('Tỉ số phải là số nguyên ≥ 0')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit(home, away)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cập nhật thất bại')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <div className="space-y-4">
        <p className="font-semibold text-primary">
          {match.homeTeam} vs {match.awayTeam}
        </p>

        {predictionCount < 10 && (
          <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Cảnh báo: Chỉ có {predictionCount}/10 dự đoán. Hệ thống vẫn tính điểm cho các dự
            đoán hiện có.
          </p>
        )}

        {match.isFinished && (
          <p className="rounded-md bg-blue-50 px-3 py-2 text-sm text-blue-800">
            Trận đã kết thúc — cập nhật sẽ tính lại điểm và phạt.
          </p>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Input
            label={match.homeTeam}
            type="number"
            min={0}
            max={99}
            value={homeScore}
            onChange={(e) => setHomeScore(e.target.value)}
            disabled={submitting}
          />
          <Input
            label={match.awayTeam}
            type="number"
            min={0}
            max={99}
            value={awayScore}
            onChange={(e) => setAwayScore(e.target.value)}
            disabled={submitting}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose} disabled={submitting}>
          Hủy
        </Button>
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Đang tính điểm...' : 'Xác nhận & tính điểm'}
        </Button>
      </div>
    </>
  )
}

/**
 * @param {{
 *   open: boolean
 *   match: import('../../types/index.js').Match | null
 *   predictionCount: number
 *   onClose: () => void
 *   onSubmit: (homeScore: number, awayScore: number) => Promise<void>
 * }} props
 */
export function ResultFormModal({ open, match, predictionCount, onClose, onSubmit }) {
  if (!open || !match) return null

  return (
    <Modal open={open} title="Cập nhật kết quả" onClose={onClose}>
      <ResultFormFields
        key={match.id}
        match={match}
        predictionCount={predictionCount}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    </Modal>
  )
}
