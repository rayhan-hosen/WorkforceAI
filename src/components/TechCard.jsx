import { useLanguage } from '../context/LanguageContext'

function TechCard({ technician, translations, onCardClick, onHireClick }) {
  const { language } = useLanguage()

  const getMatchColor = (match) => {
    if (match >= 90) return 'from-green-400 to-emerald-500'
    if (match >= 80) return 'from-yellow-400 to-orange-500'
    return 'from-blue-400 to-indigo-500'
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-2xl transition-all transform hover:scale-[1.02] relative">
      {/* AI Match Badge */}
      <div className={`absolute top-4 right-4 bg-gradient-to-r ${getMatchColor(technician.aiMatch)} text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg`}>
        {translations[language]?.aiMatch} {technician.aiMatch}%
      </div>

      {/* Profile Section */}
      <div className="flex items-center space-x-4 mb-4">
        {technician.profileImage || technician.profileImagePath ? (
          <img
            src={technician.profileImage || technician.profileImagePath}
            alt={language === 'bn' ? technician.name_bn : technician.name_en}
            className={`w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg ${
              technician.available ? 'ring-2 ring-green-400' : 'ring-2 ring-gray-300 opacity-60'
            }`}
          />
        ) : (
          <div className={`w-16 h-16 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-lg ${
            technician.available ? 'ring-2 ring-green-400' : 'ring-2 ring-gray-300 opacity-60'
          }`}>
            {(language === 'bn' ? technician.name_bn : technician.name_en).charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-800 mb-1">
            {language === 'bn' ? technician.name_bn : technician.name_en}
          </h3>
          <div className="flex items-center space-x-2">
            <span className="text-yellow-500">⭐</span>
            <span className="font-semibold text-gray-700">{technician.rating}</span>
            <span className="text-gray-400">•</span>
            <span className={`text-xs font-semibold ${
              technician.available ? 'text-green-600' : 'text-gray-400'
            }`}>
              {technician.available ? translations[language]?.available : translations[language]?.notAvailable}
            </span>
          </div>
        </div>
      </div>

      {/* Location and Category */}
      <div className="mb-4 space-y-2">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>📍</span>
          <span>{language === 'bn' ? technician.district_bn : technician.district_en}</span>
        </div>
        <div>
          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
            {technician.category}
          </span>
        </div>
      </div>

      {/* Skills */}
      <div className="mb-4">
        <div className="text-xs text-gray-600 mb-2">{translations[language]?.skills}:</div>
        <div className="flex flex-wrap gap-2">
          {(language === 'bn' ? technician.skills_bn : technician.skills_en).slice(0, 2).map((skill, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold"
            >
              {skill}
            </span>
          ))}
          {(language === 'bn' ? technician.skills_bn : technician.skills_en).length > 2 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">
              +{(language === 'bn' ? technician.skills_bn : technician.skills_en).length - 2}
            </span>
          )}
        </div>
      </div>

      {/* Hourly Rate */}
      <div className="mb-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-3">
        <div className="text-xs text-gray-600 mb-1">{translations[language]?.hourlyRate}</div>
        <div className="text-xl font-bold text-indigo-600">
          ৳ {technician.hourlyRate} <span className="text-sm text-gray-600">/ {translations[language]?.hourly}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => onCardClick(technician)}
          className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold text-sm"
        >
          {translations[language]?.viewProfile}
        </button>
        <button
          onClick={() => onHireClick(technician)}
          disabled={!technician.available}
          className={`flex-1 px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
            technician.available
              ? 'bg-gradient-to-r from-indigo-600 to-purple-700 text-white hover:from-indigo-700 hover:to-purple-800'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {translations[language]?.hireNow}
        </button>
      </div>
    </div>
  )
}

export default TechCard

