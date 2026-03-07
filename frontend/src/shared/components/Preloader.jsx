import { useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion'
export default function Preloader({ onComplete }) {
  const [percent, setPercent] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setInterval(() => {
      setPercent((prev) => {
        if (prev >= 100) {
          clearInterval(timer)
          return 100
        }
        return prev + Math.floor(Math.random() * 5) + 1
      })
    }, 50)

    if (percent === 100) {
      setTimeout(() => {
        setIsVisible(false)
        onComplete?.()
      }, 800)
    }

    return () => clearInterval(timer)
  }, [percent, onComplete])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-background"
        >
          <div className="relative overflow-hidden mb-8">
             <motion.h1 
               initial={{ y: "100%" }}
               animate={{ y: 0 }}
               transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
               className="text-sm font-black tracking-[0.5em] text-foreground uppercase"
             >
               ShadowMode
             </motion.h1>
          </div>
          
          <div className="w-[200px] h-px bg-foreground/8 relative overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percent}%` }}
              className="absolute inset-y-0 left-0 bg-brand"
              style={{ boxShadow: '0 0 8px hsla(186,90%,52%,0.6)' }}
            />
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-[10px] font-black tabular-nums tracking-widest text-brand"
          >
            {percent.toString().padStart(3, '0')}%
          </motion.div>

          {/* Minimalist Grid Pattern */}
          <div className="absolute inset-0 bg-grid-minimal opacity-[0.03] pointer-events-none" />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
