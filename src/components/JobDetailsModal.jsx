import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'

function JobDetailsModal({ job, onClose, translations }) {
  const navigate = useNavigate()
  const { language } = useLanguage()
  const [typedReason, setTypedReason] = useState('')
  const [isTyping, setIsTyping] = useState(true)

  useEffect(() => {
    if (!job) return

    const reasonText = language === 'bn' ? job.reason_bn : job.reason_en
    setTypedReason('')
    setIsTyping(true)

    let index = 0
    const typingInterval = setInterval(() => {
      if (index < reasonText.length) {
        setTypedReason(reasonText.slice(0, index + 1))
        index++
      } else {
        setIsTyping(false)
        clearInterval(typingInterval)
      }
    }, 30) // 30ms per character for typing effect

    return () => clearInterval(typingInterval)
  }, [job, language])

  if (!job) return null

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = language === 'bn' ? 'bn-BD' : 'en-US'
      utterance.rate = 0.9
      window.speechSynthesis.speak(utterance)
    }
  }

  const getMatchColor = (score) => {
    if (score >= 85) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-gray-600'
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
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold">
                {language === 'bn' ? job.title_bn : job.title_en}
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
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <span>📍</span>
                <span>{language === 'bn' ? job.location_bn : job.location_en}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>📏</span>
                <span>{job.distance || 'N/A'}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>💰</span>
                <span>৳ {job.salary.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Match Score */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border-l-4 border-indigo-500">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-600">
                  {translations[language]?.match}
                </span>
                <span className={`text-3xl font-bold ${getMatchColor(job.matchScore)}`}>
                  {job.matchScore}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`bg-gradient-to-r ${
                    job.matchScore >= 85 ? 'from-green-400 to-emerald-500' :
                    job.matchScore >= 70 ? 'from-yellow-400 to-orange-500' :
                    'from-gray-400 to-gray-500'
                  } h-3 rounded-full transition-all duration-500`}
                  style={{ width: `${job.matchScore}%` }}
                ></div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {translations[language]?.description || 'Description'}
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {language === 'bn' ? job.description_bn : job.description_en}
              </p>
            </div>

            {/* Personalized AI Reason */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border-l-4 border-blue-500">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <span className="mr-2">🤖</span>
                  {translations[language]?.reason}
                </h3>
                <button
                  onClick={() => speakText(job.personalizedReason || (language === 'bn' ? job.reason_bn : job.reason_en))}
                  className="text-indigo-600 hover:text-indigo-700 text-sm"
                  title="Read aloud"
                >
                  🔊
                </button>
              </div>
              <p className="text-gray-700 leading-relaxed">
                {job.personalizedReason || typedReason}
                {isTyping && !job.personalizedReason && <span className="animate-pulse">|</span>}
              </p>
            </div>

            {/* Skills Analysis */}
            {job.skillsMatch && job.skillsMatch.length > 0 && (
              <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="mr-2">✅</span>
                  {language === 'bn' ? 'আপনার মিলে যাওয়া দক্ষতা' : 'Your Matching Skills'}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {job.skillsMatch.map((skill, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold flex items-center space-x-1"
                    >
                      <span>✓</span>
                      <span>{skill}</span>
                    </span>
                  ))}
                </div>
                <p className="text-sm text-green-700 mt-3">
                  {language === 'bn' 
                    ? `আপনার ${job.skillsMatch.length}টি দক্ষতা এই কাজের সাথে মিলে গেছে` 
                    : `${job.skillsMatch.length} of your skills match this job`}
                </p>
              </div>
            )}

            {/* Missing Skills - Learning Path */}
            {job.missingSkills && job.missingSkills.length > 0 && (
              <div className="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-500">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="mr-2">📚</span>
                  {language === 'bn' ? 'আপনার শিখতে হবে' : 'Skills to Learn'}
                </h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {job.missingSkills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-orange-700 mb-3">
                  {language === 'bn' 
                    ? `এই ${job.missingSkills.length}টি দক্ষতা শিখলে আপনার ম্যাচ স্কোর আরও বৃদ্ধি পাবে` 
                    : `Learning these ${job.missingSkills.length} skills will improve your match score`}
                </p>
                <button
                  onClick={() => {
                    const jobTitle = language === 'bn' ? job.title_bn : job.title_en
                    const skillToLearn = job.missingSkills && job.missingSkills.length > 0 
                      ? job.missingSkills[0] 
                      : jobTitle
                    // Navigate to assistant with the skill/title as initial message
                    navigate(`/assistant?message=${encodeURIComponent(skillToLearn)}`)
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all font-medium text-sm"
                >
                  {language === 'bn' ? '📚 শিখতে শুরু করুন' : '📚 Start Learning'}
                </button>
              </div>
            )}

            {/* Required Skills */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {translations[language]?.skillsRequired}
              </h3>
              <div className="flex flex-wrap gap-2">
                {job.skillsRequired.map((skill, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Earning Boost */}
            <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {translations[language]?.earningBoost}
                </span>
                <span className="text-2xl font-bold text-green-600">
                  +{job.earningBoost}
                </span>
              </div>
            </div>

            {/* Apply Button */}
            <button
              onClick={() => {
                alert(language === 'bn' ? 'আবেদন সফল হয়েছে!' : 'Application submitted successfully!')
                onClose()
              }}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-700 text-white py-4 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-800 transition-all transform hover:scale-[1.02] shadow-lg text-lg"
            >
              {translations[language]?.apply}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default JobDetailsModal

