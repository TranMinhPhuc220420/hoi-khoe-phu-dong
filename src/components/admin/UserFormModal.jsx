import { useState } from 'react'
import { Button } from '../ui/Button.jsx'
import { Input } from '../ui/Input.jsx'
import { Modal } from './Modal.jsx'

/**
 * @param {{
 *   user?: import('../../types/index.js').User | null
 *   onClose: () => void
 *   onSubmit: (data: { name: string }) => Promise<void>
 * }} props
 */
function UserFormFields({ user, onClose, onSubmit }) {
  const [name, setName] = useState(user?.name ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Nhập tên thành viên')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit({ name: name.trim() })
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
 *   onSubmit: (data: { name: string }) => Promise<void>
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
