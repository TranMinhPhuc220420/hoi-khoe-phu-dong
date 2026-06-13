import { Button } from '../ui/Button.jsx'
import { Modal } from './Modal.jsx'

/**
 * @param {{
 *   open: boolean
 *   title: string
 *   message: string
 *   confirmLabel?: string
 *   cancelLabel?: string
 *   variant?: 'primary' | 'danger'
 *   loading?: boolean
 *   onConfirm: () => void
 *   onCancel: () => void
 * }} props
 */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Hủy',
  variant = 'primary',
  loading = false,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onCancel}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm text-secondary">{message}</p>
    </Modal>
  )
}
