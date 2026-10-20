import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import { AlertCircle } from 'lucide-react'
import { useAuth } from '@/auth/auth-context'
import { FormField } from '@/components/form-field'
import { ApiError, fieldErrors, login, NETWORK_ERROR } from '@/lib/api'
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

const FIELDS = ['email', 'password'] as const
type Field = (typeof FIELDS)[number]

const GENERIC_ERROR = 'No se pudo iniciar sesión. Inténtalo de nuevo.'

export function LoginPage() {
  const { token, setSession } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({})
  const [submitting, setSubmitting] = useState(false)

  if (token) return <Navigate to="/profile" replace />

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)

    const trimmedEmail = email.trim()
    const clientErrors: Partial<Record<Field, string>> = {}
    if (!trimmedEmail) clientErrors.email = 'Introduce tu email.'
    if (!password) clientErrors.password = 'Introduce tu contraseña.'
    setErrors(clientErrors)
    if (Object.keys(clientErrors).length > 0) return

    setSubmitting(true)
    try {
      const session = await login({ email: trimmedEmail, password })
      setSession(session.token)
      navigate('/profile', { replace: true })
    } catch (error) {
      if (!(error instanceof ApiError)) {
        setFormError(GENERIC_ERROR)
      } else if (error.status === 400) {
        setFormError('Email o contraseña incorrectos.')
      } else if (error.status === 422) {
        const byField = fieldErrors(error, FIELDS)
        if (Object.keys(byField).length > 0) setErrors(byField)
        else setFormError(GENERIC_ERROR)
      } else {
        setFormError(error.status === NETWORK_ERROR ? error.message : GENERIC_ERROR)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Iniciar sesión</CardTitle>
        <CardDescription>Accede a tu cuenta de FlowSync.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit} noValidate>
        <CardContent className="flex flex-col gap-4">
          {formError && (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}
          <FormField
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={setEmail}
            error={errors.email}
          />
          <FormField
            id="password"
            label="Contraseña"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={setPassword}
            error={errors.password}
          />
        </CardContent>
        <CardFooter className="mt-6 flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Entrando…' : 'Entrar'}
          </Button>
          <p className="text-sm text-muted-foreground">
            ¿No tienes cuenta?{' '}
            <Link to="/signup" className="text-foreground underline underline-offset-4">
              Regístrate
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
