import { useLanguage } from '../context/LanguageContext'

function DistrictTooltip({ district, x, y, translations, userMatchScore }) {
  const { language } = useLanguage()

  if (!district) return null

  const getDemandColor = (index) => {
    if (index >= 75) return 'text-red-400'
    if (index >= 50) return 'text-yellow-400'
    return 'text-gray-400'
  }

  const getMatchColor = (score) => {
    if (score >= 80) return 'text-green-400'
    if (score >= 60) return 'text-yellow-400'
    return 'text-gray-400'
  }

  return (
    <div
      className="fixed bg-black/95 text-white text-sm rounded-lg p-4 shadow-2xl z-40 min-w-[240px] pointer-events-none animate-fadeIn backdrop-blur-sm border border-white/20"
      style={{
        left: `${x}px`,
        top: `${y - 10}px`,
        transform: 'translate(-50%, -100%)'
      }}
    >
      <div className="font-bold text-white mb-3 text-base border-b border-white/20 pb-2">
        {language === 'bn' ? district.name_bn : district.name_en}
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-gray-300">{translations[language]?.demandIndex}:</span>
          <span className={`font-bold ${getDemandColor(district.demandIndex)}`}>
            {district.demandIndex}%
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-300">{translations[language]?.dominantService}:</span>
          <span className="font-semibold text-white text-right max-w-[140px]">
            {language === 'bn' ? district.dominantService_bn : district.dominantService_en}
          </span>
        </div>
        {userMatchScore !== undefined && (
          <div className="flex items-center justify-between pt-2 border-t border-white/20">
            <span className="text-gray-300">{language === 'bn' ? 'আপনার সাথে ম্যাচ' : 'Your Match'}:</span>
            <span className={`font-bold ${getMatchColor(userMatchScore)}`}>
              {userMatchScore}%
            </span>
          </div>
        )}
        {district.userRelevant && (
          <div className="mt-2 pt-2 border-t border-green-500/50">
            <span className="text-xs text-green-400 font-semibold">
              ✓ {language === 'bn' ? 'আপনার পেশার জন্য প্রস্তাবিত' : 'Recommended for your profession'}
            </span>
          </div>
        )}
        <div className="mt-2 pt-2 border-t border-gray-600 text-xs text-gray-400">
          {language === 'bn' ? district.insight_bn : district.insight_en}
        </div>
      </div>
    </div>
  )
}

export default DistrictTooltip

