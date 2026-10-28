import { defineConfig, devices } from '@playwright/test'

// La dirección de la app vive aquí y no en los tests: para apuntar a otro
// sitio basta con `E2E_BASE_URL=... npm run test:e2e`.
const baseURL = process.env.E2E_BASE_URL ?? 'http://localhost:5173'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // Levanta el Vite de desarrollo si no está ya en marcha. La API no: el
  // backend (y su base) se arranca aparte, desde `backend/` y la raíz.
  webServer: {
    command: 'npm run dev',
    url: baseURL,
    reuseExistingServer: true,
  },
})
