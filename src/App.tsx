import { useEffect } from 'react'
import HomePage from './pages/HomePage'
import { initSmoothScroll } from './lib/scroll'

function App() {
  useEffect(() => initSmoothScroll(), [])

  return <HomePage />
}

export default App
