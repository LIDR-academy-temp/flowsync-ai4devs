/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Backend origin, e.g. `https://api.flowsync.app`. Empty in dev: Vite proxies `/api`. */
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
