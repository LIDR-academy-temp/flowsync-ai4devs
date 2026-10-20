import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { AlertCircle } from 'lucide-react'
import { useAuth } from '@/auth/auth-context'
import { ApiError, getProfile, logout, type User } from '@/lib/api'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const memberSince = new Intl.DateTimeFormat('es-ES', { dateStyle: 'long' })

/** Protected view: only rendered inside <RequireAuth>, so `token` is set. */
export function ProfilePage() {
  const { token, clearSession } = useAuth()
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    let ignore = false

    getProfile(token)
      .then((profile) => {
        if (!ignore) setUser(profile)
      })
      .catch((err: unknown) => {
        if (ignore) return
        if (err instanceof ApiError && err.status === 401) {
          // Token expired or revoked: drop it and let <RequireAuth> redirect to login.
          clearSession()
          return
        }
        setError(
          err instanceof ApiError && err.status === 0
            ? err.message
            : 'No se pudo cargar tu perfil. Inténtalo de nuevo más tarde.'
        )
      })

    return () => {
      ignore = true
    }
  }, [token, clearSession])

  async function handleLogout() {
    if (token) {
      // Best effort: the local session is cleared even if revoking the token fails.
      await logout(token).catch(() => {})
    }
    clearSession()
    navigate('/login', { replace: true })
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Tu perfil</CardTitle>
        <CardDescription>Datos de tu cuenta de FlowSync.</CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <Alert variant="destructive">
            <AlertCircle />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : !user ? (
          <p className="text-sm text-muted-foreground">Cargando…</p>
        ) : (
          <div className="flex items-center gap-4">
            <div
              aria-hidden
              className="flex size-12 shrink-0 items-center justify-center rounded-full bg-muted text-base font-medium"
            >
              {user.initials}
            </div>
            <div className="flex min-w-0 flex-col">
              <p className="truncate font-medium">{user.fullName ?? user.email}</p>
              {user.fullName && (
                <p className="truncate text-sm text-muted-foreground">{user.email}</p>
              )}
              <p className="text-sm text-muted-foreground">
                Miembro desde {memberSince.format(new Date(user.createdAt))}
              </p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="mt-6">
        <Button variant="outline" className="w-full" onClick={handleLogout}>
          Cerrar sesión
        </Button>
      </CardFooter>
    </Card>
  )
}
