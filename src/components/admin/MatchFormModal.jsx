import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Timestamp } from 'firebase/firestore'
import { Button } from '../ui/Button.jsx'
import { Input } from '../ui/Input.jsx'
import { Badge } from '../ui/Badge.jsx'
import { Spinner } from '../ui/Spinner.jsx'
import { Modal } from './Modal.jsx'
import { TeamBadge } from '../shared/TeamBadge.jsx'
import { TeamSelect } from '../shared/TeamSelect.jsx'
import { STAGE_FILTERS } from '../../constants/stages.js'
import * as teamsService from '../../services/teams.service.js'

const STAGE_OPTIONS = STAGE_FILTERS.filter((s) => s.key !== 'all')

const KNOCKOUT_STAGES = STAGE_OPTIONS.filter((s) => s.key !== 'group')

const FORM_ID = 'match-form'

const selectClassName =
  'w-full rounded-md border border-secondary/40 bg-surface px-3 py-2.5 text-primary focus:border-tertiary focus:outline-none focus:ring-2 focus:ring-tertiary/20 disabled:opacity-50'

const labelClassName = 'text-[0.72rem] font-semibold uppercase tracking-wide text-secondary'

/**
 * @param {import('firebase/firestore').Timestamp | Date | string | null | undefined} value
 * @returns {string}
 */
