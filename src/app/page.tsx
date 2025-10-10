export default function Home() {
  return (
    <main className="min-h-dvh bg-white text-black">
      <LandingNav />
      <CinematicHero />

      <ValueProposition />

      <ForTeachers />

      <HowStudentsLearn />

      <SecurityCompliance />

      <SocialProof />

      <KeyFeatures />

      

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

import { LandingNav } from "@/components/site/landing-nav"
import { CinematicHero } from "@/components/site/cinematic-hero"
import { ValueProposition } from "@/components/site/value-proposition"
import { ForTeachers } from "@/components/site/for-teachers"
import { HowStudentsLearn } from "@/components/site/how-students-learn"
import { SecurityCompliance } from "@/components/site/security-compliance"
import { SocialProof } from "@/components/site/social-proof"
import { KeyFeatures } from "@/components/site/key-features"
