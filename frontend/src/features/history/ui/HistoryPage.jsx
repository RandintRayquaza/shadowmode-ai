import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Navbar from '@/shared/components/Navbar'
import { Button } from '@/shared/components/ui/button'
import {
  Search, Filter, Download, Trash2, Brain, AlertTriangle,
  CheckCircle2, Clock, Upload, ChevronRight
} from 'lucide-react'

import { cn } from '@/shared/utils/utils'
import { useHistoryData } from '../hooks/useHistoryData'

const STATUS_CONFIG = {
  'Authentic': { color: 'text-emerald-500 dark:text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', icon: CheckCircle2, label: 'AUTHENTIC' },
  'Possibly Edited': { color: 'text-amber-500 dark:text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20', icon: AlertTriangle, label: 'POSSIBLY EDITED' },
  'Likely Manipulated': { color: 'text-orange-500 dark:text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/20', icon: AlertTriangle, label: 'MANIPULATED' },
  'AI Generated': { color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/20', icon: Brain, label: 'AI GENERATED' },
  'pending': { color: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20', icon: Clock, label: 'ANALYZING' },
  'analysis_failed': { color: 'text-red-500 dark:text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20', icon: AlertTriangle, label: 'FAILED' }
}

const STATUS_FALLBACK = { color: 'text-muted-foreground', bg: 'bg-card', border: 'border-border/60', icon: AlertTriangle, label: 'UNKNOWN' };

const FILTERS = ['All', 'Authentic', 'Possibly Edited', 'Likely Manipulated', 'AI Generated']

const CONTAINER = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }
const ITEM = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } }

