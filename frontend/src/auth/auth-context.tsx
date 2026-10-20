import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

const TOKEN_KEY = 'flowsync.token'

function readToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

function writeToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    // Storage unavailable (private mode, blocked site data): the session lives in memory only.
  }
}

interface AuthContextValue {
  token: string | null
  setSession: (token: string) => void
  clearSession: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(readToken)

  const setSession = useCallback((newToken: string) => {
    writeToken(newToken)
    setToken(newToken)
  }, [])

  const clearSession = useCallback(() => {
    writeToken(null)
    setToken(null)
  }, [])

  const value = useMemo(
    () => ({ token, setSession, clearSession }),
    [token, setSession, clearSession]
  )

  return <AuthContext value={value}>{children}</AuthContext>
}

// eslint-disable-next-line react/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>')
  return context
}
