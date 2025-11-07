import { useLanguage } from '../context/LanguageContext'

function JobCard({ job, translations, onCardClick, isPremium = false }) {
  const { language } = useLanguage()

  const getMatchColor = (score) => {
    if (score >= 85) return 'from-green-400 to-emerald-500'
    if (score >= 70) return 'from-yellow-400 to-orange-500'
    return 'from-gray-400 to-gray-500'
  }

  const getMatchLabel = (score) => {
    if (score >= 85) return translations[language]?.highMatch || 'High Match'
    if (score >= 70) return translations[language]?.mediumMatch || 'Medium Match'
    return translations[language]?.lowMatch || 'Low Match'
  }

  const isHighMatch = job.matchScore >= 90

  return (
    <div
      onClick={() => onCardClick(job)}
      className={`relative bg-white rounded-xl shadow-lg p-6 cursor-pointer transition-all hover:shadow-2xl transform hover:scale-[1.02] ${
        isPremium 
          ? 'border-2 border-yellow-400 shadow-yellow-200 ring-2 ring-yellow-300 ring-opacity-50' 
          : isHighMatch 
            ? 'border-2 border-green-400 shadow-green-200' 
            : 'border border-gray-200'
      }`}
    >
      {/* Premium Badge */}
      {isPremium && (
        <div className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center space-x-1 z-10">
          <span>⭐</span>
          <span>{language === 'bn' ? 'শীর্ষ' : 'Top'}</span>
        </div>
      )}
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            {language === 'bn' ? job.title_bn : job.title_en}
          </h3>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>📍</span>
            <span>{language === 'bn' ? job.location_bn : job.location_en}</span>
            <span className="mx-2">•</span>
            <span>{job.distance || 'N/A'}</span>
          </div>
        </div>
        {isHighMatch && (
          <span className="text-2xl animate-pulse">🔥</span>
        )}
      </div>

      {/* Match Score Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">
            {translations[language]?.match}: {job.matchScore}%
          </span>
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
            job.matchScore >= 85 ? 'bg-green-100 text-green-700' :
            job.matchScore >= 70 ? 'bg-yellow-100 text-yellow-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {getMatchLabel(job.matchScore)}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`bg-gradient-to-r ${getMatchColor(job.matchScore)} h-3 rounded-full transition-all duration-500`}
            style={{ width: `${job.matchScore}%` }}
          ></div>
        </div>
      </div>

      {/* Earning Boost */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 mb-4 border border-green-200">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            {translations[language]?.earningBoost}
          </span>
          <span className="text-lg font-bold text-green-600">
            +{job.earningBoost}
          </span>
        </div>
      </div>

      {/* Salary */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-600">
          {translations[language]?.salary}:
        </span>
        <span className="text-lg font-semibold text-gray-800">
          ৳ {job.salary.toLocaleString()}
        </span>
      </div>

      {/* Skills Match Info */}
      {job.skillsMatch && job.skillsMatch.length > 0 && (
        <div className="mb-4 bg-green-50 rounded-lg p-3 border border-green-200">
          <div className="text-xs font-semibold text-green-700 mb-2">
            {language === 'bn' ? '✓ আপনার দক্ষতা' : '✓ Your Skills'}
          </div>
          <div className="flex flex-wrap gap-1">
            {job.skillsMatch.slice(0, 3).map((skill, idx) => (
              <span key={idx} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                {skill}
              </span>
            ))}
            {job.skillsMatch.length > 3 && (
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                +{job.skillsMatch.length - 3}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Missing Skills */}
      {job.missingSkills && job.missingSkills.length > 0 && (
        <div className="mb-4 bg-orange-50 rounded-lg p-3 border border-orange-200">
          <div className="text-xs font-semibold text-orange-700 mb-2">
            {language === 'bn' ? '📚 শিখতে হবে' : '📚 Learn'}
          </div>
          <div className="flex flex-wrap gap-1">
            {job.missingSkills.slice(0, 2).map((skill, idx) => (
              <span key={idx} className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium">
                {skill}
              </span>
            ))}
            {job.missingSkills.length > 2 && (
              <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium">
                +{job.missingSkills.length - 2}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Category Badge */}
      <div className="flex items-center justify-between">
        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
          {job.category}
        </span>
        <span className="text-sm text-gray-500">
          {translations[language]?.category}: {job.category}
        </span>
      </div>
    </div>
  )
}

export default JobCard

