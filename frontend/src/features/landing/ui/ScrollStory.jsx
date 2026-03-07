import { useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { motion } from 'framer-motion'
import { Brain, Search, Layers, ArrowRight, Activity } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const stories = [
  {
    title: "AI Detection",
    tag: "Neural Model Ensemble",
    description: "Utilizing a dual-model processing sequence to analyze images for generative patterns. Our system identifies markers from DALL-E, Midjourney, and Stable Diffusion models using local cross-verification.",
    icon: Brain,
    image: "/AI Analysis Interface 3.png"
  },
  {
    title: "Metadata Trace",
    tag: "EXIF Inspection",
    description: "Deep inspection of embedded image metadata. We extract and verify camera models, capture timestamps, and software modification history to identify missing or manipulated forensic layers.",
    icon: Search,
    image: "/Data Stream Interface 1.png"
  },
  {
    title: "Structural Flux",
    tag: "Anomaly Detection",
    description: "Analyzing compression artifacts and structural inconsistencies. Using Error Level Analysis (ELA) and pixel-level anomaly detection to highlight areas where the image structure deviates from the global baseline.",
    icon: Layers,
    image: "/Digital Grid Wave 2.png"
  }
]

export default function ScrollStory() {
  const containerRef = useRef(null)

  useGSAP(() => {
    const panels = gsap.utils.toArray('.story-panel')
    
    panels.forEach((panel, i) => {
      ScrollTrigger.create({
        trigger: panel,
        start: 'top top',
        pin: true,
        pinSpacing: false,
        onUpdate: (self) => {
          const progress = self.progress
          gsap.to(panel.querySelector('.story-content'), {
            opacity: 1 - progress * 1.5,
            y: -30 * progress,
            duration: 0.1
          })
        }
      })
    })

    return () => ScrollTrigger.getAll().forEach(t => t.kill())
  }, { scope: containerRef })

  return (
    <section id="features" ref={containerRef} className="relative bg-background">
      {stories.map((story, i) => (
        <div 
          key={i} 
          className="story-panel min-h-screen w-full flex items-center justify-center sticky top-0 bg-background overflow-hidden border-b border-foreground/5"
          style={{ zIndex: i }}
        >
          {/* Subtle Grid */}
          <div className="absolute inset-0 bg-grid-minimal opacity-2" />
          
          <div className="container mx-auto px-12 grid grid-cols-1 lg:grid-cols-2 gap-32 items-center relative z-10 story-content">
            <div className="order-2 lg:order-1 max-w-xl">
              <div className="flex items-center gap-4 mb-10">
                <div className="h-px w-8 bg-foreground/20" />
                <span className="text-[10px] font-black tracking-[0.4em] uppercase text-foreground/40">{story.tag}</span>
              </div>
              
              <h2 className="text-7xl md:text-9xl font-black text-foreground mb-12 leading-[0.8] tracking-tighter uppercase">
                {story.title.split(' ')[0]} <br />
                <span className="font-serif italic font-light text-foreground/20 lowercase tracking-normal">{story.title.split(' ').slice(1).join(' ')}</span>
              </h2>
              
              <p className="text-lg text-foreground/40 leading-relaxed font-medium mb-16 max-w-md">
                {story.description}
              </p>
              
              <button className="flex items-center gap-6 group">
                 <div className="size-14 rounded-full border border-foreground/10 flex items-center justify-center group-hover:bg-foreground group-hover:text-background transition-all duration-700 ease-expo">
                    <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
                 </div>
                 <span className="text-[10px] font-black tracking-widest uppercase py-2 border-b border-transparent group-hover:border-foreground/20 transition-all">Request Technical Documentation</span>
              </button>
            </div>

            <div className="order-1 lg:order-2">
               <div className="relative group">
                 <div className="relative aspect-16/10 rounded-4xl bg-foreground/2 overflow-hidden border border-foreground/5 shadow-2-xl">
                    <img 
                      src={story.image} 
                      alt={story.title} 
                      className="w-full h-full object-cover grayscale opacity-40 group-hover:opacity-60 transition-all duration-1000 scale-110 group-hover:scale-100" 
                    />
                    
                    {/* UI Overlay Elements */}
                    <div className="absolute top-8 left-8 flex flex-col gap-2">
                      <div className="h-px w-12 bg-foreground/20" />
                      <span className="text-[8px] font-black text-foreground/40 uppercase tracking-widest">Sig_Analysis_{story.layer || '0' + (i + 1)}</span>
                    </div>

                    <div className="absolute bottom-8 right-8 flex items-center gap-4">
                      <div className="size-2 rounded-full bg-foreground/40 animate-pulse" />
                      <span className="text-[8px] font-black text-foreground/40 uppercase tracking-widest text-right tabular-nums">SCAN_COORD: {482 + i * 12}.{912 - i * 4}</span>
                    </div>
                    
                    <div className="absolute inset-0 bg-linear-to-t from-background/20 to-transparent" />
                 </div>
               </div>
            </div>
          </div>
        </div>
      ))}
    </section>
  )
}
