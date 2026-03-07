// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion'

const MARQUEE_ITEMS = [
  'AI Detection',
  'Image Forensics',
  'Metadata Analysis',
  'Authenticity Score',
  'Deepfake Detection',
  'Pattern Analysis',
  'Neural Validation',
]

export default function Marquee() {
  return (
    <div className="relative py-12 overflow-hidden border-y border-foreground/5 bg-foreground/1">
      <div className="flex whitespace-nowrap">
        <motion.div 
          initial={{ x: 0 }}
          animate={{ x: "-50%" }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="flex gap-20 items-center px-10"
        >
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <div key={i} className="flex items-center gap-20">
              <span className="text-[10vw] font-black uppercase tracking-tighter text-foreground/5 transition-colors hover:text-brand/20 cursor-default">
                {item}
              </span>
              <div className="size-3 rounded-full bg-brand/20 border border-brand/30" />
            </div>
          ))}
        </motion.div>
      </div>
      
      {/* Overlay for soft edges */}
      <div className="absolute inset-y-0 left-0 w-64 bg-linear-to-r from-background to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-64 bg-linear-to-l from-background to-transparent z-10" />
    </div>
  )
}
