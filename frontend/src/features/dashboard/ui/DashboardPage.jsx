import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAuth } from '@/app/providers/AuthContext'
import Navbar from '@/shared/components/Navbar'
import { Button } from '@/shared/components/ui/button'
import {
  Upload, History, Settings, Shield, Activity, TrendingUp,
  Clock, ChevronRight, Brain, Search, Layers, AlertTriangle, CheckCircle2, Image, Loader2
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { resetDashboard } from '../state/dashboardSlice'
import { fetchDashboardData } from '../state/dashboardThunks'
import { cn } from '@/shared/utils/utils'
import ErrorBoundary from '@/shared/components/ErrorBoundary'

// Status mapping for real backend verdicts
const STATUS_CONFIG = {
  'Authentic': { color: 'text-emerald-500 dark:text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: CheckCircle2, label: 'AUTHENTIC' },
  'Possibly Edited': { color: 'text-amber-500 dark:text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: AlertTriangle, label: 'POSSIBLY EDITED' },
  'Likely Manipulated': { color: 'text-orange-500 dark:text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', icon: AlertTriangle, label: 'MANIPULATED' },
  'AI Generated': { color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/20', icon: Brain, label: 'AI GENERATED' },
  'pending': { color: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: Clock, label: 'ANALYZING' },
  'analysis_failed': { color: 'text-red-500 dark:text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: AlertTriangle, label: 'FAILED' }
}

const STATUS_FALLBACK = { color: 'text-muted-foreground', bg: 'bg-muted/50', border: 'border-border', icon: Activity, label: 'UNKNOWN' };

function ScoreRing({ score, size = 80 }) {
  const r = (size / 2) - 8
  const circ = 2 * Math.PI * r
  const displayScore = score ?? 0
  const pct = displayScore / 100
  // Backend logic: High score (near 100) = Authentic, Low score (near 0) = AI/Manipulated
  const color = displayScore >= 80 ? '#10b981' : displayScore >= 50 ? '#f59e0b' : '#ef4444'

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="currentColor" className="text-muted/30" strokeWidth="6" />
        <circle
          cx={size/2} cy={size/2} r={r} fill="none"
          stroke={color} strokeWidth="6"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct)}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease, stroke 0.5s ease' }}
        />
      </svg>
      <span className="absolute text-sm font-black" style={{ color }}>{score === null ? '--' : score}</span>
    </div>
  )
}

const CONTAINER = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } }
const ITEM = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } } }

