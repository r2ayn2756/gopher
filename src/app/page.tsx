export default function Home() {
  return (
    <main className="min-h-dvh bg-white text-black">
      <LandingNav />
      <CinematicHero />

      <AIComparison />

      {/* Compliance summary (two-box layout) */}
      <section id="schools" className="border-b border-[var(--color-border)] bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="text-2xl font-semibold text-green-900 md:text-3xl">FERPA & COPPA Compliance</h2>
          <p className="mt-2 max-w-3xl text-gray-700">
            Built with district security in mind—privacy by design, strict data access, and transparent controls.
          </p>
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-2xl bg-white p-6 ring-1 ring-[var(--color-border)] shadow-[0_12px_32px_-24px_rgba(50,255,0,0.18)] transition duration-500 ease-out hover:-translate-y-3 hover:shadow-[0_30px_72px_-28px_rgba(50,255,0,0.4)] hover:ring-[#32ff00]/45">
              <h3 className="text-lg font-medium text-green-900">FERPA Compliance</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-gray-700">
                <li><span className="font-medium">No PII to AI providers:</span> prompts are anonymized and sanitized server‑side.</li>
                <li><span className="font-medium">Row‑Level Security (RLS):</span> students can only access their own records; admins have governed oversight.</li>
                <li><span className="font-medium">Server‑side tokens only:</span> API keys never exposed to the browser.</li>
                <li><span className="font-medium">Audit & retention:</span> session logs, export, and deletion available upon authorized request.</li>
              </ul>
            </div>
            <div className="rounded-2xl bg-white p-6 ring-1 ring-[var(--color-border)] shadow-[0_12px_32px_-24px_rgba(50,255,0,0.18)] transition duration-500 ease-out hover:-translate-y-3 hover:shadow-[0_30px_72px_-28px_rgba(50,255,0,0.4)] hover:ring-[#32ff00]/45">
              <h3 className="text-lg font-medium text-green-900">COPPA & Child Safety</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-gray-700">
                <li><span className="font-medium">School/parent consent:</span> accounts provisioned by schools or with verifiable adult consent.</li>
                <li><span className="font-medium">Data minimization:</span> only what’s necessary for learning; no behavioral advertising.</li>
                <li><span className="font-medium">Content guardrails:</span> sanitization and safety checks on inputs/outputs.</li>
                <li><span className="font-medium">Secure sessions:</span> strict cookie settings, token rotation, and regular reviews.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="border-b border-[var(--color-border)] bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-3xl font-semibold text-gray-900 text-center md:text-left">Why Educators Choose Gopher</h2>
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            <FeatureCard icon="help" title="Socratic by design" desc="Guides with questions and hints—never provides answers—promoting deep understanding."/>
            <FeatureCard icon="sparkles" title="Personalized hints" desc="Adaptive hint levels help students progress at the right pace."/>
            <FeatureCard icon="shield" title="Privacy first" desc="No PII sent to AI APIs. All keys and requests remain server-side."/>
            <FeatureCard icon="book" title="Any subject" desc="Math, science, humanities—Gopher supports cross-curricular learning."/>
            <FeatureCard icon="clock" title="24/7 availability" desc="Students can get guidance whenever they’re ready to learn."/>
            <FeatureCard icon="chart" title="Analytics & oversight" desc="Admins gain insights into sessions, topics, and progression trends."/>
          </div>
        </div>
      </section>

      {/* Removed loud stats banner for a calmer, more premium look */}

      <RoadmapHow />

      <Testimonials />

      

      <footer className="bg-[#1f1f1f] text-gray-200">
        <div id="contact" className="mx-auto max-w-6xl px-4 py-12">
          <div className="grid grid-cols-1 gap-10 text-sm md:grid-cols-4">
            <div>
              <div className="mb-2 text-green-500">Gopher AI</div>
              <p className="text-gray-400">Empowering students through questioning, not answering. Building the next generation of critical thinkers.</p>
            </div>
            <div>
              <div className="mb-2 text-green-500">Product</div>
              <ul className="space-y-1">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#book-demo" className="hover:text-white">Book a Demo</a></li>
              </ul>
            </div>
            <div>
              <div className="mb-2 text-green-500">Compliance</div>
              <ul className="space-y-1">
                <li><a href="#schools" className="hover:text-white">FERPA Compliance</a></li>
                <li><a href="#schools" className="hover:text-white">COPPA Compliance</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <div className="mb-2 text-green-500">Support</div>
              <ul className="space-y-1">
                <li><a href="#contact" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Help Center</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-gray-400">© {new Date().getFullYear()} Gopher. All rights reserved.</div>
        </div>
      </footer>
    </main>
  )
}

import { HelpCircle, Sparkles, ShieldCheck, BookOpen, Clock, BarChart3 } from "lucide-react"
import { LandingNav } from "@/components/site/landing-nav"
import { CinematicHero } from "@/components/site/cinematic-hero"
import { AIComparison } from "@/components/site/ai-comparison"
import { Testimonials } from "@/components/site/testimonials"
import { RoadmapHow } from "@/components/site/roadmap-how"

function FeatureCard({ title, desc, icon }: { title: string; desc: string; icon?: 'help' | 'sparkles' | 'shield' | 'book' | 'clock' | 'chart' }) {
  const Icon = icon === 'help'
    ? HelpCircle
    : icon === 'sparkles'
    ? Sparkles
    : icon === 'shield'
    ? ShieldCheck
    : icon === 'book'
    ? BookOpen
    : icon === 'clock'
    ? Clock
    : icon === 'chart'
    ? BarChart3
    : HelpCircle
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-white p-5 shadow-[0_10px_28px_-20px_rgba(50,255,0,0.18)] transition duration-300 ease-out hover:-translate-y-2 hover:shadow-[0_22px_60px_-24px_rgba(50,255,0,0.35)] hover:ring-1 hover:ring-[#32ff00]/25">
      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-100 text-gray-700">
        <Icon size={20} />
      </div>
      <div className="mt-3 font-medium text-gray-900">{title}</div>
      <p className="mt-1 text-sm text-gray-600">{desc}</p>
    </div>
  )
}

// (StepCard removed)
