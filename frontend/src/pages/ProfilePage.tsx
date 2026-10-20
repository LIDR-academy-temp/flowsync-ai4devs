import { useEffect, useState } from 'react'
import { useAuth } from '@/auth/auth-context'
import { CenteredLayout } from '@/components/CenteredLayout'
import { FormAlert } from '@/components/FormAlert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ApiError, getProfile, type User } from '@/lib/api'
import { toFormErrors, UNEXPECTED_ERROR_MESSAGE } from '@/lib/form-errors'

const dateFormatter = new Intl.DateTimeFormat('es-ES', { dateStyle: 'long' })

export function ProfilePage() {
  const { token, logout, clearSession } = useAuth()
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState<string>()
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    if (!token) return
    let ignore = false

    getProfile(token).then(
      (profile) => {
        if (!ignore) setUser(profile)
      },
      (reason: unknown) => {
        if (ignore) return
        // A revoked or expired token: drop it and let the guard redirect.
        if (reason instanceof ApiError && reason.status === 401) clearSession()
        else setError(toFormErrors(reason).form ?? UNEXPECTED_ERROR_MESSAGE)
      },
    )

    return () => {
      ignore = true
    }
  }, [token, clearSession])

  async function handleLogout() {
    setLoggingOut(true)
    await logout()
  }

  return (
    <CenteredLayout>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Tu perfil</CardTitle>
          <CardDescription>Datos de tu cuenta de FlowSync.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <FormAlert message={error} />
          {!user && !error && (
            <p className="text-sm text-muted-foreground">Cargando perfil…</p>
          )}
          {user && (
            <div className="flex items-center gap-4">
              <div
                aria-hidden
                className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-medium text-primary-foreground"
              >
                {user.initials}
              </div>
              <dl className="grid gap-1 text-sm">
                <dt className="sr-only">Nombre</dt>
                <dd className="font-medium">{user.fullName ?? 'Sin nombre'}</dd>
                <dt className="sr-only">Email</dt>
                <dd className="text-muted-foreground">{user.email}</dd>
                <dt className="sr-only">Miembro desde</dt>
                <dd className="text-muted-foreground">
                  Miembro desde {dateFormatter.format(new Date(user.createdAt))}
                </dd>
              </dl>
            </div>
          )}
        </CardContent>
        <CardFooter className="mt-6">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut ? 'Cerrando sesión…' : 'Cerrar sesión'}
          </Button>
        </CardFooter>
      </Card>
    </CenteredLayout>
  )
}
