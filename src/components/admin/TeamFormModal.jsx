import { useState } from 'react'
import { Button } from '../ui/Button.jsx'
import { Input } from '../ui/Input.jsx'
import { Modal } from './Modal.jsx'
import { TeamBadge, GROUP_OPTIONS } from '../shared/TeamBadge.jsx'

/**
 * @param {{
 *   team?: import('../../types/index.js').Team | null
 *   onClose: () => void
 *   onSubmit: (data: {
 *     name: string
 *     group: string | null
 *     countryCode: string | null
 *     logoUrl: string | null
 *   }) => Promise<void>
 * }} props
 */
function TeamFormFields({ team, onClose, onSubmit }) {
  const [name, setName] = useState(team?.name ?? '')
  const [group, setGroup] = useState(team?.group ?? '')
  const [countryCode, setCountryCode] = useState(team?.countryCode ?? '')
  const [logoUrl, setLogoUrl] = useState(team?.logoUrl ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const previewTeam = {
    id: team?.id ?? 'preview',
    name: name.trim() || 'Tên đội',
    group: group || null,
    countryCode: countryCode.trim().toLowerCase() || null,
    logoUrl: logoUrl.trim() || null,
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Nhập tên đội')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit({
        name: name.trim(),
        group: group || null,
        countryCode: countryCode.trim().toLowerCase() || null,
        logoUrl: logoUrl.trim() || null,
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lưu thất bại')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input
          label="Tên đội"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={submitting}
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-[0.72rem] font-semibold uppercase tracking-wide text-secondary">
            Bảng đấu
          </label>
          <select
            value={group}
            onChange={(e) => setGroup(e.target.value)}
            disabled={submitting}
            className="rounded-md border border-secondary/40 bg-surface px-3 py-2.5 text-primary focus:border-tertiary focus:outline-none focus:ring-2 focus:ring-tertiary/20 disabled:opacity-50"
          >
            <option value="">Không có</option>
            {GROUP_OPTIONS.map((g) => (
              <option key={g} value={g}>
                Bảng {g}
              </option>
            ))}
          </select>
        </div>
        <Input
          label="Mã quốc gia (ISO alpha-2)"
          value={countryCode}
          onChange={(e) => setCountryCode(e.target.value)}
          placeholder="vd. br, mx, gb-eng"
          disabled={submitting}
        />
        <Input
          label="URL logo (tùy chọn)"
          value={logoUrl}
          onChange={(e) => setLogoUrl(e.target.value)}
          placeholder="https://..."
          disabled={submitting}
        />
        <div className="flex items-center gap-3 rounded-md border border-secondary/20 bg-neutral/50 px-3 py-2">
          <span className="text-xs text-secondary">Xem trước:</span>
          <TeamBadge team={previewTeam} />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose} disabled={submitting}>
          Hủy
        </Button>
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Đang lưu...' : 'Lưu'}
        </Button>
      </div>
    </>
  )
}

/**
 * @param {{
 *   open: boolean
 *   team?: import('../../types/index.js').Team | null
 *   onClose: () => void
 *   onSubmit: (data: {
 *     name: string
 *     group: string | null
 *     countryCode: string | null
 *     logoUrl: string | null
 *   }) => Promise<void>
 * }} props
 */
export function TeamFormModal({ open, team, onClose, onSubmit }) {
  const isEdit = Boolean(team)

  if (!open) return null

  return (
    <Modal
      open={open}
      title={isEdit ? 'Sửa đội bóng' : 'Thêm đội bóng'}
      onClose={onClose}
    >
      <TeamFormFields
        key={team?.id ?? 'new'}
        team={team}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    </Modal>
  )
}
