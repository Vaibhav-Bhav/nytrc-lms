// Client-side SSR hydration entry for TanStack Start.
// This file is loaded by the browser to hydrate the server-rendered HTML.
// Do NOT use createRoot() here — StartClient handles hydration automatically.
import { StartClient } from '@tanstack/react-start/client'
import { StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { getRouter } from './router'

const router = getRouter()

hydrateRoot(
  document,
  <StrictMode>
    <StartClient router={router} />
  </StrictMode>,
)
