import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import { AlertCircle } from 'lucide-react'
import { useAuth } from '@/auth/auth-context'
import { FormField } from '@/components/form-field'
import { ApiError, fieldErrors, NETWORK_ERROR, signup } from '@/lib/api'
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

/** Same bounds as `password()` in `backend/app/validators/user.ts`. */
const PASSWORD_MIN = 8
const PASSWORD_MAX = 32

const FIELDS = ['email', 'password', 'passwordConfirmation'] as const
type Field = (typeof FIELDS)[number]

const GENERIC_ERROR = 'No se pudo crear la cuenta. Inténtalo de nuevo.'

function validate(email: string, password: string, passwordConfirmation: string) {
  const errors: Partial<Record<Field, string>> = {}
  if (!email) errors.email = 'Introduce tu email.'
  if (password.length < PASSWORD_MIN || password.length > PASSWORD_MAX) {
    errors.password = `La contraseña debe tener entre ${PASSWORD_MIN} y ${PASSWORD_MAX} caracteres.`
  }
  if (passwordConfirmation !== password) {
    errors.passwordConfirmation = 'Las contraseñas no coinciden.'
  }
  return errors
}

export function SignupPage() {
  const { token, setSession } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({})
  const [submitting, setSubmitting] = useState(false)

  if (token) return <Navigate to="/profile" replace />

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)

    const trimmedEmail = email.trim()
    const clientErrors = validate(trimmedEmail, password, passwordConfirmation)
    setErrors(clientErrors)
    if (Object.keys(clientErrors).length > 0) return

    setSubmitting(true)
    try {
      const session = await signup({ email: trimmedEmail, password, passwordConfirmation })
      setSession(session.token)
      navigate('/profile', { replace: true })
    } catch (error) {
      if (!(error instanceof ApiError)) {
        setFormError(GENERIC_ERROR)
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
        <CardTitle>Crear cuenta</CardTitle>
        <CardDescription>Regístrate con tu email para empezar a usar FlowSync.</CardDescription>
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
            autoComplete="new-password"
            value={password}
            onChange={setPassword}
            error={errors.password}
          />
          <FormField
            id="passwordConfirmation"
            label="Repite la contraseña"
            type="password"
            autoComplete="new-password"
            value={passwordConfirmation}
            onChange={setPasswordConfirmation}
            error={errors.passwordConfirmation}
          />
        </CardContent>
        <CardFooter className="mt-6 flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Creando cuenta…' : 'Crear cuenta'}
          </Button>
          <p className="text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-foreground underline underline-offset-4">
              Inicia sesión
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