function toDatetimeLocalValue(value) {
  if (!value) return ''
  const date =
    typeof value === 'object' && value !== null && 'toDate' in value
      ? value.toDate()
      : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/**
 * @param {string} value
 * @returns {string}
 */
function formatMatchTimePreview(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * @param {{
 *   homeTeam?: import('../../types/index.js').Team
 *   awayTeam?: import('../../types/index.js').Team
 *   stage: import('../../types/index.js').MatchStage
 *   matchTime: string
 * }} props
 */
function MatchPreview({ homeTeam, awayTeam, stage, matchTime }) {
  const formattedTime = formatMatchTimePreview(matchTime)

  return (
    <div className="rounded-lg border border-secondary/20 bg-neutral/50 px-4 py-4">
      <p className={labelClassName}>Xem trước trận đấu</p>
      <div className="mt-3 flex items-center gap-3">
        <div className="flex min-w-0 flex-1 flex-col items-center gap-1 text-center">
          {homeTeam ? (
            <TeamBadge team={homeTeam} className="font-semibold text-primary" />
          ) : (
            <span className="text-sm text-secondary">Chọn đội nhà</span>
          )}
          <span className="text-[0.65rem] font-semibold uppercase tracking-wide text-secondary/70">
            Nhà
          </span>
        </div>

        <span
          className="shrink-0 rounded-md bg-surface px-2.5 py-1 text-sm font-bold text-secondary"
          aria-hidden="true"
        >
          VS
        </span>

        <div className="flex min-w-0 flex-1 flex-col items-center gap-1 text-center">
          {awayTeam ? (
            <TeamBadge team={awayTeam} className="font-semibold text-primary" />
          ) : (
            <span className="text-sm text-secondary">Chọn đội khách</span>
          )}
          <span className="text-[0.65rem] font-semibold uppercase tracking-wide text-secondary/70">
            Khách
          </span>
        </div>
      </div>

      {(stage || formattedTime) && (
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2 border-t border-secondary/15 pt-3">
          {stage && <Badge stage={stage} />}
          {formattedTime && <span className="text-sm text-secondary">{formattedTime}</span>}
        </div>
      )}
    </div>
  )
}

/**
 * @param {{
 *   match?: import('../../types/index.js').Match | null
 *   onClose: () => void
 *   onSubmit: (data: {
 *     homeTeam: string
 *     awayTeam: string
 *     homeTeamId: string
 *     awayTeamId: string
 *     matchTime: import('firebase/firestore').Timestamp
 *     stage: import('../../types/index.js').MatchStage
 *     homeScore: null
 *     awayScore: null
 *     isFinished: boolean
 *   }) => Promise<void>
 * }} props
 */
function MatchFormFields({ match, onClose, onSubmit }) {
  const [teams, setTeams] = useState(/** @type {import('../../types/index.js').Team[]} */ ([]))
  const [teamsLoading, setTeamsLoading] = useState(true)
  const [homeTeamId, setHomeTeamId] = useState(match?.homeTeamId ?? '')
  const [awayTeamId, setAwayTeamId] = useState(match?.awayTeamId ?? '')
  const [matchTime, setMatchTime] = useState(toDatetimeLocalValue(match?.matchTime))
  const [stage, setStage] = useState(/** @type {import('../../types/index.js').MatchStage} */ (match?.stage ?? 'group'))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const isFinished = Boolean(match?.isFinished)
  const isDisabled = submitting || isFinished

  useEffect(() => {
    let cancelled = false
    setTeamsLoading(true)

    teamsService
      .getAll()
      .then((data) => {
        if (!cancelled) setTeams(data)
      })
      .catch(() => {
        if (!cancelled) setError('Không thể tải danh sách đội')
      })
      .finally(() => {
        if (!cancelled) setTeamsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!teams.length) return

    if (match) {
      if (!homeTeamId) {
        const found = teams.find((t) => t.name === match.homeTeam)
        if (found) setHomeTeamId(found.id)
      }
      if (!awayTeamId) {
        const found = teams.find((t) => t.name === match.awayTeam)
        if (found) setAwayTeamId(found.id)
      }
      return
    }

    if (!homeTeamId && teams[0]) setHomeTeamId(teams[0].id)
    if (!awayTeamId && teams[1]) setAwayTeamId(teams[1].id)
  }, [teams, match, homeTeamId, awayTeamId])

  const teamsById = Object.fromEntries(teams.map((t) => [t.id, t]))
  const homeTeam = teamsById[homeTeamId]
  const awayTeam = teamsById[awayTeamId]
  const sameTeamSelected = Boolean(homeTeamId && awayTeamId && homeTeamId === awayTeamId)

  const swapTeams = () => {
    setHomeTeamId(awayTeamId)
    setAwayTeamId(homeTeamId)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!homeTeam || !awayTeam) {
      setError('Chọn đầy đủ hai đội')
      return
    }
    if (homeTeamId === awayTeamId) {
      setError('Hai đội phải khác nhau')
      return
    }
    if (!matchTime) {
      setError('Chọn thời gian trận đấu')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit({
        homeTeam: homeTeam.name,
        awayTeam: awayTeam.name,
        homeTeamId,
        awayTeamId,
        matchTime: Timestamp.fromDate(new Date(matchTime)),
        stage,
        homeScore: null,
        awayScore: null,
        isFinished: false,
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lưu thất bại')
    } finally {
      setSubmitting(false)
    }
  }

  if (teamsLoading) {
    return (
      <div className="flex flex-col items-center gap-3 py-10">
        <Spinner />
        <p className="text-sm text-secondary">Đang tải danh sách đội...</p>
      </div>
    )
  }

  if (teams.length === 0) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-dashed border-secondary/30 bg-neutral/40 px-4 py-8 text-center">
          <p className="font-semibold text-primary">Chưa có đội bóng</p>
          <p className="mt-1 text-sm text-secondary">
            Thêm ít nhất hai đội trước khi tạo lịch thi đấu.
          </p>
          <Link
            to="/admin/teams"
            className="mt-4 inline-flex rounded-md bg-tertiary px-4 py-2 text-sm font-semibold text-on-primary hover:opacity-90"
          >
            Thêm đội bóng
          </Link>
        </div>
        <div className="flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <form id={FORM_ID} className="space-y-5" onSubmit={handleSubmit}>
      {isFinished && (
        <p className="rounded-md bg-blue-50 px-3 py-2 text-sm text-blue-800">
          Trận đã kết thúc — chỉ có thể xem thông tin, không thể chỉnh sửa.
        </p>
      )}

      <MatchPreview
        homeTeam={homeTeam}
        awayTeam={awayTeam}
        stage={stage}
        matchTime={matchTime}
      />

      <fieldset disabled={isDisabled} className="space-y-4">
        <legend className={`${labelClassName} mb-1`}>Cặp đấu</legend>

        <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
          <TeamSelect
            id="home-team-select"
            label="Đội nhà"
            teams={teams}
            value={homeTeamId}
            onChange={(teamId) => {
              setHomeTeamId(teamId)
              setError('')
            }}
            placeholder="Chọn đội nhà"
            excludeTeamId={awayTeamId}
            disabled={isDisabled}
            required
          />

          <div className="flex justify-center sm:pb-0.5">
            <button
              type="button"
              onClick={swapTeams}
              disabled={!homeTeamId || !awayTeamId}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-secondary/40 bg-surface text-secondary transition-colors hover:border-tertiary hover:text-primary focus:border-tertiary focus:outline-none focus:ring-2 focus:ring-tertiary/20 disabled:cursor-not-allowed disabled:opacity-40"
              title="Đổi đội nhà và khách"
              aria-label="Đổi đội nhà và khách"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M13.5 4.938a7 7 0 1 1-9.006 1.737c.202-.257.59-.218.793.039.39.39.39 1.023 0 1.414-.39.39-1.023.39-1.414 0A9 9 0 1 0 3.16 5.53l1.734 1.734a.75.75 0 0 0 1.28-.53V4.25a.75.75 0 0 0-.75-.75H2.5a.75.75 0 0 0-.53 1.28l1.53 1.53Zm-2.106 9.062a7 7 0 0 1-9.006-1.737.75.75 0 0 0-1.152-.082A9 9 0 1 0 15.84 14.47l-1.734-1.734a.75.75 0 0 0-1.28.53v1.566a.75.75 0 0 0 .75.75h2.915a.75.75 0 0 0 .53-1.28l-1.53-1.53Z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          <TeamSelect
            id="away-team-select"
            label="Đội khách"
            teams={teams}
            value={awayTeamId}
            onChange={(teamId) => {
              setAwayTeamId(teamId)
              setError('')
            }}
            placeholder="Chọn đội khách"
            excludeTeamId={homeTeamId}
            disabled={isDisabled}
            required
          />
        </div>

        {sameTeamSelected && (
          <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Hai đội phải khác nhau — hãy chọn đội khách khác hoặc dùng nút đổi cặp.
          </p>
        )}
      </fieldset>

      <fieldset disabled={isDisabled} className="space-y-4">
        <legend className={`${labelClassName} mb-1`}>Lịch & vòng đấu</legend>

        <Input
          label="Thời gian thi đấu"
          type="datetime-local"
          value={matchTime}
          onChange={(e) => setMatchTime(e.target.value)}
          required
        />

        <div className="flex flex-col gap-1.5">
          <label htmlFor="stage-select" className={labelClassName}>
            Vòng đấu
          </label>
          <select
            id="stage-select"
            value={stage}
            onChange={(e) =>
              setStage(/** @type {import('../../types/index.js').MatchStage} */ (e.target.value))
            }
            className={selectClassName}
          >
            <optgroup label="Vòng bảng">
              <option value="group">Vòng bảng</option>
            </optgroup>
            <optgroup label="Vòng knock-out">
              {KNOCKOUT_STAGES.map(({ key, label }) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </optgroup>
          </select>
        </div>
      </fieldset>

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
      </form>

      <div className="mt-5 flex justify-end gap-2 border-t border-secondary/20 pt-4">
        <Button variant="secondary" onClick={onClose} disabled={submitting}>
          Hủy
        </Button>
        <Button type="submit" form={FORM_ID} disabled={submitting || isFinished}>
          {submitting ? 'Đang lưu...' : match ? 'Cập nhật' : 'Thêm trận'}
        </Button>
      </div>
    </>
  )
}

/**
 * @param {{
 *   open: boolean
 *   match?: import('../../types/index.js').Match | null
 *   onClose: () => void
 *   onSubmit: (data: {
 *     homeTeam: string
 *     awayTeam: string
 *     homeTeamId: string
 *     awayTeamId: string
 *     matchTime: import('firebase/firestore').Timestamp
 *     stage: import('../../types/index.js').MatchStage
 *     homeScore: null
 *     awayScore: null
 *     isFinished: boolean
 *   }) => Promise<void>
 * }} props
 */
export function MatchFormModal({ open, match, onClose, onSubmit }) {
  const isEdit = Boolean(match)

  if (!open) return null

  return (
    <Modal
      open={open}
      title={isEdit ? 'Sửa trận đấu' : 'Thêm trận mới'}
      onClose={onClose}
      wide
    >
      <MatchFormFields
        key={match?.id ?? 'new'}
        match={match}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    </Modal>
  )
}
