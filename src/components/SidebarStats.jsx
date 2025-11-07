import { useLanguage } from '../context/LanguageContext'

function SidebarStats({ districts, translations, selectedDistrict, onDistrictClick, userProfession, topDistricts: userTopDistricts }) {
  const { language } = useLanguage()

  if (!districts || districts.length === 0) {
    return (
      <div className="bg-white shadow-lg rounded-2xl p-4">
        <div className="text-gray-500 text-center">Loading districts...</div>
      </div>
    )
  }

  // Use user-specific top districts if available, otherwise sort by demand index
  const topDistricts = userTopDistricts && userTopDistricts.length > 0
    ? userTopDistricts
    : [...districts]
        .sort((a, b) => {
          // Prioritize user-relevant districts
          if (a.userRelevant && !b.userRelevant) return -1
          if (!a.userRelevant && b.userRelevant) return 1
          return b.demandIndex - a.demandIndex
        })
        .slice(0, 5)

  // Get recent insights (last 3 districts with changes)
  const recentInsights = districts
    .filter(d => d && d.insight_bn)
    .slice(0, 3)

  return (
    <div className="space-y-6">
      {/* Top Districts */}
      <div className="bg-white shadow-lg rounded-2xl p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="mr-2">🔥</span>
          {userProfession 
            ? (language === 'bn' 
                ? `আপনার জন্য ${translations[language]?.topDistricts}` 
                : `Top Districts for You`)
            : translations[language]?.topDistricts}
        </h3>
        <div className="space-y-2">
          {topDistricts.map((district, index) => (
            <button
              key={district.id}
              onClick={() => onDistrictClick(district)}
              className={`w-full text-left p-3 rounded-lg transition-all ${
                selectedDistrict?.id === district.id
                  ? 'bg-purple-100 border-2 border-purple-500'
                  : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-800">
                      {language === 'bn' ? district.name_bn : district.name_en}
                    </span>
                    {district.userRelevant && (
                      <span className="text-xs text-green-600 font-semibold">
                        ✓ {language === 'bn' ? 'আপনার জন্য' : 'For You'}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className={`font-bold block ${
                    district.demandIndex >= 75 ? 'text-red-600' :
                    district.demandIndex >= 50 ? 'text-yellow-600' : 'text-gray-600'
                  }`}>
                    {district.demandIndex}%
                  </span>
                  {district.matchScore !== undefined && (
                    <span className="text-xs text-purple-600 font-semibold">
                      {district.matchScore}% {language === 'bn' ? 'ম্যাচ' : 'match'}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {language === 'bn' ? district.dominantService_bn : district.dominantService_en}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Insights */}
      <div className="bg-white shadow-lg rounded-2xl p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="mr-2">📈</span>
          {translations[language]?.recentInsights}
        </h3>
        <div className="space-y-3">
          {recentInsights.map((district) => (
            <div
              key={district.id}
              className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-l-4 border-indigo-500"
            >
              <div className="text-sm font-semibold text-gray-800 mb-1">
                {language === 'bn' ? district.name_bn : district.name_en}
              </div>
              <div className="text-xs text-gray-600">
                {language === 'bn' ? district.insight_bn : district.insight_en}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white shadow-lg rounded-2xl p-4">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Legend</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-xs text-gray-600">{translations[language]?.highDemand} (75-100)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span className="text-xs text-gray-600">{translations[language]?.mediumDemand} (50-74)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-400 rounded"></div>
            <span className="text-xs text-gray-600">{translations[language]?.lowDemand} (0-49)</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SidebarStats

