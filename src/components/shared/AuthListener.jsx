import { useEffect } from 'react'
import { subscribeToAuth } from '../../services/auth.service.js'
import { useAuthStore } from '../../stores/auth.store.js'

/**
 * @param {{ children: import('react').ReactNode }} props
 */
export function AuthListener({ children }) {
  const setUser = useAuthStore((state) => state.setUser)
  const setLoading = useAuthStore((state) => state.setLoading)

  useEffect(() => {
    setLoading(true)
    const unsubscribe = subscribeToAuth((user) => {
      setUser(user)
      setLoading(false)
    })
    return unsubscribe
  }, [setUser, setLoading])

  return children
}
