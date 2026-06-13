import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { signOut } from '../../services/auth.service.js'
import { useAuth } from '../../hooks/useAuth.js'
import { ToastProvider } from '../admin/ToastProvider.jsx'
import { AdminSidebar } from './AdminSidebar.jsx'
import { AdminNavbar } from './AdminNavbar.jsx'

const pageTitles = {
  '/admin/dashboard': 'Dashboard',
  '/admin/matches': 'Quản lý trận đấu',
  '/admin/teams': 'Quản lý đội bóng',
  '/admin/users': 'Quản lý thành viên',
  '/admin/predictions': 'Quản lý dự đoán',
  '/admin/finance': 'Tài chính',
}

export function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const title = pageTitles[location.pathname] ?? 'Admin'

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await signOut()
      navigate('/admin/login', { replace: true })
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <ToastProvider>
      <div className="flex min-h-svh bg-neutral">
        <AdminSidebar
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          onLogout={handleLogout}
          loggingOut={loggingOut}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <AdminNavbar
            title={title}
            userEmail={user?.email ?? ''}
            onMenuClick={() => setSidebarOpen(true)}
          />
          <main className="flex-1 p-4 lg:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </ToastProvider>
  )
}
