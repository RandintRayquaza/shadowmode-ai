import { useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/app/providers/AuthContext'
import gsap from 'gsap'
import { Button } from '@/shared/components/ui/button'
import { ArrowRight, ShieldCheck, Cpu, Fingerprint } from 'lucide-react'

export default function Hero() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const containerRef = useRef(null)
  const titleRef = useRef(null)
  const subRef = useRef(null)
  const ctaRef = useRef(null)

  const handleAnalyzeClick = () => {
    if (user) {
      navigate('/analyze')
    } else {
      const el = document.getElementById('upload-section')
      if (el) window.lenis?.scrollTo(el)
    }
  }

  const scrollToHowItWorks = () => {
    const el = document.getElementById('how-it-works')
    if (el) window.lenis?.scrollTo(el)
  }

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })

      tl.fromTo('.hero-tag', 
        { opacity: 0, y: 20 }, 
        { opacity: 1, y: 0, duration: 1.5, delay: 0.5 }
      )
      .fromTo('.hero-title span',
        { y: '100%' },
        { y: 0, duration: 1.8, stagger: 0.1 },
        '<0.2'
      )
      .fromTo('.hero-sub',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1.5 },
        '<0.5'
      )
      .fromTo('.hero-cta',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1.5 },
        '<0.4'
      )
      .fromTo('.hero-stat',
        { opacity: 0, y : 20, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 2, stagger: 0.2 },
        '<0.6'
      )
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={containerRef} className="relative min-h-screen flex items-center justify-center pt-32 pb-20 overflow-hidden bg-background">
      {/* Refined Background Elements */}
      <div className="absolute inset-0 bg-mesh opacity-20 pointer-events-none" />
      <div className="absolute inset-0 bg-linear-to-b from-background via-transparent to-background pointer-events-none opacity-50" />
      <div className="absolute inset-0 bg-linear-to-r from-background via-transparent to-background pointer-events-none opacity-50" />
      
      {/* Forensic Asset Enhancement */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none overflow-hidden">
        <img src="/Digital Grid Wave 2.png" alt="" className="w-full h-full object-cover scale-110" />
      </div>

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-grid-minimal opacity-5 pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10 text-center">
        <div className="hero-tag inline-flex items-center gap-3 px-4 py-2 rounded-full border border-foreground/8 bg-foreground/2 text-[10px] font-bold tracking-[0.3em] font-sans uppercase mb-12">
          <Fingerprint className="size-3 opacity-40 text-primary" />
          The Forensic Standard
        </div>

        <div className="max-w-6xl mx-auto mb-16">
          <h1 ref={titleRef} className="hero-title text-7xl md:text-[11vw] font-black leading-[0.85] tracking-[-0.04em] uppercase mb-12 overflow-hidden">
            <span className="block text-gradient">Detect AI.</span>
            <span className="block italic font-serif lowercase tracking-normal">Instantly.</span>
          </h1>

          <p ref={subRef} className="hero-sub text-lg md:text-xl text-foreground/40 font-medium max-w-2xl mx-auto leading-relaxed mb-16">
            ShadowMode analyzes digital media using multi-layer AI detection and advanced forensic signals to provide definitive proof of authenticity.
          </p>
        </div>

        <div ref={ctaRef} className="hero-cta flex flex-col sm:flex-row items-center justify-center gap-10">
          {user ? (
            <Button 
              size="lg" 
              onClick={() => navigate('/dashboard')}
              className="h-16 px-12 rounded-full bg-foreground text-background font-black text-[10px] tracking-[0.2em] transition-all hover:scale-105 active:scale-95 group uppercase shadow-2xl"
            >
              GO TO DASHBOARD
              <ArrowRight className="ml-3 font-bold transition-transform group-hover:translate-x-1" />
            </Button>
          ) : (
             <div className="flex flex-col sm:flex-row items-center gap-8">
                <Button 
                  size="lg" 
                  onClick={handleAnalyzeClick}
                  className="h-16 px-12 rounded-full bg-foreground text-background font-black text-[10px] tracking-[0.2em] transition-all hover:scale-105 active:scale-95 group uppercase shadow-2xl"
                >
                  START DETECTION
                  <ArrowRight className="ml-3 font-bold transition-transform group-hover:translate-x-1" />
                </Button>
                <Link to="/login" className="text-[10px] font-black tracking-widest text-foreground/40 hover:text-foreground transition-colors uppercase">
                  Log in to your account
                </Link>
             </div>
          )}
        </div>

        {/* Minimal Stats Removed as per USER_REQUEST to avoid fake data */}
        <div className="mt-20 pt-16 border-t border-foreground/5 opacity-20">
            <p className="text-[10px] font-black tracking-[0.4em] uppercase text-center flex items-center justify-center gap-4">
              <ShieldCheck className="size-3" />
              Neural Forensic Infrastructure // v2.4.0_STABLE
              <Cpu className="size-3" />
            </p>
        </div>
      </div>

      {/* Subtle bottom gradient */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-linear-to-t from-background to-transparent pointer-events-none" />
    </section>
  )
}
