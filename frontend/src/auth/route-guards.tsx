import { Navigate, Outlet } from 'react-router'
import { useAuth } from '@/auth/auth-context'

/** Renders child routes only with a session; otherwise sends to `/login`. */
export function RequireAuth() {
  const { token } = useAuth()
  return token ? <Outlet /> : <Navigate to="/login" replace />
}

/** Keeps signed-in users away from the login and signup screens. */
export function GuestOnly() {
  const { token } = useAuth()
  return token ? <Navigate to="/profile" replace /> : <Outlet />
}
