import { useEffect, useState } from 'react'
import { useLanguage } from '../context/LanguageContext'

function GrowthCard({ data, translations }) {
  const { language } = useLanguage()
  const [animatedProgress, setAnimatedProgress] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    // Animate progress bar
    const duration = 2000
    const steps = 60
    const increment = (data.currentProgress - data.previousProgress) / steps
    let current = data.previousProgress
    let step = 0

    const interval = setInterval(() => {
      step++
      current += increment
      setAnimatedProgress(Math.min(current, data.currentProgress))
      
      if (step >= steps) {
        clearInterval(interval)
        if (data.currentProgress > data.previousProgress) {
          setShowConfetti(true)
          setTimeout(() => setShowConfetti(false), 3000)
        }
      }
    }, duration / steps)

    return () => clearInterval(interval)
  }, [data])

  const getRankColor = (rank) => {
    switch (rank) {
      case 'Bronze':
        return 'text-amber-700'
      case 'Silver':
        return 'text-gray-400'
      case 'Gold':
        return 'text-yellow-500'
      case 'Platinum':
        return 'text-blue-400'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 relative overflow-hidden">
      {showConfetti && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="text-6xl animate-bounce">🎉</div>
        </div>
      )}
      
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        {translations[language]?.growthTitle}
      </h3>

      {/* Rank Comparison */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-2">{translations[language]?.previous}</div>
          <div className={`text-3xl font-bold ${getRankColor(data.previous)}`}>
            {data.previous}
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-2">{translations[language]?.current}</div>
          <div className={`text-3xl font-bold ${getRankColor(data.current)}`}>
            {data.current}
          </div>
        </div>
      </div>

      {/* Arrow */}
      <div className="flex items-center justify-center mb-6">
        <div className="text-4xl text-indigo-600">→</div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">
            {translations[language]?.skillGrowth}
          </span>
          <span className="text-lg font-bold text-green-600">
            {data.improvement}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="bg-gradient-to-r from-green-400 to-emerald-500 h-4 rounded-full transition-all duration-1000"
            style={{ width: `${animatedProgress}%` }}
          ></div>
        </div>
        <div className="text-center text-sm text-gray-600 mt-2">
          {Math.round(animatedProgress)}% {translations[language]?.overTime || 'complete'}
        </div>
      </div>

      {/* Achievement Badge */}
      {data.currentProgress > data.previousProgress && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 border-2 border-green-300 text-center">
          <div className="text-sm font-semibold text-green-700">
            🎉 {translations[language]?.rankUpgraded}!
          </div>
        </div>
      )}
    </div>
  )
}

export default GrowthCard

