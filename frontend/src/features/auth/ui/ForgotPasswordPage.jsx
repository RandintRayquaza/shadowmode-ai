import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Button } from '@/shared/components/ui/button'
import { Mail, ArrowRight, ArrowLeft, Loader2, Check } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    setLoading(false)
    setSent(true)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden selection:bg-foreground selection:text-background py-20">
      {/* Background */}
      <div className="absolute inset-0 bg-grid-minimal opacity-[0.02]" />
      <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-foreground/5 to-transparent" />

      {/* Navigation */}
      <Link to="/" className="absolute top-12 left-12 flex items-center gap-4 group z-50">
        <span className="text-xl font-black tracking-tighter text-foreground uppercase">ShadowMode</span>
        <div className="h-4 w-px bg-foreground/10" />
        <span className="text-[10px] font-black tracking-widest text-foreground/40 uppercase">v4.0.1</span>
      </Link>

      <div className="relative z-10 w-full max-w-sm mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'expo.out' }}
        >
          <AnimatePresence mode="wait">
            {!sent ? (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {/* Header */}
                <div className="mb-16 text-center">
                  <h1 className="text-5xl font-black tracking-tighter text-foreground mb-4 uppercase">
                    Key <br />
                    <span className="font-serif italic font-light lowercase text-foreground/20">Recovery.</span>
                  </h1>
                  <p className="text-foreground/40 text-[10px] font-black tracking-widest uppercase">Encryption override</p>
                </div>

                <div className="space-y-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative group">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-foreground/20 group-focus-within:text-foreground/40 transition-colors uppercase tracking-widest">Login</span>
                      <input
                        type="email"
                        placeholder="EMAIL_ADDRESS"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full bg-foreground/2 border border-foreground/5 rounded-2xl pl-24 pr-6 py-5 text-xs text-foreground font-bold placeholder:text-foreground/10 focus:border-foreground/20 focus:bg-foreground/4 outline-none transition-all tabular-nums"
                      />
                    </div>
                    
                    <Button
                      type="submit"
                      disabled={loading || !email}
                      className="w-full h-16 rounded-2xl bg-foreground text-background font-bold text-xs tracking-[0.2em] transition-all hover:scale-[1.02] active:scale-[0.98] group uppercase"
                    >
                      {loading ? <Loader2 className="size-4 animate-spin" /> : <>Request Link <ArrowRight className="ml-3 font-bold transition-transform group-hover:translate-x-1" /></>}
                    </Button>
                  </form>

                  <div className="pt-12 text-center">
                    <Link to="/login" className="flex items-center justify-center gap-3 text-[10px] font-black tracking-widest text-foreground/40 hover:text-foreground transition-all uppercase">
                      <ArrowLeft className="size-3" /> Return to Verification
                    </Link>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center">
                <div className="size-20 rounded-full border border-foreground/10 flex items-center justify-center mx-auto mb-12">
                  <Check className="size-8 text-foreground" strokeWidth={2.5} />
                </div>
                <h2 className="text-5xl font-black tracking-tighter text-foreground mb-6 uppercase">Sync <br /><span className="text-foreground/20 lowercase italic font-serif font-light">sent.</span></h2>
                <p className="text-[10px] font-black tracking-widest text-foreground/40 uppercase mb-12">Recovery link dispatched to {email}</p>
                <Link to="/login">
                  <Button className="h-14 px-12 rounded-full bg-foreground text-background font-bold text-xs tracking-[0.2em] uppercase">Return to Terminal</Button>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Footer Info */}
      <div className="absolute bottom-12 left-12 right-12 flex justify-between items-center opacity-20 pointer-events-none">
        <span className="text-[8px] font-black tracking-widest uppercase">Recovery_Mode: Active</span>
        <span className="text-[8px] font-black tracking-widest uppercase text-right">Auth_Gate_v2</span>
      </div>
    </div>
  )
}
