import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useAuthActions } from '../hooks/useAuthActions'
import { useAuthStore } from '../state/useAuthStore'
import { Button } from '@/shared/components/ui/button'
import { Phone, ArrowRight, ArrowLeft, Loader2, RefreshCw, Check } from 'lucide-react'

export default function OtpPage() {
  const { sendOtp, verifyOtp } = useAuthActions()
  const { loading } = useAuthStore()
  
  const [step, setStep] = useState('phone') // 'phone' | 'otp'
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const inputRefs = useRef([])

  const handleSendOtp = async (e) => {
    e.preventDefault()
    if (!phone) return
    const success = await sendOtp(phone, "recaptcha-container")
    if (success) setStep('otp')
  }

  const handleOtpInput = (val, idx) => {
    if (!/^\d*$/.test(val)) return
    const newOtp = [...otp]
    newOtp[idx] = val.slice(-1)
    setOtp(newOtp)
    if (val && idx < 5) inputRefs.current[idx + 1]?.focus()
  }

  const handleOtpKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus()
    }
  }

  const handleVerify = async () => {
    const code = otp.join('')
    if (code.length !== 6) return
    await verifyOtp(code)
  }

  const otpComplete = otp.every(d => d !== '')

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
            {step === 'phone' ? (
              <motion.div key="phone" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                {/* Header */}
                <div className="mb-16 text-center">
                  <h1 className="text-5xl font-black tracking-tighter text-foreground mb-4 uppercase">
                    Comm <br />
                    <span className="font-serif italic font-light lowercase text-foreground/20">Link.</span>
                  </h1>
                  <p className="text-foreground/40 text-[10px] font-black tracking-widest uppercase">Signal initialization</p>
                </div>

                <div className="space-y-8">
                  <form onSubmit={handleSendOtp} className="space-y-6">
                    <div className="relative group">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-foreground/20 group-focus-within:text-foreground/40 transition-colors uppercase tracking-widest">Sig</span>
                      <input
                        type="tel"
                        placeholder="+0 000 000 0000"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        className="w-full bg-foreground/2 border border-foreground/5 rounded-2xl pl-24 pr-6 py-5 text-xs text-foreground font-bold placeholder:text-foreground/10 focus:border-foreground/20 focus:bg-foreground/4 outline-none transition-all tabular-nums"
                      />
                    </div>
                    
                    <Button
                      type="submit"
                      disabled={loading || !phone}
                      className="w-full h-16 rounded-2xl bg-foreground text-background font-bold text-xs tracking-[0.2em] transition-all hover:scale-[1.02] active:scale-[0.98] group uppercase"
                    >
                      {loading ? <Loader2 className="size-4 animate-spin" /> : <>Request Signal <ArrowRight className="ml-3 font-bold transition-transform group-hover:translate-x-1" /></>}
                    </Button>
                  </form>

                  <div className="pt-12 text-center">
                    <Link to="/login" className="text-[10px] font-black tracking-widest text-foreground/40 hover:text-foreground transition-all uppercase">
                      Switch to Protocol Alpha (Email)
                    </Link>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="otp" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                {/* Header */}
                <div className="mb-16 text-center">
                  <h1 className="text-5xl font-black tracking-tighter text-foreground mb-4 uppercase">
                    Signal <br />
                    <span className="font-serif italic font-light lowercase text-foreground/20">Verify.</span>
                  </h1>
                  <p className="text-foreground/40 text-[10px] font-black tracking-widest uppercase">Encryption key input</p>
                </div>

                <div className="space-y-8">
                  <div className="grid grid-cols-6 gap-3">
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={el => inputRefs.current[idx] = el}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleOtpInput(e.target.value, idx)}
                        onKeyDown={e => handleOtpKeyDown(e, idx)}
                        className={`h-14 w-full text-center text-xs font-black bg-foreground/2 border rounded-xl text-foreground outline-none transition-all ${
                          digit ? 'border-foreground/40 bg-foreground/5' : 'border-foreground/5 focus:border-foreground/20'
                        }`}
                      />
                    ))}
                  </div>

                    <Button
                      onClick={handleVerify}
                      disabled={!otpComplete || loading}
                      className="w-full h-16 rounded-2xl bg-foreground text-background font-bold text-xs tracking-[0.2em] transition-all hover:scale-[1.02] active:scale-[0.98] group uppercase"
                    >
                      {loading ? <Loader2 className="size-4 animate-spin" /> : <>Complete Sync <Check className="ml-3 font-bold" /></>}
                    </Button>

                    <div id="recaptcha-container"></div>

                  <div className="pt-12 text-center flex flex-col gap-6">
                    <button 
                      onClick={() => setStep('phone')}
                      className="text-[10px] font-black tracking-widest text-foreground/20 hover:text-foreground transition-all uppercase"
                    >
                      Re-init Signal ({phone})
                    </button>
                    <div className="h-px w-8 bg-foreground/10 mx-auto" />
                    <button className="flex items-center justify-center gap-2 text-[10px] font-black tracking-widest text-foreground/40 hover:text-foreground transition-all uppercase">
                      <RefreshCw className="size-3" /> Resend Pulse
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Footer Info */}
      <div className="absolute bottom-12 left-12 right-12 flex justify-between items-center opacity-20 pointer-events-none">
        <span className="text-[8px] font-black tracking-widest uppercase">Sig_Ver: 0x921B</span>
        <span className="text-[8px] font-black tracking-widest uppercase text-right">Enc_Node_7</span>
      </div>
    </div>
  )
}
