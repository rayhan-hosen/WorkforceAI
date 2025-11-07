import { useEffect, useState } from 'react'
import { useLanguage } from '../context/LanguageContext'

function CelebrationAnimation({ level, translations, onClose }) {
  const { language } = useLanguage()
  const [confetti, setConfetti] = useState([])

  useEffect(() => {
    // Create confetti particles
    const particles = []
    for (let i = 0; i < 100; i++) {
      particles.push({
        id: i,
        x: Math.random() * 100,
        y: -10,
        delay: Math.random() * 2,
        duration: 2 + Math.random() * 2,
        emoji: ['🎉', '✨', '⭐', '🎊', '🏆', '💫', '🌟'][Math.floor(Math.random() * 7)],
        rotation: Math.random() * 360
      })
    }
    setConfetti(particles)

    // Auto close after 4 seconds
    const timer = setTimeout(() => {
      onClose()
    }, 4000)

    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      {/* Confetti Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {confetti.map((particle) => (
          <div
            key={particle.id}
            className="absolute text-2xl animate-bounce"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
              transform: `rotate(${particle.rotation}deg)`
            }}
          >
            {particle.emoji}
          </div>
        ))}
      </div>

      {/* Main Celebration Card */}
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center relative z-10 animate-bounce">
        {/* Main Message */}
        <div className="text-7xl mb-4 animate-bounce">🎉</div>
        <h2 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3">
          {translations[language]?.congratulations}
        </h2>
        <p className="text-2xl text-gray-700 mb-3 font-semibold">
          {translations[language]?.levelCompleted}
        </p>
        <p className="text-lg text-indigo-600 mb-4 font-medium">
          {language === 'bn' ? level.name_bn : level.name_en}
        </p>
        <p className="text-sm text-gray-500 mb-6">
          {translations[language]?.allModulesCompleted}
        </p>

        {/* XP Gain Animation */}
        <div className="mb-6 p-4 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg border-2 border-yellow-300">
          <div className="text-3xl font-bold text-orange-600 mb-1">
            +{level.modules.length * 100} XP
          </div>
          <div className="text-sm text-gray-600">
            {language === 'bn' ? 'অভিজ্ঞতা পয়েন্ট যোগ হয়েছে!' : 'Experience Points Gained!'}
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-lg"
        >
          {translations[language]?.nextLevel || 'Continue'}
        </button>
      </div>
    </div>
  )
}

export default CelebrationAnimation

