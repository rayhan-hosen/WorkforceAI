import { useLanguage } from '../context/LanguageContext'

function EarningsCard({ earnings, translations, userData, completedModules, totalModules }) {
  const { language } = useLanguage()
  const isNewUser = earnings.isNewUser || completedModules === 0
  const increasePercent = earnings.potentialIncrease ? earnings.potentialIncrease.toFixed(1) : '0'

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-6 md:p-8 shadow-2xl transition-all hover:shadow-3xl transform hover:scale-[1.02]">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl md:text-3xl font-bold text-white">
            {isNewUser ? translations[language]?.newUserTitle || translations[language]?.earnings : translations[language]?.earnings}
          </h3>
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <span className="text-2xl">💰</span>
          </div>
        </div>

        {isNewUser ? (
          /* New User Motivation Section */
          <>
            {/* Current Prediction */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 md:p-6 mb-4 border border-white/20">
              <div className="text-white/80 text-sm md:text-base font-medium mb-2">
                {translations[language]?.currentEarning || translations[language]?.potentialEarning}
              </div>
              <div className="text-3xl md:text-4xl font-extrabold text-white mb-3">
                ৳ {earnings.currentPredicted.toLocaleString()}
              </div>
              <div className="flex items-center space-x-2 text-white/70">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                <span className="text-sm md:text-base font-semibold">+{increasePercent}% Potential</span>
              </div>
            </div>

            {/* Next Month Prediction */}
            <div className="bg-gradient-to-r from-green-400/30 via-emerald-400/30 to-teal-400/30 backdrop-blur-md rounded-2xl p-5 md:p-6 border-2 border-white/30 mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-white/90 text-sm md:text-base font-medium">
                  {translations[language]?.nextMonth}
                </div>
                <div className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Predicted
                </div>
              </div>
              <div className="text-3xl md:text-4xl font-extrabold text-white">
                ৳ {earnings.predictedNext.toLocaleString()}
              </div>
              <div className="mt-3 text-xs text-white/70">
                {increasePercent}% potential increase
              </div>
            </div>

            {/* Motivation Section */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 md:p-6 border border-white/20">
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-2xl">🚀</span>
                <h4 className="text-lg md:text-xl font-bold text-white">
                  {translations[language]?.whyBoost || translations[language]?.newUserMotivation}
                </h4>
              </div>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <span className="text-white text-xl mt-1">✓</span>
                  <p className="text-white/90 text-sm md:text-base">
                    {translations[language]?.newUserDesc1}
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-white text-xl mt-1">✓</span>
                  <p className="text-white/90 text-sm md:text-base">
                    {translations[language]?.newUserDesc2}
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-white text-xl mt-1">✓</span>
                  <p className="text-white/90 text-sm md:text-base">
                    {translations[language]?.newUserDesc3}
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Existing User Earnings Display */
          <>
            {/* Current Earning Prediction */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 md:p-6 mb-4 border border-white/20">
              <div className="text-white/80 text-sm md:text-base font-medium mb-2">
                {translations[language]?.currentEarning || translations[language]?.lastMonth}
              </div>
              <div className="text-3xl md:text-4xl font-extrabold text-white mb-3">
                ৳ {earnings.currentPredicted.toLocaleString()}
              </div>
              <div className="flex items-center space-x-2 text-white/70">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                <span className="text-sm md:text-base font-semibold">+{increasePercent}%</span>
              </div>
            </div>

            {/* Next Month Prediction */}
            <div className="bg-gradient-to-r from-green-400/30 via-emerald-400/30 to-teal-400/30 backdrop-blur-md rounded-2xl p-5 md:p-6 border-2 border-white/30">
              <div className="flex items-center justify-between mb-2">
                <div className="text-white/90 text-sm md:text-base font-medium">
                  {translations[language]?.nextMonth}
                </div>
                <div className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Predicted
                </div>
              </div>
              <div className="text-3xl md:text-4xl font-extrabold text-white">
                ৳ {earnings.predictedNext.toLocaleString()}
              </div>
              <div className="mt-3 text-xs text-white/70">
                {increasePercent}% increase potential
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default EarningsCard

