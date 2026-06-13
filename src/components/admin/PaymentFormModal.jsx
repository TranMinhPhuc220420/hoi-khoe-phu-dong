import { useState } from 'react'
import { Button } from '../ui/Button.jsx'
import { Input } from '../ui/Input.jsx'
import { Modal } from './Modal.jsx'
import { formatCurrency } from '../../utils/format.js'
import {
  formatMemberFinanceOption,
  getMemberCredit,
  getMemberDebt,
} from '../../utils/finance.js'

/**
 * @param {{
 *   users: import('../../types/index.js').User[]
 *   preselectedUser?: import('../../types/index.js').User | null
 *   onClose: () => void
 *   onSubmit: (userId: string, amount: number, note: string) => Promise<void>
 * }} props
 */
function PaymentFormFields({ users, preselectedUser, onClose, onSubmit }) {
  const [userId, setUserId] = useState(preselectedUser?.id ?? users[0]?.id ?? '')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [step, setStep] = useState(/** @type {'form' | 'confirm_overpay'} */ ('form'))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const selectedUser = users.find((u) => u.id === userId)
  const debt = selectedUser ? getMemberDebt(selectedUser) : 0
  const credit = selectedUser ? getMemberCredit(selectedUser) : 0
  const amountNum = Number(amount)
  const overpayAmount = amountNum > debt ? amountNum - debt : 0
  const overpayWarning =
    step === 'form' && selectedUser && amountNum > 0 && amountNum > debt
      ? `Số tiền vượt nợ hiện tại (${formatCurrency(debt)}). Bạn sẽ cần xác nhận trước khi ghi nhận.`
      : ''

  const validateForm = () => {
    if (!userId) {
      setError('Chọn thành viên')
      return false
    }
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      setError('Số tiền phải lớn hơn 0')
      return false
    }
    setError('')
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    if (amountNum > debt) {
      setStep('confirm_overpay')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit(userId, amountNum, note)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ghi nhận thất bại')
    } finally {
      setSubmitting(false)
    }
  }

  const handleConfirmOverpay = async () => {
    setSubmitting(true)
    setError('')
    try {
      await onSubmit(userId, amountNum, note)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ghi nhận thất bại')
    } finally {
      setSubmitting(false)
    }
  }

  if (step === 'confirm_overpay' && selectedUser) {
    return (
      <>
        <div className="space-y-4">
          <p className="text-sm text-secondary">
            Thành viên <span className="font-semibold text-primary">{selectedUser.name}</span> sẽ
            được ghi nhận thanh toán vượt nợ hiện tại.
          </p>

          <dl className="space-y-2 rounded-lg border border-secondary/20 bg-neutral p-4 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-secondary">Nợ hiện tại</dt>
              <dd className="font-semibold text-primary">{formatCurrency(debt)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-secondary">Số tiền ghi nhận</dt>
              <dd className="font-semibold text-primary">{formatCurrency(amountNum)}</dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-secondary/20 pt-2">
              <dt className="font-semibold text-primary">Phần dư trả trước</dt>
              <dd className="font-semibold text-green-700">{formatCurrency(overpayAmount)}</dd>
            </div>
          </dl>

          <p className="text-sm text-secondary">
            Số dư sẽ tự trừ khi thành viên bị phạt thêm.
          </p>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setStep('form')} disabled={submitting}>
            Quay lại
          </Button>
          <Button onClick={handleConfirmOverpay} disabled={submitting}>
            {submitting ? 'Đang lưu...' : 'Xác nhận ghi nhận'}
          </Button>
        </div>
      </>
    )
  }

  return (
    <>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-1.5">
          <label className="text-[0.72rem] font-semibold uppercase tracking-wide text-secondary">
            Thành viên
          </label>
          <select
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            disabled={submitting || Boolean(preselectedUser)}
            className="rounded-md border border-secondary/40 bg-surface px-3 py-2.5 text-primary focus:border-tertiary focus:outline-none focus:ring-2 focus:ring-tertiary/20 disabled:opacity-50"
          >
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {formatMemberFinanceOption(user)}
              </option>
            ))}
          </select>
        </div>

        {selectedUser && (
          <div className="text-sm text-secondary">
            {debt > 0 && (
              <p>
                Nợ hiện tại:{' '}
                <span className="font-semibold text-primary">{formatCurrency(debt)}</span>
              </p>
            )}
            {credit > 0 && (
              <p>
                Dư trả trước:{' '}
                <span className="font-semibold text-green-700">{formatCurrency(credit)}</span>
              </p>
            )}
            {debt === 0 && credit === 0 && (
              <p>
                Nợ hiện tại:{' '}
                <span className="font-semibold text-primary">{formatCurrency(0)}</span>
              </p>
            )}
          </div>
        )}

        <Input
          label="Số tiền (VND)"
          type="number"
          min={1}
          step={1000}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          disabled={submitting}
        />

        <Input
          label="Ghi chú"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="VD: CK Vietcombank 13/06"
          disabled={submitting}
        />

        {overpayWarning && (
          <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">{overpayWarning}</p>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose} disabled={submitting}>
          Hủy
        </Button>
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Đang lưu...' : 'Ghi nhận thanh toán'}
        </Button>
      </div>
    </>
  )
}

/**
 * @param {{
 *   open: boolean
 *   users: import('../../types/index.js').User[]
 *   preselectedUser?: import('../../types/index.js').User | null
 *   onClose: () => void
 *   onSubmit: (userId: string, amount: number, note: string) => Promise<void>
 * }} props
 */
export function PaymentFormModal({ open, users, preselectedUser, onClose, onSubmit }) {
  if (!open) return null

  return (
    <Modal open={open} title="Ghi nhận thanh toán" onClose={onClose}>
      <PaymentFormFields
        key={preselectedUser?.id ?? 'new'}
        users={users}
        preselectedUser={preselectedUser}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    </Modal>
  )
}
