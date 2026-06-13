import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button } from '../../components/ui/Button.jsx'
import { Card } from '../../components/ui/Card.jsx'
import { PageLoading, PageError } from '../../components/public/PageStatus.jsx'
import { TeamFormModal } from '../../components/admin/TeamFormModal.jsx'
import { ConfirmDialog } from '../../components/admin/ConfirmDialog.jsx'
import { TeamBadge, GROUP_OPTIONS } from '../../components/shared/TeamBadge.jsx'
import { useToast } from '../../hooks/useToast.js'
import * as teamsService from '../../services/teams.service.js'
import { useDataStore } from '../../stores/data.store.js'

/**
 * @param {import('../../types/index.js').Team[]} teams
 */
function groupTeamsByGroup(teams) {
  /** @type {Record<string, import('../../types/index.js').Team[]>} */
  const byGroup = {}
  /** @type {import('../../types/index.js').Team[]} */
  const ungrouped = []

  for (const team of teams) {
    if (team.group) {
      if (!byGroup[team.group]) byGroup[team.group] = []
      byGroup[team.group].push(team)
    } else {
      ungrouped.push(team)
    }
  }

  for (const group of Object.keys(byGroup)) {
    byGroup[group].sort((a, b) => a.name.localeCompare(b.name))
  }
  ungrouped.sort((a, b) => a.name.localeCompare(b.name))

  return { byGroup, ungrouped }
}

/**
 * @param {{
 *   team: import('../../types/index.js').Team
 *   onEdit: (team: import('../../types/index.js').Team) => void
 *   onDelete: (team: import('../../types/index.js').Team) => void
 * }} props
 */
function TeamRow({ team, onEdit, onDelete }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-md border border-secondary/15 bg-neutral/30 px-3 py-2.5">
      <div className="min-w-0 flex-1">
        <TeamBadge team={team} className="font-medium text-primary" />
        {team.countryCode && (
          <p className="mt-0.5 text-xs text-secondary">{team.countryCode}</p>
        )}
      </div>
      <div className="flex shrink-0 gap-1">
        <Button variant="secondary" size="sm" onClick={() => onEdit(team)}>
          Sửa
        </Button>
        <Button variant="danger" size="sm" onClick={() => onDelete(team)}>
          Xóa
        </Button>
      </div>
    </div>
  )
}

/**
 * @param {{
 *   title: string
 *   teams: import('../../types/index.js').Team[]
 *   onEdit: (team: import('../../types/index.js').Team) => void
 *   onDelete: (team: import('../../types/index.js').Team) => void
 * }} props
 */
function GroupCard({ title, teams, onEdit, onDelete }) {
  return (
    <Card
      title={title}
      description={`${teams.length} đội`}
      className="h-full border border-secondary/15"
    >
      <div className="space-y-2">
        {teams.map((team) => (
          <TeamRow key={team.id} team={team} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </div>
    </Card>
  )
}

export function AdminTeams() {
  const toast = useToast()
  const [teams, setTeams] = useState(/** @type {import('../../types/index.js').Team[]} */ ([]))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [formOpen, setFormOpen] = useState(false)
  const [editTeam, setEditTeam] = useState(/** @type {import('../../types/index.js').Team | null} */ (null))
  const [deleteTeam, setDeleteTeam] = useState(/** @type {import('../../types/index.js').Team | null} */ (null))
  const [deleting, setDeleting] = useState(false)

  const refresh = useCallback(() => {
    setLoading(true)
    setError('')
    return teamsService
      .getAll()
      .then((data) => {
        setTeams(data)
        useDataStore.getState().fetchTeams(true)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Không thể tải đội bóng')
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    let cancelled = false

    teamsService
      .getAll()
      .then((data) => {
        if (cancelled) return
        setTeams(data)
        useDataStore.getState().fetchTeams(true)
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Không thể tải đội bóng')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const { byGroup, ungrouped } = useMemo(() => groupTeamsByGroup(teams), [teams])

  const filledGroupCount = GROUP_OPTIONS.filter((g) => (byGroup[g]?.length ?? 0) > 0).length

  const openCreate = () => {
    setEditTeam(null)
    setFormOpen(true)
  }

  const openEdit = (team) => {
    setEditTeam(team)
    setFormOpen(true)
  }

  const handleSave = async (data) => {
    if (editTeam) {
      await teamsService.update(editTeam.id, data)
      toast.success('Đã cập nhật đội bóng')
      useDataStore.getState().fetchMatches(true)
    } else {
      await teamsService.create(data)
      toast.success('Đã thêm đội mới')
    }
    await refresh()
  }

  const handleDelete = async () => {
    if (!deleteTeam) return
    setDeleting(true)
    try {
      await teamsService.remove(deleteTeam.id)
      toast.success('Đã xóa đội bóng')
      setDeleteTeam(null)
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
          <p className="text-3xl font-bold text-primary">{teams.length}</p>
          <div>
            <p className="font-semibold text-primary">Tổng số đội</p>
            <p className="text-sm text-secondary">
              {filledGroupCount > 0
                ? `${filledGroupCount} bảng đấu`
                : 'Chưa phân bảng'}
              {ungrouped.length > 0 ? ` · ${ungrouped.length} đội chưa phân bảng` : ''}
            </p>
          </div>
        </div>
        <Button onClick={openCreate}>Thêm đội mới</Button>
      </div>

      {teams.length === 0 ? (
        <Card className="border border-dashed border-secondary/30">
          <p className="text-sm text-secondary">
            Chưa có đội bóng. Thêm đội để chọn trong form trận đấu.
          </p>
        </Card>
      ) : (
        <>
          {filledGroupCount > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {GROUP_OPTIONS.map((group) => {
                const groupTeams = byGroup[group]
                if (!groupTeams?.length) return null
                return (
                  <GroupCard
                    key={group}
                    title={`Bảng ${group}`}
                    teams={groupTeams}
                    onEdit={openEdit}
                    onDelete={setDeleteTeam}
                  />
                )
              })}
            </div>
          )}

          {ungrouped.length > 0 && (
            <div className={filledGroupCount > 0 ? 'pt-2' : ''}>
              <GroupCard
                title="Chưa phân bảng"
                teams={ungrouped}
                onEdit={openEdit}
                onDelete={setDeleteTeam}
              />
            </div>
          )}
        </>
      )}

      <TeamFormModal
        open={formOpen}
        team={editTeam}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSave}
      />

      <ConfirmDialog
        open={Boolean(deleteTeam)}
        title="Xóa đội bóng"
        message={`Xóa đội ${deleteTeam?.name}? Hành động không thể hoàn tác.`}
        confirmLabel="Xóa"
        variant="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTeam(null)}
      />
    </div>
  )
}
