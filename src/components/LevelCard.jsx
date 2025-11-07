import { useLanguage } from '../context/LanguageContext'

function LevelCard({ level, onModuleClick, translations }) {
  const { language } = useLanguage()

  const getStatusBadge = () => {
    if (level.completed) {
      return (
        <span className="px-3 py-1 bg-green-500 text-white rounded-full text-sm font-semibold flex items-center space-x-1">
          <span>✅</span>
          <span>{translations[language]?.complete}</span>
        </span>
      )
    } else if (level.unlocked) {
      return (
        <span className="px-3 py-1 bg-gradient-to-r from-indigo-400 to-blue-500 text-white rounded-full text-sm font-semibold animate-pulse flex items-center space-x-1">
          <span>✨</span>
          <span>{translations[language]?.startLearning || 'Start Learning'}</span>
        </span>
      )
    } else {
      return (
        <span className="px-3 py-1 bg-gray-300 text-gray-500 rounded-full text-sm font-semibold flex items-center space-x-1">
          <span>🔒</span>
          <span>{translations[language]?.locked}</span>
        </span>
      )
    }
  }

  const getModuleStatus = (module) => {
    if (module.completed) {
      return 'bg-green-500 border-green-600'
    } else if (level.unlocked) {
      return 'bg-gradient-to-r from-indigo-400 to-blue-500 border-indigo-600 animate-pulse'
    } else {
      return 'bg-gray-300 border-gray-400'
    }
  }

  return (
    <div className={`w-full max-w-md rounded-2xl shadow-md p-6 transition-all ${
      level.completed 
        ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300' 
        : level.unlocked 
        ? 'bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-300' 
        : 'bg-gray-100 border-2 border-gray-300'
    }`}>
      {/* Level Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800">
          {language === 'bn' ? level.name_bn : level.name_en}
        </h3>
        {getStatusBadge()}
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-3 gap-3 mt-4">
        {level.modules.map((module) => (
          <button
            key={module.id}
            onClick={() => level.unlocked && onModuleClick(module, level)}
            disabled={!level.unlocked}
            className={`relative w-full aspect-square rounded-lg border-2 transition-all ${
              getModuleStatus(module)
            } ${
              level.unlocked 
                ? 'hover:scale-110 hover:shadow-lg cursor-pointer' 
                : 'cursor-not-allowed opacity-60'
            }`}
            title={language === 'bn' ? module.title_bn : module.title_en}
          >
            {module.completed && (
              <span className="absolute inset-0 flex items-center justify-center text-white text-2xl">
                ✅
              </span>
            )}
            {!module.completed && level.unlocked && (
              <span className="absolute inset-0 flex items-center justify-center text-white text-lg font-bold">
                {module.id.toString().slice(-1)}
              </span>
            )}
            {!level.unlocked && (
              <span className="absolute inset-0 flex items-center justify-center text-gray-500 text-xl">
                🔒
              </span>
            )}
            {/* Module Title Tooltip */}
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {language === 'bn' ? module.title_bn : module.title_en}
            </div>
          </button>
        ))}
      </div>

      {/* Module Titles Below */}
      <div className="mt-4 space-y-1">
        {level.modules.slice(0, 3).map((module) => (
          <div key={module.id} className="text-xs text-gray-600 truncate">
            {language === 'bn' ? module.title_bn : module.title_en}
          </div>
        ))}
      </div>
    </div>
  )
}

export default LevelCard

