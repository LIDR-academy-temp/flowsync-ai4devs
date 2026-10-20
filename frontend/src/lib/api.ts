/**
 * Minimal client for the FlowSync backend (`backend/start/routes.ts`).
 *
 * Successful responses are wrapped as `{ data: … }` by the backend serializer;
 * errors come back as `{ errors: [{ message, field?, rule? }] }`.
 */

const API_URL = `${import.meta.env.VITE_API_URL ?? ''}/api/v1`

/** Mirrors `backend/app/transformers/user_transformer.ts`. */
export interface User {
  id: number
  fullName: string | null
  email: string
  createdAt: string
  updatedAt: string | null
  initials: string
}

export interface AuthResponse {
  user: User
  token: string
}

export interface ApiErrorDetail {
  message: string
  field?: string
  rule?: string
}

export class ApiError extends Error {
  readonly status: number
  readonly errors: ApiErrorDetail[]

  constructor(status: number, errors: ApiErrorDetail[]) {
    super(errors[0]?.message ?? `Request failed with status ${status}`)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

/** Status used for requests that never reached the server. */
export const NETWORK_ERROR = 0

interface RequestOptions {
  method?: 'GET' | 'POST'
  body?: unknown
  token?: string | null
}

async function request<T>(path: string, { method = 'GET', body, token }: RequestOptions = {}) {
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(NETWORK_ERROR, [{ message: 'No se pudo conectar con el servidor.' }])
  }

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    const errors = Array.isArray(payload?.errors) ? (payload.errors as ApiErrorDetail[]) : []
    throw new ApiError(response.status, errors)
  }

  return payload as T
}

export async function signup(input: {
  email: string
  password: string
  passwordConfirmation: string
}) {
  const { data } = await request<{ data: AuthResponse }>('/auth/signup', {
    method: 'POST',
    body: { fullName: null, ...input },
  })
  return data
}

export async function login(input: { email: string; password: string }) {
  const { data } = await request<{ data: AuthResponse }>('/auth/login', {
    method: 'POST',
    body: input,
  })
  return data
}

export async function getProfile(token: string) {
  const { data } = await request<{ data: User }>('/account/profile', { token })
  return data
}

export async function logout(token: string) {
  await request('/account/logout', { method: 'POST', token })
}

/** Groups backend validation errors (422) by field name, keeping the first message per field. */
export function fieldErrors(error: ApiError): Record<string, string> {
  const byField: Record<string, string> = {}
  for (const { field, message } of error.errors) {
    if (field && !(field in byField)) byField[field] = message
  }
  return byField
}
