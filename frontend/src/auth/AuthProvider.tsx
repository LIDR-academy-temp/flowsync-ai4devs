import { useCallback, useMemo, useState, type ReactNode } from 'react'
import * as api from '@/lib/api'
import { AuthContext, type AuthContextValue } from '@/auth/auth-context'
import { readToken, writeToken } from '@/auth/token-storage'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(readToken)

  const storeToken = useCallback((next: string | null) => {
    writeToken(next)
    setToken(next)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      login: async (payload) => storeToken((await api.login(payload)).token),
      signup: async (payload) => storeToken((await api.signup(payload)).token),
      logout: async () => {
        try {
          if (token) await api.logout(token)
        } catch {
          // The token is discarded locally either way.
        } finally {
          storeToken(null)
        }
      },
      clearSession: () => storeToken(null),
    }),
    [token, storeToken],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}
