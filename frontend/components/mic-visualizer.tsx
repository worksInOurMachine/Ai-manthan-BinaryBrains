"use client"

import { useEffect, useRef } from "react"
import { motion, useAnimationControls } from "framer-motion"

export default function MicVisualizer({ active }: { active: boolean }) {
  const controls = useAnimationControls()
  const timer = useRef<number | null>(null)

  useEffect(() => {
    if (!active) {
      controls.start({ scale: 1, boxShadow: "0 0 0 0px color-mix(in oklab, var(--color-primary) 0%, transparent)" })
      if (timer.current) cancelAnimationFrame(timer.current)
      return
    }

    let t = 0
    const loop = () => {
      t += 0.08
      const s = 1 + Math.abs(Math.sin(t)) * 0.2
      controls.start({
        scale: s,
        boxShadow: `0 0 0 ${8 + 6 * Math.abs(Math.cos(t))}px color-mix(in oklab, var(--color-primary) 15%, transparent)`,
        transition: { duration: 0.15 },
      })
      timer.current = requestAnimationFrame(loop)
    }
    loop()

    return () => {
      if (timer.current) cancelAnimationFrame(timer.current)
    }
  }, [active, controls])

  return (
    <motion.div
      className="mx-auto h-12 w-12 rounded-full bg-primary text-primary-foreground"
      animate={controls}
      aria-hidden
    />
  )
}
