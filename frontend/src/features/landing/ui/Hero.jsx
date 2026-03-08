import { useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/app/providers/AuthContext'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { Button } from '@/shared/components/ui/button'
import { ArrowRight, FileSearch, Brain, Layers } from 'lucide-react'

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
      .fromTo('.hero-card', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 1, stagger: 0.18 }, '<0.6')

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


          </div>

          {/* Right: Analysis methods */}
          <div className="hero-panel flex items-center justify-center lg:justify-end">
            <div className="w-full max-w-[360px] flex flex-col gap-3">
              {[
                {
                  Icon: FileSearch,
                  title: 'ELA Forensics',
                  desc: 'Detects pixel-level inconsistencies from editing or re-compression by analysing error levels across the image.',
                },
                {
                  Icon: Brain,
                  title: 'Neural AI Detection',
                  desc: 'Identifies generative fingerprints left by GANs, diffusion models, and other image synthesis systems.',
                },
                {
                  Icon: Layers,
                  title: 'Metadata Integrity',
                  desc: 'Parses EXIF and file headers for signs of software manipulation, timestamp forgery, or data stripping.',
                },
              ].map(({ Icon, title, desc }, i) => (
                <div key={i} className="hero-card flex items-start gap-4 p-4 rounded-xl border border-foreground/[0.07] bg-foreground/[0.02]">
                  <div className="mt-0.5 p-2 rounded-lg bg-brand/[0.08] border border-brand/15 shrink-0">
                    <Icon className="size-4 text-brand/70" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black tracking-[0.18em] text-brand/80 uppercase mb-1">{title}</p>
                    <p className="text-[11px] text-foreground/35 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
