import { useMemo, useState } from 'react'
import { getMemberBalance } from '../../utils/finance.js'
import { MemberFinanceCard } from './MemberFinanceCard.jsx'
import { MemberPenaltyTable } from './PenaltySection.jsx'

/** @typedef {'debt-desc' | 'name-asc'} SortMode */

/**
 * @param {{
 *   users: import('../../types/index.js').User[]
 *   onViewDetails?: (user: import('../../types/index.js').User) => void
 * }} props
 */
export function MemberFinanceGrid({ users, onViewDetails }) {
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState(/** @type {SortMode} */ ('debt-desc'))
  const [viewMode, setViewMode] = useState(/** @type {'cards' | 'table'} */ ('cards'))

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    let rows = [...users]

    if (query) {
      rows = rows.filter((u) => u.name.toLowerCase().includes(query))
    }

    if (sort === 'debt-desc') {
      rows.sort((a, b) => getMemberBalance(b) - getMemberBalance(a))
    } else {
      rows.sort((a, b) => a.name.localeCompare(b.name, 'vi'))
    }

    return rows
  }, [users, search, sort])

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          placeholder="Tìm tên thành viên..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-md border border-secondary/30 bg-surface px-3 py-2 text-sm text-primary placeholder:text-secondary/70 focus:border-primary focus:outline-none sm:max-w-xs"
        />
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={sort}
            onChange={(e) => setSort(/** @type {SortMode} */ (e.target.value))}
            className="rounded-md border border-secondary/30 bg-surface px-3 py-2 text-sm text-primary focus:border-primary focus:outline-none"
          >
            <option value="debt-desc">Nợ cao → thấp</option>
            <option value="name-asc">Tên A → Z</option>
          </select>
          <div className="flex rounded-md border border-secondary/20 p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`rounded px-3 py-1.5 text-xs font-semibold ${
                viewMode === 'cards'
                  ? 'bg-primary text-on-primary'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              Thẻ
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`rounded px-3 py-1.5 text-xs font-semibold ${
                viewMode === 'table'
                  ? 'bg-primary text-on-primary'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              Bảng
            </button>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-secondary">Không tìm thấy thành viên phù hợp.</p>
      ) : viewMode === 'cards' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((user) => (
            <MemberFinanceCard key={user.id} user={user} onViewDetails={onViewDetails} />
          ))}
        </div>
      ) : (
        <MemberPenaltyTable
          users={filtered}
          showProgress
          onViewDetails={onViewDetails}
        />
      )}
    </div>
  )
}
