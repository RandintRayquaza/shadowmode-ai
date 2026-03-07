import { Link } from "react-router-dom"
import { ArrowUp, ScanSearch, Twitter, Github, Linkedin, ArrowUpRight } from "lucide-react"


export default function Footer() {
  const scrollToTop = () => {
    window.lenis?.scrollTo(0)
  }

  return (
    <footer className="bg-background border-t border-foreground/5 py-24 pb-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-24">
          <div className="col-span-1 md:col-span-2">
            <div className="flex flex-col gap-6">
              <span className="text-sm font-black tracking-[0.3em] uppercase">ShadowMode</span>
              <p className="text-foreground/40 text-sm max-w-sm leading-relaxed font-medium">
                Advanced image forensics powered by AI. We help you see through manipulation 
                and verify the authenticity of digital content in an era of deepfakes.
              </p>
            </div>
          </div>
          
          <div>
            <h4 className="text-[10px] font-bold tracking-widest uppercase text-foreground/30 mb-8">Navigation</h4>
            <ul className="space-y-4">
              {[
                { label: 'Technology', href: '/#technology' },
                { label: 'How It Works', href: '/#how-it-works' },
                { label: 'Platform', href: '/signup' },
              ].map(link => (
                <li key={link.label}>
                  <Link 
                    to={link.href} 
                    className="text-sm font-medium text-foreground/60 hover:text-foreground transition-colors flex items-center group/link"
                  >
                    {link.label}
                    <ArrowUpRight className="ml-1 size-3 opacity-0 group-hover/link:opacity-100 transition-all -translate-y-1" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-bold tracking-widest uppercase text-foreground/30 mb-8">Social</h4>
            <div className="flex flex-col gap-4">
               {[
                 { icon: Twitter, label: 'Twitter', href: '#' },
                 { icon: Github, label: 'Github', href: '#' },
                 { icon: Linkedin, label: 'LinkedIn', href: '#' },
               ].map(social => (
                 <a 
                   key={social.label}
                   href={social.href} 
                   className="text-sm font-medium text-foreground/60 hover:text-foreground transition-colors flex items-center group/social"
                 >
                   {social.label}
                   <social.icon className="ml-2 size-3 opacity-0 group-hover/social:opacity-100 transition-all" />
                 </a>
               ))}
            </div>
          </div>
        </div>
        
        <div className="pt-12 border-t border-foreground/5 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <p className="text-[10px] font-bold tracking-widest text-foreground/20 uppercase">© 2026 SHADOWMODE AI</p>
            <div className="flex gap-6">
              <a href="#" className="text-[10px] font-bold tracking-widest text-foreground/20 hover:text-foreground transition-colors uppercase">Privacy</a>
              <a href="#" className="text-[10px] font-bold tracking-widest text-foreground/20 hover:text-foreground transition-colors uppercase">Terms</a>
            </div>
          </div>
          
          <button 
            onClick={scrollToTop}
            className="text-[10px] font-bold tracking-widest text-foreground/40 hover:text-foreground transition-colors uppercase flex items-center gap-2 group"
          >
            Back to Top
            <div className="size-8 rounded-full border border-foreground/10 flex items-center justify-center group-hover:border-foreground/30 transition-all">
              <ArrowUpRight className="size-3 -rotate-45" />
            </div>
          </button>
        </div>
      </div>
    </footer>
  )
}
