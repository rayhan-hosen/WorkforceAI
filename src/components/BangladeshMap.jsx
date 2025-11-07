import { useState, useMemo } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

function BangladeshMap({ districts, onDistrictHover, onDistrictClick, hoveredDistrict, selectedDistrict, userProfession, topDistricts, translations }) {
  const { language } = useLanguage()
  const [localHovered, setLocalHovered] = useState(null)

  // Generate random positions for districts (graph-like layout) - memoized to prevent regeneration
  const getRandomPositions = (count) => {
    const positions = []
    const usedPositions = new Set()
    
    for (let i = 0; i < count; i++) {
      let x, y, key, attempts = 0
      do {
        // Random positions within 85% of the container (leaving margins)
        x = Math.random() * 75 + 10 // 10-85%
        y = Math.random() * 75 + 10 // 10-85%
        key = `${Math.round(x)}-${Math.round(y)}`
        attempts++
        // Prevent infinite loop
        if (attempts > 100) break
      } while (usedPositions.has(key))
      
      usedPositions.add(key)
      positions.push({ x, y })
    }
    
    return positions
  }

  // Generate positions once and memoize - only regenerate if district count changes
  const positions = useMemo(() => {
    return getRandomPositions(districts.length)
  }, [districts.length])

  const getDistrictColor = (demandIndex) => {
    if (demandIndex >= 75) return '#ef4444' // red - high demand
    if (demandIndex >= 50) return '#eab308' // yellow - medium demand
    return '#9ca3af' // gray - low demand
  }

  const getDemandLevel = (demandIndex) => {
    if (demandIndex >= 75) return language === 'bn' ? 'উচ্চ' : 'High'
    if (demandIndex >= 50) return language === 'bn' ? 'মাঝারি' : 'Medium'
    return language === 'bn' ? 'নিম্ন' : 'Low'
  }

  // Get demand reasons (multiple reasons for each district)
  const getDemandReasons = (district) => {
    const reasons = []
    
    // Base reason from data
    if (district.reason_bn || district.reason_en) {
      reasons.push({
        text_bn: district.reason_bn,
        text_en: district.reason_en,
        type: 'primary'
      })
    }
    
    // Additional reasons based on demand index
    if (district.demandIndex >= 75) {
      reasons.push({
        text_bn: 'শহুরে উন্নয়ন এবং নতুন প্রকল্প',
        text_en: 'Urban development and new projects',
        type: 'secondary'
      })
      if (district.dominantService_en?.toLowerCase().includes('ac')) {
        reasons.push({
          text_bn: 'তাপমাত্রা বৃদ্ধি এবং আবহাওয়া পরিবর্তন',
          text_en: 'Temperature rise and climate change',
          type: 'secondary'
        })
      }
    }
    
    if (district.demandIndex >= 50 && district.demandIndex < 75) {
      reasons.push({
        text_bn: 'স্থিতিশীল অর্থনৈতিক অবস্থা',
        text_en: 'Stable economic conditions',
        type: 'secondary'
      })
    }
    
    // Seasonal factors
    if (district.insight_en?.toLowerCase().includes('season')) {
      reasons.push({
        text_bn: 'মৌসুমী চাহিদা বৃদ্ধি',
        text_en: 'Seasonal demand increase',
        type: 'seasonal'
      })
    }
    
    // Industry-specific
    if (district.insight_en?.toLowerCase().includes('industrial') || 
        district.insight_en?.toLowerCase().includes('port')) {
      reasons.push({
        text_bn: 'শিল্পায়ন এবং বাণিজ্যিক কার্যক্রম',
        text_en: 'Industrialization and commercial activities',
        type: 'industry'
      })
    }
    
    return reasons
  }

  const handleDistrictInteraction = (district, action) => {
    if (action === 'hover') {
      setLocalHovered(district)
      if (onDistrictHover) onDistrictHover(district)
    } else if (action === 'click') {
      if (onDistrictClick) onDistrictClick(district)
      setLocalHovered(null) // Clear hover when clicking
    } else if (action === 'leave') {
      // Only clear hover if not selected
      if (!selectedDistrict || selectedDistrict.id !== district?.id) {
        setLocalHovered(null)
        if (onDistrictHover && !selectedDistrict) {
          onDistrictHover(null)
        }
      }
    }
  }

  // Priority: selected > localHovered > hoveredDistrict
  const activeDistrict = selectedDistrict || localHovered || (hoveredDistrict && !selectedDistrict ? hoveredDistrict : null)

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-3 sm:p-4 md:p-6 overflow-auto" style={{ minHeight: '400px' }}>
      {/* Legend */}
      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-white/95 backdrop-blur-sm rounded-lg p-2 sm:p-3 shadow-lg border border-gray-200 z-10 max-w-[110px] sm:max-w-none">
        <div className="text-xs sm:text-sm font-bold text-gray-700 mb-1.5 sm:mb-2">
          {language === 'bn' ? 'চাহিদা সূচক' : 'Demand Index'}
        </div>
        <div className="space-y-1 sm:space-y-1.5">
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-red-500 border-2 border-white shadow-sm flex-shrink-0"></div>
            <span className="text-[10px] sm:text-xs text-gray-700 font-medium leading-tight">
              {language === 'bn' ? 'উচ্চ (75-100%)' : 'High (75-100%)'}
            </span>
          </div>
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-yellow-500 border-2 border-white shadow-sm flex-shrink-0"></div>
            <span className="text-[10px] sm:text-xs text-gray-700 font-medium leading-tight">
              {language === 'bn' ? 'মাঝারি (50-74%)' : 'Medium (50-74%)'}
            </span>
          </div>
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-gray-400 border-2 border-white shadow-sm flex-shrink-0"></div>
            <span className="text-[10px] sm:text-xs text-gray-700 font-medium leading-tight">
              {language === 'bn' ? 'নিম্ন (0-49%)' : 'Low (0-49%)'}
            </span>
          </div>
        </div>
      </div>

      {/* Districts Grid/Graph Layout */}
      <div className="relative w-full h-full" style={{ minHeight: '400px' }}>
        {districts.map((district, index) => {
          const pos = positions[index] || { x: 50, y: 50 }
          const color = getDistrictColor(district.demandIndex)
          const isActive = activeDistrict?.id === district.id
          const isHovered = localHovered?.id === district.id
          
          return (
            <div
              key={district.id}
              className="absolute group"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: isActive ? 50 : isHovered ? 40 : 10
              }}
            >
              {/* District Dot */}
              <div
                className="relative cursor-pointer transition-all duration-300"
                onMouseEnter={() => handleDistrictInteraction(district, 'hover')}
                onMouseLeave={() => handleDistrictInteraction(district, 'leave')}
                onClick={() => handleDistrictInteraction(district, 'click')}
              >
                {/* Glow effect for active */}
                {(isActive || isHovered) && (
                  <div
                    className="absolute inset-0 rounded-full animate-ping"
                    style={{
                      backgroundColor: color,
                      opacity: 0.3,
                      transform: 'scale(2)'
                    }}
                  />
                )}
                
                {/* Dot */}
                <div
                  className="relative w-8 h-8 sm:w-10 sm:h-12 rounded-full border-2 sm:border-4 border-white shadow-lg transition-all duration-300 flex items-center justify-center"
                  style={{
                    backgroundColor: color,
                    transform: isActive ? 'scale(1.3)' : isHovered ? 'scale(1.15)' : 'scale(1)',
                    boxShadow: isActive 
                      ? `0 0 20px ${color}, 0 4px 6px rgba(0,0,0,0.3)` 
                      : `0 4px 6px rgba(0,0,0,0.2)`
                  }}
                >
                  <span className="text-white font-bold text-[10px] sm:text-xs md:text-sm">
                    {district.demandIndex}
                  </span>
                </div>
                
                {/* District Name - Hide on very small screens, show on hover/active */}
                <div
                  className={`mt-1 sm:mt-2 px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg text-center transition-all duration-300 cursor-pointer ${
                    isActive || isHovered
                      ? 'bg-white shadow-lg scale-110 block'
                      : 'bg-white/70 backdrop-blur-sm shadow-md hidden sm:block'
                  }`}
                  onMouseEnter={() => handleDistrictInteraction(district, 'hover')}
                  onMouseLeave={() => handleDistrictInteraction(district, 'leave')}
                  onClick={() => handleDistrictInteraction(district, 'click')}
                >
                  <span className={`text-[10px] sm:text-xs font-bold ${
                    isActive || isHovered ? 'text-gray-800' : 'text-gray-700'
                  }`}>
                    {language === 'bn' ? district.name_bn : district.name_en}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* District Information Panel - Only show on click, not hover */}
      {selectedDistrict && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4" onClick={() => {
          if (onDistrictClick) onDistrictClick(null)
          setLocalHovered(null)
        }}>
          <div 
            className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-4xl mx-auto max-h-[98vh] sm:max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div 
              className="p-3 sm:p-4 md:p-6 border-b sticky top-0 bg-white z-10 backdrop-blur-sm"
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.98)',
                borderColor: getDistrictColor(selectedDistrict.demandIndex)
              }}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
                <div className="flex-1 min-w-0 pr-2">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-1.5 sm:mb-2 truncate">
                    {language === 'bn' ? selectedDistrict.name_bn : selectedDistrict.name_en}
                  </h2>
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 md:gap-4">
                    <div className="flex items-center space-x-1.5 sm:space-x-2">
                      <div
                        className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                        style={{ backgroundColor: getDistrictColor(selectedDistrict.demandIndex) }}
                      />
                      <span className="text-sm sm:text-base md:text-lg font-bold text-gray-700 whitespace-nowrap">
                        {selectedDistrict.demandIndex}% - {getDemandLevel(selectedDistrict.demandIndex)}
                      </span>
                    </div>
                    {selectedDistrict.userRelevant && (
                      <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-green-100 text-green-700 rounded-full text-[10px] sm:text-xs md:text-sm font-semibold whitespace-nowrap">
                        ✓ {language === 'bn' ? 'আপনার জন্য' : 'For You'} ({selectedDistrict.matchScore}%)
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (onDistrictClick) onDistrictClick(null)
                    setLocalHovered(null)
                  }}
                  className="text-gray-400 hover:text-gray-600 text-xl sm:text-2xl md:text-3xl transition-colors flex-shrink-0"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 md:space-y-6">
              {/* Dominant Service */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-500 mb-2 uppercase">
                  {language === 'bn' ? 'প্রধান সেবা' : 'Dominant Service'}
                </h3>
                <p className="text-lg font-semibold text-gray-800">
                  {language === 'bn' ? selectedDistrict.dominantService_bn : selectedDistrict.dominantService_en}
                </p>
              </div>

              {/* Primary Reason for Demand Change */}
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-4 border-l-4 border-indigo-500">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <span className="mr-2">🤖</span>
                    {language === 'bn' ? 'চাহিদা পরিবর্তনের কারণ' : 'Reason for Demand Change'}
                  </h3>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {language === 'bn' ? selectedDistrict.reason_bn : selectedDistrict.reason_en}
                </p>
              </div>

              {/* Additional Demand Reasons */}
              {getDemandReasons(selectedDistrict).filter(r => r.type !== 'primary').length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase">
                    {language === 'bn' ? 'অতিরিক্ত কারণসমূহ' : 'Additional Factors'}
                  </h3>
                  <div className="space-y-2">
                    {getDemandReasons(selectedDistrict).filter(r => r.type !== 'primary').map((reason, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg border-l-4 ${
                          reason.type === 'seasonal'
                            ? 'bg-orange-50 border-orange-500'
                            : reason.type === 'industry'
                            ? 'bg-purple-50 border-purple-500'
                            : 'bg-gray-50 border-gray-400'
                        }`}
                      >
                        <div className="flex items-start space-x-2">
                          <span className="text-base">
                            {reason.type === 'seasonal' ? '📅' : 
                             reason.type === 'industry' ? '🏭' : '💡'}
                          </span>
                          <p className="text-sm text-gray-700 flex-1">
                            {language === 'bn' ? reason.text_bn : reason.text_en}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Trend Chart */}
              {selectedDistrict.trend && selectedDistrict.trend.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase">
                    {language === 'bn' ? 'চাহিদার প্রবণতা (শেষ ৬ মাস)' : 'Demand Trend (Last 6 Months)'}
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-2 sm:p-4">
                    <ResponsiveContainer width="100%" height={180}>
                      <LineChart data={selectedDistrict.trend.map((value, index) => {
                        const months = language === 'bn' 
                          ? ['জানু', 'ফেব্রু', 'মার্চ', 'এপ্রিল', 'মে', 'জুন']
                          : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
                        return {
                          month: months[index] || `M${index + 1}`,
                          demand: value
                        }
                      })}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="month" 
                          stroke="#6b7280"
                          fontSize={11}
                          tick={{ fill: '#6b7280' }}
                          interval={0}
                        />
                        <YAxis 
                          stroke="#6b7280"
                          fontSize={11}
                          domain={[0, 100]}
                          tick={{ fill: '#6b7280' }}
                          width={40}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1f2937', 
                            border: 'none', 
                            borderRadius: '8px',
                            color: '#fff',
                            padding: '8px 12px'
                          }}
                          labelStyle={{ color: '#fff', marginBottom: '4px' }}
                          formatter={(value) => [`${value}%`, language === 'bn' ? 'চাহিদা' : 'Demand']}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="demand" 
                          stroke={getDistrictColor(selectedDistrict.demandIndex)} 
                          strokeWidth={3}
                          dot={{ fill: getDistrictColor(selectedDistrict.demandIndex), r: 5, strokeWidth: 2, stroke: '#fff' }}
                          activeDot={{ r: 7, fill: getDistrictColor(selectedDistrict.demandIndex) }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Recommended Skills */}
              {selectedDistrict.recommendedSkills && selectedDistrict.recommendedSkills.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    {language === 'bn' ? 'প্রস্তাবিত দক্ষতা' : 'Recommended Skills'}
                  </h3>
                  <div className="space-y-2">
                    {selectedDistrict.recommendedSkills.map((skill, index) => (
                      <div
                        key={index}
                        className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-200 hover:border-purple-400 transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-purple-600 font-semibold">#{index + 1}</span>
                          <span className="text-gray-800 font-medium">{skill}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Insight */}
              {selectedDistrict.insight_bn && (
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border-l-4 border-indigo-500">
                  <p className="text-gray-700 italic">
                    💡 {language === 'bn' ? selectedDistrict.insight_bn : selectedDistrict.insight_en}
                  </p>
                </div>
              )}

              {/* Top Districts Section - Only show if topDistricts provided */}
              {topDistricts && topDistricts.length > 0 && translations && (
                <div className="border-t pt-6 mt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <span className="mr-2">🔥</span>
                    {userProfession 
                      ? (language === 'bn' 
                          ? `আপনার জন্য ${translations[language]?.topDistricts || 'শীর্ষ জেলা'}` 
                          : `Top Districts for You`)
                      : (translations[language]?.topDistricts || 'Top Districts')}
                  </h3>
                  <div className="space-y-2">
                    {topDistricts.slice(0, 5).map((district, index) => (
                      <button
                        key={district.id}
                        onClick={() => onDistrictClick && onDistrictClick(district)}
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
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BangladeshMap
