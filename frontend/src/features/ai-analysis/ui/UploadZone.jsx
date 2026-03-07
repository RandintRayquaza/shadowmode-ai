import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { Upload, X, FileText, CheckCircle2, ShieldAlert, Zap, Search, Lock, Fingerprint, ArrowRight } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { useAuth } from '@/app/providers/AuthContext'
import gsap from 'gsap'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { uploadImageAndAnalyze } from '../state/analysisThunks'
export default function UploadZone() {
  const [file, setFile] = useState(null)
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const dispatch = useAppDispatch()
  const { loading: isAnalyzing } = useAppSelector(state => state.analysis)

  const onDrop = useCallback(acceptedFiles => {
    setFile(acceptedFiles[0])
    // Auto-scroll slightly to focus on the preview
    window.lenis?.scrollTo('#upload-container', { offset: -100 })
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false,
    noClick: !user,
    noKeyboard: !user
  })

  const handleAnalyze = async () => {
    if (!user) {
      navigate('/login')
      return
    }
    
    // Scan animation logic
    gsap.to('.scan-line', {
      top: '100%',
      duration: 2,
      repeat: -1,
      ease: 'power1.inOut'
    })

    try {
      const res = await dispatch(uploadImageAndAnalyze(file)).unwrap()
      if (res?.id) {
        navigate(`/analyze/${res.id}`)
      }
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <section id="upload-section" className="py-40 relative bg-background border-y border-foreground/5 overflow-hidden">
      <div className="absolute inset-0 bg-grid-minimal opacity-[0.02]" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-32">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-[10px] font-black tracking-[0.4em] mb-10 block uppercase text-foreground/40"
          >
            Terminal Interface
          </motion.div>
          <h2 className="text-7xl md:text-[8vw] font-black text-foreground mb-10 leading-[0.85] uppercase tracking-tighter">
            Begin <br />
            <span className="font-serif italic font-light lowercase text-foreground/20">analysis.</span>
          </h2>
          <p className="text-xl text-foreground/40 font-medium max-w-2xl mx-auto leading-relaxed">
            Test the system by uploading an image for verification. Authentication is required via Google, Email, or Phone to access our forensic tools.
          </p>
        </div>

        <div id="upload-container" className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative border border-foreground/8 bg-foreground/2 rounded-[3rem] p-4 glass-card shadow-2xl"
          >
            <div 
              {...getRootProps()} 
              className={`
                relative min-h-[600px] rounded-[2.5rem] border border-dashed transition-all duration-1000 h-full flex flex-col items-center justify-center cursor-pointer overflow-hidden
                ${isDragActive ? 'border-primary bg-primary/5' : 'border-foreground/10 hover:border-foreground/20'}
                ${file ? 'p-6' : 'p-20'}
              `}
            >
              <input {...getInputProps()} />

              <AnimatePresence mode="wait">
                {!file ? (
                  <motion.div 
                    key="idle"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    className="text-center"
                  >
                    <div className="size-28 rounded-full border border-foreground/5 bg-foreground/2 flex items-center justify-center mb-12 mx-auto group relative">
                       <div className="absolute inset-0 rounded-full bg-primary/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                       <Upload className="size-10 text-foreground/20 group-hover:text-primary transition-all duration-700 relative z-10" />
                    </div>
                    <h3 className="text-4xl font-black text-foreground mb-4 uppercase tracking-tighter">
                      {user ? 'IDENTIFY_MEDIA' : 'AUTH_REQUIRED'}
                    </h3>
                    <p className="text-foreground/30 font-bold text-[10px] tracking-[0.3em] uppercase mb-10">
                      {user ? 'PNG, JPG, WEBP • ISO_FORENSIC_READY' : 'Sign in to access neural scanning'}
                    </p>

                    {!user && (
                      <Link to="/login" onClick={(e) => e.stopPropagation()}>
                        <Button className="h-16 px-12 rounded-full bg-foreground text-background font-black text-[10px] tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition-all uppercase">
                          INITIALIZE SESSION
                        </Button>
                      </Link>
                    )}
                    
                    <div className="mt-20 flex items-center justify-center gap-12 opacity-20">
                       <div className="flex flex-col items-center gap-3">
                          <Lock className="size-4" />
                          <span className="text-[9px] font-black tracking-[0.2em] uppercase">AES_256</span>
                       </div>
                       <div className="h-4 w-px bg-foreground/30" />
                       <div className="flex flex-col items-center gap-3">
                          <Fingerprint className="size-4" />
                          <span className="text-[9px] font-black tracking-[0.2em] uppercase">BIO_VERIFIED</span>
                       </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="preview"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative w-full h-full flex flex-col items-center justify-center"
                  >
                    <div className="relative group max-w-sm w-full aspect-4/5 rounded-[2.5rem] overflow-hidden border border-foreground/10 bg-black mb-12 shadow-2xl">
                       <img 
                        src={URL.createObjectURL(file)} 
                        alt="Preview" 
                        className={`w-full h-full object-cover transition-all duration-3000 ${isAnalyzing ? 'scale-110 blur-xl opacity-30' : 'opacity-70 group-hover:opacity-100'}`} 
                      />
                       
                       {isAnalyzing && (
                         <div className="scan-line absolute inset-x-0 top-0 h-1 bg-primary shadow-[0_0_30px_#2DD4BF] z-20" />
                       )}
                       
                       <button 
                         onClick={(e) => { e.stopPropagation(); setFile(null); }}
                         className="absolute top-6 right-6 size-12 rounded-full bg-black/80 border border-white/10 flex items-center justify-center text-white hover:bg-destructive hover:border-destructive transition-all z-30 group"
                       >
                         <X className="size-5 group-hover:rotate-90 transition-transform" />
                       </button>

                       {isAnalyzing && (
                         <div className="absolute inset-0 flex items-center justify-center z-20">
                            <div className="flex flex-col items-center gap-8">
                               <div className="relative">
                                  <div className="size-20 border-2 border-primary/20 border-t-primary rounded-full animate-spin shadow-[0_0_20px_rgba(45,212,191,0.2)]" />
                                  <div className="absolute inset-2 border border-primary/10 border-b-primary rounded-full animate-spin-reverse" />
                               </div>
                               <div className="flex flex-col items-center gap-2">
                                  <span className="text-[10px] font-black tracking-[0.5em] text-primary animate-pulse uppercase">NEURAL_SCANNING</span>
                                  <span className="text-[8px] font-bold text-primary/40 uppercase tracking-widest">LAYER_INGESTION_V2</span>
                               </div>
                            </div>
                         </div>
                       )}
                    </div>

                    <div className="flex flex-col items-center gap-10">
                       <div className="flex items-center gap-16">
                          <div className="flex flex-col items-center">
                             <span className="text-[9px] text-foreground/20 tracking-[0.3em] font-black mb-2 uppercase">DATA_ID</span>
                             <span className="text-foreground font-black text-[11px] tabular-nums uppercase tracking-tight">{file.name.length > 24 ? file.name.substring(0, 24) + '...' : file.name}</span>
                          </div>
                          <div className="flex flex-col items-center">
                             <span className="text-[9px] text-foreground/20 tracking-[0.3em] font-black mb-2 uppercase">VOLUME</span>
                             <span className="text-foreground font-black text-[11px] tabular-nums">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                          </div>
                       </div>

                       <Button 
                         size="lg" 
                         disabled={isAnalyzing}
                         onClick={(e) => { e.stopPropagation(); handleAnalyze(); }}
                         className="h-20 px-20 rounded-full bg-foreground text-background font-black text-[10px] tracking-[0.3em] transition-all hover:scale-105 active:scale-95 group uppercase shadow-2xl"
                       >
                         {isAnalyzing ? 'PROCESSING...' : 'EXECUTE ANALYSIS'}
                         {!isAnalyzing && <ArrowRight className="ml-4 font-bold transition-transform group-hover:translate-x-1" />}
                       </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Minimal Corner Details */}
            <div className="absolute top-10 left-10 flex items-center gap-3 opacity-20 pointer-events-none">
                <div className="size-1 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[8px] font-black tracking-[0.3em] text-foreground uppercase">SYSTEM_READY</span>
            </div>
            <div className="absolute bottom-10 right-10 text-[8px] font-black tracking-[0.4em] text-foreground/10 uppercase pointer-events-none">
               FORENSIC_SUITE // V4.0.5
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
