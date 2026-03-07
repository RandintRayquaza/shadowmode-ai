import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '@/shared/components/Navbar'
import { Button } from '@/shared/components/ui/button'
import {
  Upload, X, Search, Shield, Brain, Layers, Activity,
  AlertTriangle, CheckCircle2, Info, Camera, Clock,
  ChevronDown, ChevronUp, Zap, Eye, FileText, BarChart3, Image, ScanSearch
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { resetAnalysis } from '../state/analysisSlice'
import { loadExistingAnalysis, uploadImageAndAnalyze } from '../state/analysisThunks'

const buildSignals = (result) => {
  if (!result || !result.signals) return [
    { label: 'Neural Pattern Match', value: 0, warning: false },
    { label: 'Error Level Analysis (ELA)', value: 0, warning: false },
    { label: 'Metadata Integrity', value: 20, warning: true },
    { label: 'Compression Consistency', value: 45, warning: true },
    { label: 'Noise Distribution', value: 35, warning: true },
    { label: 'Hive AI Detection', value: 0, warning: false },
  ];
  
  const s = result.signals;
  return [
    { label: 'Neural Pattern Match', value: s.aiProbability || 0, warning: (s.aiProbability || 0) > 60 },
    { label: 'Error Level Analysis (ELA)', value: s.elaScore || 0, warning: (s.elaScore || 0) > 30 },
    { label: 'Metadata Integrity', value: s.metadataIntegrity || 0, warning: (s.metadataIntegrity || 0) < 50 },
    { label: 'Compression Consistency', value: s.compressionConsistency || 0, warning: (s.compressionConsistency || 0) < 50 },
    { label: 'Noise Distribution', value: s.noiseScore || 0, warning: (s.noiseScore || 0) < 50 },
    { label: 'Hive AI Detection', value: s.hiveAiProbability || 0, warning: (s.hiveAiProbability || 0) > 50 },
  ];
}

const STATUS_MAP = {
  'Authentic': { label: 'AUTHENTIC', color: 'text-emerald-500 dark:text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: CheckCircle2, hex: '#10b981' },
  'Possibly Edited': { label: 'POSSIBLY EDITED', color: 'text-amber-500 dark:text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: AlertTriangle, hex: '#f59e0b' },
  'Likely Manipulated': { label: 'MANIPULATED', color: 'text-orange-500 dark:text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', icon: AlertTriangle, hex: '#f97316' },
  'AI Generated': { label: 'AI GENERATED', color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/20', icon: Brain, hex: '#ef4444' },
  'pending': { label: 'ANALYZING', color: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: Clock, hex: '#3b82f6' },
  'analysis_failed': { label: 'FAILED', color: 'text-red-500 dark:text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: AlertTriangle, hex: '#ef4444' }
}

const STATUS_FALLBACK = { label: 'UNKNOWN', color: 'text-muted-foreground', bg: 'bg-muted/50', border: 'border-border', icon: AlertTriangle, hex: '#888888' };

function ScoreGauge({ score, statusCfg }) {
  const displayScore = score ?? 0;
  const color = statusCfg.hex;
  const r = 70;
  const circ = 2 * Math.PI * r * 0.75;
  const offset = circ * (1 - (displayScore / 100));

  return (
    <div className="relative flex items-center justify-center w-48 h-36 mx-auto">
      <svg width="192" height="144" viewBox="0 0 192 144">
        <path
          d="M 20 130 A 76 76 0 1 1 172 130"
          fill="none" stroke="currentColor" className="text-muted/30" strokeWidth="10" strokeLinecap="round"
        />
        <motion.path
          d="M 20 130 A 76 76 0 1 1 172 130"
          fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ filter: `drop-shadow(0 0 8px ${color}40)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
        <motion.span
          className="text-4xl font-black tracking-tight"
          style={{ color }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {score === null ? '--' : Math.round(score)}
        </motion.span>
        <span className="text-[9px] font-bold tracking-widest text-muted-foreground mt-1">
          {displayScore >= 80 ? 'TRUST SCORE' : displayScore < 50 ? 'RISK SCORE' : 'SUSPECT SCORE'}
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

  // Load existing analysis if ID present
  useEffect(() => {
    if (id) {
      dispatch(loadExistingAnalysis(id))
    } else {
      dispatch(resetAnalysis())
      setFile(null)
      setPreview(null)
    }
  }, [id, dispatch])

  // Show uploaded image if available, else show backend result imageUrl
  const displayImage = preview || result?.imageUrl || result?.thumbnailUrl

  const onDrop = useCallback(accepted => {
    const f = accepted[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
    // Do not call reset() here otherwise it clears the loaded result, just let user click upload
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false,
  })

  const handleAnalyze = async () => {
    if (!file) return
    try {
      const res = await dispatch(uploadImageAndAnalyze(file)).unwrap()
      if (res?.id) {
        navigate(`/analyze/${res.id}`)
      }
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

  const statusKey = result?.status === 'pending' ? 'pending' : result?.status === 'analysis_failed' ? 'analysis_failed' : result?.verdict;
  const statusCfg = result ? STATUS_MAP[statusKey] || STATUS_FALLBACK : null
  const signals = result ? buildSignals(result) : []
  const hasMetadataUrl = Object.keys(result?.metadata || {}).length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex-1 pt-24 pb-20">
        <div className="container mx-auto px-6 max-w-6xl">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <ScanSearch className="size-4 text-primary" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Image Analysis
              </h1>
            </div>
            <p className="text-muted-foreground text-sm">
              Upload an image to run a deep forensic scan and detect AI manipulation.
            </p>
          </motion.div>

          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-start">

            {/* Left Column: Image & Upload (5 cols) */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="md:col-span-5 space-y-4"
            >
              <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col">
                <div className="px-4 py-3 border-b border-border flex items-center gap-2 bg-muted/30">
                  <Image className="size-4 text-muted-foreground" />
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Source Media</span>
                </div>

                <div className="p-4 bg-muted/10">
                  {!file && !id ? (
                    <div
                      {...getRootProps()}
                      className={`relative min-h-[400px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
                        isDragActive ? 'border-primary bg-primary/5' : 'border-border/60 hover:border-primary/50 hover:bg-muted/50'
                      }`}
                    >
                      <input {...getInputProps()} />
                      <div className="size-14 rounded-2xl bg-background border border-border flex items-center justify-center mb-4 shadow-sm group-hover:shadow-md transition-shadow">
                        <Upload className="size-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <p className="text-sm font-semibold text-foreground mb-1">Click or drag image</p>
                      <p className="text-xs text-muted-foreground text-center px-4">JPG, PNG, WEBP max 20MB</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Image Preview Container */}
                      <div className="relative aspect-4/5 rounded-xl overflow-hidden border border-border bg-muted/20 group">
                        {displayImage && (
                          <img 
                            src={displayImage} 
                            alt="Preview" 
                            className={`w-full h-full object-cover transition-all duration-700 ${analyzing ? 'brightness-50 blur-sm scale-105' : ''}`} 
                          />
                        )}

                        {/* Scanner Effect */}
                        {analyzing && (
                          <div className="absolute inset-x-0 h-32 bg-linear-to-b from-transparent via-primary/20 to-primary/40 blur-md rounded-full shadow-[0_0_20px_hsla(var(--primary),0.5)]"
                               style={{ animation: 'scan 2s linear infinite' }} />
                        )}

                        {/* Loading Spinner overlay */}
                        {analyzing && (
                          <div className="absolute inset-0 flex items-center justify-center z-10">
                            <div className="bg-background/80 backdrop-blur-md px-6 py-4 rounded-xl border border-border/50 text-center shadow-lg">
                              <div className="size-8 flex items-center justify-center mx-auto mb-2">
                                <span className="absolute size-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                              </div>
                              <p className="text-xs font-bold text-foreground tracking-widest uppercase mt-3">Processing</p>
                            </div>
                          </div>
                        )}
                        
                        {/* Remove button */}
                        <button
                          onClick={handleReset}
                          className="absolute top-2 right-2 size-8 rounded-full bg-background/80 backdrop-blur border border-border flex items-center justify-center text-muted-foreground hover:text-destructive hover:border-destructive/50 transition-colors opacity-0 group-hover:opacity-100 z-20 shadow-sm"
                        >
                          <X className="size-4" />
                        </button>
                      </div>

                      {/* File Info Bar */}
                      {file && (
                        <div className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border shadow-sm">
                          <div className="p-2 rounded-lg bg-muted">
                             <FileText className="size-4 text-muted-foreground shrink-0" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-foreground truncate">{file.name}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{(file.size / 1024).toFixed(1)} KB · Ready to scan</p>
                          </div>
                        </div>
                      )}

                      {!id && (
                        <Button
                          onClick={handleAnalyze}
                          disabled={analyzing || !file}
                          className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md transition-all active:scale-[0.98]"
                        >
                          {analyzing ? 'Scanning...' : 'Run Forensic Scan'}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Right Column: Results & Intel (7 cols) */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="md:col-span-7"
            >
              <AnimatePresence mode="wait">
                {!result ? (
                  // Empty State
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-8 bg-card rounded-2xl border border-border border-dashed"
                  >
                    <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4">
                      <BarChart3 className="size-6 text-muted-foreground/50" />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground mb-1">Awaiting Media</h3>
                    <p className="text-xs text-muted-foreground max-w-[250px]">
                      Upload an image to generate a detailed forensic authenticity report.
                    </p>
                  </motion.div>
                ) : (
                  // Results Dashboard
                  <motion.div
                    key="results"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-4 md:space-y-6"
                  >
                    {/* Score Card Hero */}
                    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden relative">
                       {/* Subtle animated background gradient based on status */}
                      <div className={`absolute inset-0 ${statusCfg.bg} opacity-30`} />
                      
                      <div className="p-6 relative">
                        <div className="flex items-center justify-between mb-2">
                          <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Forensic Verdict</h2>
                          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full bg-background border border-border shadow-sm`}>
                            <statusCfg.icon className={`size-3.5 ${statusCfg.color}`} />
                            <span className={`text-[10px] font-bold tracking-wider ${statusCfg.color}`}>{statusCfg.label}</span>
                          </div>
                        </div>
                        
                        <div className="py-6">
                            <ScoreGauge score={result.score} statusCfg={statusCfg} />
                        </div>
                        
                        <div className="pt-4 border-t border-border/50">
                          <p className="text-sm text-foreground leading-relaxed text-center">
                            {result.explanation || "Analysis in progress... awaiting detailed response."}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Forensic Signals */}
                    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                      <div className="px-5 py-3.5 border-b border-border bg-muted/30">
                        <div className="flex items-center gap-2">
                          <Activity className="size-4 text-primary" />
                          <span className="text-xs font-semibold text-foreground uppercase tracking-wider">Detection Signals</span>
                        </div>
                      </div>
                      <div className="p-5 space-y-5">
                        {signals.map((sig, i) => (
                          <motion.div
                            key={sig.label}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                          >
                            <div className="flex items-center justify-between text-xs mb-2">
                              <span className="text-foreground font-medium">{sig.label}</span>
                              <span className={`font-bold ${sig.warning ? 'text-amber-500' : 'text-emerald-500'}`}>{sig.value}%</span>
                            </div>
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                              <motion.div
                                className={`h-full rounded-full ${sig.warning ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${sig.value}%` }}
                                transition={{ duration: 0.8, delay: 0.2 + i * 0.05 }}
                              />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* ELA Heatmap (if available) */}
                    {result.elaUrl && (
                       <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                          <div className="px-5 py-3.5 border-b border-border bg-muted/30">
                            <div className="flex items-center gap-2">
                              <Eye className="size-4 text-primary" />
                              <span className="text-xs font-semibold text-foreground uppercase tracking-wider">Error Level Match (ELA)</span>
                            </div>
                          </div>
                          <div className="p-4 bg-muted/10">
                            <div className="relative aspect-video rounded-xl overflow-hidden border border-border/50 bg-black/10">
                              <img src={result.elaUrl} alt="ELA Heatmap" className="w-full h-full object-contain" />
                            </div>
                          </div>
                       </div>
                    )}

                    {/* Metadata Vault */}
                    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                      <button
                        onClick={() => setExpandedMeta(!expandedMeta)}
                        className="w-full flex items-center justify-between px-5 py-4 bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Camera className="size-4 text-primary" />
                          <span className="text-xs font-semibold text-foreground uppercase tracking-wider">Metadata Vault</span>
                        </div>
                        {expandedMeta ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
                      </button>
                      <AnimatePresence>
                        {expandedMeta && hasMetadataUrl && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden bg-card"
                          >
                            <div className="p-5 border-t border-border grid grid-cols-2 gap-3 bg-muted/10">
                                {Object.entries(result.metadata || {}).map(([key, val]) => (
                                  <div key={key} className="p-3 bg-card rounded-xl border border-border/50 flex flex-col justify-center">
                                    <p className="text-[10px] text-muted-foreground font-semibold uppercase mb-1 truncate">{key}</p>
                                    <p className="text-xs font-medium text-foreground line-clamp-2">{val}</p>
                                  </div>
                                ))}
                            </div>
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
      
      {/* Global scan animation keyframes */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { transform: translateY(-100%); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(400%); opacity: 0; }
        }
      `}} />
    </div>
  )
}
