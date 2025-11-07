import { useLanguage } from '../context/LanguageContext'

function XPJourneyBar({ currentRank = 'Silver' }) {
  const { language } = useLanguage()

  const ranks = ['Bronze', 'Silver', 'Gold', 'Platinum']
  const currentIndex = ranks.indexOf(currentRank)

  const getRankStyle = (rank, index) => {
    const isCurrent = rank === currentRank
    const isUnlocked = index <= currentIndex

    if (isCurrent) {
      return {
        bg: 'bg-gradient-to-br from-gray-400 to-gray-500',
        glow: 'shadow-lg shadow-gray-500/50',
        scale: 'scale-110',
        pulse: 'animate-pulse'
      }
    } else if (isUnlocked) {
      return {
        bg: 'bg-gradient-to-br from-amber-600 to-amber-700',
        glow: '',
        scale: '',
        pulse: ''
      }
    } else {
      return {
        bg: 'bg-gray-300',
        glow: '',
        scale: '',
        pulse: ''
      }
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t-2 border-gray-200 shadow-2xl z-30 overflow-x-auto">
      <div className="max-w-6xl mx-auto px-2 sm:px-4 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0 min-w-max sm:min-w-0">
          <div className="text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">
            {language === 'bn' ? 'আপনার জার্নি' : 'Your Journey'}
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 flex-1 justify-center overflow-x-auto w-full sm:w-auto">
            {ranks.map((rank, index) => {
              const style = getRankStyle(rank, index)
              return (
                <div key={rank} className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm transition-all ${style.bg} ${style.glow} ${style.scale} ${style.pulse}`}
                  >
                    {index + 1}
                  </div>
                  <span className={`text-xs font-semibold whitespace-nowrap ${rank === currentRank ? 'text-gray-700' : 'text-gray-400'}`}>
                    {rank}
                  </span>
                  {index < ranks.length - 1 && (
                    <div className={`w-4 sm:w-6 md:w-8 h-1 ${index < currentIndex ? 'bg-amber-600' : 'bg-gray-300'}`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default XPJourneyBar

