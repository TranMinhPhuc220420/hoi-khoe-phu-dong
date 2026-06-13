import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Trang chủ', end: true },
  { to: '/matches', label: 'Thi đấu', end: false, matchPaths: ['/matches', '/leaderboard'] },
]

function isNavItemActive(pathname, item) {
  if (item.matchPaths) {
    return item.matchPaths.some((p) => pathname === p || pathname.startsWith(`${p}/`))
  }
  if (item.end) {
    return pathname === item.to
  }
  return pathname === item.to || pathname.startsWith(`${item.to}/`)
}

export function PublicLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()

  return (
    <div className="min-h-svh bg-neutral">
      <header className="border-b border-secondary/20 bg-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <NavLink to="/" className="text-xl font-bold text-primary" onClick={() => setMenuOpen(false)}>
            Hội Khỏe Phú Đổng
          </NavLink>

          <button
            type="button"
            aria-label="Mở menu"
            className="rounded-md p-2 text-primary hover:bg-neutral sm:hidden"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          <nav className="hidden flex-wrap gap-1 sm:flex">
            {navItems.map((item) => {
              const active = isNavItemActive(pathname, item)
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={`rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
                    active
                      ? 'bg-primary text-on-primary'
                      : 'text-secondary hover:bg-neutral hover:text-primary'
                  }`}
                >
                  {item.label}
                </NavLink>
              )
            })}
          </nav>
        </div>

        {menuOpen && (
          <>
            <button
              type="button"
              aria-label="Đóng menu"
              className="fixed inset-0 z-40 bg-primary/30 sm:hidden"
              onClick={() => setMenuOpen(false)}
            />
            <nav className="relative z-50 border-t border-secondary/20 bg-surface px-4 py-3 sm:hidden">
              <div className="flex flex-col gap-1">
                {navItems.map((item) => {
                  const active = isNavItemActive(pathname, item)
                  return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => setMenuOpen(false)}
                    className={`rounded-md px-3 py-2.5 text-sm font-semibold ${
                      active ? 'bg-primary text-on-primary' : 'text-secondary hover:bg-neutral'
                    }`}
                  >
                    {item.label}
                  </NavLink>
                  )
                })}
              </div>
            </nav>
          </>
        )}
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>

      <footer className="border-t border-secondary/20 py-6 text-center text-sm text-secondary">
        Hội Khỏe Phú Đổng - Dự án chỉ mang tính chất tham khảo và không có tính chính thức
      </footer>
    </div>
  )
}
