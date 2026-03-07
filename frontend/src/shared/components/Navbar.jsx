import { useState, useEffect } from 'react'
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/shared/components/ui/button'
import { useAuth } from '@/app/providers/AuthContext'
import { Menu, X, LogOut, LayoutDashboard, History, Settings, Upload, ScanSearch } from 'lucide-react'
import { cn } from '@/shared/utils/utils'

const NAV_LINKS = [
  { label: 'How it Works', anchor: 'how-it-works' },
  { label: 'Technology', anchor: 'technology' },
  { label: 'Features', anchor: 'features' },
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

  const handleLinkClick = (link) => {
    setMobileMenuOpen(false)
    if (link.anchor) {
      if (location.pathname === '/') {
        const el = document.getElementById(link.anchor)
        if (el) window.lenis?.scrollTo(el)
      } else {
        navigate('/')
        setTimeout(() => {
          const el = document.getElementById(link.anchor)
          if (el) window.lenis?.scrollTo(el)
        }, 500)
      }
    } else if (link.to) {
      navigate(link.to)
      window.scrollTo(0, 0)
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
      scrolled ? "py-3" : "py-6"
    )}>
      <div className={cn(
        "max-w-[1400px] mx-auto px-6 md:px-10 h-14 flex items-center justify-between transition-all duration-700",
        scrolled
          ? "bg-background/70 backdrop-blur-2xl border border-foreground/8 rounded-2xl mx-4 md:mx-8 shadow-[0_8px_40px_rgba(0,0,0,0.4)]"
          : "bg-transparent"
      )}>
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="size-8 rounded-xl bg-brand/15 border border-brand/30 flex items-center justify-center group-hover:bg-brand/20 transition-all duration-300">
            <ScanSearch className="size-4 text-brand" />
          </div>
          <span className="text-sm font-black tracking-tighter text-foreground uppercase">ShadowMode</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-10">
          {NAV_LINKS.map((link) => (
            <button
              key={link.label}
              onClick={() => handleLinkClick(link)}
              className="text-[10px] font-black tracking-[0.2em] text-foreground/35 hover:text-foreground transition-all duration-300 uppercase relative group"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-foreground transition-all duration-300 group-hover:w-full" />
            </button>
          ))}
        </div>

        {/* CTAs */}
        <div className="hidden lg:flex items-center gap-6">
          {user ? (
            <div className="flex items-center gap-6">
              <Link to="/dashboard" className="text-[10px] font-black tracking-widest text-foreground/40 hover:text-foreground uppercase transition-colors">
                Dashboard
              </Link>
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-3 group"
                >
                  <div className="size-9 rounded-full border border-foreground/10 flex items-center justify-center bg-foreground/3 group-hover:border-foreground/20 transition-all overflow-hidden relative">
                    <span className="text-[11px] font-black">{(user.displayName || user.name || user.email || 'A').charAt(0).toUpperCase()}</span>
                  </div>
                </button>
                
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute right-0 top-full mt-4 w-64 glass-card p-2 rounded-2xl z-110"
                    >
                      <div className="px-4 py-3 border-b border-foreground/5 mb-1">
                        <p className="text-[10px] font-black tracking-widest text-foreground/40 uppercase">Account</p>
                        <p className="text-[11px] font-bold text-foreground truncate mt-1">{user.email}</p>
                      </div>
                      {[
                        { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
                        { icon: Upload, label: 'New Analysis', to: '/analyze' },
                        { icon: History, label: 'History', to: '/history' },
                        { icon: Settings, label: 'Settings', to: '/settings' },
                      ].map(item => (
                        <Link
                          key={item.label}
                          to={item.to}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-[11px] font-bold text-foreground/60 hover:text-foreground hover:bg-foreground/3 rounded-xl transition-all"
                        >
                          <item.icon className="size-3.5" />
                          {item.label}
                        </Link>
                      ))}
                      <div className="h-px bg-foreground/5 my-2 mx-2" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-bold text-destructive hover:bg-destructive/5 rounded-xl transition-all"
                      >
                        <LogOut className="size-3.5" />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-[10px] font-black tracking-widest uppercase text-foreground/40 hover:text-foreground transition-colors">
                Sign In
              </Link>
              <Link to="/signup">
                <Button className="h-9 px-5 rounded-xl bg-brand text-background text-[10px] font-black tracking-[0.15em] uppercase hover:opacity-90 hover:shadow-[0_4px_16px_hsla(186,90%,52%,0.35)] active:scale-[0.97] transition-all">
                  Get Started
                </Button>
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
                  onClick={() => handleLinkClick(link)}
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
