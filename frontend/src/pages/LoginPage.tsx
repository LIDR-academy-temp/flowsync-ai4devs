import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '@/auth/auth-context'
import { CenteredLayout } from '@/components/CenteredLayout'
import { FormAlert } from '@/components/FormAlert'
import { FormField } from '@/components/FormField'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { toFormErrors, type FormErrors } from '@/lib/form-errors'

export const INVALID_CREDENTIALS_MESSAGE =
  'Email o contraseña incorrectos. Revísalos e inténtalo de nuevo.'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [errors, setErrors] = useState<FormErrors>({ fields: {} })
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)

    setSubmitting(true)
    setErrors({ fields: {} })
    try {
      await login({
        email: String(form.get('email') ?? '').trim(),
        password: String(form.get('password') ?? ''),
      })
      navigate('/profile', { replace: true })
    } catch (error) {
      setErrors(
        toFormErrors(error, {
          statusMessages: { 400: INVALID_CREDENTIALS_MESSAGE },
        }),
      )
      setSubmitting(false)
    }
  }

  return (
    <CenteredLayout>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Iniciar sesión</CardTitle>
          <CardDescription>Accede a tu cuenta de FlowSync.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit} noValidate>
          <CardContent className="grid gap-4">
            <FormAlert message={errors.form} />
            <FormField
              name="email"
              label="Email"
              type="email"
              autoComplete="email"
              error={errors.fields.email}
              required
            />
            <FormField
              name="password"
              label="Contraseña"
              type="password"
              autoComplete="current-password"
              error={errors.fields.password}
              required
            />
          </CardContent>
          <CardFooter className="mt-6 flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Entrando…' : 'Entrar'}
            </Button>
            <p className="text-sm text-muted-foreground">
              ¿No tienes cuenta?{' '}
              <Link to="/signup" className="text-foreground underline">
                Crear cuenta
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </CenteredLayout>
  )
}
