import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', end: true },
  { to: '/admin/finance', label: 'Tài chính' },
  { to: '/admin/matches', label: 'Trận đấu' },
  { to: '/admin/predictions', label: 'Dự đoán' },
  { to: '/admin/teams', label: 'Đội bóng' },
  { to: '/admin/users', label: 'Thành viên' },
]

/**
 * @param {{ onLogout?: () => void, sidebarOpen?: boolean, onCloseSidebar?: () => void, loggingOut?: boolean }} props
 */
export function AdminSidebar({ onLogout, sidebarOpen, onCloseSidebar, loggingOut }) {
  return (
    <>
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Đóng menu"
          className="fixed inset-0 z-40 bg-primary/40 lg:hidden"
          onClick={onCloseSidebar}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-secondary/20 bg-surface transition-transform lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="border-b border-secondary/20 px-6 py-5">
          <p className="text-lg font-bold text-primary">Admin</p>
          <p className="text-xs text-secondary">Hội Khỏe Phú Đổng</p>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-4">
          {navItems.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onCloseSidebar}
              className={({ isActive }) =>
                `rounded-md px-3 py-2.5 text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-neutral text-primary'
                    : 'text-secondary hover:bg-neutral hover:text-primary'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-secondary/20 p-4">
          <button
            type="button"
            onClick={onLogout}
            disabled={loggingOut}
            className="w-full rounded-md px-3 py-2.5 text-left text-sm font-semibold text-secondary hover:bg-neutral hover:text-primary disabled:opacity-50"
          >
            {loggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
          </button>
        </div>
      </aside>
    </>
  )
}
