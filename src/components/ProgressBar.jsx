import { useLanguage } from '../context/LanguageContext'
import AnimatedCounter from './AnimatedCounter'

function ProgressBar({ levels, currentRank = 'Silver', nextRank = 'Gold' }) {
  const { language } = useLanguage()

  // Calculate total progress
  const totalModules = levels.reduce((sum, level) => sum + level.modules.length, 0)
  const completedModules = levels.reduce(
    (sum, level) => sum + level.modules.filter(m => m.completed).length,
    0
  )
  const progress = totalModules > 0 ? (completedModules / totalModules) * 100 : 0

  // Calculate XP (simplified: each module = 100 XP)
  const totalXP = totalModules * 100
  const currentXP = completedModules * 100
  const xpForNextRank = totalXP * 0.7 // 70% to reach next rank (example)

  const getRankColor = (rank) => {
    switch (rank) {
      case 'Bronze':
        return { bg: 'bg-amber-600', text: 'text-amber-600', border: 'border-amber-600', glow: 'shadow-amber-500/50' }
      case 'Silver':
        return { bg: 'bg-gray-400', text: 'text-gray-600', border: 'border-gray-400', glow: 'shadow-gray-500/50' }
      case 'Gold':
        return { bg: 'bg-yellow-500', text: 'text-yellow-600', border: 'border-yellow-500', glow: 'shadow-yellow-500/50' }
      case 'Platinum':
        return { bg: 'bg-blue-400', text: 'text-blue-600', border: 'border-blue-400', glow: 'shadow-blue-500/50' }
      default:
        return { bg: 'bg-gray-400', text: 'text-gray-600', border: 'border-gray-400', glow: 'shadow-gray-500/50' }
    }
  }

  const currentRankColor = getRankColor(currentRank)
  const nextRankColor = getRankColor(nextRank)
  const inProgressLevels = levels.filter(l => l.unlocked && !l.completed).length
  const lockedLevels = levels.filter(l => !l.unlocked).length

  return (
    <div className="w-full bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-4 sm:p-5 md:p-6 mb-4 md:mb-6 border border-white/30">
      {/* Rank Display */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 md:mb-6">
        <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 flex-wrap">
          <div className={`px-3 py-2 sm:px-4 sm:py-2.5 md:px-5 md:py-3 rounded-xl ${currentRankColor.bg} text-white font-bold text-sm sm:text-base shadow-lg ${currentRankColor.glow} animate-pulse flex items-center`}>
            <span className="mr-1.5 sm:mr-2 text-base sm:text-lg md:text-xl">🏅</span>
            <span className="whitespace-nowrap">{currentRank}</span>
          </div>
          <div className="text-xl sm:text-2xl md:text-3xl text-gray-400 flex-shrink-0">→</div>
          <div className={`px-3 py-2 sm:px-4 sm:py-2.5 md:px-5 md:py-3 rounded-xl ${nextRankColor.bg} text-white font-bold text-sm sm:text-base shadow-lg flex items-center`}>
            <span className="whitespace-nowrap">{nextRank}</span>
          </div>
        </div>
        <div className="text-xs sm:text-sm text-gray-600 font-semibold whitespace-nowrap">
          {language === 'bn' ? 'অগ্রগতি' : 'Progress'}: <AnimatedCounter value={completedModules} />/{totalModules}
        </div>
      </div>

      {/* XP Bar */}
      <div className="relative mb-4 md:mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-2">
          <span className="flex items-center space-x-1.5 sm:space-x-2 text-xs sm:text-sm text-gray-600 font-medium">
            <span className="text-base sm:text-lg">⚡</span>
            <span>{language === 'bn' ? 'দক্ষতার পরবর্তী ধাপ' : 'Journey to Next Rank'}</span>
          </span>
          <span className="text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">
            <AnimatedCounter value={currentXP} /> / <AnimatedCounter value={xpForNextRank} /> XP
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 sm:h-5 md:h-6 overflow-hidden relative shadow-inner">
          {/* Progress Fill */}
          <div
            className={`h-full ${currentRankColor.bg} transition-all duration-500 relative overflow-hidden rounded-full`}
            style={{ width: `${Math.min((currentXP / xpForNextRank) * 100, 100)}%` }}
          >
            {/* Animated Shine Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
          </div>

          {/* XP Glow Effect */}
          {progress > 0 && (
            <div
              className={`absolute top-0 left-0 h-full ${currentRankColor.bg} opacity-50 blur-sm transition-all duration-500 rounded-full`}
              style={{ width: `${Math.min((currentXP / xpForNextRank) * 100, 100)}%` }}
            />
          )}
        </div>

        {/* Progress Percentage */}
        <div className="text-right text-xs text-gray-600 mt-1.5 font-medium">
          {Math.round((currentXP / xpForNextRank) * 100)}% {language === 'bn' ? 'সম্পন্ন' : 'Complete'}
        </div>
      </div>

      {/* Module Completion Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center border-2 border-green-200">
          <div className="text-xl sm:text-2xl md:text-3xl mb-1 sm:mb-2">📘</div>
          <div className="text-lg sm:text-xl md:text-2xl font-bold text-green-600">
            <AnimatedCounter value={completedModules} />
          </div>
          <div className="text-xs text-gray-600 font-medium mt-1">{language === 'bn' ? 'সম্পন্ন' : 'Completed'}</div>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center border-2 border-orange-200">
          <div className="text-xl sm:text-2xl md:text-3xl mb-1 sm:mb-2">⚙️</div>
          <div className="text-lg sm:text-xl md:text-2xl font-bold text-orange-600">
            <AnimatedCounter value={inProgressLevels} />
          </div>
          <div className="text-xs text-gray-600 font-medium mt-1">{language === 'bn' ? 'চালিয়ে যান' : 'In Progress'}</div>
        </div>
        <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center border-2 border-gray-200">
          <div className="text-xl sm:text-2xl md:text-3xl mb-1 sm:mb-2">🔒</div>
          <div className="text-lg sm:text-xl md:text-2xl font-bold text-gray-400">
            <AnimatedCounter value={lockedLevels} />
          </div>
          <div className="text-xs text-gray-600 font-medium mt-1">{language === 'bn' ? 'লকড' : 'Locked'}</div>
        </div>
      </div>
    </div>
  )
}

export default ProgressBar

