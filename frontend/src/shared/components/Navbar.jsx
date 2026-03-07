import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/shared/components/ui/button'
import { useAuth } from '@/app/providers/AuthContext'
import { Github, Menu, X, LogOut, LayoutDashboard, History, Settings, Upload, ArrowRight } from 'lucide-react'
import { cn } from '@/shared/utils/utils'

const NAV_LINKS = [
  { label: 'How it Works', anchor: 'how-it-works' },
  { label: 'Technology', anchor: 'technology' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleAnchorClick = (anchor) => {
    setMobileMenuOpen(false)
    if (location.pathname === '/') {
      const el = document.getElementById(anchor)
      if (el) window.lenis?.scrollTo(el)
    } else {
      navigate('/')
      setTimeout(() => {
        const el = document.getElementById(anchor)
        if (el) window.lenis?.scrollTo(el)
      }, 500)
    }
  }

  const handleLogout = () => {
    logout()
    setUserMenuOpen(false)
    navigate('/')
  }

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-[100] transition-all duration-700 ease-[0.16,1,0.3,1]",
      scrolled ? "py-4 bg-background/80 backdrop-blur-md border-b border-foreground/5" : "py-8 bg-transparent"
    )}>
      <div className="max-w-[1400px] mx-auto px-12 h-20 flex items-center justify-between border-b border-foreground/5 bg-background/3 backdrop-blur-xl">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group overflow-hidden">
          <span className="text-sm font-black tracking-[0.3em] uppercase group-hover:tracking-[0.4em] transition-all duration-500">
            ShadowMode
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-12">
          {NAV_LINKS.map((link) => (
            <button
              key={link.label}
              onClick={() => handleAnchorClick(link.anchor)}
              className="text-[10px] font-bold tracking-[0.2em] text-foreground/50 hover:text-foreground transition-colors duration-300 uppercase"
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* CTAs */}
        <div className="hidden lg:flex items-center gap-8">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-4 group"
              >
                <span className="text-[10px] font-bold tracking-widest text-foreground/60 group-hover:text-foreground transition-colors uppercase">{(user.displayName || user.name || user.email || 'Agent').split('@')[0].split(' ')[0]}</span>
                <div className="size-8 rounded-full border border-foreground/10 flex items-center justify-center bg-foreground/3 group-hover:border-foreground/20 transition-all overflow-hidden">
                   <span className="text-[10px] font-bold">{(user.displayName || user.name || user.email || 'A').charAt(0).toUpperCase()}</span>
                </div>
              </button>
              
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute right-0 top-full mt-6 w-64 glass-card p-2 rounded-xl"
                  >
                    {[
                      { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
                      { icon: Upload, label: 'Analysis', to: '/analyze' },
                      { icon: History, label: 'History', to: '/history' },
                      { icon: Settings, label: 'Settings', to: '/settings' },
                    ].map(item => (
                      <Link
                        key={item.label}
                        to={item.to}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-[11px] font-medium text-foreground/60 hover:text-foreground hover:bg-foreground/3 rounded-lg transition-all"
                      >
                        <item.icon className="size-3.5" />
                        {item.label}
                      </Link>
                    ))}
                    <div className="h-px bg-foreground/5 my-2 mx-2" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-medium text-destructive hover:bg-destructive/5 rounded-lg transition-all"
                    >
                      <LogOut className="size-3.5" />
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <Link 
                to="/login" 
                className="px-6 py-2.5 rounded-full text-[10px] font-black tracking-widest uppercase text-foreground/40 hover:text-foreground hover:bg-foreground/3 transition-all"
              >
                Log In
              </Link>
              <Link 
                to="/signup" 
                className="px-6 py-2.5 rounded-full bg-foreground text-background text-[10px] font-black tracking-widest uppercase transition-all hover:scale-105 active:scale-95"
              >
                Start Detect
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="lg:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[-1] bg-background flex flex-col p-8 pt-32 gap-12"
          >
            <div className="flex flex-col gap-8">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.label}
                  onClick={() => handleAnchorClick(link.anchor)}
                  className="text-4xl font-black tracking-tighter text-foreground hover:text-foreground/60 transition-colors uppercase text-left"
                >
                  {link.label}
                </button>
              ))}
            </div>
            
            <div className="mt-auto flex flex-col gap-4">
              {user ? (
                 <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                   <Button className="w-full h-14 rounded-full bg-foreground text-background font-bold text-sm tracking-widest">DASHBOARD</Button>
                 </Link>
              ) : (
                <>
                  <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full h-14 rounded-full bg-foreground text-background font-bold text-sm tracking-widest">GET STARTED</Button>
                  </Link>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full h-14 rounded-full border-foreground/10 font-bold text-sm tracking-widest uppercase">Login</Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
