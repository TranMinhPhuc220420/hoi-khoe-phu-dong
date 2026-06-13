import { Link } from 'react-router-dom'
import { Table, TableHead, TableBody, TableHeaderCell, TableCell } from '../ui/Table.jsx'

const MEDALS = ['🥇', '🥈', '🥉']

/**
 * @param {{
 *   users: import('../../types/index.js').User[]
 *   limit?: number
 *   compact?: boolean
 *   showLink?: boolean
 * }} props
 */
export function LeaderboardTable({ users, limit, compact = false, showLink = false }) {
  const rows = limit ? users.slice(0, limit) : users

  if (!rows.length) {
    return <p className="text-sm text-secondary">Chưa có dữ liệu xếp hạng.</p>
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden sm:block">
        <Table>
          <TableHead>
            <tr>
              <TableHeaderCell>Hạng</TableHeaderCell>
              <TableHeaderCell>Thành viên</TableHeaderCell>
              <TableHeaderCell>Điểm</TableHeaderCell>
            </tr>
          </TableHead>
          <TableBody>
            {rows.map((user, index) => (
              <tr
                key={user.id}
                className={index === 0 && !compact ? 'bg-amber-50/60' : undefined}
              >
                <TableCell className="font-semibold">
                  {index < 3 ? MEDALS[index] : index + 1}
                </TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell className="font-bold">{user.totalPoints}</TableCell>
              </tr>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-2 sm:hidden">
        {rows.map((user, index) => (
          <div
            key={user.id}
            className={`flex items-center justify-between rounded-lg border border-secondary/20 bg-surface px-4 py-3 ${
              index === 0 && !compact ? 'bg-amber-50/60' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="w-6 text-center font-semibold">
                {index < 3 ? MEDALS[index] : index + 1}
              </span>
              <span className="font-medium text-primary">{user.name}</span>
            </div>
            <span className="font-bold text-primary">{user.totalPoints}</span>
          </div>
        ))}
      </div>

      {showLink && (
        <Link to="/leaderboard" className="mt-3 inline-block text-sm font-semibold text-tertiary hover:underline">
          Xem bảng xếp hạng →
        </Link>
      )}
    </>
  )
}
