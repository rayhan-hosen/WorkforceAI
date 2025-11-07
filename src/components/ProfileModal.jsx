import { useLanguage } from '../context/LanguageContext'

function ProfileModal({ technician, onClose, translations }) {
  const { language } = useLanguage()

  if (!technician) return null

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return null
  }

  const rankIcon = getRankIcon(technician.rank)

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      {/* Modal */}
      <div 
        className="fixed inset-0 flex items-center justify-center z-50 p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-700 text-white p-6 rounded-t-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-indigo-600 text-2xl font-bold border-4 border-white shadow-lg">
                  {(language === 'bn' ? technician.name_bn : technician.name_en).charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">
                    {language === 'bn' ? technician.name_bn : technician.name_en}
                  </h2>
                  <div className="flex items-center space-x-2 mt-1">
                    {rankIcon && <span className="text-2xl">{rankIcon}</span>}
                    <span className="text-indigo-200">#{technician.rank} {translations[language]?.rank}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-4 text-center">
                <div className="text-sm text-gray-600 mb-1">{translations[language]?.points}</div>
                <div className="text-2xl font-bold text-indigo-600">{technician.points.toLocaleString()}</div>
              </div>
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 text-center">
                <div className="text-sm text-gray-600 mb-1">{translations[language]?.rating}</div>
                <div className="flex items-center justify-center space-x-1">
                  <span className="text-2xl font-bold text-yellow-600">{technician.rating}</span>
                  <span className="text-yellow-500">⭐</span>
                </div>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 text-center">
                <div className="text-sm text-gray-600 mb-1">{translations[language]?.level}</div>
                <div className="text-2xl font-bold text-green-600">{technician.level}</div>
              </div>
            </div>

            {/* Skills Mastered */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="mr-2">✅</span>
                {translations[language]?.skillsMastered}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {technician.skills.map((skill, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 bg-green-50 rounded-lg p-3 border border-green-200"
                  >
                    <span className="text-green-600">✅</span>
                    <span className="text-gray-800 font-medium">{skill}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Certificates */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="mr-2">📜</span>
                {translations[language]?.certificates}
              </h3>
              <div className="space-y-2">
                {technician.certificates.map((cert, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-200"
                  >
                    <span className="text-2xl">📜</span>
                    <span className="text-gray-800 font-medium">{cert}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Jobs */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="mr-2">💼</span>
                {translations[language]?.recentJobs}
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-3xl font-bold text-indigo-600 text-center">
                  {technician.recentJobs}
                </div>
                <div className="text-sm text-gray-600 text-center mt-2">
                  {language === 'bn' ? 'সাম্প্রতিক মাসে সম্পন্ন' : 'Completed this month'}
                </div>
              </div>
            </div>

            {/* Category Badge */}
            <div className="flex items-center justify-center">
              <span className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-full font-semibold text-lg">
                {technician.category} {translations[language]?.category || 'Category'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ProfileModal

