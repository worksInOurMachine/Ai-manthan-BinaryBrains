"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Hero from "@/components/hero";
import AnimatedSection from "@/components/animated-section";
import NumberTicker from "@/components/number-ticker";

// --- DARK BLUE THEME WITH SHINY GRADIENTS AND SOLID BUTTONS CONSTANTS ---
// Main CTA button: a strong, solid blue background with white text
const PRIMARY_BUTTON_BG = "bg-blue-600"; // A solid, impactful blue
const PRIMARY_BUTTON_TEXT = "text-white";
const PRIMARY_BUTTON_HOVER_BG = "hover:bg-blue-700"; // Darker blue on hover

// Text gradients and accent colors remain for headings and numbers
const TEXT_GRADIENT = "from-blue-200 to-sky-400"; // Headings: a luminous, deep blue to light blue glow
const ACCENT_COLOR = "text-sky-400"; // Accent color: a vibrant, electric blue
const ACCENT_BG = "bg-gradient-to-br from-blue-950/70 to-blue-900/50"; // Card background

export default function HomePage() {
  return (
    <main className="min-h-screen  text-white">
      <div className="h-10" aria-hidden />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 md:py-32 lg:py-40">
        <Hero />
        <motion.div
          className="mt-10 flex flex-col items-center gap-6 text-center"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link
              href="/create-interview"
              // Primary button with solid blue color and hover effect
              className={`rounded-lg ${PRIMARY_BUTTON_BG} ${PRIMARY_BUTTON_TEXT} px-8 py-3 text-sm font-bold shadow-lg shadow-blue-500/30 ${PRIMARY_BUTTON_HOVER_BG} transition-all duration-300 transform hover:-translate-y-1`}
            >
              Start Practicing ↗
            </Link>
            <Link
              href="/roadmap-chat"
              // Secondary button with solid border and subtle hover
              className="rounded-lg border border-sky-500/70 bg-transparent px-8 py-3 text-sm font-medium text-sky-300 hover:bg-blue-800/30 hover:text-white transition-all duration-300 hover:shadow-sky-500/20"
            >
              Explore Features
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Stats Section (no changes here as they are not buttons) */}
      <AnimatedSection>
        <section className="container mx-auto px-4 py-24 text-center">
          <div className="grid gap-10 md:grid-cols-3">
            {[
              { value: 1200, suffix: "+", label: "Interviews Practiced" },
              { value: 97, suffix: "%", label: "Improvement Rate" },
              { value: 24, suffix: "/7", label: "AI Availability" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                className="p-6 rounded-xl bg-gradient-to-br from-blue-900/40 to-blue-950/30 border border-sky-700/60 shadow-xl shadow-sky-900/20 backdrop-blur-sm"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i, duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className={`text-5xl font-bold mb-2 ${ACCENT_COLOR}`}>
                  <NumberTicker value={stat.value} />
                  {stat.suffix}
                </div>
                <p className="text-gray-300">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </AnimatedSection>

      {/* Features Section (no changes here as the 'Try Now' is a link, not a primary button) */}
      {/* @ts-ignore */}
      <AnimatedSection id="features" className="border-t border-sky-800/40">
        <section className="container mx-auto px-4 py-24 text-center">
          <h2
            className={`text-4xl font-extrabold mb-4 bg-gradient-to-r ${TEXT_GRADIENT} bg-clip-text text-transparent`}
          >
            Why NeuraView?
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto mb-16 text-lg">
            Experience intelligent interview coaching powered by AI — designed
            to assess not just your words, but your expressions, tone, and
            confidence.
          </p>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "AI-Powered Mock Interviews",
                desc: "Simulate real interviews with adaptive AI that responds to your tone and expressions.",
                icon: "🤖",
              },
              {
                title: "Facial Expression Tracking",
                desc: "Track confidence, focus, and engagement through real-time video analytics.",
                icon: "🎥",
              },
              {
                title: "Personalized Reports",
                desc: "Receive instant, detailed insights and improvement recommendations.",
                icon: "📊",
              },
              {
                title: "Custom Interview Creation",
                desc: "Build interviews tailored to your resume, field, and experience level.",
                icon: "🧠",
              },
              {
                title: "Performance Dashboard",
                desc: "Track your growth with weekly analytics and comparison charts.",
                icon: "📈",
              },
              {
                title: "Seamless Experience",
                desc: "Enjoy smooth interaction, built for speed and precision using Next.js and AI APIs.",
                icon: "⚡",
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                className={`rounded-xl border border-blue-700/60 ${ACCENT_BG} p-8 shadow-2xl shadow-blue-800/30 hover:shadow-sky-500/40 transition-all duration-500 backdrop-blur-sm transform hover:-translate-y-2`}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i, duration: 0.7 }}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </AnimatedSection>

      {/* How It Works Section (no changes here as 'Try Now' is a link) */}
      <AnimatedSection className="border-t border-sky-800/40">
        <section className="container mx-auto px-4 py-24">
          <h2
            className={`text-4xl font-extrabold text-center mb-4 bg-gradient-to-r ${TEXT_GRADIENT} bg-clip-text text-transparent`}
          >
            How It Works
          </h2>
          <p className="text-gray-300 text-center max-w-2xl mx-auto mb-16 text-lg">
            NeuraView transforms your preparation into measurable growth — from
            interview setup to AI-driven analysis.
          </p>

          <div className="grid gap-10 md:grid-cols-4">
            {[
              {
                step: "1",
                title: "Create Interview",
                desc: "Head to the create interview page and set your goals.",
                link: "/create-interview",
              },
              {
                step: "2",
                title: "Face the AI",
                desc: "Respond to AI-generated questions with live camera feedback.",
              },
              {
                step: "3",
                title: "Analyze Results",
                desc: "Review insights on confidence, clarity, and consistency.",
              },
              {
                step: "4",
                title: "Track Progress",
                desc: "Compare past reports and unlock personalized coaching.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="p-6 text-center rounded-xl border border-blue-700/60 bg-gradient-to-br from-blue-900/30 to-blue-950/20 hover:bg-gradient-to-br hover:from-blue-800/40 hover:to-blue-900/30 transition-all duration-300 backdrop-blur-sm shadow-lg shadow-blue-900/20 transform hover:-translate-y-1"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i, duration: 0.6 }}
              >
                <div className={`text-2xl font-bold ${ACCENT_COLOR} mb-3`}>
                  Step {item.step}
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm mb-2">{item.desc}</p>
                {item.link && (
                  <Link
                    href={item.link}
                    className={`${ACCENT_COLOR} hover:underline text-sm`}
                  >
                    Try Now →
                  </Link>
                )}
              </motion.div>
            ))}
          </div>
        </section>
      </AnimatedSection>

      {/* Final CTA Section */}
      <AnimatedSection
        className={`border-t border-sky-800/40 bg-gradient-to-b from-blue-900/20 to-transparent`}
      >
        <section className="container mx-auto px-4 py-24 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to face your next interview with confidence?
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto text-lg">
            Start practicing with NeuraView today and transform your preparation
            into performance.
          </p>
          <Link
            href="/create-interview"
            // Final CTA button with solid blue color and hover effect
            className={`inline-flex items-center gap-2 rounded-lg ${PRIMARY_BUTTON_BG} ${PRIMARY_BUTTON_TEXT} px-8 py-3 text-sm font-bold shadow-lg shadow-blue-500/30 ${PRIMARY_BUTTON_HOVER_BG} transition-all duration-300 transform hover:-translate-y-1`}
          >
            Start Interview Practice ↗
          </Link>
        </section>
      </AnimatedSection>
    </main>
  );
}
