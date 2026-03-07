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
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-28 pb-20">
        <div className="container mx-auto px-6 max-w-7xl">

          {/* Header */}
          <motion.div
            variants={CONTAINER} initial="hidden" animate="show"
            className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12"
          >
            <motion.div variants={ITEM}>
              <p className="text-[10px] font-black tracking-[0.4em] text-muted-foreground mb-2 uppercase">{greeting}</p>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground">
                {(user?.name || 'Agent').split(' ')[0]}<span className="text-primary italic">.</span>
              </h1>
              <p className="text-muted-foreground text-sm mt-2">{user?.analysisCount || 0} analyses completed · {user?.plan || 'Free'} plan</p>
            </motion.div>
            <motion.div variants={ITEM}>
              <Link to="/analyze">
                <Button className="h-12 px-8 rounded-2xl bg-primary hover:bg-primary/80 text-primary-foreground font-black text-xs tracking-widest shadow-[0_0_30px_-8px_hsla(var(--primary),0.5)] group">
                  <Upload className="size-4 mr-2 group-hover:scale-110 transition-transform" />
                  NEW ANALYSIS
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            variants={CONTAINER} initial="hidden" animate="show"
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            {[
              { label: 'Total Scans', value: user?.analysisCount || safeAnalyses.length, icon: Search, color: 'text-primary', glow: 'shadow-[0_0_30px_-10px_hsla(var(--primary),0.3)]' },
              { label: 'Authentic', value: authenticCount, icon: CheckCircle2, color: 'text-emerald-500 dark:text-emerald-400', glow: 'shadow-[0_0_30px_-10px_rgba(16,185,129,0.2)]' },
              { label: 'Manipulated', value: manipulatedCount, icon: AlertTriangle, color: 'text-amber-500 dark:text-amber-400', glow: 'shadow-[0_0_30px_-10px_rgba(245,158,11,0.2)]' },
              { label: 'AI Generated', value: aiCount, icon: Brain, color: 'text-destructive', glow: 'shadow-[0_0_30px_-10px_rgba(239,68,68,0.2)]' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                variants={ITEM}
                className={`bg-card p-6 rounded-2xl border border-border ${stat.glow} group hover:border-primary/50 transition-all`}
              >
                <div className="flex items-start justify-between mb-4">
                  <stat.icon className={`size-5 ${stat.color}`} />
                  <TrendingUp className="size-3 text-muted-foreground group-hover:text-foreground/70 transition-colors" />
                </div>
                <p className="text-3xl font-black text-foreground mb-1">{stat.value}</p>
                <p className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Main grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Recent Analyses */}
            <motion.div
              variants={CONTAINER} initial="hidden" animate="show"
              className="lg:col-span-2 bg-card rounded-3xl border border-border overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div>
                  <h2 className="text-sm font-black tracking-wider text-foreground">RECENT ANALYSES</h2>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Your latest image forensics</p>
                </div>
                <Link to="/history" className="flex items-center gap-1 text-[10px] font-black tracking-widest text-muted-foreground hover:text-primary transition-colors uppercase">
                  View All <ChevronRight className="size-3" />
                </Link>
              </div>

              <div className="divide-y divide-border">
                {showLoading ? (
                  <div className="p-8 text-center text-muted-foreground text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-3">
                    <Loader2 className="size-4 animate-spin" /> Loading analyses...
                  </div>
                ) : safeAnalyses.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground text-sm font-bold uppercase tracking-widest">No analyses yet. Start exploring!</div>
                ) : safeAnalyses.map((item) => {
                  const statusKey = item.status === 'pending' ? 'pending' : item.status === 'analysis_failed' ? 'analysis_failed' : item.verdict;
                  const cfg = STATUS_CONFIG[statusKey] || STATUS_FALLBACK;
                  const StatusIcon = cfg.icon;
                  const timeAgo = item.timestamp ? new Date(item.timestamp._seconds * 1000).toLocaleDateString() : 'Just now';
                  
                  return (
                    <Link
                      key={item.id}
                      to={`/analyze/${item.id}`}
                      className="flex items-center gap-4 p-5 hover:bg-muted/30 transition-colors group cursor-pointer"
                    >
                      <div className="size-12 rounded-xl overflow-hidden shrink-0 border border-border bg-muted/10">
                        {item.thumbnailUrl && <img src={item.thumbnailUrl} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground truncate">{item.originalName || 'Unknown Image'}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="size-3 text-muted-foreground/60" />
                          <span className="text-[10px] text-muted-foreground">{timeAgo}</span>
                        </div>
                      </div>
                      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${cfg.bg} border ${cfg.border}`}>
                        <StatusIcon className={`size-3 ${cfg.color}`} />
                        <span className={`text-[9px] font-black tracking-widest ${cfg.color}`}>{cfg.label}</span>
                      </div>
                      <ScoreRing score={item.score} size={52} />
                    </Link>
                  )
                })}
              </div>
            </motion.div>

            {/* Right column */}
            <div className="space-y-4">
              {/* Quick actions */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-card rounded-3xl border border-border p-6"
              >
                <h2 className="text-[10px] font-black tracking-[0.3em] text-muted-foreground mb-5 uppercase">Quick Actions</h2>
                <div className="space-y-2">
                  {[
                    { icon: Upload, label: 'Analyze New Image', to: '/analyze', glow: true },
                    { icon: History, label: 'View History', to: '/history' },
                    { icon: Settings, label: 'Account Settings', to: '/settings' },
                  ].map((action) => (
                    <Link
                      key={action.label}
                      to={action.to}
                      className={`flex items-center gap-3 p-4 rounded-2xl transition-all group ${
                        action.glow
                          ? 'bg-primary/10 border border-primary/20 hover:bg-primary/20'
                          : 'bg-muted/10 border border-border hover:bg-muted/30'
                      }`}
                    >
                      <action.icon className={`size-4 ${action.glow ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'} transition-colors`} />
                      <span className={`text-xs font-bold ${action.glow ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'} transition-colors`}>{action.label}</span>
                      <ChevronRight className="size-3 ml-auto text-muted-foreground/60 transition-colors" />
                    </Link>
                  ))}
                </div>
              </motion.div>

              {/* Plan card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.35 }}
                className="bg-card rounded-3xl border border-primary/20 p-6 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent pointer-events-none" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[9px] font-black tracking-widest text-primary border border-primary/20 bg-primary/10 px-2 py-0.5 rounded-full">{user?.plan?.toUpperCase()} PLAN</span>
                    <Shield className="size-4 text-primary/60" />
                  </div>
                  <p className="text-sm font-black text-foreground mb-1">Monthly Usage</p>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-3">
                    <span>{user?.analysisCount || 0} used</span>
                    <span>500 limit</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${((user?.analysisCount || 0) / 500) * 100}%` }}
                      transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-3">{500 - (user?.analysisCount || 0)} analyses remaining this month</p>
                </div>
              </motion.div>

              {/* Recent Activity Mini-Chart (Placeholder removed, using real counts) */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="bg-card rounded-3xl border border-border p-6"
              >
                <h2 className="text-[10px] font-black tracking-[0.3em] text-muted-foreground mb-5 uppercase">Recent Breakdown</h2>
                <div className="space-y-4">
                  {[
                    { label: 'Authentic', count: authenticCount, color: 'bg-emerald-500' },
                    { label: 'Manipulated', count: manipulatedCount, color: 'bg-amber-500' },
                    { label: 'AI Generated', count: aiCount, color: 'bg-destructive' }
                  ].map((stat, i) => {
                    const total = authenticCount + manipulatedCount + aiCount || 1;
                    const pct = (stat.count / total) * 100;
                    return (
                      <div key={i}>
                         <div className="flex justify-between text-[10px] font-bold text-muted-foreground mb-1.5">
                           <span>{stat.label}</span>
                           <span>{stat.count}</span>
                         </div>
                         <div className="h-1 bg-muted rounded-full overflow-hidden">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