export default function HistoryPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [selected, setSelected] = useState(new Set())

  const { history, isLoading } = useHistoryData()

  const filtered = history.filter(item => {
    const itemName = item.originalName || 'Unknown Image';
    const matchSearch = itemName.toLowerCase().includes(search.toLowerCase())
    const statusKey = item.status === 'pending' ? 'pending' : item.status === 'analysis_failed' ? 'analysis_failed' : item.verdict;
    const matchFilter = filter === 'All' || statusKey === filter
    return matchSearch && matchFilter
  })

  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-6 max-w-6xl">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10"
          >
            <div>
              <p className="text-[10px] font-black tracking-[0.4em] text-muted-foreground mb-2 uppercase">Forensic Archive</p>
              <h1 className="text-4xl font-black tracking-tighter text-foreground">
                Analysis <span className="text-primary italic">History</span>
              </h1>
              <p className="text-muted-foreground text-sm mt-2">{history.length} total analyses</p>
            </div>
            <Link to="/analyze">
              <Button className="h-11 px-6 rounded-2xl bg-primary hover:bg-primary/80 text-primary-foreground font-black text-xs tracking-widest shadow-[0_0_20px_-8px_hsla(var(--primary),0.5)] group">
                <Upload className="size-3.5 mr-2 group-hover:scale-110 transition-transform" />
                NEW ANALYSIS
              </Button>
            </Link>
          </motion.div>

          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col sm:flex-row gap-4 mb-8"
          >
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search analyses..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-card border border-border/60 rounded-2xl pl-11 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 outline-none transition-all"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
              <Filter className="size-4 text-muted-foreground shrink-0" />
              {FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all ${
                    filter === f
                      ? 'bg-primary/10 border border-primary/30 text-primary'
                      : 'text-muted-foreground hover:text-foreground/60 border border-border hover:border-border/60'
                  }`}
                >
                  {f.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Bulk actions */}
            {selected.size > 0 && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-10 border-border/60 text-foreground/60 rounded-xl text-xs">
                  <Download className="size-3 mr-1.5" /> Export {selected.size}
                </Button>
                <Button variant="outline" size="sm" className="h-10 border-destructive/20 text-destructive/70 hover:bg-destructive/5 rounded-xl text-xs">
                  <Trash2 className="size-3 mr-1.5" /> Delete
                </Button>
              </motion.div>
            )}
          </motion.div>

          {/* Table */}
          <motion.div
            variants={CONTAINER} initial="hidden" animate="show"
            className="glass-card rounded-3xl border border-foreground/8 overflow-hidden shadow-2xl"
          >
            {/* Table header */}
            <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-6 items-center px-8 py-5 border-b border-foreground/5 text-[9px] font-black tracking-[0.3em] text-foreground/40 uppercase">
              <div className="size-4" />
              <span>Asset_Identity</span>
              <span className="hidden md:block">Volume</span>
              <span className="hidden lg:block">Timestamp</span>
              <span>Status</span>
              <span>Vector_Risk</span>
            </div>

            {isLoading ? (
              <div className="py-24 text-center">
                <p className="text-foreground/20 font-black text-xs uppercase tracking-[0.4em] flex items-center justify-center gap-4">
                  <Loader2 className="size-4 animate-spin text-primary" /> FETCHING_ARCHIVE...
                </p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-24 text-center">
                <p className="text-foreground/20 font-black text-xs uppercase tracking-[0.4em]">NO_RECORDS_FOUND</p>
                <p className="text-foreground/10 text-[10px] font-bold uppercase tracking-widest mt-3">Refine filters or start new scan</p>
              </div>
            ) : (
              filtered.map((item) => {
                const statusKey = item.status === 'pending' ? 'pending' : item.status === 'analysis_failed' ? 'analysis_failed' : item.verdict;
                const cfg = STATUS_CONFIG[statusKey] || STATUS_FALLBACK;
                const StatusIcon = cfg.icon
                const isSelected = selected.has(item.id)
                const displayScore = item.score ?? 0;
                const scoreColor = displayScore >= 80 ? 'text-emerald-500' : displayScore >= 50 ? 'text-amber-500' : 'text-destructive'
                const timeAgo = item.timestamp ? new Date(item.timestamp._seconds * 1000).toLocaleDateString() : 'Just now';

                return (
                  <Link
                    key={item.id}
                    to={`/analyze/${item.id}`}
                    className={`grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-6 items-center px-8 py-6 border-b border-foreground/5 hover:bg-foreground/3 transition-all cursor-pointer group ${isSelected ? 'bg-primary/5' : ''}`}
                  >
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleSelect(item.id); }}
                      className={`size-4 rounded border flex items-center justify-center transition-all shrink-0 ${
                        isSelected ? 'bg-primary border-primary' : 'border-foreground/20 group-hover:border-foreground/40'
                      }`}
                    >
                      {isSelected && <div className="size-1.5 bg-background rounded-sm" />}
                    </div>

                    <div className="flex items-center gap-4 min-w-0">
                      <div className="size-12 rounded-xl overflow-hidden shrink-0 border border-foreground/5 bg-foreground/3">
                        {item.thumbnailUrl && <img src={item.thumbnailUrl} alt="" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-black text-foreground uppercase tracking-tight group-hover:text-primary transition-colors truncate">{item.originalName || 'Unknown_Asset'}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <Clock className="size-2.5 text-foreground/20" />
                          <span className="text-[10px] font-bold text-foreground/30 tabular-nums">{timeAgo}</span>
                        </div>
                      </div>
                    </div>

                    <span className="hidden md:block text-[10px] text-foreground/30 font-bold tabular-nums">{(item.metadata?.FileSize || '0 B')}</span>

                    <span className="hidden lg:block text-[10px] text-foreground/30 font-bold tabular-nums">{timeAgo}</span>

                    <div className={cn("flex items-center gap-2 px-3 py-1 rounded-full border shadow-sm shrink-0", cfg.bg, cfg.border)}>
                      <StatusIcon className={cn("size-2.5", cfg.color)} />
                      <span className={cn("text-[8px] font-black tracking-widest hidden sm:block", cfg.color)}>{cfg.label}</span>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 justify-end">
                      <span className={`text-sm font-black tabular-nums ${scoreColor}`}>{item.score === null ? '--' : item.score}</span>
                      <ChevronRight className="size-4 text-foreground/10 group-hover:text-foreground/40 transition-all group-hover:translate-x-1" />
                    </div>
                  </Link>
                )
              })
            )}
          </motion.div>

          {/* Stats footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-3 gap-4 mt-8"
          >
            {[
              { label: 'Authentic', count: history.filter(i => i.verdict === 'Authentic').length, color: 'text-emerald-500 dark:text-emerald-400' },
              { label: 'Manipulated', count: history.filter(i => i.verdict === 'Likely Manipulated' || i.verdict === 'Possibly Edited').length, color: 'text-amber-500 dark:text-amber-400' },
              { label: 'AI Generated', count: history.filter(i => i.verdict === 'AI Generated').length, color: 'text-destructive' },
            ].map(stat => (
              <div key={stat.label} className="glass-card rounded-2xl p-5 border border-border text-center">
                <p className={`text-2xl font-black ${stat.color}`}>{stat.count}</p>
                <p className="text-[10px] font-black tracking-widest text-muted-foreground mt-1 uppercase">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
