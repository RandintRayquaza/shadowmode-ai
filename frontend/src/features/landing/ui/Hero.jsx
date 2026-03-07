import { useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/app/providers/AuthContext'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { Button } from '@/shared/components/ui/button'
import { ArrowRight, ScanSearch, CheckCircle2 } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

export default function Hero() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const containerRef = useRef(null)

  const handleAnalyzeClick = () => {
    if (user) {
      navigate('/analyze')
    } else {
      const el = document.getElementById('upload-section')
      if (el) window.lenis?.scrollTo(el)
    }
  }

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })

    tl.fromTo('.hero-eyebrow', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 1.2, delay: 0.3 })
      .fromTo('.hero-line', { y: '105%' }, { y: 0, duration: 1.6, stagger: 0.1 }, '<0.2')
      .fromTo('.hero-sub', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 1.2 }, '<0.4')
      .fromTo('.hero-cta', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 1.2 }, '<0.3')
      .fromTo('.hero-panel', { opacity: 0, x: 32 }, { opacity: 1, x: 0, duration: 1.8 }, '<0.5')
      .fromTo('.hero-stat', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 1, stagger: 0.15 }, '<0.6')

    ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top top',
      end: 'bottom top',
      scrub: true,
      onUpdate: (self) => {
        gsap.set('.hero-content', { opacity: 1 - self.progress * 1.6 })
      },
    })

    return () => ScrollTrigger.getAll().forEach(t => t.kill())
  }, { scope: containerRef })

  return (
    <section ref={containerRef} className="relative min-h-screen flex items-center overflow-hidden bg-background">
      {/* Background layers */}
      <div className="absolute inset-0 bg-grid-minimal opacity-[0.025]" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand/30 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-foreground/5 to-transparent" />
      <div className="absolute inset-0 bg-radial-brand opacity-[0.04]" />

      <div className="hero-content w-full container mx-auto px-6 md:px-12 max-w-7xl relative z-10 pt-28 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-16 lg:gap-20 items-center">

          {/* Left: Copy */}
          <div className="flex flex-col justify-center">
            <div className="hero-eyebrow flex items-center gap-3 mb-10">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand/25 bg-brand/[0.06]">
                <div className="size-1 rounded-full bg-brand animate-pulse" />
                <span className="text-[9px] font-black tracking-[0.25em] text-brand/80 uppercase">AI Forensic Platform</span>
              </div>
            </div>

            <h1 className="mb-10 leading-[0.82] tracking-tighter">
              {['Detect.', 'Verify.'].map((word, i) => (
                <div key={i} className="overflow-hidden">
                  <div className="hero-line text-[clamp(3.5rem,9vw,8rem)] font-black text-foreground uppercase">{word}</div>
                </div>
              ))}
              <div className="overflow-hidden">
                <div className="hero-line text-[clamp(3.5rem,9vw,8rem)] font-serif italic font-light lowercase text-foreground/20">Reveal.</div>
              </div>
            </h1>

            <p className="hero-sub text-base text-foreground/40 leading-relaxed max-w-sm mb-10">
              Multi-vector forensic intelligence. Detect AI generation, metadata tampering, and pixel-level manipulation in under two seconds.
            </p>

            <div className="hero-cta flex flex-wrap items-center gap-4">
              <Button
                onClick={handleAnalyzeClick}
                className="h-12 px-7 rounded-xl bg-brand text-background font-black text-[10px] tracking-[0.2em] uppercase hover:opacity-90 hover:shadow-[0_4px_24px_hsla(186,90%,52%,0.4)] active:scale-[0.98] transition-all group"
              >
                Start Analysis
                <ArrowRight className="ml-2 size-3.5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Link to={user ? '/dashboard' : '/login'}>
                <button className="h-12 px-5 text-[10px] font-black tracking-[0.2em] uppercase text-foreground/35 hover:text-foreground transition-colors">
                  {user ? 'Open Dashboard' : 'Sign In'} â†’
                </button>
              </Link>
            </div>

            {/* Stat strip */}
            <div className="flex flex-wrap items-center gap-8 mt-14 pt-8 border-t border-foreground/[0.06]">
              {[
                { value: '99.2%', label: 'Detection accuracy' },
                { value: '<2s', label: 'Analysis time' },
                { value: '3-layer', label: 'Forensic signals' },
              ].map((s, i) => (
                <div key={i} className="hero-stat">
                  <p className="text-xl font-black text-brand tabular-nums">{s.value}</p>
                  <p className="text-[9px] font-black tracking-widest text-foreground/25 uppercase mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Forensic panel */}
          <div className="hero-panel flex items-center justify-center lg:justify-end">
            <div className="relative w-full max-w-[380px]">
              {/* Ambient glow */}
              <div className="absolute -inset-6 rounded-3xl bg-brand/5 blur-2xl pointer-events-none" />

              <div className="relative bg-background border border-foreground/10 rounded-2xl overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.5)]">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-foreground/[0.06] bg-foreground/[0.02]">
                  <div className="flex items-center gap-2">
                    <ScanSearch className="size-3.5 text-brand" />
                    <span className="text-[9px] font-black tracking-[0.2em] text-foreground/35 uppercase">Forensic Scan</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-brand/8 border border-brand/20">
                    <div className="size-1.5 rounded-full bg-brand animate-pulse" />
                    <span className="text-[8px] font-black tracking-widest text-brand/70 uppercase">Live</span>
                  </div>
                </div>

                {/* Score ring */}
                <div className="flex flex-col items-center px-5 py-8 border-b border-foreground/[0.05]">
                  <div className="relative w-32 h-32">
                    <svg viewBox="0 0 128 128" className="w-full h-full -rotate-[108deg]">
                      <circle cx="64" cy="64" r="52" fill="none" stroke="currentColor" className="text-foreground/[0.05]" strokeWidth="6" strokeLinecap="round" />
                      <circle
                        cx="64" cy="64" r="52" fill="none" stroke="hsl(186,90%,52%)" strokeWidth="6" strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 52 * 0.84} ${2 * Math.PI * 52 * 0.16}`}
                        style={{ filter: 'drop-shadow(0 0 8px hsla(186,90%,52%,0.5))' }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-black text-brand tabular-nums">84</span>
                      <span className="text-[8px] font-black tracking-widest text-foreground/30 uppercase">Score</span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/8 border border-emerald-500/20">
                    <CheckCircle2 className="size-3 text-emerald-400" />
                    <span className="text-[9px] font-black tracking-widest text-emerald-400 uppercase">Authentic Photo</span>
                  </div>
                </div>

                {/* Signal bars */}
                <div className="px-5 py-5 space-y-3.5">
                  {[
                    { label: 'Neural AI Detection', value: 12, color: '#10b981' },
                    { label: 'ELA Forensics', value: 22, color: '#10b981' },
                    { label: 'Metadata Integrity', value: 91, color: '#10b981' },
                  ].map((sig, i) => (
                    <div key={i}>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-[9px] font-black text-foreground/30 uppercase tracking-wider">{sig.label}</span>
                        <span className="text-[9px] font-black tabular-nums" style={{ color: sig.color }}>{sig.value}</span>
                      </div>
                      <div className="h-[3px] bg-foreground/[0.05] rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${sig.value}%`, backgroundColor: sig.color, opacity: 0.75 }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Scan animation */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div className="absolute inset-x-0 h-14 bg-gradient-to-b from-transparent via-brand/[0.05] to-transparent animate-scanline" />
                </div>

                {/* Corner brackets */}
                <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-brand/30" />
                <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-brand/30" />
                <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-brand/30" />
                <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-brand/30" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
