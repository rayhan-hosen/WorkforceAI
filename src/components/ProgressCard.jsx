import { useLanguage } from '../context/LanguageContext'

function ProgressCard({ skills, translations }) {
  const { language } = useLanguage()

  // Calculate overall progress
  const overallProgress = skills.length > 0
    ? Math.round(skills.reduce((sum, skill) => sum + skill.completion, 0) / skills.length)
    : 0

  // Find current level (first incomplete skill or last skill)
  const currentSkill = skills.find(skill => skill.completion < 100) || skills[skills.length - 1]

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-white via-purple-50/50 to-indigo-50/50 rounded-3xl p-6 md:p-8 shadow-2xl border-2 border-purple-100/50 transition-all hover:shadow-3xl hover:border-purple-200 transform hover:scale-[1.02]">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200/20 rounded-full -mr-16 -mt-16"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            {translations[language]?.skillProgress || 'Skill Progress'}
          </h3>
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <span className="text-2xl">📊</span>
          </div>
        </div>

        <div className="space-y-6">
          {/* Overall Progress */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-purple-100">
            <div className="flex justify-between items-center mb-4">
              <span className="text-base md:text-lg font-semibold text-gray-700">
                {translations[language]?.currentLevel || 'Current Level'}
              </span>
              <span className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                {overallProgress}%
              </span>
            </div>
            <div className="relative w-full bg-gray-200 rounded-full h-4 md:h-5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 h-full rounded-full transition-all duration-1000 relative"
                style={{ width: `${overallProgress}%` }}
              >
                <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Current Skill Progress */}
          {currentSkill && (
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-5 md:p-6 border-2 border-indigo-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-lg">🎯</span>
                  </div>
                  <div>
                    <div className="text-base md:text-lg font-bold text-gray-800">
                      {language === 'bn' ? currentSkill.name_bn : currentSkill.name_en}
                    </div>
                    <div className="text-xs text-gray-500">
                      Level {currentSkill.id}
                    </div>
                  </div>
                </div>
                <div className="text-2xl md:text-3xl font-extrabold text-indigo-600">
                  {currentSkill.completion}%
                </div>
              </div>
              <div className="relative w-full bg-gray-200 rounded-full h-3 md:h-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 h-full rounded-full transition-all duration-1000 relative"
                  style={{ width: `${currentSkill.completion}%` }}
                >
                  {currentSkill.completion > 0 && currentSkill.completion < 100 && (
                    <div className="absolute inset-0 bg-white/40 animate-pulse"></div>
                  )}
                </div>
                {currentSkill.completion === 100 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">✓ Completed</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProgressCard

