import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Brain, Search, Layers, Activity } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const FEATURES = [
  {
    num: '01',
    title: 'Neural AI Detection',
    desc: 'Dual-model ensemble identifies generation markers from DALL-E, Midjourney, and Stable Diffusion with sub-2s local processing.',
    icon: Brain,
    accentFrom: 'from-purple-500/15',
    iconColor: 'text-purple-400',
  },
  {
    num: '02',
    title: 'Metadata Forensics',
    desc: 'Deep EXIF, IPTC, and XMP signal extraction reveals device signatures, capture timestamps, and software modification traces.',
    icon: Search,
    accentFrom: 'from-brand/15',
    iconColor: 'text-brand',
  },
  {
    num: '03',
    title: 'Error Level Analysis',
    desc: 'Pixel-level ELA mapping surfaces structural inconsistencies and localized compression artifacts indicating manual editing.',
    icon: Layers,
    accentFrom: 'from-amber-500/15',
    iconColor: 'text-amber-400',
  },
  {
    num: '04',
    title: 'Authenticity Score',
    desc: 'Weighted multi-signal aggregation delivers a single trust metric with confidence bounds and per-signal breakdown.',
    icon: Activity,
    accentFrom: 'from-emerald-500/15',
    iconColor: 'text-emerald-400',
  },
]

export default function Features() {
  const sectionRef = useRef(null)

  useGSAP(() => {
    gsap.fromTo('.features-heading',
      { opacity: 0, y: 30 },
      {
        opacity: 1, y: 0, duration: 1.4, ease: 'expo.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
      }
    )
    gsap.utils.toArray('.feat-card').forEach((card, i) => {
      gsap.fromTo(card,
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 1.2, ease: 'expo.out',
          delay: i * 0.06,
          scrollTrigger: { trigger: card, start: 'top 90%', toggleActions: 'play none none reverse' },
        }
      )
    })
    return () => ScrollTrigger.getAll().forEach(t => t.kill())
  }, { scope: sectionRef })

  return (
    <section ref={sectionRef} id="features" className="py-48 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-minimal opacity-[0.02]" />

      <div className="container mx-auto px-6 md:px-12 max-w-7xl relative z-10">
        {/* Heading */}
        <div className="features-heading max-w-2xl mb-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px w-8 bg-brand/40" />
            <span className="text-[10px] font-black tracking-[0.3em] text-brand/70 uppercase">Capabilities</span>
          </div>
          <h2 className="text-6xl md:text-[7vw] font-black tracking-tighter text-foreground leading-[0.85] uppercase mb-6">
            Forensic<br />
            <span className="font-serif italic font-light lowercase text-foreground/20">Intelligence.</span>
          </h2>
          <p className="text-base text-foreground/40 leading-relaxed max-w-sm">
            A unified pipeline decoding authenticity across every signal layer.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-foreground/[0.06] overflow-hidden rounded-2xl">
          {FEATURES.map((f, i) => {
            const Icon = f.icon
            return (
              <div key={i} className="feat-card group relative bg-background p-8 hover:bg-foreground/[0.02] transition-all duration-500 cursor-default overflow-hidden">
                {/* Top accent */}
                <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${f.accentFrom} to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left`} />
                {/* Bottom accent */}
                <div className={`absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r ${f.accentFrom} to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-right`} />

                <div className="flex items-start justify-between mb-8">
                  <span className="text-5xl font-black text-foreground/[0.05] tabular-nums group-hover:text-foreground/[0.09] transition-colors duration-500">{f.num}</span>
                  <div className="size-10 rounded-xl bg-foreground/[0.04] flex items-center justify-center group-hover:bg-foreground/[0.07] transition-all">
                    <Icon className={`size-4 ${f.iconColor}`} />
                  </div>
                </div>

                <h3 className="text-sm font-black tracking-tight text-foreground uppercase mb-3">{f.title}</h3>
                <p className="text-sm text-foreground/35 leading-relaxed">{f.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
