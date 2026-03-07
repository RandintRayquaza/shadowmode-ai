import { useState } from 'react'
import AppRouter from '@/app/router/AppRouter'
import Preloader from '@/shared/components/Preloader'

export default function App() {
  const [loading, setLoading] = useState(true)

  return (
    <>
      <Preloader onComplete={() => setLoading(false)} />
      {!loading && <AppRouter />}
      
      {/* Global Grain Texture */}
      <div className="fixed inset-0 pointer-events-none z-100 opacity-[0.03] bg-grain" />
    </>
  )
}