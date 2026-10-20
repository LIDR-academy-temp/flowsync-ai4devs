import { createContext, useContext } from 'react'
import type { LoginPayload, SignupPayload } from '@/lib/api'

export type AuthContextValue = {
  token: string | null
  login: (payload: LoginPayload) => Promise<void>
  signup: (payload: SignupPayload) => Promise<void>
  /** Revokes the token on the backend (best effort) and clears the session. */
  logout: () => Promise<void>
  /** Drops the local session without calling the backend, e.g. after a 401. */
  clearSession: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside <AuthProvider>')
  return value
}
