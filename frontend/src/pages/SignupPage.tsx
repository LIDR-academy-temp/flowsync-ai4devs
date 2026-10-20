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

export const EMAIL_TAKEN_MESSAGE =
  'Ya existe una cuenta con este email. Inicia sesión o usa otro email.'

export function SignupPage() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [errors, setErrors] = useState<FormErrors>({ fields: {} })
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const fullName = String(form.get('fullName') ?? '').trim()

    setSubmitting(true)
    setErrors({ fields: {} })
    try {
      await signup({
        fullName: fullName || null,
        email: String(form.get('email') ?? '').trim(),
        password: String(form.get('password') ?? ''),
        passwordConfirmation: String(form.get('passwordConfirmation') ?? ''),
      })
      navigate('/profile', { replace: true })
    } catch (error) {
      setErrors(
        toFormErrors(error, {
          fieldMessages: { 'email.database.unique': EMAIL_TAKEN_MESSAGE },
        }),
      )
      setSubmitting(false)
    }
  }

  return (
    <CenteredLayout>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Crear cuenta</CardTitle>
          <CardDescription>
            Regístrate para empezar a usar FlowSync.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit} noValidate>
          <CardContent className="grid gap-4">
            <FormAlert message={errors.form} />
            <FormField
              name="fullName"
              label="Nombre (opcional)"
              autoComplete="name"
              error={errors.fields.fullName}
            />
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
              autoComplete="new-password"
              placeholder="Entre 8 y 32 caracteres"
              error={errors.fields.password}
              required
            />
            <FormField
              name="passwordConfirmation"
              label="Repite la contraseña"
              type="password"
              autoComplete="new-password"
              error={errors.fields.passwordConfirmation}
              required
            />
          </CardContent>
          <CardFooter className="mt-6 flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Creando cuenta…' : 'Crear cuenta'}
            </Button>
            <p className="text-sm text-muted-foreground">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="text-foreground underline">
                Iniciar sesión
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </CenteredLayout>
  )
}
