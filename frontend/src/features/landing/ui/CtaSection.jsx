import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Button } from '@/shared/components/ui/button'
import { ArrowRight, Sparkles, Globe, ShieldCheck } from 'lucide-react'

export default function CtaSection() {
  return (
    <section className="py-60 relative bg-background overflow-hidden selection:bg-foreground selection:text-background">
      {/* Background kinetic elements */}
      <div className="absolute inset-0 bg-grid-minimal opacity-[0.03]" />
      <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-foreground/5 to-transparent" />
      
      <div className="container mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: 'expo.out' }}
          className="max-w-5xl mx-auto"
        >
          <span className="text-[10px] font-black tracking-[0.4em] mb-12 block uppercase text-foreground/40">The Final Step</span>
          
          <h2 className="text-7xl md:text-[10vw] font-black text-foreground mb-16 leading-[0.8] tracking-tighter uppercase">
            Secure the <br />
            <span className="font-serif italic font-light lowercase text-foreground/20">Truth.</span>
          </h2>
          
          <p className="text-xl md:text-2xl text-foreground/40 font-medium max-w-2xl mx-auto mb-20 leading-relaxed">
            Start verifying digital media authenticity today using metadata signals and neural model cross-verification.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-12">
            <Link to="/signup">
              <Button 
                size="lg" 
                className="h-16 px-16 rounded-full bg-foreground text-background font-bold text-xs tracking-[0.2em] transition-all hover:scale-105 active:scale-95 group uppercase"
              >
                Get Started
                <ArrowRight className="ml-3 font-bold transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            
            <Link to="/login" className="text-[10px] font-black tracking-[0.2em] text-foreground/40 hover:text-foreground transition-all uppercase underline underline-offset-8 decoration-foreground/10 hover:decoration-foreground">
              Sign In to Platform
            </Link>
          </div>
          
          <div className="mt-40 flex flex-wrap justify-center gap-16 opacity-30">
             {[
               { icon: Globe, label: 'Global Standard' },
               { icon: ShieldCheck, label: 'Secure Pipeline' },
               { icon: Sparkles, label: 'Verified AI' },
             ].map((item, i) => (
               <div key={i} className="flex items-center gap-4">
                  <item.icon className="size-4" />
                  <span className="text-[10px] font-black tracking-[0.2em] uppercase">{item.label}</span>
               </div>
             ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
