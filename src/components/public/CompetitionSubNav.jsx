import { NavLink } from 'react-router-dom'

const items = [
  { to: '/matches', label: 'Lịch thi đấu', end: false },
  { to: '/leaderboard', label: 'Bảng xếp hạng', end: true },
]

export function CompetitionSubNav() {
  return (
    <nav className="flex gap-1 rounded-lg border border-secondary/20 bg-surface p-1">
      {items.map(({ to, label, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex-1 rounded-md px-4 py-2 text-center text-sm font-semibold transition-colors sm:flex-none ${
              isActive
                ? 'bg-primary text-on-primary'
                : 'text-secondary hover:bg-neutral hover:text-primary'
            }`
          }
        >
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
