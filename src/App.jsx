import { Routes, Route, Navigate } from 'react-router-dom'
import { ErrorBoundary } from './components/shared/ErrorBoundary.jsx'
import { ProtectedRoute } from './components/shared/ProtectedRoute.jsx'
import { PublicLayout } from './components/layout/PublicLayout.jsx'
import { AdminLayout } from './components/layout/AdminLayout.jsx'
import { DashboardPage } from './pages/public/DashboardPage.jsx'
import { MatchesPage } from './pages/public/MatchesPage.jsx'
import { LeaderboardPage } from './pages/public/LeaderboardPage.jsx'
import { AdminLoginPage } from './pages/admin/AdminLoginPage.jsx'
import { AdminDashboard } from './pages/admin/AdminDashboard.jsx'
import { AdminMatches } from './pages/admin/AdminMatches.jsx'
import { AdminPredictions } from './pages/admin/AdminPredictions.jsx'
import { AdminFinance } from './pages/admin/AdminFinance.jsx'
import { AdminTeams } from './pages/admin/AdminTeams.jsx'
import { AdminUsers } from './pages/admin/AdminUsers.jsx'

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="matches" element={<MatchesPage />} />
          <Route path="leaderboard" element={<LeaderboardPage />} />
          <Route path="penalty" element={<Navigate to="/" replace />} />
        </Route>

        <Route path="admin/login" element={<AdminLoginPage />} />

        <Route
          path="admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="matches" element={<AdminMatches />} />
          <Route path="teams" element={<AdminTeams />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="predictions" element={<AdminPredictions />} />
          <Route path="finance" element={<AdminFinance />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  )
}
