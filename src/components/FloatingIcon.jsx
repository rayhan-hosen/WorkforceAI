import { useEffect, useState } from 'react'

function FloatingIcon({ icon, x, y, delay = 0 }) {
  const [position, setPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    // Random floating animation
    const interval = setInterval(() => {
      setPosition({
        x: (Math.random() - 0.5) * 20,
        y: (Math.random() - 0.5) * 20
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div
      className="absolute text-xl pointer-events-none animate-float opacity-60"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        animationDelay: `${delay}s`,
        transform: `translate(${position.x}px, ${position.y}px)`,
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
        zIndex: 1
      }}
    >
      {icon}
    </div>
  )
}

export default FloatingIcon

