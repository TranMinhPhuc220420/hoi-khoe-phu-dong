import { useCallback, useEffect, useState } from 'react'
import { Button } from '../../components/ui/Button.jsx'
import { Card } from '../../components/ui/Card.jsx'
import { PageLoading, PageError } from '../../components/public/PageStatus.jsx'
import { UserFormModal } from '../../components/admin/UserFormModal.jsx'
import { ConfirmDialog } from '../../components/admin/ConfirmDialog.jsx'
import { Table, TableHead, TableBody, TableHeaderCell, TableCell } from '../../components/ui/Table.jsx'
import { useToast } from '../../hooks/useToast.js'
import { formatCurrency } from '../../utils/format.js'
import * as usersService from '../../services/users.service.js'
import { UserAvatar } from '../../components/shared/UserAvatar.jsx'
import { useDataStore } from '../../stores/data.store.js'

export function AdminUsers() {
  const toast = useToast()
  const [users, setUsers] = useState(/** @type {import('../../types/index.js').User[]} */ ([]))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [movingId, setMovingId] = useState(/** @type {string | null} */ (null))

  const [formOpen, setFormOpen] = useState(false)
  const [editUser, setEditUser] = useState(/** @type {import('../../types/index.js').User | null} */ (null))
  const [deleteUser, setDeleteUser] = useState(/** @type {import('../../types/index.js').User | null} */ (null))
  const [deleting, setDeleting] = useState(false)

  const invalidateCache = () => {
    useDataStore.getState().fetchUsers(true)
  }

  const refresh = useCallback(() => {
    setLoading(true)
    setError('')
    return usersService
      .getAll()
      .then((data) => {
        setUsers(data)
        invalidateCache()
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Không thể tải thành viên')
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    let cancelled = false

    usersService
      .getAll()
      .then((data) => {
        if (cancelled) return
        setUsers(data)
        invalidateCache()
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Không thể tải thành viên')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const openCreate = () => {
    setEditUser(null)
    setFormOpen(true)
  }

  const openEdit = (user) => {
    setEditUser(user)
    setFormOpen(true)
  }

  const handleSave = async (data) => {
    if (editUser) {
      await usersService.update(editUser.id, data)
      toast.success('Đã cập nhật thành viên')
    } else {
      await usersService.create(data)
      toast.success('Đã thêm thành viên mới')
    }
    await refresh()
  }

  const handleMove = async (user, direction) => {
    setMovingId(user.id)
    try {
      await usersService.move(user.id, direction)
      await refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể đổi thứ tự')
    } finally {
      setMovingId(null)
    }
  }

  const handleDelete = async () => {
    if (!deleteUser) return
    setDeleting(true)
    try {
      await usersService.remove(deleteUser.id)
      toast.success('Đã xóa thành viên')
      setDeleteUser(null)
      await refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Xóa thất bại')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <PageLoading />
  if (error) return <PageError message={error} onRetry={refresh} />

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <p className="text-3xl font-bold text-primary">{users.length}</p>
          <div>
            <p className="font-semibold text-primary">Tổng số thành viên</p>
            <p className="text-sm text-secondary">Sắp xếp thứ tự hiển thị trên toàn hệ thống</p>
          </div>
        </div>
        <Button onClick={openCreate}>Thêm thành viên</Button>
      </div>

      {users.length === 0 ? (
        <Card className="border border-dashed border-secondary/30">
          <p className="text-sm text-secondary">
            Chưa có thành viên. Thêm thành viên để bắt đầu nhập dự đoán.
          </p>
        </Card>
      ) : (
        <Table>
          <TableHead>
            <tr>
              <TableHeaderCell>#</TableHeaderCell>
              <TableHeaderCell>Tên</TableHeaderCell>
              <TableHeaderCell>Điểm</TableHeaderCell>
              <TableHeaderCell>Phạt</TableHeaderCell>
              <TableHeaderCell>Đã trả</TableHeaderCell>
              <TableHeaderCell>Thứ tự</TableHeaderCell>
              <TableHeaderCell>Thao tác</TableHeaderCell>
            </tr>
          </TableHead>
          <TableBody>
            {users.map((user, index) => {
              const isMoving = movingId === user.id
              const isFirst = index === 0
              const isLast = index === users.length - 1

              return (
                <tr key={user.id}>
                  <TableCell className="text-secondary">{index + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 font-medium text-primary">
                      <UserAvatar user={user} size="sm" />
                      <span>{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.totalPoints}</TableCell>
                  <TableCell>{formatCurrency(user.totalPenalty)}</TableCell>
                  <TableCell>{formatCurrency(user.paidAmount)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={isFirst || isMoving}
                        onClick={() => handleMove(user, 'up')}
                        aria-label={`Đưa ${user.name} lên`}
                      >
                        ↑
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={isLast || isMoving}
                        onClick={() => handleMove(user, 'down')}
                        aria-label={`Đưa ${user.name} xuống`}
                      >
                        ↓
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="secondary" size="sm" onClick={() => openEdit(user)}>
                        Sửa
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => setDeleteUser(user)}>
                        Xóa
                      </Button>
                    </div>
                  </TableCell>
                </tr>
              )
            })}
          </TableBody>
        </Table>
      )}

      <UserFormModal
        open={formOpen}
        user={editUser}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSave}
      />

      <ConfirmDialog
        open={Boolean(deleteUser)}
        title="Xóa thành viên"
        message={`Xóa ${deleteUser?.name}? Không thể hoàn tác nếu thành viên chưa có dự đoán hoặc giao dịch.`}
        confirmLabel="Xóa"
        variant="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteUser(null)}
      />
    </div>
  )
}
