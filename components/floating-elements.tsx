"use client"

import { useEffect, useState } from "react"

interface FloatingElement {
  id: number
  x: number
  y: number
  size: number
  speed: number
  opacity: number
  emoji: string
}

export function FloatingElements() {
  const [elements, setElements] = useState<FloatingElement[]>([])

  useEffect(() => {
    const emojis = ["🐾", "⭐", "💎", "🎮", "🏆", "✨", "🎯", "🔥"]

    const generateElements = () => {
      return Array.from({ length: 15 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 20 + 10,
        speed: Math.random() * 2 + 1,
        opacity: Math.random() * 0.3 + 0.1,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
      }))
    }

    setElements(generateElements())

    const interval = setInterval(() => {
      setElements((prev) =>
        prev.map((element) => ({
          ...element,
          y: element.y <= -10 ? 110 : element.y - element.speed * 0.1,
          x: element.x + Math.sin(Date.now() * 0.001 + element.id) * 0.1,
        })),
      )
    }, 50)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {elements.map((element) => (
        <div
          key={element.id}
          className="absolute transition-all duration-100 ease-linear animate-float"
          style={{
            left: `${element.x}%`,
            top: `${element.y}%`,
            fontSize: `${element.size}px`,
            opacity: element.opacity,
            animationDelay: `${element.id * 0.2}s`,
            animationDuration: `${3 + element.id * 0.1}s`,
          }}
        >
          {element.emoji}
        </div>
      ))}
    </div>
  )
}
