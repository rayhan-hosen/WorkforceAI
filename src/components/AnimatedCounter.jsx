import { useEffect, useState } from 'react'

function AnimatedCounter({ value, duration = 1000, suffix = '' }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTime = null
    const startValue = 0
    const endValue = value

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      setCount(Math.floor(startValue + (endValue - startValue) * easeOutQuart))

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setCount(endValue)
      }
    }

    requestAnimationFrame(animate)
  }, [value, duration])

  return <span>{count}{suffix}</span>
}

export default AnimatedCounter

