import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
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
      <div className="absolute inset-0 bg-linear-to-b from-background via-transparent to-background pointer-events-none opacity-50" />
      <div className="absolute inset-0 bg-linear-to-r from-background via-transparent to-background pointer-events-none opacity-50" />

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-grid-minimal opacity-2 pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10 text-center">
        <div className="hero-tag inline-flex items-center gap-3 px-4 py-2 rounded-full border border-foreground/5 bg-foreground/2 text-[10px] font-bold tracking-[0.3em] font-sans uppercase mb-12">
          <Fingerprint className="size-3 opacity-40" />
          Advanced Image Forensics
        </div>

        <div className="max-w-6xl mx-auto mb-16">
          <h1 ref={titleRef} className="hero-title text-7xl md:text-[13vw] font-black leading-[0.85] tracking-[-0.04em] uppercase mb-12 overflow-hidden">
            <span className="block italic font-serif lowercase tracking-normal bg-clip-text text-transparent bg-linear-to-b from-foreground to-foreground/40">the</span>
            <span className="block">Unseen</span>
            <span className="block">Truth.</span>
          </h1>

          <p ref={subRef} className="hero-sub text-lg md:text-2xl text-foreground/40 font-medium max-w-2xl mx-auto leading-relaxed mb-16">
            Identify synthetic patterns and hidden metadata in digital media. ShadowMode provides definitive proof of AI generation and manipulation.
          </p>
        </div>

        <div ref={ctaRef} className="hero-cta flex flex-col sm:flex-row items-center justify-center gap-12">
          <Button 
            size="lg" 
            onClick={handleAnalyzeClick}
            className="h-16 px-12 rounded-full bg-foreground text-background font-bold text-xs tracking-[0.2em] transition-all hover:scale-105 active:scale-95 group uppercase"
          >
            Start Analysis
            <ArrowRight className="ml-3 font-bold transition-transform group-hover:translate-x-1" />
          </Button>
          
          <button 
            onClick={scrollToHowItWorks}
            className="text-[10px] font-bold tracking-[0.2em] text-foreground/40 hover:text-foreground transition-all uppercase underline underline-offset-8 decoration-foreground/10 hover:decoration-foreground"
          >
            How it works
          </button>
        </div>

        {/* Minimal Stats */}
        <div className="mt-40 grid grid-cols-2 lg:grid-cols-4 gap-12 max-w-5xl mx-auto pt-16 border-t border-foreground/5">
          {[
            { label: 'Detection Accuracy', val: '99.8%', icon: ShieldCheck },
            { label: 'Neural Processing', val: '0.8ms', icon: Cpu },
            { label: 'Validation Layers', val: '24+', icon: Fingerprint },
            { label: 'Verified Samples', val: '4M+', icon: ShieldCheck },
          ].map((stat, i) => (
            <div key={i} className="hero-stat flex flex-col items-center lg:items-start text-center lg:text-left gap-2">
              <span className="text-[9px] font-black text-foreground/20 tracking-[0.2em] uppercase">{stat.label}</span>
              <span className="text-3xl font-black tabular-nums">{stat.val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Subtle bottom gradient */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-linear-to-t from-background to-transparent pointer-events-none" />
    </section>
  )
}
