import Navbar from '@/shared/components/Navbar'
import Footer from '@/shared/components/Footer'
import Hero from './Hero'
import Marquee from './Marquee'
import ScrollStory from './ScrollStory'
import HowItWorks from './HowItWorks'
import CtaSection from './CtaSection'
import UploadZone from '@/features/ai-analysis/ui/UploadZone'
import TechnologySection from './TechnologySection'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-foreground selection:text-background">
      <Navbar />
      <main>
        <Hero />
        <Marquee />
        <ScrollStory />
        <HowItWorks />
        <TechnologySection />
        <UploadZone />
        <CtaSection />
      </main>
      <Footer />
    </div>
  )
}
