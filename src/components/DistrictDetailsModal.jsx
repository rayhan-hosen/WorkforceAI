import { useLanguage } from '../context/LanguageContext'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

function DistrictDetailsModal({ district, onClose, translations }) {
  const { language } = useLanguage()

  if (!district) return null

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  const chartDataWithMonths = district.trend.map((value, index) => ({
    month: months[index] || `M${index + 1}`,
    demand: value
  }))

  const getDemandColor = (index) => {
    if (index >= 75) return 'text-red-600'
    if (index >= 50) return 'text-yellow-600'
    return 'text-gray-600'
  }

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = language === 'bn' ? 'bn-BD' : 'en-US'
      utterance.rate = 0.9
      window.speechSynthesis.speak(utterance)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      {/* Modal */}
      <div 
        className="fixed inset-y-0 right-0 w-full md:w-96 bg-white shadow-2xl z-50 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
      {/* Header */}
      <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-purple-800 text-white p-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold">
            {language === 'bn' ? district.name_bn : district.name_en}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex items-center space-x-4">
          <div>
            <span className="text-sm text-purple-200">{translations[language]?.demandIndex}:</span>
            <span className={`ml-2 text-2xl font-bold ${getDemandColor(district.demandIndex)}`}>
              {district.demandIndex} / 100
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Dominant Service */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">
            {translations[language]?.dominantService}
          </div>
          <div className="text-lg font-semibold text-gray-800">
            {language === 'bn' ? district.dominantService_bn : district.dominantService_en}
          </div>
        </div>

        {/* Trend Chart */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {translations[language]?.trend} ({translations[language]?.last6Months})
          </h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartDataWithMonths}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="month" 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                  domain={[0, 100]}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="demand" 
                  stroke="#8b5cf6" 
                  strokeWidth={3}
                  dot={{ fill: '#8b5cf6', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Reason */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-4 border-l-4 border-indigo-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <span className="mr-2">🤖</span>
              {translations[language]?.reason}
            </h3>
            <button
              onClick={() => speakText(language === 'bn' ? district.reason_bn : district.reason_en)}
              className="text-indigo-600 hover:text-indigo-700 text-sm"
              title="Read aloud"
            >
              🔊
            </button>
          </div>
          <p className="text-gray-700 leading-relaxed">
            {language === 'bn' ? district.reason_bn : district.reason_en}
          </p>
        </div>

        {/* Recommended Skills */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {translations[language]?.recommendedSkills}
          </h3>
          <div className="space-y-2">
            {district.recommendedSkills.map((skill, index) => (
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
      </div>
      </div>
    </>
  )
}

export default DistrictDetailsModal

