import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const rootElement = document.getElementById('root')!

// If HTML was pre-rendered (Static Site Generation), hydrate immediately for 0ms paint
if (rootElement.hasChildNodes()) {
  hydrateRoot(
    rootElement,
    <StrictMode>
      <App />
    </StrictMode>
  )
} else {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  )
}
