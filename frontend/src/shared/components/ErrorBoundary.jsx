import React from 'react'
import { AlertTriangle, Home, RefreshCcw } from 'lucide-react'
import { Button } from './ui/button'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center bg-card rounded-3xl border border-destructive/20 shadow-2xl">
          <div className="size-20 rounded-full bg-destructive/10 flex items-center justify-center mb-8">
            <AlertTriangle className="size-10 text-destructive" />
          </div>
          <h2 className="text-3xl font-black tracking-tighter text-foreground mb-4 uppercase">
            System_Interrupt<span className="text-destructive">.</span>
          </h2>
          <p className="text-foreground/40 text-sm max-w-md mb-12 font-medium leading-relaxed">
            A runtime exception occurred in the forensic pipeline. This may be due to an unexpected data format or connection failure.
          </p>
          <div className="flex items-center gap-4">
            <Button 
              onClick={() => window.location.reload()}
              className="h-12 px-8 rounded-full bg-foreground text-background font-black text-[10px] tracking-widest uppercase"
            >
              <RefreshCcw className="size-4 mr-2" />
              REBOOT_SESSION
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/'}
              className="h-12 px-8 rounded-full border-foreground/10 font-black text-[10px] tracking-widest uppercase hover:bg-foreground/5"
            >
              <Home className="size-4 mr-2" />
              TERMINATE
            </Button>
          </div>
          {import.meta.env.DEV && (
            <div className="mt-12 p-6 bg-muted rounded-2xl w-full max-w-2xl text-left overflow-auto max-h-48 border border-border">
               <p className="text-[10px] font-black text-destructive tracking-widest uppercase mb-4">Error_Log:</p>
               <pre className="text-[11px] font-mono text-foreground/70 leading-relaxed whitespace-pre-wrap">
                 {this.state.error?.toString()}
               </pre>
            </div>
          )}
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
