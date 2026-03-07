import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/app/providers/AuthContext'
import Navbar from '@/shared/components/Navbar'
import {
  Upload, History, Settings, Activity, Clock,
  ChevronRight, Brain, AlertTriangle, CheckCircle2,
  Loader2, ScanSearch, BarChart3, FileText
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { resetDashboard } from '../state/dashboardSlice'
import { fetchDashboardData } from '../state/dashboardThunks'
import { cn } from '@/shared/utils/utils'
import ErrorBoundary from '@/shared/components/ErrorBoundary'

const STATUS_CONFIG = {
  'Authentic':          { border: 'border-emerald-500/25', bg: 'bg-emerald-500/8',  text: 'text-emerald-400', icon: CheckCircle2, label: 'AUTHENTIC' },
  'Authentic Photo':    { border: 'border-emerald-500/25', bg: 'bg-emerald-500/8',  text: 'text-emerald-400', icon: CheckCircle2, label: 'AUTHENTIC' },
  'Possibly Edited':    { border: 'border-amber-500/25',   bg: 'bg-amber-500/8',   text: 'text-amber-400',   icon: AlertTriangle, label: 'POSSIBLY EDITED' },
  'Likely Manipulated': { border: 'border-orange-500/25',  bg: 'bg-orange-500/8',  text: 'text-orange-400',  icon: AlertTriangle, label: 'MANIPULATED' },
  'Edited Image':       { border: 'border-orange-500/25',  bg: 'bg-orange-500/8',  text: 'text-orange-400',  icon: AlertTriangle, label: 'EDITED' },
  'AI Generated':       { border: 'border-red-500/25',     bg: 'bg-red-500/8',     text: 'text-red-400',     icon: Brain,         label: 'AI GENERATED' },
  'Likely AI Generated':{ border: 'border-red-500/25',     bg: 'bg-red-500/8',     text: 'text-red-400',     icon: Brain,         label: 'AI GENERATED' },
  'pending':            { border: 'border-blue-500/25',    bg: 'bg-blue-500/8',    text: 'text-blue-400',    icon: Clock,         label: 'ANALYZING' },
  'analysis_failed':    { border: 'border-red-500/25',     bg: 'bg-red-500/8',     text: 'text-red-400',     icon: AlertTriangle, label: 'FAILED' },
}
const STATUS_FALLBACK = { border: 'border-foreground/10', bg: 'bg-foreground/5', text: 'text-foreground/30', icon: Activity, label: 'UNKNOWN' }

function ScoreRing({ score, size = 64 }) {
  const r = (size / 2) - 6
  const circ = 2 * Math.PI * r
  const displayScore = score ?? 0
  const color = displayScore >= 70 ? '#10b981' : displayScore >= 40 ? '#f59e0b' : '#ef4444'
  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="currentColor" className="text-foreground/[0.06]" strokeWidth="5" />
        <circle
          cx={size/2} cy={size/2} r={r} fill="none"
          stroke={color} strokeWidth="5" strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - displayScore / 100)}
          style={{ transition: 'stroke-dashoffset 1s ease', filter: `drop-shadow(0 0 4px ${color}60)` }}
        />
      </svg>
      <span className="absolute text-[10px] font-black tabular-nums" style={{ color }}>
        {score === null ? '--' : score}
      </span>
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const dispatch = useAppDispatch()
  const { recentAnalyses, isLoading, ownerUid } = useAppSelector(state => state.dashboard)

  useEffect(() => {
    if (!user?.uid) return
    if (ownerUid && ownerUid !== user.uid) {
      dispatch(resetDashboard())
    }
    dispatch(fetchDashboardData(user.uid))
  }, [user?.uid]) // eslint-disable-line react-hooks/exhaustive-deps

  const safeAnalyses = ownerUid === user?.uid ? recentAnalyses : []
  const showLoading = isLoading || (user?.uid && ownerUid !== user?.uid)

  const authenticCount = safeAnalyses.filter(a => a.verdict === 'Authentic' || a.verdict === 'Authentic Photo').length
  const manipulatedCount = safeAnalyses.filter(a => ['Possibly Edited', 'Likely Manipulated', 'Edited Image'].includes(a.verdict)).length
  const aiCount = safeAnalyses.filter(a => a.verdict === 'AI Generated' || a.verdict === 'Likely AI Generated').length
  const totalCount = safeAnalyses.length

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening'
  const firstName = user?.displayName?.split(' ')[0] || user?.name?.split(' ')[0] || 'Agent'

  const stats = [
    { label: 'Total Scans', value: totalCount,        accent: 'text-brand', bar: 'bg-brand' },
    { label: 'Authentic',   value: authenticCount,    accent: 'text-emerald-400', bar: 'bg-emerald-400' },
    { label: 'AI Generated',value: aiCount,           accent: 'text-red-400',     bar: 'bg-red-400' },
    { label: 'Flagged',     value: manipulatedCount,  accent: 'text-amber-400',   bar: 'bg-amber-400' },
  ]

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="h-px bg-gradient-to-r from-transparent via-brand/30 to-transparent" />

        <div className="flex-1 pt-20 pb-20">
          <div className="container mx-auto px-6 max-w-6xl">

            {/* Page header */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-between py-8 border-b border-foreground/[0.05] mb-8"
            >
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center">
                  <BarChart3 className="size-4 text-brand" />
                </div>
                <div>
                  <h1 className="text-lg font-black tracking-tighter uppercase text-foreground">
                    {greeting}, {firstName}
                  </h1>
                  <p className="text-[9px] font-black tracking-[0.2em] text-foreground/25 uppercase mt-0.5">Forensic Intelligence Dashboard</p>
                </div>
              </div>
              <Link
                to="/analyze"
                className="flex items-center gap-2 h-9 px-5 rounded-xl bg-brand text-background text-[10px] font-black tracking-[0.15em] uppercase hover:opacity-90 hover:shadow-[0_4px_20px_hsla(186,90%,52%,0.35)] active:scale-[0.98] transition-all"
              >
                <Upload className="size-3.5" />
                New Scan
              </Link>
            </motion.div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
            >
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.05 }}
                  className="bg-foreground/[0.015] border border-foreground/8 rounded-2xl p-5 relative overflow-hidden group hover:border-foreground/12 transition-colors"
                >
                  <p className="text-[9px] font-black tracking-widest text-foreground/25 uppercase mb-2">{stat.label}</p>
                  <p className={cn('text-3xl font-black tabular-nums tracking-tighter', stat.accent)}>
                    {showLoading ? <span className="animate-pulse opacity-30">--</span> : stat.value}
                  </p>
                  <div className="mt-3 h-[2px] bg-foreground/[0.04] rounded-full overflow-hidden">
                    <motion.div
                      className={cn('h-full rounded-full', stat.bar)}
                      initial={{ width: 0 }}
                      animate={{ width: totalCount > 0 ? `${(stat.value / (totalCount || 1)) * 100}%` : '0%' }}
                      transition={{ duration: 1, delay: 0.3 + i * 0.1 }}
                    />
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Main grid: recent analyses + quick actions */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

              {/* Recent analyses table (8 cols) */}
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="lg:col-span-8 bg-foreground/[0.015] border border-foreground/8 rounded-2xl overflow-hidden"
              >
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-foreground/[0.05] bg-foreground/[0.01]">
                  <div className="flex items-center gap-2.5">
                    <Activity className="size-3.5 text-brand" />
                    <span className="text-[10px] font-black tracking-[0.2em] text-foreground/35 uppercase">Recent Analyses</span>
                  </div>
                  <Link
                    to="/history"
                    className="flex items-center gap-1.5 text-[9px] font-black tracking-widest text-foreground/25 hover:text-foreground uppercase transition-colors"
                  >
                    Full Archive <ChevronRight className="size-3" />
                  </Link>
                </div>

                <AnimatePresence>
                  {showLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                      <Loader2 className="size-6 text-brand animate-spin" />
                      <p className="text-[9px] font-black tracking-widest text-foreground/20 uppercase">Loading scan history...</p>
                    </div>
                  ) : safeAnalyses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                      <div className="size-12 rounded-2xl bg-foreground/[0.04] border border-foreground/8 flex items-center justify-center">
                        <FileText className="size-5 text-foreground/20" />
                      </div>
                      <p className="text-[9px] font-black tracking-widest text-foreground/20 uppercase">No analyses yet</p>
                      <Link
                        to="/analyze"
                        className="text-[9px] font-black tracking-widest text-brand uppercase hover:opacity-70 transition-opacity"
                      >
                        Run your first scan →
                      </Link>
                    </div>
                  ) : (
                    <div className="divide-y divide-foreground/[0.04]">
                      {safeAnalyses.map((item, i) => {
                        const statusKey = item.status === 'pending' ? 'pending' : item.status === 'analysis_failed' ? 'analysis_failed' : item.verdict
                        const cfg = STATUS_CONFIG[statusKey] || STATUS_FALLBACK
                        const StatusIcon = cfg.icon
                        const timeAgo = item.timestamp
                          ? new Date(item.timestamp._seconds * 1000).toLocaleDateString()
                          : 'Just now'
                        return (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.03 }}
                          >
                            <Link
                              to={`/analyze/${item.id}`}
                              className="flex items-center gap-4 px-5 py-4 hover:bg-foreground/[0.02] transition-colors group"
                            >
                              {/* Thumb */}
                              <div className="size-10 rounded-xl overflow-hidden shrink-0 border border-foreground/8 bg-foreground/[0.03]">
                                {item.thumbnailUrl
                                  ? <img src={item.thumbnailUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                  : <div className="w-full h-full flex items-center justify-center"><ScanSearch className="size-4 text-foreground/15" /></div>
                                }
                              </div>
                              {/* Name + time */}
                              <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-black text-foreground/60 truncate uppercase tracking-tight">
                                  {item.originalName || 'Untitled Asset'}
                                </p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <Clock className="size-2.5 text-foreground/20" />
                                  <span className="text-[9px] font-black text-foreground/20 uppercase tracking-widest">{timeAgo}</span>
                                </div>
                              </div>
                              {/* Status badge */}
                              <div className={cn('hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border shrink-0', cfg.bg, cfg.border)}>
                                <StatusIcon className={cn('size-2.5', cfg.text)} />
                                <span className={cn('text-[8px] font-black tracking-widest uppercase', cfg.text)}>{cfg.label}</span>
                              </div>
                              {/* Score ring */}
                              <ScoreRing score={item.score} size={44} />
                              <ChevronRight className="size-3.5 text-foreground/15 group-hover:text-foreground/40 transition-colors shrink-0" />
                            </Link>
                          </motion.div>
                        )
                      })}
                    </div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Sidebar (4 cols) */}
              <motion.div
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                className="lg:col-span-4 space-y-4"
              >
                {/* Quick actions */}
                <div className="bg-foreground/[0.015] border border-foreground/8 rounded-2xl overflow-hidden">
                  <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-foreground/[0.05] bg-foreground/[0.01]">
                    <Settings className="size-3.5 text-brand" />
                    <span className="text-[10px] font-black tracking-[0.2em] text-foreground/35 uppercase">Operations</span>
                  </div>
                  <div className="p-2">
                    {[
                      { icon: Upload,  label: 'New Scan',    sub: 'Upload an image', to: '/analyze' },
                      { icon: History, label: 'Archive',     sub: 'View all scans',  to: '/history' },
                      { icon: Settings,label: 'Settings',    sub: 'Account config',  to: '/settings' },
                    ].map(action => (
                      <Link
                        key={action.label}
                        to={action.to}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-foreground/[0.03] group transition-colors"
                      >
                        <div className="size-8 rounded-lg bg-foreground/[0.04] border border-foreground/8 flex items-center justify-center shrink-0 group-hover:border-brand/20 group-hover:bg-brand/5 transition-colors">
                          <action.icon className="size-3.5 text-foreground/25 group-hover:text-brand transition-colors" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-foreground/50 uppercase tracking-wide group-hover:text-foreground transition-colors">{action.label}</p>
                          <p className="text-[9px] text-foreground/20 font-black tracking-widest uppercase">{action.sub}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Breakdown chart */}
                {!showLoading && totalCount > 0 && (
                  <div className="bg-foreground/[0.015] border border-foreground/8 rounded-2xl overflow-hidden">
                    <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-foreground/[0.05] bg-foreground/[0.01]">
                      <BarChart3 className="size-3.5 text-brand" />
                      <span className="text-[10px] font-black tracking-[0.2em] text-foreground/35 uppercase">Verdict Breakdown</span>
                    </div>
                    <div className="p-5 space-y-4">
                      {[
                        { label: 'Authentic',   count: authenticCount,   color: 'bg-emerald-400', textColor: 'text-emerald-400' },
                        { label: 'Flagged',     count: manipulatedCount, color: 'bg-amber-400',   textColor: 'text-amber-400' },
                        { label: 'AI Generated',count: aiCount,          color: 'bg-red-400',     textColor: 'text-red-400' },
                      ].map((item, i) => (
                        <div key={item.label}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[9px] font-black text-foreground/30 uppercase tracking-widest">{item.label}</span>
                            <span className={cn('text-[9px] font-black tabular-nums', item.textColor)}>{item.count}</span>
                          </div>
                          <div className="h-[2px] bg-foreground/[0.06] rounded-full overflow-hidden">
                            <motion.div
                              className={cn('h-full rounded-full', item.color)}
                              initial={{ width: 0 }}
                              animate={{ width: `${(item.count / totalCount) * 100}%` }}
                              transition={{ duration: 1, delay: 0.4 + i * 0.1 }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>

            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}
