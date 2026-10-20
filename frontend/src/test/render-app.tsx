import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { vi } from 'vitest'
import { AppRoutes } from '@/AppRoutes'
import { AuthProvider } from '@/auth/AuthProvider'

/** Renders the real route tree at `path`, as the browser would. */
export function renderApp(path: string) {
  const user = userEvent.setup()
  render(
    <AuthProvider>
      <MemoryRouter initialEntries={[path]}>
        <AppRoutes />
      </MemoryRouter>
    </AuthProvider>,
  )
  return { user }
}

/** Replaces `fetch` with a stub that answers successive calls with `responses`. */
export function mockFetch(
  ...responses: Array<{ status: number; body: unknown }>
) {
  const fetchMock = vi.fn<typeof fetch>()
  for (const { status, body } of responses) {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
  }
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}
