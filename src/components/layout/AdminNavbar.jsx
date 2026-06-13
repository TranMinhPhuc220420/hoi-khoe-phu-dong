/**
 * @param {{ title: string, userEmail?: string, onMenuClick?: () => void }} props
 */
export function AdminNavbar({ title, userEmail, onMenuClick }) {
  return (
    <header className="flex items-center justify-between border-b border-secondary/20 bg-surface px-4 py-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Mở menu"
          className="rounded-md p-2 text-primary hover:bg-neutral lg:hidden"
          onClick={onMenuClick}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-primary">{title}</h1>
      </div>
      {userEmail ? (
        <span className="max-w-[200px] truncate text-sm text-secondary">{userEmail}</span>
      ) : (
        <span className="text-sm text-secondary">Admin</span>
      )}
    </header>
  )
}
