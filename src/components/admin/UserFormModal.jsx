import { useState } from 'react'
import { Button } from '../ui/Button.jsx'
import { Input } from '../ui/Input.jsx'
import { Modal } from './Modal.jsx'
import { UserAvatar } from '../shared/UserAvatar.jsx'
import { isValidAvatarUrl } from '../../utils/userAvatar.js'

/**
 * @param {{
 *   user?: import('../../types/index.js').User | null
 *   onClose: () => void
 *   onSubmit: (data: { name: string, avatarUrl: string | null }) => Promise<void>
 * }} props
 */
function UserFormFields({ user, onClose, onSubmit }) {
  const [name, setName] = useState(user?.name ?? '')
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const previewUser = {
    id: user?.id ?? 'preview',
    name: name.trim() || 'Tên thành viên',
    avatarUrl: avatarUrl.trim() || null,
    totalPoints: 0,
    totalPenalty: 0,
    paidAmount: 0,
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Nhập tên thành viên')
      return
    }

    if (!isValidAvatarUrl(avatarUrl)) {
      setError('URL avatar phải bắt đầu bằng http:// hoặc https://')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit({
        name: name.trim(),
        avatarUrl: avatarUrl.trim() || null,
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
          label="Tên thành viên"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={submitting}
        />
        <Input
          label="URL avatar (tùy chọn)"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          placeholder="https://..."
          disabled={submitting}
        />
        <div className="flex items-center gap-3 rounded-md border border-secondary/20 bg-neutral/50 px-3 py-2">
          <span className="text-xs text-secondary">Xem trước:</span>
          <UserAvatar user={previewUser} size="md" />
          <span className="text-sm font-medium text-primary">{previewUser.name}</span>
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
 *   user?: import('../../types/index.js').User | null
 *   onClose: () => void
 *   onSubmit: (data: { name: string, avatarUrl: string | null }) => Promise<void>
 * }} props
 */
export function UserFormModal({ open, user, onClose, onSubmit }) {
  const isEdit = Boolean(user)

  if (!open) return null

  return (
    <Modal
      open={open}
      title={isEdit ? 'Sửa thành viên' : 'Thêm thành viên'}
      onClose={onClose}
    >
      <UserFormFields
        key={user?.id ?? 'new'}
        user={user}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    </Modal>
  )
}