export default function DashboardPage() {
  const { user } = useAuth()
  const dispatch = useAppDispatch()

  // Pull from Redux — never Zustand — so state resets are instant across the app
  const { recentAnalyses, isLoading, ownerUid } = useAppSelector(state => state.dashboard)

  // KEY SESSION ISOLATION: any time the logged-in user changes, wipe old data
  // and fetch fresh data that belongs to the new user.
  useEffect(() => {
    if (!user?.uid) return
    // If cached data belongs to a DIFFERENT user, clear it first
    if (ownerUid && ownerUid !== user.uid) {
      dispatch(resetDashboard())
    }
    dispatch(fetchDashboardData(user.uid))
  }, [user?.uid]) // eslint-disable-line react-hooks/exhaustive-deps

  // Prevent rendering stale cross-user data during transitions
  const safeAnalyses = ownerUid === user?.uid ? recentAnalyses : []
  const showLoading = isLoading || (user?.uid && ownerUid !== user?.uid)
  
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  // Calculate real stats from fetched data
  const authenticCount = safeAnalyses.filter(a => a.verdict === 'Authentic').length;
  const manipulatedCount = safeAnalyses.filter(a => a.verdict === 'Likely Manipulated' || a.verdict === 'Possibly Edited').length;
  const aiCount = safeAnalyses.filter(a => a.verdict === 'AI Generated').length;

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-28 pb-20">
          <div className="container mx-auto px-6 max-w-7xl">

            {/* Top Section: Header & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16 items-start">
              <motion.div
                variants={CONTAINER} initial="hidden" animate="show"
                className="lg:col-span-2"
              >
                <motion.div variants={ITEM}>
                  <p className="text-[10px] font-black tracking-[0.4em] text-foreground/20 mb-3 uppercase tabular-nums">{greeting} // SESSION_ACTIVE</p>
                  <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-foreground uppercase">
                    {user?.name?.split(' ')[0] || 'Agent'}<span className="text-primary italic">.</span>
                  </h1>
                  <p className="text-foreground/40 text-sm mt-4 font-medium max-w-sm">
                    Neural forensic pipeline active. Integrity verification systems operational.
                  </p>
                </motion.div>
              </motion.div>

              <motion.div 
                variants={ITEM}
                initial="hidden" animate="show"
                className="flex justify-end"
              >
                <Link to="/analyze">
                  <Button className="h-16 px-10 rounded-full bg-foreground text-background font-black text-[10px] tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition-all group">
                    <Upload className="size-4 mr-3 group-hover:scale-110 transition-transform" />
                    NEW ANALYSIS
                  </Button>
                </Link>
              </motion.div>
            </div>

            {/* Middle Section: Recent History (Main Focus) */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <motion.div
                variants={CONTAINER} initial="hidden" animate="show"
                className="lg:col-span-3 glass-card rounded-3xl border border-foreground/8 overflow-hidden"
              >
                <div className="flex items-center justify-between p-8 border-b border-foreground/5 bg-foreground/[0.02]">
                  <div>
                    <h2 className="text-[10px] font-black tracking-[0.3em] text-foreground/40 uppercase">RECENT_HISTORY</h2>
                    <p className="text-[9px] font-bold text-foreground/20 tracking-widest uppercase mt-1">Live image forensic audit stream</p>
                  </div>
                  <Link to="/history" className="flex items-center gap-2 text-[10px] font-black tracking-widest text-foreground/40 hover:text-foreground transition-colors uppercase">
                    OPEN ARCHIVE <ChevronRight className="size-3" />
                  </Link>
                </div>

                <div className="divide-y divide-foreground/5">
                  {showLoading ? (
                    <div className="p-20 text-center text-foreground/20 text-[10px] font-black uppercase tracking-widest flex flex-col items-center justify-center gap-6">
                      <Loader2 className="size-8 animate-spin text-primary" /> 
                      AUTHENTICATING_HISTORY...
                    </div>
                  ) : safeAnalyses.length === 0 ? (
                    <div className="p-20 text-center flex flex-col items-center justify-center gap-6">
                      <div className="size-16 rounded-3xl bg-foreground/5 flex items-center justify-center">
                        <Activity className="size-6 text-foreground/20" />
                      </div>
                      <p className="text-foreground/20 text-[10px] font-black uppercase tracking-widest">Database_Empty. Upload to begin.</p>
                    </div>
                  ) : safeAnalyses.map((item) => {
                    const statusKey = item.status === 'pending' ? 'pending' : item.status === 'analysis_failed' ? 'analysis_failed' : item.verdict;
                    const cfg = STATUS_CONFIG[statusKey] || STATUS_FALLBACK;
                    const StatusIcon = cfg.icon;
                    const timeAgo = item.timestamp ? new Date(item.timestamp._seconds * 1000).toLocaleDateString() : 'Just now';
                    
                    return (
                      <Link
                        key={item.id}
                        to={`/analyze/${item.id}`}
                        className="flex items-center gap-6 p-6 hover:bg-foreground/3 transition-colors group cursor-pointer"
                      >
                        <div className="size-14 rounded-2xl overflow-hidden shrink-0 border border-foreground/5 bg-foreground/2 relative">
                          {item.thumbnailUrl && <img src={item.thumbnailUrl} alt="" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" />}
                          <div className="absolute inset-0 bg-linear-to-t from-background/40 to-transparent pointer-events-none" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-black text-foreground truncate uppercase tracking-tight">{item.originalName || 'Unknown_Asset'}</p>
                          <div className="flex items-center gap-3 mt-1.5">
                            <Clock className="size-3 text-foreground/20" />
                            <span className="text-[10px] font-bold text-foreground/30 tabular-nums">{timeAgo}</span>
                          </div>
                        </div>
                        <div className={cn("hidden sm:flex items-center gap-2 px-3 py-1 rounded-full border shadow-sm", cfg.bg, cfg.border)}>
                          <StatusIcon className={cn("size-3", cfg.color)} />
                          <span className={cn("text-[9px] font-black tracking-widest", cfg.color)}>{cfg.label}</span>
                        </div>
                        <ScoreRing score={item.score} size={60} />
                        <ChevronRight className="size-4 text-foreground/10 group-hover:text-foreground/40 transition-colors" />
                      </Link>
                    )
                  })}
                </div>
              </motion.div>

              {/* Right Sidebar: Intelligence & Status */}
              <div className="space-y-6">
                {/* Real-time breakdown */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="glass-card rounded-3xl border border-foreground/8 p-8"
                >
                  <h2 className="text-[10px] font-black tracking-widest text-foreground/40 mb-8 uppercase">SIGNAL_STRENGTH</h2>
                  
                  {/* Summary of the most recent result if available */}
                  {safeAnalyses.length > 0 ? (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                         <p className="text-[9px] font-black text-foreground/40 uppercase tracking-widest">LATEST_SCAN</p>
                         <span className="text-[10px] font-black text-primary tabular-nums">{safeAnalyses[0].score}%</span>
                      </div>
                      <div className="h-2 bg-foreground/5 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-primary"
                          initial={{ width: 0 }}
                          animate={{ width: `${safeAnalyses[0].score}%` }}
                        />
                      </div>
                      <p className="text-[10px] font-bold text-foreground/60 leading-relaxed italic">
                        "{safeAnalyses[0].explanation?.substring(0, 100)}..."
                      </p>
                    </div>
                  ) : (
                    <p className="text-[10px] text-foreground/20 font-black uppercase tracking-widest">Awaiting signal data...</p>
                  )}

                  <div className="mt-12 space-y-4 pt-12 border-t border-foreground/5">
                    {[
                      { label: 'Authentic', count: authenticCount, color: 'bg-emerald-500' },
                      { label: 'Manipulated', count: manipulatedCount, color: 'bg-amber-500' },
                      { label: 'AI Generated', count: aiCount, color: 'bg-destructive' }
                    ].map((stat, i) => {
                      const total = authenticCount + manipulatedCount + aiCount || 1;
                      const pct = (stat.count / total) * 100;
                      return (
                        <div key={i}>
                           <div className="flex justify-between text-[9px] font-black text-foreground/40 mb-2 uppercase">
                             <span>{stat.label}</span>
                             <span className="tabular-nums">{stat.count}</span>
                           </div>
                           <div className="h-1 bg-foreground/5 rounded-full overflow-hidden">
                             <motion.div 
                               className={`h-full ${stat.color} rounded-full`}
                               initial={{ width: 0 }}
                               animate={{ width: `${pct}%` }}
                               transition={{ duration: 1, delay: 0.6 + i * 0.1 }}
                             />
                           </div>
                        </div>
                      )
                    })}
                  </div>
                </motion.div>

                {/* Operations */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="glass-card rounded-3xl border border-foreground/8 p-8"
                >
                  <h2 className="text-[10px] font-black tracking-widest text-foreground/40 mb-6 uppercase">OPERATIONS</h2>
                  <div className="space-y-2">
                    {[
                      { icon: Upload, label: 'NEW UPLOAD', to: '/analyze' },
                      { icon: History, label: 'ARCHIVE', to: '/history' },
                      { icon: Settings, label: 'SYSTEM_CONFIG', to: '/settings' },
                    ].map((action) => (
                      <Link
                        key={action.label}
                        to={action.to}
                        className="flex items-center gap-4 p-4 rounded-2xl hover:bg-foreground/5 group transition-colors"
                      >
                        <action.icon className="size-4 text-foreground/20 group-hover:text-primary transition-colors" />
                        <span className="text-[10px] font-black tracking-widest text-foreground/40 group-hover:text-foreground uppercase">{action.label}</span>
                      </Link>
                    ))}
                  </div>
                </motion.div>
                
                {/* Plan Level */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="glass-card rounded-3xl border border-primary/20 p-8 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-linear-to-br from-primary/10 to-transparent pointer-events-none group-hover:opacity-40 transition-opacity" />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-[9px] font-black tracking-[0.3em] text-primary border border-primary/20 bg-primary/10 px-3 py-1 rounded-full uppercase tabular-nums">Vector_{user?.plan?.toUpperCase() || 'CORE'}</span>
                      <Shield className="size-4 text-primary/60" />
                    </div>
                    <p className="text-[10px] font-black tracking-[0.2em] text-foreground/40 uppercase mb-4">RESOURCE_UTILIZATION</p>
                    <div className="flex items-center justify-between text-[11px] font-bold text-foreground/60 mb-3 tabular-nums">
                      <span>{user?.analysisCount || 0} audits</span>
                      <span>500 LIMIT</span>
                    </div>
                    <div className="h-1.5 bg-foreground/5 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-primary rounded-full shadow-[0_0_12px_hsla(var(--primary),0.5)]"
                        initial={{ width: 0 }}
                        animate={{ width: `${((user?.analysisCount || 0) / 500) * 100}%` }}
                      />
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}
