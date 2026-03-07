import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/shared/components/ui/button'
import { ArrowRight, Globe, ShieldCheck, Sparkles } from 'lucide-react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function CtaSection() {
  const sectionRef = useRef(null)

  useGSAP(() => {
    gsap.fromTo('.cta-headline span',
      { y: '105%' },
      {
        y: 0, duration: 1.6, stagger: 0.1, ease: 'expo.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
      }
    )
    gsap.fromTo('.cta-fade',
      { opacity: 0, y: 20 },
      {
        opacity: 1, y: 0, duration: 1.2, stagger: 0.12, ease: 'expo.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' },
      }
    )
    return () => ScrollTrigger.getAll().forEach(t => t.kill())
  }, { scope: sectionRef })

  return (
    <section ref={sectionRef} className="py-60 relative bg-background overflow-hidden selection:bg-foreground selection:text-background">
      <div className="absolute inset-0 bg-grid-minimal opacity-[0.02]" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand/20 to-transparent" />
      <div className="absolute inset-0 bg-radial-brand opacity-[0.03]" />

      <div className="container mx-auto px-6 max-w-5xl relative z-10 text-center">
        <div className="cta-fade inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand/20 bg-brand/[0.05] mb-12">
          <div className="size-1 rounded-full bg-brand animate-pulse" />
          <span className="text-[9px] font-black tracking-[0.25em] text-brand/80 uppercase">The Final Step</span>
        </div>

        <h2 className="cta-headline mb-16 leading-[0.82] tracking-tighter">
          {[
            { text: 'Verify the', serif: false },
            { text: 'Truth.', serif: true },
          ].map((line, i) => (
            <div key={i} className="overflow-hidden block">
              <span className={`block ${line.serif ? 'text-7xl md:text-[10vw] font-serif italic font-light lowercase text-foreground/20' : 'text-7xl md:text-[10vw] font-black text-foreground uppercase'}`}>
                {line.text}
              </span>
            </div>
          ))}
        </h2>

        <p className="cta-fade text-lg text-foreground/40 max-w-lg mx-auto mb-14 leading-relaxed">
          Leverage neural ensemble analysis and forensic signal extraction to verify any image in seconds.
        </p>

        <div className="cta-fade flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link to="/signup">
            <Button className="h-14 px-12 rounded-2xl bg-brand text-background font-black text-[10px] tracking-[0.2em] uppercase hover:opacity-90 hover:shadow-[0_4px_32px_hsla(186,90%,52%,0.4)] active:scale-[0.98] transition-all group">
              Get Started Free
              <ArrowRight className="ml-3 size-3.5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link to="/login" className="text-[10px] font-black tracking-[0.2em] text-foreground/35 hover:text-foreground transition-all uppercase underline underline-offset-8 decoration-foreground/10 hover:decoration-foreground/30">
            Already have an account
          </Link>
        </div>

        <div className="cta-fade mt-20 pt-16 border-t border-foreground/[0.04] flex flex-wrap justify-center gap-12 opacity-30">
          {[
            { icon: Globe, label: 'Global Standard' },
            { icon: ShieldCheck, label: 'Secure Pipeline' },
            { icon: Sparkles, label: 'Neural Verified' },
          ].map((item, i) => {
            const Icon = item.icon
            return (
              <div key={i} className="flex items-center gap-3">
                <Icon className="size-4" />
                <span className="text-[10px] font-black tracking-widest uppercase">{item.label}</span>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}



