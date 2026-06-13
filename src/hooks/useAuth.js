import { useAuthStore } from '../stores/auth.store.js'

export function useAuth() {
  const user = useAuthStore((state) => state.user)
  const loading = useAuthStore((state) => state.loading)
  const setUser = useAuthStore((state) => state.setUser)
  const setLoading = useAuthStore((state) => state.setLoading)

  return { user, loading, setUser, setLoading, isAuthenticated: Boolean(user) }
}
