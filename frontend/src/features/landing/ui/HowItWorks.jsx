import { useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { Upload, Cpu, BarChart3, Fingerprint } from 'lucide-react'
import { Link } from 'react-router-dom'

gsap.registerPlugin(ScrollTrigger)

const steps = [
  {
    title: "Upload Image",
    desc: "Secure ingestion into our processing sandbox. The system prepares the file for immediate forensic and neural analysis.",
    icon: Upload
  },
  {
    title: "Neural Analysis",
    desc: "Parallel scan using ensemble local AI models to detect synthetic generative markers and deepfake signatures.",
    icon: Cpu
  },
  {
    title: "Forensic Integrity",
    desc: "Deep inspection of error levels (ELA), compression consistency, and noise distributions to detect manual edits.",
    icon: BarChart3
  }
]

export default function HowItWorks() {
  const sectionRef = useRef(null)
  const triggerRef = useRef(null)

  useGSAP(() => {
    const section = sectionRef.current
    const totalWidth = section.scrollWidth - window.innerWidth
    
    if (totalWidth <= 0) return

    gsap.to(section, {
      x: -totalWidth,
      ease: "none",
      scrollTrigger: {
        trigger: triggerRef.current,
        start: "top top",
        end: `+=${totalWidth}`,
        pin: true,
        scrub: 1.2,
      }
    })

    return () => ScrollTrigger.getAll().forEach(t => t.kill())
  }, { scope: triggerRef })

  return (
    <div id="how-it-works" ref={triggerRef} className="bg-background overflow-hidden border-y border-foreground/5">
      <div 
        ref={sectionRef} 
        className="flex h-screen items-center px-[10vw]"
        style={{ width: `fit-content` }} 
      >
        <div className="flex-shrink-0 w-[40vw] pr-20">
           <span className="text-[10px] font-black tracking-[0.4em] mb-8 block uppercase text-foreground/40">The Methodology</span>
           <h2 className="text-7xl md:text-[8vw] font-black text-foreground leading-[0.85] mb-12 uppercase tracking-tighter">
             How it <br />
             <span className="font-serif italic font-light lowercase text-foreground/20">works.</span>
           </h2>
           <p className="text-xl text-foreground/40 font-medium max-w-sm leading-relaxed">
             A high-speed forensic pipeline designed for the age of synthetic media. Scroll to observe the process.
           </p>
        </div>

        {steps.map((step, i) => (
          <div key={i} className="flex-shrink-0 w-[50vw] px-12">
            <div className="relative h-[60vh] border border-foreground/5 bg-foreground/1 rounded-4xl p-20 flex flex-col justify-between group overflow-hidden transition-all duration-1000 shadow-2-xl">
               {/* Background detail */}
               <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
                  <step.icon size={240} className="stroke-[0.5]" />
               </div>
               
               <div className="relative z-10">
                 <span className="text-8xl font-black text-foreground/5 mb-10 block tabular-nums">0{i + 1}</span>
                 <h3 className="text-5xl md:text-6xl font-black text-foreground mb-10 tracking-tighter uppercase">{step.title}</h3>
                 <p className="text-xl text-foreground/40 font-medium leading-relaxed max-w-md">{step.desc}</p>
               </div>

               <div className="relative z-10 flex items-center justify-between pt-10 border-t border-foreground/5">
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded-full border border-foreground/10 flex items-center justify-center">
                       <Fingerprint className="size-4 opacity-40" />
                    </div>
                    <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-foreground/30">Protocol Active</span>
                  </div>
                  <span className="text-[10px] font-black tracking-widest uppercase text-foreground/60">Core_Vector_0{i + 1}</span>
               </div>
            </div>
          </div>
        ))}
        
        {/* End padding */}
        <div className="flex-shrink-0 w-[20vw]" />
      </div>
    </div>
  )
}
