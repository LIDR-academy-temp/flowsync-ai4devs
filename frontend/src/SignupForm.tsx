import { useState } from 'react'
import type { FormEvent } from 'react'
import './SignupForm.css'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3333'

type FieldErrors = Record<string, string>

type ApiError = { field?: string; message: string }

function SignupForm() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [createdEmail, setCreatedEmail] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrors({})
    setFormError(null)

    if (password !== passwordConfirmation) {
      setErrors({ passwordConfirmation: 'Passwords do not match' })
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch(`${API_URL}/api/v1/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim() || null,
          email,
          password,
          passwordConfirmation,
        }),
      })

      if (response.ok) {
        const body = await response.json()
        localStorage.setItem('token', body.data.token)
        setCreatedEmail(body.data.user.email)
        return
      }

      const body = await response.json().catch(() => null)
      const apiErrors: ApiError[] | undefined = body?.errors
      if (response.status === 422 && apiErrors) {
        const fieldErrors: FieldErrors = {}
        for (const { field, message } of apiErrors) {
          if (field) fieldErrors[field] = message
        }
        setErrors(fieldErrors)
      } else {
        setFormError('Could not create the account. Please try again.')
      }
    } catch {
      setFormError('Cannot reach the server. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (createdEmail) {
    return (
      <section className="signup" role="status">
        <h1>Account created</h1>
        <p>
          Welcome! Your account <strong>{createdEmail}</strong> is ready.
        </p>
      </section>
    )
  }

  return (
    <form className="signup" onSubmit={handleSubmit} noValidate>
      <h1>Create account - With Harness</h1>

      {formError && (
        <p className="signup-error" role="alert">
          {formError}
        </p>
      )}

      <label>
        Full name (optional)
        <input
          type="text"
          name="fullName"
          autoComplete="name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        {errors.fullName && <span className="signup-error">{errors.fullName}</span>}
      </label>

      <label>
        Email
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {errors.email && <span className="signup-error">{errors.email}</span>}
      </label>

      <label>
        Password
        <input
          type="password"
          name="password"
          autoComplete="new-password"
          required
          minLength={8}
          maxLength={32}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {errors.password && <span className="signup-error">{errors.password}</span>}
      </label>

      <label>
        Confirm password
        <input
          type="password"
          name="passwordConfirmation"
          autoComplete="new-password"
          required
          value={passwordConfirmation}
          onChange={(e) => setPasswordConfirmation(e.target.value)}
        />
        {errors.passwordConfirmation && (
          <span className="signup-error">{errors.passwordConfirmation}</span>
        )}
      </label>

      <button type="submit" disabled={submitting}>
        {submitting ? 'Creating…' : 'Create account'}
      </button>
    </form>
  )
}

export default SignupForm
