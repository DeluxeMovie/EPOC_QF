import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'lenis/dist/lenis.css'
import './index.css'

document.documentElement.classList.add('js')
import App from './App.jsx'
import { lazy, Suspense } from 'react'
const Results = lazy(() => import('./sections/Results.jsx'))
const showResults = location.hash === '#resultados'

addEventListener('hashchange', () => { if ((location.hash === '#resultados') !== showResults) location.reload() })

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {showResults ? <Suspense fallback={null}><Results /></Suspense> : <App />}
  </StrictMode>,
)
