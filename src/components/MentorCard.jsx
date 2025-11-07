import { useLanguage } from '../context/LanguageContext'

function MentorCard({ mentor, translations }) {
  const { language } = useLanguage()

  const getMatchColor = (match) => {
    if (match >= 90) return 'from-green-400 to-emerald-500'
    if (match >= 80) return 'from-yellow-400 to-orange-500'
    return 'from-blue-400 to-indigo-500'
  }

  return (
    <div className="bg-gradient-to-r from-indigo-400 to-blue-500 text-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all transform hover:scale-[1.02]">
      {/* AI Match Badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
          <span className="text-xs font-bold">🤖 {translations[language]?.aiMatch} {mentor.aiMatch}%</span>
        </div>
        <span className="text-yellow-300 text-2xl">⭐ {mentor.rating}</span>
      </div>

      {/* Profile Section */}
      <div className="mb-4">
        <h3 className="text-2xl font-bold mb-2">
          {language === 'bn' ? mentor.name_bn : mentor.name_en}
        </h3>
        <p className="text-indigo-100 text-sm mb-2">
          {language === 'bn' ? mentor.expertise_bn : mentor.expertise_en}
        </p>
        <div className="flex items-center space-x-4 text-sm text-indigo-100">
          <span>{mentor.yearsExperience} {translations[language]?.years}</span>
          <span>•</span>
          <span>{mentor.completedJobs} {translations[language]?.completedJobs}</span>
        </div>
      </div>

      {/* AI Recommendation */}
      <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 mb-4">
        <p className="text-sm text-white/90">
          {language === 'bn' ? mentor.aiMatch_bn : mentor.aiMatch_en}
        </p>
      </div>

      {/* Skills */}
      <div className="mb-4">
        <div className="text-xs text-indigo-200 mb-2">{translations[language]?.skills}:</div>
        <div className="flex flex-wrap gap-2">
          {mentor.skills.slice(0, 2).map((skill, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Message Button */}
      <button
        onClick={() => {
          const message = language === 'bn' 
            ? 'মেসেজ পাঠানো হয়েছে (ডেমো)'
            : 'Message sent (demo)'
          alert(message)
        }}
        className="w-full bg-white text-indigo-600 py-2 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
      >
        {translations[language]?.messageMentor}
      </button>
    </div>
  )
}

export default MentorCard

