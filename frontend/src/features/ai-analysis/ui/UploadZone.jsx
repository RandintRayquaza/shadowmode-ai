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
            className="relative border border-foreground/5 bg-foreground/1 rounded-4xl p-4"
          >
            <div 
              {...getRootProps()} 
              className={`
                relative min-h-[550px] rounded-[3rem] border border-dashed transition-all duration-1000 h-full flex flex-col items-center justify-center cursor-pointer overflow-hidden
                ${isDragActive ? 'border-foreground/40 bg-foreground/3' : 'border-foreground/10 hover:border-foreground/20'}
                ${file ? 'p-6' : 'p-24'}
              `}
            >
              <input {...getInputProps()} />

              <AnimatePresence mode="wait">
                {!file ? (
                  <motion.div 
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center"
                  >
                    <div className="size-24 rounded-full border border-foreground/10 flex items-center justify-center mb-12 mx-auto group">
                       <Upload className="size-8 text-foreground/20 group-hover:text-foreground transition-all duration-700" />
                    </div>
                    <h3 className="text-3xl font-black text-foreground mb-4 uppercase tracking-tighter">
                      {user ? 'Drop Media File' : 'Login Required'}
                    </h3>
                    <p className="text-foreground/30 font-medium text-sm tracking-widest uppercase mb-8">
                      {user ? 'PNG, JPG, WEBP • Max 20MB' : 'Sign in to access forensic tools'}
                    </p>

                    {!user && (
                      <Link to="/login" onClick={(e) => e.stopPropagation()}>
                        <Button className="rounded-full bg-foreground text-background font-bold text-[10px] tracking-[0.2em] px-12 h-12 uppercase">
                          Sign In
                        </Button>
                      </Link>
                    )}
                    
                    <div className="mt-16 flex items-center justify-center gap-16 opacity-10">
                       <div className="flex flex-col items-center gap-2">
                          <Lock className="size-5" />
                          <span className="text-[10px] font-black tracking-[0.2em]">ENCRYPTED</span>
                       </div>
                       <div className="h-4 w-px bg-foreground" />
                       <div className="flex flex-col items-center gap-2">
                          <Fingerprint className="size-5" />
                          <span className="text-[10px] font-black tracking-[0.2em]">VALIDATED</span>
                       </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="preview"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="relative w-full h-full flex flex-col items-center justify-center"
                  >
                    <div className="relative group max-w-sm w-full aspect-4/5 rounded-[2.5rem] overflow-hidden border border-foreground/10 bg-black mb-12">
                       <img 
                        src={URL.createObjectURL(file)} 
                        alt="Preview" 
                        className={`w-full h-full object-cover transition-all duration-3000 ${isAnalyzing ? 'scale-110 blur-md opacity-40' : 'opacity-80'}`} 
                      />
                       
                       {isAnalyzing && (
                         <div className="scan-line absolute inset-x-0 top-0 h-px bg-foreground shadow-[0_0_20px_white] z-20" />
                       )}
                       
                       <button 
                         onClick={(e) => { e.stopPropagation(); setFile(null); }}
                         className="absolute top-6 right-6 size-12 rounded-full bg-black/80 border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all z-30"
                       >
                         <X className="size-5" />
                       </button>

                       {isAnalyzing && (
                         <div className="absolute inset-0 flex items-center justify-center z-20">
                            <div className="flex flex-col items-center gap-6">
                               <div className="size-12 border border-foreground/20 border-t-foreground rounded-full animate-spin" />
                               <span className="text-[10px] font-black tracking-[0.4em] text-foreground animate-pulse uppercase">Neural Scanning</span>
                            </div>
                         </div>
                       )}
                    </div>

                    <div className="flex flex-col items-center gap-8">
                       <div className="flex items-center gap-12">
                          <div className="flex flex-col items-center">
                             <span className="text-[10px] text-foreground/20 tracking-widest font-black mb-2 uppercase">File</span>
                             <span className="text-foreground font-bold text-sm">{file.name.length > 20 ? file.name.substring(0, 20) + '...' : file.name}</span>
                          </div>
                          <div className="w-px h-8 bg-foreground/10" />
                          <div className="flex flex-col items-center">
                             <span className="text-[10px] text-foreground/20 tracking-widest font-black mb-2 uppercase">Size</span>
                             <span className="text-foreground font-bold text-sm">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                          </div>
                       </div>

                       <Button 
                         size="lg" 
                         disabled={isAnalyzing}
                         onClick={(e) => { e.stopPropagation(); handleAnalyze(); }}
                         className="h-16 px-16 rounded-full bg-foreground text-background font-bold text-xs tracking-[0.2em] transition-all hover:scale-105 active:scale-95 group uppercase"
                       >
                         {isAnalyzing ? 'Processing...' : 'Start Scan'}
                         {!isAnalyzing && <ArrowRight className="ml-3 font-bold transition-transform group-hover:translate-x-1" />}
                       </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Minimal Corner Details */}
            <div className="absolute top-8 left-8 text-[8px] font-black tracking-widest text-foreground/20 uppercase pointer-events-none">
               Status: Ready
            </div>
            <div className="absolute bottom-8 right-8 text-[8px] font-black tracking-widest text-foreground/20 uppercase pointer-events-none">
               ShadowMode v4.0.1
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
