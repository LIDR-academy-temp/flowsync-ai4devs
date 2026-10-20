import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { INVALID_CREDENTIALS_MESSAGE } from '@/pages/LoginPage'
import { EMAIL_TAKEN_MESSAGE } from '@/pages/SignupPage'
import { NETWORK_ERROR_MESSAGE } from '@/lib/form-errors'
import { mockFetch, renderApp } from '@/test/render-app'

const user = {
  id: 1,
  fullName: 'Ada Lovelace',
  email: 'ada@example.com',
  initials: 'AL',
  createdAt: '2026-10-20T10:00:00.000+00:00',
  updatedAt: '2026-10-20T10:00:00.000+00:00',
}

describe('login', () => {
  it('stores the token and shows the profile', async () => {
    const fetchMock = mockFetch(
      { status: 200, body: { data: { user, token: 'oat_abc' } } },
      { status: 200, body: { data: user } },
    )
    const { user: ui } = renderApp('/login')

    await ui.type(screen.getByLabelText('Email'), 'ada@example.com')
    await ui.type(screen.getByLabelText('Contraseña'), 'secret123')
    await ui.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByText('Ada Lovelace')).toBeInTheDocument()
    expect(localStorage.getItem('flowsync.token')).toBe('oat_abc')

    const [loginUrl, loginInit] = fetchMock.mock.calls[0]
    expect(loginUrl).toBe('/api/v1/auth/login')
    expect(JSON.parse(String(loginInit?.body))).toEqual({
      email: 'ada@example.com',
      password: 'secret123',
    })
    const [profileUrl, profileInit] = fetchMock.mock.calls[1]
    expect(profileUrl).toBe('/api/v1/account/profile')
    expect(profileInit?.headers).toMatchObject({
      Authorization: 'Bearer oat_abc',
    })
  })

  it('shows a clear message on invalid credentials', async () => {
    mockFetch({
      status: 400,
      body: { errors: [{ message: 'Invalid user credentials' }] },
    })
    const { user: ui } = renderApp('/login')

    await ui.type(screen.getByLabelText('Email'), 'ada@example.com')
    await ui.type(screen.getByLabelText('Contraseña'), 'wrong')
    await ui.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      INVALID_CREDENTIALS_MESSAGE,
    )
    expect(localStorage.getItem('flowsync.token')).toBeNull()
  })

  it('shows a clear message when the backend is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('fail')))
    const { user: ui } = renderApp('/login')

    await ui.type(screen.getByLabelText('Email'), 'ada@example.com')
    await ui.type(screen.getByLabelText('Contraseña'), 'secret123')
    await ui.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      NETWORK_ERROR_MESSAGE,
    )
  })

  it('links to the signup screen', async () => {
    const { user: ui } = renderApp('/login')

    await ui.click(screen.getByRole('link', { name: 'Crear cuenta' }))

    expect(
      screen.getByRole('button', { name: 'Crear cuenta' }),
    ).toBeInTheDocument()
  })
})

describe('signup', () => {
  async function fillSignup(ui: ReturnType<typeof renderApp>['user']) {
    await ui.type(screen.getByLabelText('Email'), 'ada@example.com')
    await ui.type(screen.getByLabelText('Contraseña'), 'secret123')
    await ui.type(screen.getByLabelText('Repite la contraseña'), 'secret123')
    await ui.click(screen.getByRole('button', { name: 'Crear cuenta' }))
  }

  it('creates the account and shows the profile', async () => {
    const fetchMock = mockFetch(
      { status: 200, body: { data: { user, token: 'oat_new' } } },
      { status: 200, body: { data: user } },
    )
    const { user: ui } = renderApp('/signup')

    await fillSignup(ui)

    expect(await screen.findByText('ada@example.com')).toBeInTheDocument()
    expect(localStorage.getItem('flowsync.token')).toBe('oat_new')
    expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body))).toEqual({
      fullName: null,
      email: 'ada@example.com',
      password: 'secret123',
      passwordConfirmation: 'secret123',
    })
  })

  it('shows a clear message when the email is already registered', async () => {
    mockFetch({
      status: 422,
      body: {
        errors: [
          {
            message: 'The email has already been taken',
            rule: 'database.unique',
            field: 'email',
          },
        ],
      },
    })
    const { user: ui } = renderApp('/signup')

    await fillSignup(ui)

    expect(await screen.findByText(EMAIL_TAKEN_MESSAGE)).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toHaveAttribute(
      'aria-invalid',
      'true',
    )
  })

  it('links to the login screen', async () => {
    const { user: ui } = renderApp('/signup')

    await ui.click(screen.getByRole('link', { name: 'Iniciar sesión' }))

    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument()
  })
})

describe('profile', () => {
  it('redirects to login without a session', () => {
    renderApp('/profile')

    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument()
  })

  it('drops a rejected token and redirects to login', async () => {
    localStorage.setItem('flowsync.token', 'oat_stale')
    mockFetch({
      status: 401,
      body: { errors: [{ message: 'Unauthorized access' }] },
    })
    renderApp('/profile')

    expect(
      await screen.findByRole('button', { name: 'Entrar' }),
    ).toBeInTheDocument()
    expect(localStorage.getItem('flowsync.token')).toBeNull()
  })

  it('logs out and returns to login', async () => {
    localStorage.setItem('flowsync.token', 'oat_abc')
    const fetchMock = mockFetch(
      { status: 200, body: { data: user } },
      { status: 200, body: { message: 'Logged out successfully' } },
    )
    const { user: ui } = renderApp('/profile')

    await ui.click(await screen.findByRole('button', { name: 'Cerrar sesión' }))

    expect(
      await screen.findByRole('button', { name: 'Entrar' }),
    ).toBeInTheDocument()
    expect(fetchMock.mock.calls[1][0]).toBe('/api/v1/account/logout')
    expect(localStorage.getItem('flowsync.token')).toBeNull()
  })
})
