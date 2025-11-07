import { useEffect, useState } from 'react'
import { useLanguage } from '../context/LanguageContext'

function LeaderCard({ technician, maxPoints, translations, onCardClick }) {
  const { language } = useLanguage()
  const [progressWidth, setProgressWidth] = useState(0)

  useEffect(() => {
    // Animate progress bar
    const percentage = (technician.points / maxPoints) * 100
    setTimeout(() => {
      setProgressWidth(percentage)
    }, 100)
  }, [technician.points, maxPoints])

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return null
  }

  const getRankColor = (rank) => {
    if (rank === 1) return 'from-yellow-400 to-orange-500'
    if (rank === 2) return 'from-gray-300 to-gray-400'
    if (rank === 3) return 'from-amber-600 to-amber-700'
    return 'from-blue-400 to-indigo-500'
  }

  const isTopThree = technician.rank <= 3
  const rankIcon = getRankIcon(technician.rank)

  return (
    <div
      onClick={() => onCardClick(technician)}
      className={`relative bg-white rounded-2xl shadow-md p-6 cursor-pointer transition-all hover:scale-105 hover:shadow-2xl ${
        isTopThree ? 'border-2 border-yellow-400 shadow-yellow-200 animate-pulse' : 'border border-gray-200'
      }`}
    >
      {/* Rank Badge */}
      <div className={`absolute top-4 right-4 w-12 h-12 rounded-full bg-gradient-to-r ${getRankColor(technician.rank)} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
        {rankIcon || technician.rank}
      </div>

      {/* Profile Section */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-lg">
          {(language === 'bn' ? technician.name_bn : technician.name_en).charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-800 mb-1">
            {language === 'bn' ? technician.name_bn : technician.name_en}
          </h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">{translations[language]?.category}:</span>
            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
              {technician.category}
            </span>
          </div>
        </div>
      </div>

      {/* Points and Rating */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-3">
          <div className="text-xs text-gray-600 mb-1">{translations[language]?.points}</div>
          <div className="text-2xl font-bold text-indigo-600">{technician.points.toLocaleString()}</div>
        </div>
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-3">
          <div className="text-xs text-gray-600 mb-1">{translations[language]?.rating}</div>
          <div className="flex items-center space-x-1">
            <span className="text-2xl font-bold text-yellow-600">{technician.rating}</span>
            <span className="text-yellow-500">⭐</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-600">{translations[language]?.level} {technician.level}</span>
          <span className="text-xs text-gray-600">{technician.points} / {maxPoints} {translations[language]?.xp}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`bg-gradient-to-r ${getRankColor(technician.rank)} h-3 rounded-full transition-all duration-1000`}
            style={{ width: `${progressWidth}%` }}
          ></div>
        </div>
      </div>

      {/* Skills Badges */}
      <div className="flex flex-wrap gap-2">
        {technician.skills.slice(0, 2).map((skill, index) => (
          <span
            key={index}
            className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold"
          >
            {skill}
          </span>
        ))}
        {technician.skills.length > 2 && (
          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">
            +{technician.skills.length - 2}
          </span>
        )}
      </div>

      {/* Rank Change Indicator */}
      {technician.rankChange !== 0 && (
        <div className="absolute bottom-4 right-4 flex items-center space-x-1">
          {technician.rankChange > 0 ? (
            <>
              <span className="text-green-500 font-bold">↑</span>
              <span className="text-green-600 text-xs font-semibold">+{technician.rankChange}</span>
            </>
          ) : (
            <>
              <span className="text-red-500 font-bold">↓</span>
              <span className="text-red-600 text-xs font-semibold">{technician.rankChange}</span>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default LeaderCard

