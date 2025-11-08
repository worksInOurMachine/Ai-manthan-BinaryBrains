"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

export default function Hero() {
  const fullText = "The fastest and most powerful platform for mastering interviews with AI" // Updated to match OpenAI style
  const [typed, setTyped] = useState("")

  useEffect(() => {
    let i = 0
    const id = setInterval(() => {
      i++
      setTyped(fullText.slice(0, i))
      if (i >= fullText.length) clearInterval(id)
    }, 35) // Slightly slower typing for readability
    return () => clearInterval(id)
  }, [])

  return (
    <div className="relative overflow-hidden text-center">
      {" "}
      {/* Removed gradient background for clean look */}
      <motion.h1
        className="text-balance text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl" // Larger, more impactful sizing
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {typed}
        <span className="ml-0.5 inline-block w-[1ch] animate-pulse">|</span>
      </motion.h1>
      <motion.p
        className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl lg:text-2xl" // Larger subtitle text
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8 }}
      >
        Practice transformative interview experiences powered by industry-leading AI models and tools.{" "}
        {/* Updated copy to match OpenAI style */}
      </motion.p>
    </div>
  )
}
