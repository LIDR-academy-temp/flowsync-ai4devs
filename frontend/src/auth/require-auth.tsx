import type { ReactNode } from 'react'
import { Navigate } from 'react-router'
import { useAuth } from '@/auth/auth-context'

/** Renders its children only when there is a session; otherwise sends the user to login. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { token } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  return children
}
