import { useState } from 'react'
import { motion } from 'framer-motion'
import Navbar from '@/shared/components/Navbar'
import { useAuth } from '@/app/providers/AuthContext'
import { Button } from '@/shared/components/ui/button'
import {
  User, Mail, Phone, Lock, Bell, Shield, Palette,
  Save, Loader2, Check, Camera, Eye, EyeOff, CreditCard, Trash2
} from 'lucide-react'

const SECTIONS = ['Profile', 'Security', 'Notifications', 'Billing', 'Danger Zone']

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const [activeSection, setActiveSection] = useState('Profile')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false })
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [notifications, setNotifications] = useState({
    analysisComplete: true,
    weeklyReport: false,
    securityAlerts: true,
    productUpdates: false,
  })

  const handleSave = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 1000))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
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
            className="mb-10"
          >
            <p className="text-[10px] font-black tracking-[0.4em] text-muted-foreground mb-2 uppercase">Configuration</p>
            <h1 className="text-4xl font-black tracking-tighter text-foreground">
              Account <span className="text-primary italic">Settings</span>
            </h1>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-8">

            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:w-56 flex-shrink-0"
            >
              {/* Avatar */}
              <div className="glass-card rounded-2xl border border-border p-5 mb-4 text-center">
                <div className="relative inline-block mb-3">
                  <div className="size-16 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-black text-xl mx-auto">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <button className="absolute -bottom-1 -right-1 size-6 rounded-full bg-primary flex items-center justify-center hover:scale-110 transition-transform">
                    <Camera className="size-3 text-primary-foreground" />
                  </button>
                </div>
                <p className="text-xs font-black text-foreground">{user?.name}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{user?.email}</p>
                <div className="mt-3 inline-block text-[9px] font-black tracking-widest bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">
                  {user?.plan?.toUpperCase()} PLAN
                </div>
              </div>

              {/* Nav */}
              <div className="glass-card rounded-2xl border border-border overflow-hidden">
                {[
                  { label: 'Profile', icon: User },
                  { label: 'Security', icon: Shield },
                  { label: 'Notifications', icon: Bell },
                  { label: 'Billing', icon: CreditCard },
                  { label: 'Danger Zone', icon: Trash2 },
                ].map(({ label, icon: Icon }) => (
                  <button
                    key={label}
                    onClick={() => setActiveSection(label)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 text-xs font-bold transition-all border-b border-white/[0.04] last:border-0 ${
                      activeSection === label
                        ? 'bg-primary/10 text-primary border-l-2 border-l-primary pl-3.5'
                        : label === 'Danger Zone'
                        ? 'text-destructive/50 hover:text-destructive hover:bg-destructive/5'
                        : 'text-muted-foreground hover:text-foreground/80 hover:bg-white/[0.02]'
                    }`}
                  >
                    <Icon className="size-3.5" />
                    {label}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Content */}
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex-1"
            >
              {activeSection === 'Profile' && (
                <div className="glass-card rounded-3xl border border-border p-8">
                  <h2 className="text-sm font-black tracking-wider text-foreground mb-8 pb-5 border-b border-border">Profile Information</h2>
                  <div className="space-y-5 max-w-lg">
                    <div>
                      <label className="text-[10px] font-black tracking-widest text-muted-foreground mb-2 block uppercase">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <input
                          value={name}
                          onChange={e => setName(e.target.value)}
                          className="w-full bg-white/[0.03] border border-border/60 rounded-2xl pl-12 pr-4 py-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 outline-none transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black tracking-widest text-muted-foreground mb-2 block uppercase">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <input
                          type="email"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          className="w-full bg-white/[0.03] border border-border/60 rounded-2xl pl-12 pr-4 py-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 outline-none transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black tracking-widest text-muted-foreground mb-2 block uppercase">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <input
                          type="tel"
                          placeholder="+1 (555) 000-0000"
                          className="w-full bg-white/[0.03] border border-border/60 rounded-2xl pl-12 pr-4 py-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 outline-none transition-all"
                        />
                      </div>
                    </div>
                    <Button
                      onClick={handleSave}
                      disabled={saving}
                      className="h-12 px-8 rounded-2xl bg-primary hover:bg-primary/80 text-primary-foreground font-black text-xs tracking-widest"
                    >
                      {saving ? <Loader2 className="size-4 animate-spin" /> : saved ? <><Check className="size-4 mr-2" />SAVED</> : <><Save className="size-4 mr-2" />SAVE CHANGES</>}
                    </Button>
                  </div>
                </div>
              )}

              {activeSection === 'Security' && (
                <div className="glass-card rounded-3xl border border-border p-8">
                  <h2 className="text-sm font-black tracking-wider text-foreground mb-8 pb-5 border-b border-border">Security Settings</h2>
                  <div className="space-y-5 max-w-lg">
                    {['Current Password', 'New Password', 'Confirm Password'].map((label, i) => {
                      const key = ['current', 'new', 'confirm'][i]
                      return (
                        <div key={label}>
                          <label className="text-[10px] font-black tracking-widest text-muted-foreground mb-2 block uppercase">{label}</label>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <input
                              type={showPass[key] ? 'text' : 'password'}
                              className="w-full bg-white/[0.03] border border-border/60 rounded-2xl pl-12 pr-12 py-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 outline-none transition-all"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPass(p => ({ ...p, [key]: !p[key] }))}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground/70 transition-colors"
                            >
                              {showPass[key] ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                            </button>
                          </div>
                        </div>
                      )
                    })}

                    <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                      <div className="flex items-center gap-3">
                        <Shield className="size-5 text-primary flex-shrink-0" />
                        <div>
                          <p className="text-xs font-black text-foreground">Two-Factor Authentication</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">Add an extra layer of security to your account</p>
                        </div>
                        <button className="ml-auto text-[10px] font-black tracking-widest text-primary border border-primary/30 px-3 py-1.5 rounded-full hover:bg-primary/10 transition-colors">
                          ENABLE
                        </button>
                      </div>
                    </div>

                    <Button className="h-12 px-8 rounded-2xl bg-primary hover:bg-primary/80 text-primary-foreground font-black text-xs tracking-widest">
                      <Save className="size-4 mr-2" /> UPDATE PASSWORD
                    </Button>
                  </div>
                </div>
              )}

              {activeSection === 'Notifications' && (
                <div className="glass-card rounded-3xl border border-border p-8">
                  <h2 className="text-sm font-black tracking-wider text-foreground mb-8 pb-5 border-b border-border">Notification Preferences</h2>
                  <div className="space-y-4 max-w-lg">
                    {[
                      { key: 'analysisComplete', label: 'Analysis Complete', desc: 'Get notified when your forensic analysis finishes' },
                      { key: 'weeklyReport', label: 'Weekly Report', desc: 'Receive a weekly summary of your analysis activity' },
                      { key: 'securityAlerts', label: 'Security Alerts', desc: 'Important notices about your account security' },
                      { key: 'productUpdates', label: 'Product Updates', desc: 'News about new features and improvements' },
                    ].map(({ key, label, desc }) => (
                      <div
                        key={key}
                        className="flex items-start justify-between p-5 bg-white/[0.02] rounded-2xl border border-border gap-4"
                      >
                        <div>
                          <p className="text-sm font-bold text-foreground/80">{label}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">{desc}</p>
                        </div>
                        <button
                          onClick={() => setNotifications(n => ({ ...n, [key]: !n[key] }))}
                          className={`w-12 h-6 rounded-full transition-all flex-shrink-0 relative ${notifications[key] ? 'bg-primary' : 'bg-muted/50'}`}
                        >
                          <motion.div
                            className="absolute top-1 size-4 bg-white rounded-full shadow-sm"
                            animate={{ left: notifications[key] ? '1.5rem' : '0.25rem' }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeSection === 'Billing' && (
                <div className="glass-card rounded-3xl border border-border p-8">
                  <h2 className="text-sm font-black tracking-wider text-foreground mb-8 pb-5 border-b border-border">Billing & Plan</h2>
                  <div className="space-y-6 max-w-lg">
                    {/* Current plan */}
                    <div className="p-6 bg-primary/5 rounded-2xl border border-primary/15 relative overflow-hidden">
                      <div className="absolute top-4 right-4 text-[9px] font-black tracking-widest text-primary border border-primary/20 bg-primary/10 px-2 py-0.5 rounded-full">CURRENT</div>
                      <p className="text-xl font-black text-foreground">{user?.plan} Plan</p>
                      <p className="text-muted-foreground text-sm mt-1">500 analyses / month · Priority processing</p>
                      <p className="text-primary font-black text-lg mt-3">$29<span className="text-muted-foreground text-sm font-normal">/month</span></p>
                    </div>

                    {/* Upgrade options */}
                    {[
                      { name: 'Enterprise', price: '$99', analyses: 'Unlimited', features: 'API access, bulk processing, custom integrations' },
                    ].map(plan => (
                      <div key={plan.name} className="p-5 bg-white/[0.02] rounded-2xl border border-border">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-black text-foreground">{plan.name} Plan</p>
                            <p className="text-[10px] text-muted-foreground mt-1">{plan.features}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-foreground font-black">{plan.price}<span className="text-muted-foreground text-xs font-normal">/mo</span></p>
                            <Button size="sm" className="mt-2 h-8 px-4 text-[10px] rounded-xl bg-primary text-primary-foreground font-black tracking-widest">UPGRADE</Button>
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="p-4 bg-white/[0.02] rounded-2xl border border-border">
                      <div className="flex items-center gap-3">
                        <CreditCard className="size-5 text-muted-foreground" />
                        <div>
                          <p className="text-xs font-bold text-foreground/60">•••• •••• •••• 4242</p>
                          <p className="text-[10px] text-muted-foreground">Expires 12/27</p>
                        </div>
                        <button className="ml-auto text-[10px] font-black tracking-widest text-muted-foreground hover:text-primary transition-colors">UPDATE</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'Danger Zone' && (
                <div className="glass-card rounded-3xl border border-destructive/15 p-8">
                  <h2 className="text-sm font-black tracking-wider text-destructive mb-8 pb-5 border-b border-destructive/10">Danger Zone</h2>
                  <div className="space-y-4 max-w-lg">
                    <div className="p-5 bg-destructive/[0.03] rounded-2xl border border-destructive/10">
                      <p className="text-sm font-black text-foreground/80 mb-1">Delete All Analysis History</p>
                      <p className="text-[10px] text-muted-foreground mb-4">Permanently delete all your forensic analysis history. This action cannot be undone.</p>
                      <Button variant="outline" size="sm" className="h-9 border-destructive/30 text-destructive/70 hover:bg-destructive/10 hover:text-destructive rounded-xl text-xs">
                        <Trash2 className="size-3 mr-1.5" /> DELETE HISTORY
                      </Button>
                    </div>
                    <div className="p-5 bg-destructive/[0.03] rounded-2xl border border-destructive/10">
                      <p className="text-sm font-black text-foreground/80 mb-1">Delete Account</p>
                      <p className="text-[10px] text-muted-foreground mb-4">Permanently delete your ShadowMode account and all associated data. This cannot be undone.</p>
                      <Button variant="outline" size="sm" className="h-9 border-destructive/30 text-destructive/70 hover:bg-destructive/10 hover:text-destructive rounded-xl text-xs">
                        <Trash2 className="size-3 mr-1.5" /> DELETE ACCOUNT
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
