import { useLanguage } from '../context/LanguageContext'

function TechModal({ technician, onClose, translations }) {
  const { language } = useLanguage()

  if (!technician) return null

  const getMatchColor = (match) => {
    if (match >= 90) return 'from-green-400 to-emerald-500'
    if (match >= 80) return 'from-yellow-400 to-orange-500'
    return 'from-blue-400 to-indigo-500'
  }

  const handleBookNow = () => {
    const message = language === 'bn' 
      ? '🎉 টেকনিশিয়ান সফলভাবে বুক করা হয়েছে (ডেমো)'
      : '🎉 Technician booked successfully (demo)'
    alert(message)
    onClose()
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
        className="fixed inset-0 flex items-center justify-center z-50 p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-700 text-white p-6 rounded-t-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                {technician.profileImage || technician.profileImagePath ? (
                  <img
                    src={technician.profileImage || technician.profileImagePath}
                    alt={language === 'bn' ? technician.name_bn : technician.name_en}
                    className={`w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg ${
                      technician.available ? 'ring-2 ring-green-400' : 'ring-2 ring-gray-300'
                    }`}
                  />
                ) : (
                  <div className={`w-16 h-16 rounded-full bg-white flex items-center justify-center text-indigo-600 text-2xl font-bold border-4 border-white shadow-lg ${
                    technician.available ? 'ring-2 ring-green-400' : 'ring-2 ring-gray-300'
                  }`}>
                    {(language === 'bn' ? technician.name_bn : technician.name_en).charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold">
                    {language === 'bn' ? technician.name_bn : technician.name_en}
                  </h2>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-yellow-300">⭐</span>
                    <span className="text-white font-semibold">{technician.rating}</span>
                    <span className="text-indigo-200">•</span>
                    <span className={`text-sm ${
                      technician.available ? 'text-green-300' : 'text-gray-300'
                    }`}>
                      {technician.available ? translations[language]?.available : translations[language]?.notAvailable}
                    </span>
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
            {/* AI Match Banner */}
            <div className={`bg-gradient-to-r ${getMatchColor(technician.aiMatch)} text-white rounded-lg p-4`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">{translations[language]?.aiMatch}: {technician.aiMatch}%</span>
                <span className="text-2xl">🤖</span>
              </div>
              <p className="text-sm text-white/90">
                {language === 'bn' ? technician.aiMatch_bn : technician.aiMatch_en}
              </p>
            </div>

            {/* Bio */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {translations[language]?.bio}
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {language === 'bn' ? technician.bio_bn : technician.bio_en}
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-4 text-center">
                <div className="text-sm text-gray-600 mb-1">{translations[language]?.rating}</div>
                <div className="flex items-center justify-center space-x-1">
                  <span className="text-2xl font-bold text-yellow-600">{technician.rating}</span>
                  <span className="text-yellow-500">⭐</span>
                </div>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 text-center">
                <div className="text-sm text-gray-600 mb-1">{translations[language]?.completedJobs}</div>
                <div className="text-2xl font-bold text-green-600">{technician.completedJobs}</div>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 text-center">
                <div className="text-sm text-gray-600 mb-1">{translations[language]?.hourlyRate}</div>
                <div className="text-xl font-bold text-purple-600">
                  ৳ {technician.hourlyRate}
                </div>
              </div>
            </div>

            {/* Skills */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="mr-2">✅</span>
                {translations[language]?.skills}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {(language === 'bn' ? technician.skills_bn : technician.skills_en).map((skill, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 bg-green-50 rounded-lg p-3 border border-green-200"
                  >
                    <span className="text-green-600">✓</span>
                    <span className="text-gray-800 font-medium">{skill}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Certificates */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="mr-2">📜</span>
                {translations[language]?.certificates} <span className="ml-2 text-green-600 text-sm">✓ {translations[language]?.verified}</span>
              </h3>
              <div className="space-y-2">
                {technician.certificates.map((cert, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-200"
                  >
                    <span className="text-2xl">📜</span>
                    <span className="text-gray-800 font-medium">{cert}</span>
                    <span className="ml-auto text-green-600">✓</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Location */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <span className="text-xl">📍</span>
                <div>
                  <div className="text-sm text-gray-600">{translations[language]?.location}</div>
                  <div className="font-semibold text-gray-800">
                    {language === 'bn' ? technician.district_bn : technician.district_en}
                  </div>
                </div>
              </div>
            </div>

            {/* Book Now Button */}
            <button
              onClick={handleBookNow}
              disabled={!technician.available}
              className={`w-full py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-[1.02] shadow-lg ${
                technician.available
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-700 text-white hover:from-indigo-700 hover:to-purple-800'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {translations[language]?.bookNow}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default TechModal

