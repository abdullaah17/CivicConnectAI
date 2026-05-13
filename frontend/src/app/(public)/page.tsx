'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Ticket, FileText, Megaphone, Shield } from 'lucide-react'
import { WordsPullUp } from '@/components/common/WordsPullUp'

const navItems = ['Our Story', 'Services', 'Permits', 'Events', 'Contact']

const features = [
  { icon: <Ticket className="w-6 h-6" />, title: 'Report Issues', description: 'Submit civic complaints and track their resolution in real time.' },
  { icon: <FileText className="w-6 h-6" />, title: 'Apply for Permits', description: 'Construction, event, and business permits — all in one place.' },
  { icon: <Megaphone className="w-6 h-6" />, title: 'Stay Informed', description: 'City announcements, events, and emergency alerts delivered instantly.' },
  { icon: <Shield className="w-6 h-6" />, title: 'Transparent Governance', description: 'Every request is tracked with SLA timers and public status updates.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'transparent' }}>

      {/* ── Navbar (Prisma-style pill) ─────────────────────────────────────── */}
      <nav className="absolute left-1/2 top-0 z-20 -translate-x-1/2">
        <div className="flex items-center gap-3 rounded-b-2xl bg-black px-4 py-2 sm:gap-6 md:gap-12 md:rounded-b-3xl md:px-8 lg:gap-14">
          {navItems.map((item) => (
            <a
              key={item}
              href="#"
              className="text-[10px] transition-colors sm:text-xs md:text-sm"
              style={{ color: 'rgba(225, 224, 204, 0.8)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#E1E0CC')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(225, 224, 204, 0.8)')}
            >
              {item}
            </a>
          ))}
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="h-screen w-full relative flex flex-col justify-end overflow-hidden">
        <div className="px-4 pb-2 sm:px-6 md:px-10">
          <div className="grid grid-cols-12 items-end gap-4">

            {/* Giant wordmark — two lines so each word fills width without overflow */}
            <div className="col-span-12 lg:col-span-7 overflow-hidden">
              <h1
                className="font-medium leading-[0.82] tracking-[-0.05em]"
                style={{ color: '#E1E0CC' }}
              >
                {/* "Civic" — scales to fill ~half the viewport width */}
                <span className="block text-[13vw] sm:text-[12vw] md:text-[11vw] lg:text-[10vw] xl:text-[9.5vw]">
                  <WordsPullUp text="Civic" />
                </span>
                {/* "Connect" — slightly smaller so it fits on one line */}
                <span className="block text-[13vw] sm:text-[12vw] md:text-[11vw] lg:text-[10vw] xl:text-[9.5vw]">
                  <WordsPullUp text="Connect" />
                </span>
              </h1>
            </div>

            {/* Tagline + CTA */}
            <div className="col-span-12 flex flex-col gap-5 pb-6 lg:col-span-5 lg:pb-10">
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="text-xs sm:text-sm md:text-base"
                style={{ color: 'rgba(225, 224, 204, 0.85)', lineHeight: 1.3 }}
              >
                Your city. Your voice. Report civic issues, apply for permits, and stay connected with your city government — all in one platform.
              </motion.p>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-wrap gap-3"
              >
                <Link
                  href="/register"
                  className="group inline-flex items-center gap-2 rounded-full py-1 pl-5 pr-1 text-sm font-medium text-black transition-all hover:gap-3 sm:text-base"
                  style={{ backgroundColor: '#E1E0CC' }}
                >
                  Get Started
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black transition-transform group-hover:scale-110 sm:h-10 sm:w-10">
                    <ArrowRight className="h-4 w-4" style={{ color: '#E1E0CC' }} />
                  </span>
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-full text-sm font-medium border transition-colors"
                  style={{ color: '#E1E0CC', borderColor: 'rgba(225,224,204,0.4)', backgroundColor: 'rgba(0,0,0,0.3)' }}
                >
                  Sign In
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 md:px-10">
        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-2xl font-bold text-center mb-10 drop-shadow"
          style={{ color: '#E1E0CC' }}
        >
          Everything you need to engage with your city
        </motion.h2>
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="card-glass p-5"
            >
              <div className="w-10 h-10 bg-primary-700/80 text-white rounded-lg flex items-center justify-center mb-3" aria-hidden="true">
                {f.icon}
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
              <p className="text-sm text-gray-600">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6 md:px-10">
        <div className="max-w-3xl mx-auto">
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-2xl font-bold text-center mb-10 drop-shadow"
            style={{ color: '#E1E0CC' }}
          >
            How it works
          </motion.h2>
          <ol className="space-y-6" role="list">
            {[
              { step: '01', title: 'Create your account', desc: 'Register with your email and verify with a one-time code.' },
              { step: '02', title: 'Submit your request', desc: 'Describe the issue, attach photos, and pin the location.' },
              { step: '03', title: 'Track in real time', desc: 'Get notified at every status change until resolution.' },
            ].map((item, i) => (
              <motion.li
                key={item.step}
                initial={{ x: -20, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="flex gap-4 items-start"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                  style={{ backgroundColor: '#E1E0CC', color: '#0F2447' }}
                  aria-hidden="true"
                >
                  {item.step}
                </div>
                <div>
                  <h3 className="font-semibold drop-shadow" style={{ color: '#E1E0CC' }}>{item.title}</h3>
                  <p className="text-sm mt-0.5" style={{ color: 'rgba(225,224,204,0.7)' }}>{item.desc}</p>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 text-center">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-xl mx-auto"
        >
          <h2 className="text-2xl font-bold mb-3 drop-shadow" style={{ color: '#E1E0CC' }}>
            Ready to get started?
          </h2>
          <p className="mb-6" style={{ color: 'rgba(225,224,204,0.7)' }}>
            Join thousands of residents already using CivicConnect.
          </p>
          <Link
            href="/register"
            className="group inline-flex items-center gap-2 rounded-full py-1 pl-6 pr-1 text-sm font-medium text-black transition-all hover:gap-3"
            style={{ backgroundColor: '#E1E0CC' }}
          >
            Create Free Account
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black transition-transform group-hover:scale-110">
              <ArrowRight className="h-4 w-4" style={{ color: '#E1E0CC' }} />
            </span>
          </Link>
        </motion.div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="py-8 px-4 border-t" style={{ borderColor: 'rgba(225,224,204,0.15)' }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary-700 rounded flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">CC</span>
            </div>
            <span className="font-semibold" style={{ color: '#E1E0CC' }}>CivicConnect</span>
          </div>
          <p style={{ color: 'rgba(225,224,204,0.5)' }}>
            © 2026 CivicConnect · AUREX AI · Bahria University BSEAS
          </p>
          <Link href="/verify/demo" style={{ color: 'rgba(225,224,204,0.6)' }} className="hover:text-white transition-colors">
            Verify a Permit
          </Link>
        </div>
      </footer>
    </div>
  )
}
