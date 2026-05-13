import Link from 'next/link'
import { ArrowRight, Ticket, FileText, Megaphone, Shield } from 'lucide-react'

const features = [
  {
    icon: <Ticket className="w-6 h-6" />,
    title: 'Report Issues',
    description: 'Submit civic complaints and track their resolution in real time.',
  },
  {
    icon: <FileText className="w-6 h-6" />,
    title: 'Apply for Permits',
    description: 'Construction, event, and business permits — all in one place.',
  },
  {
    icon: <Megaphone className="w-6 h-6" />,
    title: 'Stay Informed',
    description: 'City announcements, events, and emergency alerts delivered instantly.',
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Transparent Governance',
    description: 'Every request is tracked with SLA timers and public status updates.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface">
      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-700 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold font-display">CC</span>
            </div>
            <span className="font-display font-bold text-primary-700 text-lg">CivicConnect</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-700 hover:text-primary-700 transition-colors px-3 py-2"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="text-sm font-medium bg-primary-700 text-white px-4 py-2 rounded hover:bg-primary-900 transition-colors min-h-[44px] flex items-center"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-primary-700 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Your City. Your Voice.
            <br />
            <span className="text-amber-400">Your CivicConnect.</span>
          </h1>
          <p className="text-primary-100 text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            Report civic issues, apply for permits, and stay connected with your city government — all in one platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-semibold px-6 py-3 rounded text-base transition-colors min-h-[52px]"
            >
              Report an Issue
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded text-base transition-colors border border-white/30 min-h-[52px]"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-2xl font-bold text-gray-900 text-center mb-10">
            Everything you need to engage with your city
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-white rounded-lg p-5 shadow-card border border-gray-100">
                <div className="w-10 h-10 bg-primary-50 text-primary-700 rounded-lg flex items-center justify-center mb-3" aria-hidden="true">
                  {f.icon}
                </div>
                <h3 className="font-display font-semibold text-gray-900 mb-1">{f.title}</h3>
                <p className="text-sm text-gray-600">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-16 px-4 border-t border-gray-100">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-2xl font-bold text-gray-900 text-center mb-10">
            How it works
          </h2>
          <ol className="space-y-6" role="list">
            {[
              { step: '01', title: 'Create your account', desc: 'Register with your email and verify with a one-time code.' },
              { step: '02', title: 'Submit your request', desc: 'Describe the issue, attach photos, and pin the location.' },
              { step: '03', title: 'Track in real time', desc: 'Get notified at every status change until resolution.' },
            ].map((item) => (
              <li key={item.step} className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-primary-700 text-white flex items-center justify-center font-display font-bold text-sm flex-shrink-0" aria-hidden="true">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-display font-semibold text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-600 mt-0.5">{item.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-primary-50">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="font-display text-2xl font-bold text-gray-900 mb-3">
            Ready to get started?
          </h2>
          <p className="text-gray-600 mb-6">Join thousands of residents already using CivicConnect.</p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-primary-700 hover:bg-primary-900 text-white font-semibold px-6 py-3 rounded transition-colors min-h-[52px]"
          >
            Create Free Account
            <ArrowRight className="w-5 h-5" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary-900 text-primary-100 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">CC</span>
            </div>
            <span className="font-display font-semibold text-white">CivicConnect</span>
          </div>
          <p className="text-primary-300">
            © 2026 CivicConnect. AUREX AI — Bahria University BSEAS.
          </p>
          <Link href="/verify/demo" className="hover:text-white transition-colors">
            Verify a Permit
          </Link>
        </div>
      </footer>
    </div>
  )
}
