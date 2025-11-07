import { useLanguage } from '../context/LanguageContext'

function ChallengeCard({ challenge, translations }) {
  const { language } = useLanguage()

  const getRewardColor = (reward) => {
    if (reward.includes('Gold') || reward.includes('🥇')) return 'from-yellow-400 to-orange-500'
    if (reward.includes('Platinum') || reward.includes('🏆')) return 'from-blue-400 to-indigo-500'
    if (reward.includes('Silver') || reward.includes('🥈')) return 'from-gray-300 to-gray-400'
    return 'from-amber-600 to-amber-700'
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all transform hover:scale-[1.02] border-2 border-transparent hover:border-indigo-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800">
          {language === 'bn' ? challenge.title_bn : challenge.title_en}
        </h3>
        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
          {challenge.category}
        </span>
      </div>

      {/* Description */}
      <p className="text-gray-600 text-sm mb-4">
        {language === 'bn' ? challenge.description_bn : challenge.description_en}
      </p>

      {/* Goal */}
      <div className="bg-gray-50 rounded-lg p-3 mb-4">
        <div className="text-xs text-gray-600 mb-1">{translations[language]?.goal}</div>
        <div className="font-semibold text-gray-800">
          {language === 'bn' ? challenge.goal_bn : challenge.goal_en}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">{translations[language]?.progress}</span>
          <span className="text-sm font-bold text-indigo-600">{challenge.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-indigo-600 to-purple-700 h-3 rounded-full transition-all duration-1000"
            style={{ width: `${challenge.progress}%` }}
          ></div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-600 mb-1">{translations[language]?.participants}</div>
          <div className="text-xl font-bold text-green-600">{challenge.participants}</div>
        </div>
        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-600 mb-1">{translations[language]?.timeLeft}</div>
          <div className="text-xl font-bold text-orange-600">{challenge.timeLeft}</div>
        </div>
      </div>

      {/* Reward */}
      <div className={`bg-gradient-to-r ${getRewardColor(challenge.reward)} text-white rounded-lg p-4 text-center`}>
        <div className="text-sm font-semibold mb-1">{translations[language]?.reward}</div>
        <div className="text-2xl font-bold">{challenge.reward}</div>
      </div>
    </div>
  )
}

export default ChallengeCard

