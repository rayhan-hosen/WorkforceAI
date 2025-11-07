import { useLanguage } from '../context/LanguageContext'

function LevelNode({ level, index, isActive, onClick, translations }) {
  const { language } = useLanguage()

  // Calculate star rating based on module completion
  const completedModules = level.modules.filter(m => m.completed).length
  const totalModules = level.modules.length
  const starRating = level.completed ? 3 : Math.floor((completedModules / totalModules) * 3)

  const getNodeStyle = () => {
    if (level.completed) {
      return {
        gradient: 'bg-gradient-to-br from-yellow-300 via-yellow-400 to-orange-400',
        border: 'border-4 border-yellow-500',
        shadow: 'shadow-2xl shadow-yellow-500/60',
        glow: '',
        shine: 'from-yellow-200/60 via-transparent to-transparent'
      }
    } else if (level.unlocked && isActive) {
      return {
        gradient: 'bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400',
        border: 'border-4 border-purple-500',
        shadow: 'shadow-2xl shadow-purple-500/60',
        glow: '',
        shine: 'from-white/60 via-transparent to-transparent'
      }
    } else if (level.unlocked) {
      return {
        gradient: 'bg-gradient-to-br from-pink-300 via-purple-300 to-blue-300',
        border: 'border-4 border-purple-400',
        shadow: 'shadow-xl shadow-purple-400/50',
        glow: '',
        shine: 'from-white/40 via-transparent to-transparent'
      }
    } else {
      return {
        gradient: 'bg-gradient-to-br from-gray-300 to-gray-400',
        border: 'border-4 border-gray-500',
        shadow: 'shadow-lg',
        glow: 'grayscale opacity-60',
        shine: 'from-gray-400/20 via-transparent to-transparent'
      }
    }
  }

  const getIcon = () => {
    if (level.completed) {
      return '👑'
    } else if (!level.unlocked) {
      return '🔒'
    } else {
      return '✨'
    }
  }

  const getProgressRing = () => {
    if (!level.unlocked || level.completed) return null
    
    const progress = (completedModules / totalModules) * 100
    
    return (
      <svg className="absolute inset-0 w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="46"
          fill="none"
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="6"
        />
        <circle
          cx="50"
          cy="50"
          r="46"
          fill="none"
          stroke="white"
          strokeWidth="6"
          strokeDasharray={`${2 * Math.PI * 46}`}
          strokeDashoffset={`${2 * Math.PI * 46 * (1 - progress / 100)}`}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
    )
  }

  const style = getNodeStyle()

  return (
    <div className="relative flex flex-col items-center z-20 w-full px-2">
      {/* Cloud System - Floating cloud background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0" style={{ width: '200%', height: '200%', margin: '-50%' }}>
        {/* Main cloud shape - larger and more prominent */}
        <div className={`absolute w-48 h-32 sm:w-56 sm:h-36 md:w-64 md:h-40 lg:w-72 lg:h-44 rounded-full ${level.completed ? 'bg-white/40' : level.unlocked ? 'bg-white/50' : 'bg-gray-200/25'} animate-float`} style={{
          filter: 'blur(50px)',
          animationDelay: `${index * 0.3}s`,
          animationDuration: '4s'
        }}></div>
        {/* Additional cloud layers for depth and texture */}
        <div className={`absolute w-40 h-28 sm:w-48 sm:h-32 md:w-56 md:h-36 rounded-full ${level.completed ? 'bg-white/30' : level.unlocked ? 'bg-white/40' : 'bg-gray-200/20'} animate-float`} style={{
          transform: 'translateX(-40px) translateY(-15px)',
          filter: 'blur(40px)',
          animationDelay: `${index * 0.3 + 0.5}s`,
          animationDuration: '5s'
        }}></div>
        <div className={`absolute w-44 h-30 sm:w-52 sm:h-34 md:w-60 md:h-38 rounded-full ${level.completed ? 'bg-white/35' : level.unlocked ? 'bg-white/45' : 'bg-gray-200/22'} animate-float`} style={{
          transform: 'translateX(40px) translateY(-20px)',
          filter: 'blur(45px)',
          animationDelay: `${index * 0.3 + 1}s`,
          animationDuration: '4.5s'
        }}></div>
        {/* Small accent clouds */}
        <div className={`absolute w-24 h-16 sm:w-28 sm:h-20 md:w-32 md:h-24 rounded-full ${level.completed ? 'bg-white/20' : level.unlocked ? 'bg-white/30' : 'bg-gray-200/15'} animate-float`} style={{
          transform: 'translateX(-60px) translateY(10px)',
          filter: 'blur(35px)',
          animationDelay: `${index * 0.3 + 1.5}s`,
          animationDuration: '6s'
        }}></div>
        <div className={`absolute w-28 h-18 sm:w-32 sm:h-22 md:w-36 md:h-26 rounded-full ${level.completed ? 'bg-white/25' : level.unlocked ? 'bg-white/35' : 'bg-gray-200/18'} animate-float`} style={{
          transform: 'translateX(60px) translateY(15px)',
          filter: 'blur(38px)',
          animationDelay: `${index * 0.3 + 2}s`,
          animationDuration: '5.5s'
        }}></div>
      </div>
      
      {/* Level Node - Glossy Candy Jelly Bubble */}
      <button
        onClick={onClick}
        disabled={!level.unlocked}
        className={`relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 flex items-center justify-center rounded-full ${style.gradient} ${style.border} ${style.shadow} ${style.glow} transition-all duration-300 ${
          level.unlocked ? 'hover:scale-110 sm:hover:scale-125 cursor-pointer' : 'cursor-not-allowed'
        }`}
        style={{
          filter: 'drop-shadow(0 15px 25px rgba(0,0,0,0.4))',
          transform: 'perspective(1000px) rotateX(5deg)',
        }}
      >
        {/* Jelly shine effect - multiple layers for depth */}
        <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${style.shine} opacity-70`}></div>
        <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-50"></div>
        
        {/* Progress Ring */}
        {getProgressRing()}
        
        {/* Level Icon/Number - with text shadow for depth */}
        <div className="relative z-10 flex flex-col items-center justify-center">
          <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl mb-1 drop-shadow-2xl filter" style={{ 
            textShadow: '2px 2px 4px rgba(0,0,0,0.3), 0 0 10px rgba(255,255,255,0.5)'
          }}>
            {getIcon()}
          </span>
          <span 
            className="text-white font-black text-sm sm:text-base md:text-lg lg:text-2xl drop-shadow-2xl"
            style={{
              textShadow: '2px 2px 4px rgba(0,0,0,0.5), 0 0 8px rgba(255,255,255,0.3)'
            }}
          >
            L{level.id}
          </span>
        </div>
        
        {/* Pulsing glow rings for active */}
        {isActive && level.unlocked && !level.completed && (
          <>
            <div className="absolute inset-0 rounded-full bg-white/40 animate-ping"></div>
            <div className="absolute -inset-4 rounded-full bg-purple-400/30 animate-pulse"></div>
            <div className="absolute -inset-8 rounded-full bg-purple-400/20 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          </>
        )}
        
        {/* Golden crown sparkle for completed */}
        {level.completed && (
          <>
            <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-xl">
              <span className="text-white text-lg">⭐</span>
            </div>
            {/* Sparkle particles around crown */}
            {[0, 60, 120, 180, 240, 300].map((angle, i) => {
              const rad = (angle * Math.PI) / 180
              const x = Math.cos(rad) * 20
              const y = Math.sin(rad) * 20
              return (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-yellow-300 rounded-full animate-pulse"
                  style={{
                    left: `calc(50% + ${x}px)`,
                    top: `calc(50% + ${y}px)`,
                    animationDelay: `${i * 0.2}s`
                  }}
                />
              )
            })}
          </>
        )}
      </button>

      {/* 3-Star Rating Display */}
      <div className="flex items-center space-x-0.5 sm:space-x-1 mt-2 sm:mt-3 bg-white/80 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full shadow-lg border-2 border-purple-200">
        {[1, 2, 3].map((star) => (
          <span
            key={star}
            className={`text-sm sm:text-base md:text-lg lg:text-xl ${
              star <= starRating
                ? level.completed
                  ? 'text-yellow-400 drop-shadow-lg animate-pulse'
                  : 'text-purple-400'
                : 'text-gray-300'
            }`}
            style={{
              filter: star <= starRating ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' : 'none'
            }}
          >
            ⭐
          </span>
        ))}
      </div>

      {/* Level Title */}
      <div className="mt-2 text-center max-w-[160px] sm:max-w-[180px] px-1">
        <h3 className={`text-xs sm:text-sm font-bold ${
          level.completed ? 'text-yellow-700' : 
          level.unlocked ? 'text-purple-700' : 
          'text-gray-500'
        }`}>
          {language === 'bn' ? level.name_bn : level.name_en}
        </h3>
        {level.unlocked && !level.completed && (
          <p className="text-xs text-gray-600 mt-1 font-medium">
            {completedModules}/{totalModules} {language === 'bn' ? 'মডিউল' : 'modules'}
          </p>
        )}
      </div>

      {/* Status Badge */}
      <div className="mt-2">
        {level.completed && (
          <span className="px-2 sm:px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold rounded-full shadow-lg border-2 border-yellow-500">
            {translations[language]?.complete}
          </span>
        )}
        {!level.unlocked && (
          <span className="px-2 sm:px-3 py-1 bg-gray-500 text-white text-xs font-bold rounded-full shadow-md border-2 border-gray-600">
            {translations[language]?.locked}
          </span>
        )}
      </div>
    </div>
  )
}

export default LevelNode
