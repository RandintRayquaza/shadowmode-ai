import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { useAuthActions } from '../hooks/useAuthActions'
import { useAuthStore } from '../state/useAuthStore'
import { Button } from '@/shared/components/ui/button'
import { Eye, EyeOff, ArrowRight, Loader2, Fingerprint, ScanSearch } from 'lucide-react'

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuthActions()
  const { loading } = useAuthStore()
  
  const location = useLocation()


  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.email || !form.password) { setError('Please fill all fields'); return }
    await login(form.email, form.password)
  }

  const handleGoogle = async () => {
    await loginWithGoogle()
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden selection:bg-foreground selection:text-background">
      {/* Background */}
      <div className="absolute inset-0 bg-grid-minimal opacity-[0.02]" />
      <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-foreground/5 to-transparent" />

      {/* Navigation */}
      <Link to="/" className="absolute top-12 left-12 flex items-center gap-2.5 group z-50">
        <div className="size-8 rounded-xl bg-brand/15 border border-brand/30 flex items-center justify-center">
          <ScanSearch className="size-4 text-brand" />
        </div>
        <span className="text-sm font-black tracking-tighter text-foreground uppercase">ShadowMode</span>
      </Link>

      <div className="relative z-10 w-full max-w-sm mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'expo.out' }}
        >
          {/* Header */}
          <div className="mb-16 text-center">
            <h1 className="text-5xl font-black tracking-tighter text-foreground mb-4 uppercase">
              Secure <br />
              <span className="font-serif italic font-light lowercase text-foreground/20">Access.</span>
            </h1>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand/20 bg-brand/5">
              <div className="size-1 rounded-full bg-brand animate-pulse" />
              <span className="text-[9px] font-black tracking-[0.2em] text-brand/70 uppercase">Verification Terminal</span>
            </div>
          </div>

          <div className="space-y-8">
            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="relative group">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-foreground/20 group-focus-within:text-foreground/40 transition-colors uppercase tracking-widest">User</span>
                  <input
                    type="email"
                    placeholder="EMAIL_ADDRESS"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full bg-foreground/[0.02] border border-foreground/8 rounded-2xl pl-24 pr-6 py-5 text-xs text-foreground font-bold placeholder:text-foreground/10 focus:border-brand/30 focus:bg-brand/[0.02] outline-none transition-all tabular-nums"
                  />
                </div>

                <div className="relative group">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-foreground/20 group-focus-within:text-foreground/40 transition-colors uppercase tracking-widest">Key</span>
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="********"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    className="w-full bg-foreground/[0.02] border border-foreground/8 rounded-2xl pl-24 pr-16 py-5 text-xs text-foreground font-bold placeholder:text-foreground/10 focus:border-brand/30 focus:bg-brand/[0.02] outline-none transition-all"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-6 top-1/2 -translate-y-1/2 text-foreground/20 hover:text-foreground transition-colors">
                    {showPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-[10px] text-red-500 font-black tracking-widest uppercase text-center px-1">{error}</p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 rounded-2xl bg-brand text-background font-black text-[10px] tracking-[0.2em] uppercase hover:opacity-90 hover:shadow-[0_4px_20px_hsla(186,90%,52%,0.35)] active:scale-[0.98] transition-all group"
              >
                {loading ? <Loader2 className="size-4 animate-spin" /> : (
                  <>Connect Terminal <ArrowRight className="ml-3 font-bold transition-transform group-hover:translate-x-1" /></>
                )}
              </Button>
            </form>

            <div className="flex items-center gap-6">
              <div className="flex-1 h-px bg-foreground/5" />
              <span className="text-[8px] text-foreground/20 font-black tracking-[0.4em] uppercase">Methods</span>
              <div className="flex-1 h-px bg-foreground/5" />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={handleGoogle}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl border border-foreground/8 hover:border-brand/20 hover:bg-brand/[0.03] transition-all group"
              >
                <Fingerprint className="size-4 text-foreground/40 group-hover:text-brand transition-colors" />
                <span className="text-[10px] font-black text-foreground/40 tracking-widest uppercase group-hover:text-brand transition-colors">Google Sync</span>
              </button>
            </div>

            <div className="pt-12 text-center space-y-6">
              <Link to="/forgot-password" className="block text-[10px] font-black tracking-widest text-foreground/20 hover:text-foreground transition-all uppercase">
                Recover Access Key
              </Link>
              <div className="h-px w-8 bg-foreground/10 mx-auto" />
              <p className="text-[10px] font-black tracking-widest text-foreground/40 uppercase">
                New Identity?{' '}
                <Link to="/signup" className="text-foreground border-b border-foreground/20 hover:border-foreground transition-all ml-2">
                  Initialize
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer Info */}
      <div className="absolute bottom-12 left-12 right-12 flex justify-between items-center opacity-20 pointer-events-none">
        <span className="text-[8px] font-black tracking-widest uppercase">Loc_Ver: 0x291A</span>
        <span className="text-[8px] font-black tracking-widest uppercase text-right">Protected_Channel</span>
      </div>
    </div>
  )
}
