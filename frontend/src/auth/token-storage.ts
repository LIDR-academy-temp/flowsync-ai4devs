const TOKEN_KEY = 'flowsync.token'

// Storage access can throw (private mode, blocked site data), so every call is
// guarded and the app falls back to an in-memory session.
export function readToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function writeToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    // Ignore: the token still lives in React state for this tab.
  }
}
