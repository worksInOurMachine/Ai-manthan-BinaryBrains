"use client"

import { motion } from "framer-motion"

export default function AISpeakingBars() {
  const bars = Array.from({ length: 12 })

  return (
    <div className="flex items-end gap-1 p-4">
      {bars.map((_, i) => (
        <motion.div
          key={i}
          className="w-1 rounded-sm bg-primary"
          initial={{ height: 6 }}
          animate={{ height: [8, 28, 12, 22, 10, 18, 8] }}
          transition={{
            duration: 1.2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: i * 0.05,
          }}
          aria-hidden
        />
      ))}
      <span className="sr-only">AI is speaking</span>
    </div>
  )
}
