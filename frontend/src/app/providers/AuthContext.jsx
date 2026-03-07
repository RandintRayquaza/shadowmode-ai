import { createContext, useContext } from 'react'
import { useAuthStore } from '@/features/auth/state/useAuthStore'
import { useAuthActions } from '@/features/auth/hooks/useAuthActions'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const { user, loading } = useAuthStore()
  const { login, signup, loginWithGoogle, verifyOtp, logout } = useAuthActions()

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, loginWithGoogle, verifyOtp }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
