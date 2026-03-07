import { useRef } from 'react'
import { motion } from 'framer-motion'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Cpu, GitBranch, Layers3, Network, Microscope, Database, Code2 } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const TECH_LAYERS = [
  {
    layer: '01',
    title: 'Neural Ensemble',
    tag: 'AI Verification',
    description: 'A dual-model local processing sequence combining umm-maybe and Deep-Fake-Detector-v2. Our system parses probabilistic artifacts from different neural architectures to ensure high-confidence cross-verification.',
    icon: Network,
    details: ['Model Cross-Verification', 'Synthetic Pattern Detection']
  },
  {
    layer: '02',
    title: 'Metadata Forensic',
    tag: 'Signal Extraction',
    description: 'Automated inspection of EXIF, IPTC, and XMP metadata chains. Identifying discrepancies in device-specific quantization tables and software-injected signature packets.',
    icon: Microscope,
    details: ['Camera Signature Verification', 'Software Modification Trace']
  },
  {
    layer: '03',
    title: 'Forensic Signals',
    tag: 'Anomaly Mapping',
    description: 'Analyzing physical image properties through Error Level Analysis (ELA) and compression artifact mapping. Identifying localized manipulation by detecting pixel-group inconsistencies.',
    icon: Layers3,
    details: ['Structural Anomaly Detection', 'Compression Consistency Check']
  }
]

export default function TechnologySection() {
  const containerRef = useRef(null)

  useGSAP(() => {
    const lines = gsap.utils.toArray('.tech-line')
    lines.forEach(line => {
      gsap.fromTo(line,
        { scaleX: 0, transformOrigin: 'left center' },
        {
          scaleX: 1,
          duration: 1.5,
          ease: 'expo.out',
          scrollTrigger: { trigger: line, start: 'top 90%', toggleActions: 'play none none reverse' }
        }
      )
    })
    return () => ScrollTrigger.getAll().forEach(t => t.kill())
  }, { scope: containerRef })

  return (
    <section id="technology" ref={containerRef} className="py-60 relative bg-background overflow-hidden">
      <div className="absolute inset-0 bg-grid-minimal opacity-2" />
      
      <div className="container mx-auto px-12 relative z-10 max-w-7xl">
        <div className="max-w-3xl mb-40">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px w-12 bg-brand/40" />
            <span className="text-[10px] font-black tracking-[0.4em] uppercase text-brand/70">Technical Specifications</span>
          </div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: 'expo.out' }}
            className="text-8xl md:text-[10vw] font-black tracking-tighter text-foreground leading-[0.8] uppercase"
          >
            The <br />
            <span className="font-serif italic font-light lowercase text-foreground/20">Science.</span>
          </motion.h2>
          
          <p className="mt-16 text-xl text-foreground/40 font-medium leading-relaxed max-w-xl">
            ShadowMode utilizes a multi-vector forensic pipeline to validate image integrity across the spectral and metadata domains.
          </p>
        </div>

        <div className="space-y-0">
          {TECH_LAYERS.map((tech, i) => (
            <div key={i} className="group border-t border-foreground/5 relative overflow-hidden">
              <div className="tech-line absolute top-0 left-0 h-px bg-brand/30 w-full" />
              
              <div className="grid grid-cols-1 lg:grid-cols-[120px_1fr_auto] gap-20 py-24 px-8 hover:bg-foreground/1 transition-all duration-700 cursor-default">
                <span className="text-5xl font-black text-brand/10 group-hover:text-brand/25 transition-colors tabular-nums">{tech.layer}</span>

                <div className="max-w-3xl">
                  <div className="flex flex-col gap-4 mb-10">
                    <span className="text-[10px] font-black tracking-widest text-brand/60 uppercase">{tech.tag}</span>
                    <h3 className="text-4xl md:text-6xl font-black text-foreground tracking-tighter uppercase group-hover:translate-x-4 transition-transform duration-700 ease-expo">{tech.title}</h3>
                  </div>
                  <p className="text-foreground/40 text-lg font-medium leading-relaxed mb-10">{tech.description}</p>
                  
                  <div className="flex gap-4">
                    {tech.details.map((detail, idx) => (
                      <span key={idx} className="px-4 py-2 rounded-full border border-brand/15 bg-brand/[0.04] text-[9px] font-bold tracking-widest text-brand/60 uppercase">
                        {detail}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex lg:flex-col justify-center items-end h-full py-4 opacity-20 group-hover:opacity-60 transition-opacity duration-700">
                  <tech.icon className="size-16 stroke-[0.5]" />
                </div>
              </div>
            </div>
          ))}
          <div className="tech-line h-px bg-foreground/20 w-full" />
        </div>

        {/* Technical Capabilities Grid */}
        <div className="mt-60 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-foreground/5 border border-foreground/5 rounded-4xl overflow-hidden shadow-2-xl">
          {[
            { icon: Network, label: 'Model Ensemble', sub: 'Neural Verification' },
            { icon: GitBranch, label: 'Metadata', sub: 'EXIF/IPTC Validation' },
            { icon: Database, label: 'Firebase', sub: 'Secure Persistence' },
            { icon: Code2, label: 'ImageKit', sub: 'Low-Loss Storage' },
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="p-16 bg-background flex flex-col items-center text-center group hover:bg-foreground/1 transition-all"
            >
              <item.icon className="size-8 text-foreground/20 group-hover:text-foreground mb-10 transition-colors stroke-[1.5]" />
              <div className="space-y-3">
                <p className="text-[10px] font-black tracking-[0.3em] text-foreground uppercase">{item.label}</p>
                <div className="h-px w-4 bg-foreground/10 mx-auto" />
                <p className="text-[9px] font-bold tracking-widest text-foreground/30 uppercase">{item.sub}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ShieldCheck(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}
