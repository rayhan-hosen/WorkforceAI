import { useState } from 'react'
import { useLanguage } from '../context/LanguageContext'

function GroupCard({ group, translations, onViewFeed }) {
  const { language } = useLanguage()
  const [joined, setJoined] = useState(false)

  const handleJoin = () => {
    setJoined(true)
    const message = language === 'bn' 
      ? '✅ ' + translations[language]?.joinSuccess
      : '✅ ' + translations[language]?.joinSuccess
    setTimeout(() => {
      alert(message)
    }, 100)
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition-all">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-1">
            {language === 'bn' ? group.name_bn : group.name_en}
          </h3>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <span>👥</span>
              <span>{group.members} {translations[language]?.members}</span>
            </div>
            <div className="flex items-center space-x-1 text-green-600">
              <span>🟢</span>
              <span>{group.activeNow} {translations[language]?.activeNow}</span>
            </div>
          </div>
        </div>
        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
          {group.category}
        </span>
      </div>

      {/* Recent Post */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="text-xs text-gray-600 mb-2">{translations[language]?.recentActivity}</div>
        <p className="text-gray-700">
          {language === 'bn' ? group.recentPost_bn : group.recentPost_en}
        </p>
      </div>

      {/* AI Tip Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-4 border-2 border-blue-400">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-xl">🤖</span>
          <span className="font-semibold text-blue-700">{translations[language]?.dailyTip}</span>
        </div>
        <p className="text-sm text-gray-700">
          {language === 'bn' ? group.aiTip_bn : group.aiTip_en}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => onViewFeed(group)}
          className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold text-sm"
        >
          {translations[language]?.viewFeed}
        </button>
        <button
          onClick={handleJoin}
          className={`flex-1 px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
            joined
              ? 'bg-green-500 text-white cursor-default'
              : 'bg-gradient-to-r from-indigo-600 to-purple-700 text-white hover:from-indigo-700 hover:to-purple-800'
          }`}
        >
          {joined ? '✅ ' + translations[language]?.joinGroup : translations[language]?.joinGroup}
        </button>
      </div>
    </div>
  )
}

export default GroupCard

