/**
 * Minimal client for the FlowSync backend. Requests go to `/api/v1`, which the
 * Vite dev server proxies to the AdonisJS app (see `vite.config.ts`).
 */
const BASE_URL = '/api/v1'

export type User = {
  id: number
  fullName: string | null
  email: string
  initials: string
  createdAt: string
  updatedAt: string | null
}

export type AuthResult = {
  user: User
  token: string
}

export type SignupPayload = {
  fullName: string | null
  email: string
  password: string
  passwordConfirmation: string
}

export type LoginPayload = {
  email: string
  password: string
}

/**
 * One entry of the `{ errors: [...] }` body AdonisJS returns on failures.
 * Validation errors (422) carry `field` and `rule`; others only `message`.
 */
export type ApiErrorDetail = {
  message: string
  field?: string
  rule?: string
  meta?: Record<string, unknown>
}

/**
 * Thrown for any non-2xx response. `status` is 0 when the request never
 * reached the server (network failure, backend down).
 */
export class ApiError extends Error {
  readonly status: number
  readonly details: ApiErrorDetail[]

  constructor(status: number, details: ApiErrorDetail[]) {
    super(details[0]?.message ?? `Request failed with status ${status}`)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }

  static fromBody(status: number, body: unknown): ApiError {
    const errors =
      body && typeof body === 'object' && 'errors' in body
        ? (body as { errors: unknown }).errors
        : undefined
    const details = Array.isArray(errors)
      ? errors.filter(
          (error): error is ApiErrorDetail =>
            !!error && typeof error.message === 'string',
        )
      : []
    return new ApiError(status, details)
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST'
  body?: unknown
  token?: string | null
}

async function request<T>(
  path: string,
  { method = 'GET', body, token }: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  let response: Response
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(0, [])
  }

  const payload: unknown = await response.json().catch(() => null)
  if (!response.ok) throw ApiError.fromBody(response.status, payload)
  return payload as T
}

export async function signup(payload: SignupPayload): Promise<AuthResult> {
  const { data } = await request<{ data: AuthResult }>('/auth/signup', {
    method: 'POST',
    body: payload,
  })
  return data
}

export async function login(payload: LoginPayload): Promise<AuthResult> {
  const { data } = await request<{ data: AuthResult }>('/auth/login', {
    method: 'POST',
    body: payload,
  })
  return data
}

export async function getProfile(token: string): Promise<User> {
  const { data } = await request<{ data: User }>('/account/profile', { token })
  return data
}

export async function logout(token: string): Promise<void> {
  await request('/account/logout', { method: 'POST', token })
}
