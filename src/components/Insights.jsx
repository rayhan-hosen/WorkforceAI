import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import GrowthCard from './GrowthCard'
import EarningsChart from './EarningsChart'
import AISuggestions from './AISuggestions'

function Insights() {
  const navigate = useNavigate()
  const { language, toggleLanguage } = useLanguage()
  const [userData, setUserData] = useState(null)
  const [feedbackData, setFeedbackData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [showUpdateAnimation, setShowUpdateAnimation] = useState(false)

  useEffect(() => {
    const storedData = localStorage.getItem('userData')
    if (!storedData) {
      navigate('/register')
      return
    }
    setUserData(JSON.parse(storedData))

    // Load feedback data
    fetch('/feedbackData.json')
      .then(res => res.json())
      .then(data => {
        setFeedbackData(data)
        setLastUpdate(new Date())
        // Simulate AI analysis delay
        setTimeout(() => {
          setLoading(false)
        }, 2000)
      })
      .catch(err => {
        console.error('Error loading feedback data:', err)
        setLoading(false)
      })
  }, [navigate])

  // Simulate live updates every 30 seconds
  useEffect(() => {
    if (loading) return

    const interval = setInterval(() => {
      setShowUpdateAnimation(true)
      setTimeout(() => {
        setShowUpdateAnimation(false)
        setLastUpdate(new Date())
      }, 1500)
    }, 30000) // Every 30 seconds

    return () => clearInterval(interval)
  }, [loading])

  if (!userData || !feedbackData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-sky-100">
        <div className="text-gray-600 text-xl">Loading...</div>
      </div>
    )
  }

  const translations = feedbackData.translations
  const feedback = feedbackData.feedback

  const getTimeAgo = (date) => {
    if (!date) return ''
    const seconds = Math.floor((new Date() - date) / 1000)
    if (seconds < 60) {
      return `${seconds} ${translations[language]?.secondsAgo || 'seconds ago'}`
    }
    const minutes = Math.floor(seconds / 60)
    return `${minutes} ${translations[language]?.minutesAgo || 'minutes ago'}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-sky-100">
      {/* Header */}
     

      {/* Data Update Note */}
      <div className="max-w-7xl mx-auto px-6 mb-4">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-4 shadow-md">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 text-2xl">ℹ️</div>
            <div className="flex-1">
              <h4 className="font-semibold text-indigo-800 mb-1">
                {translations[language]?.dataNoteTitle || (language === 'bn' ? '📌 গুরুত্বপূর্ণ নোট' : '📌 Important Note')}
              </h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                {translations[language]?.dataNote || (language === 'bn' 
                  ? 'এই ডেটা আপনার পারফরম্যান্স এবং অনেক বাস্তব বিশ্বের পরিসংখ্যানের বিশ্লেষণের উপর ভিত্তি করে আপডেট হবে।'
                  : 'This data will update based on your performance and analysis of many real-world statistics.')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Update Animation */}
      {showUpdateAnimation && (
        <div className="max-w-7xl mx-auto px-6 mb-4">
          <div className="bg-indigo-100 border-2 border-indigo-300 rounded-lg p-3 text-center animate-pulse">
            <div className="flex items-center justify-center space-x-2 text-indigo-700 font-semibold">
              <span className="animate-spin">🔄</span>
              <span>{translations[language]?.updatingInsights}</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="mb-6">
              <div className="relative inline-block">
                <div className="w-20 h-20 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-8 h-8 text-indigo-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
              </div>
            </div>
            <p className="text-xl text-indigo-500 animate-pulse font-semibold">
              {translations[language]?.loading}
            </p>
          </div>
        )}

        {/* Content Grid */}
        {!loading && (
          <div className="space-y-6">
            {/* Growth and Earnings Row */}
            <div className="grid md:grid-cols-2 gap-6">
              <GrowthCard 
                data={feedback.skillRankChange} 
                translations={translations}
              />
              <EarningsChart 
                data={feedback.earningPrediction} 
                translations={translations}
              />
            </div>

            {/* Performance Metrics */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                {translations[language]?.performanceMetrics || 'Performance Metrics'}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">{feedback.performanceMetrics.completedCourses}</div>
                  <div className="text-xs text-gray-600 mt-1">{language === 'bn' ? 'সম্পন্ন কোর্স' : 'Completed Courses'}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{feedback.performanceMetrics.completedJobs}</div>
                  <div className="text-xs text-gray-600 mt-1">{language === 'bn' ? 'সম্পন্ন কাজ' : 'Completed Jobs'}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">⭐ {feedback.performanceMetrics.averageRating}</div>
                  <div className="text-xs text-gray-600 mt-1">{language === 'bn' ? 'গড় রেটিং' : 'Avg Rating'}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{feedback.performanceMetrics.skillCompletion}%</div>
                  <div className="text-xs text-gray-600 mt-1">{language === 'bn' ? 'দক্ষতা সম্পূর্ণ' : 'Skill Complete'}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{feedback.performanceMetrics.monthlyGrowth}</div>
                  <div className="text-xs text-gray-600 mt-1">{language === 'bn' ? 'মাসিক বৃদ্ধি' : 'Monthly Growth'}</div>
                </div>
              </div>
            </div>

            {/* AI Suggestions */}
            <AISuggestions 
              suggestions={feedback.aiSuggestions[language]} 
              translations={translations}
            />

            {/* Market Insights */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-6 border-2 border-blue-200">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <span className="mr-2">📈</span>
                {language === 'bn' ? 'বাজার অন্তর্দৃষ্টি' : 'Market Insights'}
              </h3>
              <div className="space-y-2">
                {feedback.marketInsights[language].map((insight, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg p-3 border-l-4 border-blue-500"
                  >
                    <p className="text-gray-700">{insight}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Insights

