import type { Preview } from '@storybook/react-vite'
import { mswLoader } from 'msw-storybook-addon/csf3'
import { MemoryRouter, Route, Routes } from 'react-router'

// Los tokens y Tailwind: sin esto las piezas se pintan sin estilos.
import '../src/index.css'
import { AuthProvider } from '../src/auth/auth-provider'
import { mswHandlers } from './msw-handlers'

const preview: Preview = {
  // El mismo árbol que `src/main.tsx` (router y luego sesión), con un router en
  // memoria: la dirección la fija cada historia con `parameters.route` y, si la
  // pantalla lee `useParams`, el patrón con `parameters.path`.
  decorators: [
    (Story, { parameters }) => (
      <MemoryRouter initialEntries={[parameters.route ?? '/']}>
        <AuthProvider>
          <Routes>
            <Route path={parameters.path ?? '*'} element={<Story />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    ),
  ],
  loaders: [mswLoader()],
  async beforeEach({ msw }) {
    msw.use(...mswHandlers)
    // La única clave que lee la app: con ella, AuthProvider rehidrata la sesión
    // contra el `GET /account/profile` simulado.
    localStorage.setItem('flowsync.token', 'token-de-storybook')
  },
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
    },
  },
}

export default preview
