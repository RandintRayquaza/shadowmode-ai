import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '@/shared/components/Navbar'
import { Button } from '@/shared/components/ui/button'
import {
  Upload, X, Brain, Layers, Activity,
  AlertTriangle, CheckCircle2, Info, Camera, Clock,
  ChevronDown, ChevronUp, Eye, FileText, BarChart3, ScanSearch, Loader2
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { resetAnalysis } from '../state/analysisSlice'
import { loadExistingAnalysis, uploadImageAndAnalyze } from '../state/analysisThunks'
import { cn } from '@/shared/utils/utils'

const buildSignals = (result) => {
  if (!result || !result.signals) return [
    { label: 'Neural AI Detection', value: 0, warning: false },
    { label: 'Forensic Error Levels (ELA)', value: 0, warning: false },
    { label: 'Metadata Integrity', value: 0, warning: false },
    { label: 'Compression Consistency', value: 0, warning: false },
    { label: 'Noise Distribution', value: 0, warning: false },
  ]
  const s = result.signals
  const neuralVal = s.neuralScore ?? s.aiProbability ?? 0
  const metaVal = s.metadataScore ?? s.metadataIntegrity ?? 0
  return [
    { label: 'Neural AI Detection', value: neuralVal, warning: neuralVal >= 65 },
    { label: 'Forensic Error Levels (ELA)', value: s.elaScore || 0, warning: (s.elaScore || 0) > 40 },
    { label: 'Metadata Integrity', value: metaVal, warning: metaVal < 50 },
    { label: 'Compression Consistency', value: s.compressionScore || 0, warning: (s.compressionScore || 0) < 50 },
    { label: 'Noise Distribution', value: s.noiseScore || 0, warning: (s.noiseScore || 0) < 50 },
  ]
}

const STATUS_MAP = {
  'Authentic Photo':     { label: 'AUTHENTIC',      color: '#10b981', border: 'border-emerald-500/25', bg: 'bg-emerald-500/8',  text: 'text-emerald-400', icon: CheckCircle2 },
  'Authentic':           { label: 'AUTHENTIC',      color: '#10b981', border: 'border-emerald-500/25', bg: 'bg-emerald-500/8',  text: 'text-emerald-400', icon: CheckCircle2 },
  'Uncertain':           { label: 'UNCERTAIN',      color: '#f59e0b', border: 'border-amber-500/25',   bg: 'bg-amber-500/8',   text: 'text-amber-400',   icon: AlertTriangle },
  'Possibly Edited':     { label: 'POSSIBLY EDITED',color: '#f59e0b', border: 'border-amber-500/25',   bg: 'bg-amber-500/8',   text: 'text-amber-400',   icon: AlertTriangle },
  'Edited Image':        { label: 'EDITED',         color: '#f97316', border: 'border-orange-500/25',  bg: 'bg-orange-500/8',  text: 'text-orange-400',  icon: AlertTriangle },
  'Likely AI Generated': { label: 'AI GENERATED',   color: '#ef4444', border: 'border-red-500/25',     bg: 'bg-red-500/8',     text: 'text-red-400',     icon: Brain },
  'AI Generated':        { label: 'AI GENERATED',   color: '#ef4444', border: 'border-red-500/25',     bg: 'bg-red-500/8',     text: 'text-red-400',     icon: Brain },
  'pending':             { label: 'ANALYZING',      color: '#3b82f6', border: 'border-blue-500/25',    bg: 'bg-blue-500/8',    text: 'text-blue-400',    icon: Clock },
  'analysis_failed':     { label: 'FAILED',         color: '#ef4444', border: 'border-red-500/25',     bg: 'bg-red-500/8',     text: 'text-red-400',     icon: AlertTriangle },
}
const STATUS_FALLBACK = { label: 'UNKNOWN', color: '#888', border: 'border-foreground/15', bg: 'bg-foreground/5', text: 'text-foreground/40', icon: AlertTriangle }

function ScoreGauge({ score, statusCfg }) {
  const displayScore = score ?? 0
  const color = statusCfg.color
  const r = 70, circ = 2 * Math.PI * r * 0.75
  const offset = circ * (1 - displayScore / 100)

  return (
    <div className="relative flex items-center justify-center w-48 h-36 mx-auto">
      <svg width="192" height="144" viewBox="0 0 192 144">
        <path d="M 20 130 A 76 76 0 1 1 172 130" fill="none" stroke="currentColor" className="text-foreground/[0.06]" strokeWidth="10" strokeLinecap="round" />
        <motion.path
          d="M 20 130 A 76 76 0 1 1 172 130"
          fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ filter: `drop-shadow(0 0 10px ${color}60)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
        <motion.span
          className="text-4xl font-black tracking-tight tabular-nums"
          style={{ color }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {score === null ? '--' : Math.round(score)}
        </motion.span>
        <span className="text-[9px] font-black tracking-widest text-foreground/30 uppercase mt-1">
          {displayScore >= 70 ? 'AUTHENTIC' : displayScore >= 40 ? 'UNCERTAIN' : 'AI RISK'}
        </span>
      </div>
    </div>
  )
}

export default function AnalysisPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [expandedMeta, setExpandedMeta] = useState(false)

  const dispatch = useAppDispatch()
  const { result, loading: analyzing } = useAppSelector(state => state.analysis)

  useEffect(() => {
    if (id) {
      dispatch(loadExistingAnalysis(id))
    } else {
      dispatch(resetAnalysis())
    }
  }, [id, dispatch])

  const displayImage = preview || result?.imageUrl || result?.thumbnailUrl

  const onDrop = useCallback(accepted => {
    const f = accepted[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': [] }, multiple: false,
  })

  const handleAnalyze = async () => {
    if (!file) return
    try {
      const res = await dispatch(uploadImageAndAnalyze(file)).unwrap()
      if (res?.id) navigate(`/analyze/${res.id}`)
    } catch (e) {
      console.error(e)
    }
  }

  const handleReset = () => {
    setFile(null)
    setPreview(null)
    dispatch(resetAnalysis())
    navigate('/analyze')
    if (preview) URL.revokeObjectURL(preview)
  }

  const statusKey = result?.status === 'pending' ? 'pending' : result?.status === 'analysis_failed' ? 'analysis_failed' : result?.verdict
  const statusCfg = result ? (STATUS_MAP[statusKey] || STATUS_FALLBACK) : null
  const signals = result ? buildSignals(result) : []

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      {/* Brand accent rule */}
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
                <ScanSearch className="size-4 text-brand" />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tighter uppercase text-foreground">
                  {id ? 'Analysis Report' : 'Image Analysis'}
                </h1>
                {id && <p className="text-[9px] font-black tracking-[0.2em] text-foreground/25 uppercase mt-0.5">ID: {id?.slice(0, 12)}...</p>}
              </div>
            </div>
            {result && (
              <button
                onClick={handleReset}
                className="flex items-center gap-2 text-[10px] font-black tracking-widest text-foreground/30 hover:text-foreground uppercase transition-colors group"
              >
                <Upload className="size-3.5 group-hover:scale-110 transition-transform" />
                New Scan
              </button>
            )}
          </motion.div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-start">

            {/* Left: Image + upload (5 cols) */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="md:col-span-5 space-y-4"
            >
              <div className="bg-foreground/[0.015] border border-foreground/8 rounded-2xl overflow-hidden">
                {/* Card header */}
                <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-foreground/[0.05] bg-foreground/[0.01]">
                  <BarChart3 className="size-3.5 text-brand" />
                  <span className="text-[10px] font-black tracking-[0.2em] text-foreground/35 uppercase">Source Media</span>
                </div>

                <div className="p-5">
                  {!file && !id ? (
                    <div
                      {...getRootProps()}
                      className={cn(
                        'relative min-h-[360px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300',
                        isDragActive
                          ? 'border-brand/60 bg-brand/[0.03]'
                          : 'border-foreground/10 hover:border-brand/30 hover:bg-brand/[0.02]'
                      )}
                    >
                      <input {...getInputProps()} />
                      <div className="size-14 rounded-2xl bg-foreground/[0.04] border border-foreground/8 flex items-center justify-center mb-4">
                        <Upload className={cn('size-5 transition-colors', isDragActive ? 'text-brand' : 'text-foreground/30')} />
                      </div>
                      <p className="text-sm font-black text-foreground/50 mb-1 uppercase tracking-tight">
                        {isDragActive ? 'Drop to begin scan' : 'Upload image'}
                      </p>
                      <p className="text-[10px] text-foreground/25 font-black tracking-widest uppercase">JPG Â· PNG Â· WEBP Â· max 20MB</p>

                      {/* Corner brackets on drag */}
                      {isDragActive && (
                        <>
                          <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-brand/60" />
                          <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-brand/60" />
                          <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-brand/60" />
                          <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-brand/60" />
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Preview */}
                      <div className="relative aspect-[4/5] rounded-xl overflow-hidden border border-foreground/8 bg-foreground/[0.02] group">
                        {displayImage && (
                          <img
                            src={displayImage} alt="Preview"
                            className={cn('w-full h-full object-cover transition-all duration-700', analyzing ? 'brightness-40 blur-[2px] scale-105' : '')}
                          />
                        )}
                        {analyzing && (
                          <>
                            <div className="absolute inset-0 flex items-center justify-center z-10">
                              <div className="bg-background/80 backdrop-blur-md px-6 py-4 rounded-xl border border-foreground/10 text-center">
                                <Loader2 className="size-6 text-brand animate-spin mx-auto mb-2" />
                                <p className="text-[9px] font-black text-foreground/40 tracking-[0.2em] uppercase">Scanning...</p>
                              </div>
                            </div>
                            <div className="absolute inset-x-0 h-20 bg-gradient-to-b from-transparent via-brand/20 to-transparent animate-scanline" />
                          </>
                        )}
                        <button
                          onClick={handleReset}
                          className="absolute top-2 right-2 size-8 rounded-full bg-background/80 backdrop-blur border border-foreground/10 flex items-center justify-center text-foreground/40 hover:text-foreground transition-all opacity-0 group-hover:opacity-100 z-20"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>

                      {/* File info */}
                      {file && (
                        <div className="flex items-center gap-3 p-3 bg-foreground/[0.02] rounded-xl border border-foreground/8">
                          <div className="p-2 rounded-lg bg-foreground/[0.04]">
                            <FileText className="size-4 text-foreground/30 shrink-0" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-black text-foreground/60 truncate uppercase">{file.name}</p>
                            <p className="text-[10px] text-foreground/25 font-black tracking-widest uppercase mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
                          </div>
                        </div>
                      )}

                      {!id && (
                        <Button
                          onClick={handleAnalyze}
                          disabled={analyzing || !file}
                          className="w-full h-11 rounded-xl bg-brand text-background font-black text-[10px] tracking-[0.2em] uppercase hover:opacity-90 hover:shadow-[0_4px_20px_hsla(186,90%,52%,0.35)] active:scale-[0.98] disabled:opacity-40 transition-all group"
                        >
                          {analyzing ? (
                            <><Loader2 className="size-3.5 animate-spin mr-2" /> Scanning...</>
                          ) : (
                            <><ScanSearch className="size-3.5 mr-2 group-hover:scale-110 transition-transform" /> Run Forensic Scan</>
                          )}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Right: Results (7 cols) */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="md:col-span-7"
            >
              <AnimatePresence mode="wait">
                {!result ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="min-h-[480px] flex flex-col items-center justify-center text-center p-10 bg-foreground/[0.01] rounded-2xl border border-dashed border-foreground/8"
                  >
                    <div className="size-14 rounded-2xl bg-foreground/[0.04] border border-foreground/8 flex items-center justify-center mb-5">
                      <BarChart3 className="size-6 text-foreground/20" />
                    </div>
                    <p className="text-[10px] font-black tracking-widest text-foreground/25 uppercase mb-1">Awaiting media input</p>
                    <p className="text-[10px] text-foreground/15 font-black tracking-widest uppercase">Upload an image to generate a forensic report</p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-4"
                  >
                    {/* Score card */}
                    <div className="bg-foreground/[0.015] border border-foreground/8 rounded-2xl overflow-hidden">
                      <div className="flex items-center justify-between px-5 py-3.5 border-b border-foreground/[0.05] bg-foreground/[0.01]">
                        <div className="flex items-center gap-2.5">
                          <Activity className="size-3.5 text-brand" />
                          <span className="text-[10px] font-black tracking-[0.2em] text-foreground/35 uppercase">Authenticity Report</span>
                        </div>
                        {statusCfg && (
                          <div className={cn('flex items-center gap-1.5 px-3 py-1 rounded-full border', statusCfg.bg, statusCfg.border)}>
                            <statusCfg.icon className={cn('size-2.5', statusCfg.text)} />
                            <span className={cn('text-[9px] font-black tracking-widest uppercase', statusCfg.text)}>{statusCfg.label}</span>
                          </div>
                        )}
                      </div>
                      <div className="py-8 px-5">
                        <ScoreGauge score={result.score} statusCfg={statusCfg || STATUS_FALLBACK} />
                        {result.explanation && (
                          <div className="mt-6 flex gap-3 p-4 bg-foreground/[0.02] rounded-xl border border-foreground/8">
                            <Info className="size-4 text-foreground/25 mt-0.5 shrink-0" />
                            <p className="text-[11px] text-foreground/50 leading-relaxed font-medium capitalize">
                              {result.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Detection signals */}
                    <div className="bg-foreground/[0.015] border border-foreground/8 rounded-2xl overflow-hidden">
                      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-foreground/[0.05] bg-foreground/[0.01]">
                        <Activity className="size-3.5 text-brand" />
                        <span className="text-[10px] font-black tracking-[0.2em] text-foreground/35 uppercase">Detection Signals</span>
                      </div>
                      <div className="p-5 space-y-4">
                        {signals.map((sig, i) => (
                          <motion.div
                            key={sig.label}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 + i * 0.05 }}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] font-black text-foreground/40 uppercase tracking-wider">{sig.label}</span>
                              <span className={cn('text-[10px] font-black tabular-nums', sig.warning ? 'text-amber-400' : 'text-emerald-400')}>{sig.value}%</span>
                            </div>
                            <div className="h-[3px] bg-foreground/[0.06] rounded-full overflow-hidden">
                              <motion.div
                                className={cn('h-full rounded-full', sig.warning ? 'bg-amber-400' : 'bg-emerald-400')}
                                initial={{ width: 0 }}
                                animate={{ width: `${sig.value}%` }}
                                transition={{ duration: 1, delay: 0.2 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                                style={{ boxShadow: sig.warning ? '0 0 6px rgba(251,191,36,0.4)' : '0 0 6px rgba(52,211,153,0.4)' }}
                              />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* ELA heatmap */}
                    {result.elaUrl && (
                      <div className="bg-foreground/[0.015] border border-foreground/8 rounded-2xl overflow-hidden">
                        <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-foreground/[0.05] bg-foreground/[0.01]">
                          <Eye className="size-3.5 text-brand" />
                          <span className="text-[10px] font-black tracking-[0.2em] text-foreground/35 uppercase">Error Level Analysis (ELA)</span>
                        </div>
                        <div className="p-4">
                          <div className="relative aspect-video rounded-xl overflow-hidden border border-foreground/8 bg-background">
                            <img src={result.elaUrl} alt="ELA Heatmap" className="w-full h-full object-contain" />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Metadata vault */}
                    <div className="bg-foreground/[0.015] border border-foreground/8 rounded-2xl overflow-hidden">
                      <button
                        onClick={() => setExpandedMeta(!expandedMeta)}
                        className="w-full flex items-center justify-between px-5 py-3.5 bg-foreground/[0.01] hover:bg-foreground/[0.025] transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <Camera className="size-3.5 text-brand" />
                          <span className="text-[10px] font-black tracking-[0.2em] text-foreground/35 uppercase">Metadata Vault</span>
                        </div>
                        {expandedMeta
                          ? <ChevronUp className="size-4 text-foreground/25" />
                          : <ChevronDown className="size-4 text-foreground/25" />
                        }
                      </button>
                      <AnimatePresence>
                        {expandedMeta && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            {(() => {
                              const META_LABELS = {
                                camera: 'Camera Model', make: 'Manufacturer', model: 'Device Model',
                                datetime: 'Capture Date', software: 'Software', hasGPS: 'GPS Data', raw: 'Raw EXIF',
                              }
                              const allEntries = Object.entries(result.metadata || {})
                              const present = allEntries.filter(([, v]) =>
                                v !== null && v !== undefined &&
                                !(typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0)
                              )
                              const missing = allEntries.filter(([, v]) => v === null || v === undefined)

                              if (allEntries.length === 0) return (
                                <div className="p-6 text-center border-t border-foreground/[0.05]">
                                  <p className="text-[10px] font-black text-foreground/25 uppercase tracking-widest">No EXIF metadata found</p>
                                  <p className="text-[9px] text-foreground/15 font-black tracking-widest uppercase mt-1">AI-generated images typically lack camera metadata</p>
                                </div>
                              )

                              const renderCard = ([key, val]) => {
                                let display
                                if (val === null || val === undefined) {
                                  display = <span className="text-[10px] italic text-foreground/20">Not available</span>
                                } else if (typeof val === 'boolean') {
                                  display = <span className={cn('text-[10px] font-black', val ? 'text-emerald-400' : 'text-foreground/30')}>{val ? 'âœ“ Yes' : 'âœ— No'}</span>
                                } else if (typeof val === 'object') {
                                  display = <span className="text-[10px] font-mono text-foreground/30 break-all line-clamp-2">{JSON.stringify(val)}</span>
                                } else {
                                  display = <span className="text-[10px] font-bold text-foreground/60 line-clamp-2">{String(val)}</span>
                                }
                                return (
                                  <div key={key} className="p-3 bg-foreground/[0.02] rounded-xl border border-foreground/8 flex flex-col gap-1">
                                    <p className="text-[9px] text-foreground/25 font-black uppercase tracking-wider truncate">
                                      {META_LABELS[key] || key}
                                    </p>
                                    {display}
                                  </div>
                                )
                              }

                              return (
                                <div className="p-4 border-t border-foreground/[0.05] space-y-3">
                                  {present.length > 0 && (
                                    <div className="grid grid-cols-2 gap-2">{present.map(renderCard)}</div>
                                  )}
                                  {missing.length > 0 && (
                                    <>
                                      {present.length > 0 && <p className="text-[9px] font-black text-foreground/20 uppercase tracking-widest">Missing Fields</p>}
                                      <div className="grid grid-cols-2 gap-2">{missing.map(renderCard)}</div>
                                    </>
                                  )}
                                </div>
                              )
                            })()}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  )
}

