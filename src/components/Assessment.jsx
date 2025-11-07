import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'

function Assessment() {
  const navigate = useNavigate()
  const { language } = useLanguage()
  const [assessmentData, setAssessmentData] = useState(null)
  const [answers, setAnswers] = useState({})
  const [showResults, setShowResults] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userData, setUserData] = useState(null)
  const [timeRemaining, setTimeRemaining] = useState(1800) // 30 minutes in seconds
  const [loadingError, setLoadingError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    console.log('=== ASSESSMENT MOUNTED ===')
    
    // Get user data from localStorage
    const storedData = localStorage.getItem('userData')
    if (!storedData) {
      console.log('No userData, redirecting to register')
      navigate('/register')
      return
    }

    // Check if assessment is already completed
    const storedAssessment = localStorage.getItem('assessmentResult')
    if (storedAssessment) {
      try {
        const assessmentResult = JSON.parse(storedAssessment)
        // If assessment has been completed (has completedAt timestamp), redirect to dashboard
        if (assessmentResult.completedAt) {
          console.log('Assessment already completed, redirecting to dashboard')
          navigate('/dashboard')
          return
        }
      } catch (error) {
        console.error('Error parsing assessment result:', error)
        // Continue with assessment if parsing fails
      }
    }

    const parsedData = JSON.parse(storedData)
    console.log('User data loaded:', parsedData)
    setUserData(parsedData)

    // Load assessment data
    console.log('Fetching assessmentData.json...')
    fetch('/assessmentData.json')
      .then(res => {
        console.log('Response status:', res.status)
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        return res.json()
      })
      .then(data => {
        console.log('✅ Assessment data loaded:', data)
        
        // Normalize profession key
        const userProfession = parsedData.profession || 'electrician'
        const professionKey = userProfession.toLowerCase().replace(/\s+/g, '-')
        
        console.log('Looking for profession:', professionKey)
        console.log('Available professions:', Object.keys(data.professions || {}))
        
        let selectedData = null
        
        if (data.professions && data.professions[professionKey]) {
          selectedData = data.professions[professionKey]
          console.log('✅ Found data for profession:', professionKey)
        } else if (data.professions && data.professions.electrician) {
          selectedData = data.professions.electrician
          console.log('⚠️ Using fallback: electrician')
        } else {
          throw new Error(`No assessment data found. Available: ${Object.keys(data.professions || {}).join(', ')}`)
        }
        
        console.log('Selected assessment data:', selectedData)
        console.log('Questions in data:', selectedData?.questions)
        console.log('Questions count:', selectedData?.questions?.length)
        
        setAssessmentData(selectedData)
        setIsLoading(false)
      })
      .catch(err => {
        console.error('❌ Error loading assessment data:', err)
        setLoadingError(err.message || 'Failed to load assessment data')
        setIsLoading(false)
      })
  }, [navigate])

  const handleAnswer = (questionId, answer) => {
    setAnswers({ ...answers, [questionId]: answer })
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleSubmit = useCallback(() => {
    if (isSubmitting || !assessmentData) return

    const totalQuestions = assessmentData.questions?.length || 0
    const answeredQuestions = Object.keys(answers).length

    if (answeredQuestions < totalQuestions) {
      const confirmMessage = language === 'bn' 
        ? `আপনি ${totalQuestions - answeredQuestions}টি প্রশ্নের উত্তর দেননি। আপনি কি এখনই জমা দিতে চান?`
        : `You haven't answered ${totalQuestions - answeredQuestions} questions. Do you want to submit now?`
      
      if (!window.confirm(confirmMessage)) {
        return
      }
    }

    setIsSubmitting(true)
    setIsAnalyzing(true)

    setTimeout(() => {
      setIsAnalyzing(false)
      setIsSubmitting(false)
      setShowResults(true)
    }, 2000)
  }, [isSubmitting, assessmentData, answers, language])

  // Timer countdown
  useEffect(() => {
    if (!showResults && !isAnalyzing && assessmentData && !isLoading) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleSubmit()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [showResults, isAnalyzing, assessmentData, isLoading, handleSubmit])

  // Save assessment result to localStorage when results are shown
  useEffect(() => {
    if (showResults && assessmentData?.aiResult) {
      const result = assessmentData.aiResult
      localStorage.setItem('assessmentResult', JSON.stringify({
        rank: result.rank,
        predictedEarningBoost: result.predictedEarningBoost,
        completedAt: new Date().toISOString()
      }))
    }
  }, [showResults, assessmentData])

  const getRankColor = (rank) => {
    switch (rank) {
      case 'Bronze':
        return 'text-amber-700'
      case 'Silver':
        return 'text-gray-400'
      case 'Gold':
        return 'text-yellow-500'
      case 'Platinum':
        return 'text-blue-400'
      default:
        return 'text-gray-600'
    }
  }

  const translations = {
    bn: {
      title: "স্কিল অ্যাসেসমেন্ট",
      subtitle: "আপনার দক্ষতা মূল্যায়ন করুন",
      question: "প্রশ্ন",
      of: "এর",
      timeRemaining: "সময় বাকি",
      submit: "জমা দিন",
      reviewing: "পর্যালোচনা করছেন",
      analyzing: "AI বিশ্লেষণ করছে...",
      analyzingDesc: "আপনার দক্ষতা মূল্যায়ন এবং ব্যক্তিগতকৃত সুপারিশ তৈরি করা হচ্ছে",
      complete: "অ্যাসেসমেন্ট সম্পন্ন!",
      resultDesc: "এখানে আপনার AI-চালিত দক্ষতা বিশ্লেষণ",
      primaryRank: "প্রাথমিক দক্ষতা র্যাঙ্ক",
      currentLevel: "আপনার বর্তমান দক্ষতা স্তরের মূল্যায়ন",
      suggestedPath: "প্রস্তাবিত কোর্স পথ",
      predictedIncrease: "আয় বৃদ্ধির পূর্বাভাস",
      expectedIncrease: "প্রস্তাবিত কোর্স সম্পন্ন করার পর প্রত্যাশিত বৃদ্ধি",
      continue: "ড্যাশবোর্ডে যান",
      unanswered: "উত্তরহীন",
      answered: "উত্তর দেওয়া হয়েছে"
    },
    en: {
      title: "Skill Assessment",
      subtitle: "Evaluate Your Skills",
      question: "Question",
      of: "of",
      timeRemaining: "Time Remaining",
      submit: "Submit Assessment",
      reviewing: "Reviewing",
      analyzing: "AI is analyzing...",
      analyzingDesc: "Evaluating your skills and crafting personalized recommendations",
      complete: "Assessment Complete!",
      resultDesc: "Here's your AI-powered skill analysis",
      primaryRank: "PRIMARY SKILL RANK",
      currentLevel: "Your current skill level assessment",
      suggestedPath: "Suggested Course Path",
      predictedIncrease: "Predicted Earning Increase",
      expectedIncrease: "Expected increase after completing recommended courses",
      continue: "Continue to Dashboard",
      unanswered: "Unanswered",
      answered: "Answered"
    }
  }

  const t = translations[language]

  // Loading states
  if (!userData || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="text-gray-600 text-xl mb-2">
            {!userData ? 'Loading user data...' : 'Loading assessment questions...'}
          </div>
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    )
  }

  if (loadingError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
        <div className="text-center max-w-md">
          <div className="text-red-600 text-xl mb-4">⚠️ Error Loading Assessment</div>
          <div className="text-gray-700 mb-4">{loadingError}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all"
          >
            Reload Page
          </button>
        </div>
      </div>
    )
  }

  if (!assessmentData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="text-gray-600 text-xl mb-2">No assessment data available</div>
        </div>
      </div>
    )
  }

  if (isAnalyzing) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="shadow-xl rounded-2xl p-8 bg-white max-w-md w-full text-center">
          <div className="mb-6">
            <div className="relative inline-block">
              <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-8 h-8 text-purple-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{t.analyzing}</h2>
          <p className="text-gray-600">{t.analyzingDesc}</p>
        </div>
      </div>
    )
  }

  if (showResults) {
    const result = assessmentData.aiResult
    const recommendedCourses = language === 'bn' 
      ? result.recommendedCourses_bn 
      : result.recommendedCourses_en

    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="shadow-xl rounded-2xl p-8 bg-white max-w-2xl w-full">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">{t.complete}</h2>
            <p className="text-gray-600">{t.resultDesc}</p>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-gray-600 mb-2">{t.primaryRank}</h3>
              <div className={`text-5xl font-bold ${getRankColor(result.rank)} mb-2`}>
                {result.rank}
              </div>
              <p className="text-gray-600">{t.currentLevel}</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">{t.suggestedPath}</h3>
              <div className="space-y-2">
                {recommendedCourses.map((course, index) => (
                  <div key={index} className="flex items-center space-x-3 bg-white p-3 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-semibold">
                      {index + 1}
                    </div>
                    <span className="text-gray-800">{course}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{t.predictedIncrease}</h3>
              <div className="text-4xl font-bold text-green-600 mb-2">
                {result.predictedEarningBoost}
              </div>
              <p className="text-gray-600">{t.expectedIncrease}</p>
            </div>

            <button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white py-4 rounded-lg font-semibold hover:from-purple-700 hover:to-purple-900 transition-all transform hover:scale-[1.02] shadow-lg text-lg"
            >
              {t.continue}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Validate questions exist
  const questions = assessmentData.questions || []
  const totalQuestions = questions.length
  const answeredCount = Object.keys(answers).length
  const unansweredCount = totalQuestions - answeredCount

  console.log('=== RENDERING QUESTIONS ===')
  console.log('Total questions:', totalQuestions)
  console.log('Questions array:', questions)

  if (totalQuestions === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
        <div className="text-center max-w-md">
          <div className="text-red-600 text-xl mb-4">⚠️ No Questions Found</div>
          <div className="text-gray-700 mb-4">
            The assessment data doesn't contain any questions.
          </div>
          <div className="text-sm text-gray-500 mb-4 max-h-60 overflow-auto">
            <pre className="bg-gray-100 p-2 rounded text-left text-xs">
              {JSON.stringify(assessmentData, null, 2)}
            </pre>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all"
          >
            Reload Page
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-1">{t.title}</h1>
              <p className="text-gray-600">{t.subtitle}</p>
            </div>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              {/* Timer */}
              <div className="bg-red-50 border-2 border-red-200 rounded-lg px-4 py-2">
                <div className="text-xs text-red-600 font-semibold mb-1">{t.timeRemaining}</div>
                <div className="text-xl font-bold text-red-700">{formatTime(timeRemaining)}</div>
              </div>
              {/* Progress */}
              <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg px-4 py-2">
                <div className="text-xs text-indigo-600 font-semibold mb-1">
                  {t.question} {answeredCount}/{totalQuestions}
                </div>
                <div className="text-sm text-indigo-700">
                  {answeredCount === totalQuestions ? t.answered : `${unansweredCount} ${t.unanswered}`}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Questions - Single Page */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="space-y-8">
            {questions.map((question, index) => {
              const questionId = question.id || index
              const selectedAnswer = answers[questionId]
              const questionText = language === 'bn' ? question.q_bn : question.q_en
              const options = language === 'bn' ? question.options_bn : question.options_en

              if (!options || !Array.isArray(options) || options.length === 0) {
                return (
                  <div key={questionId} className="border-2 border-red-300 bg-red-50 p-4 rounded-lg">
                    <div className="text-red-600 font-bold">Error: Question {index + 1} has invalid options</div>
                  </div>
                )
              }

              return (
                <div key={questionId} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-gray-800 mb-4">{questionText}</h2>
                      <div className="space-y-3">
                        {options.map((option, optIndex) => (
                          <button
                            key={optIndex}
                            onClick={() => handleAnswer(questionId, option)}
                            className={`w-full text-left px-6 py-4 rounded-lg border-2 transition-all ${
                              selectedAnswer === option
                                ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-md'
                                : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 text-gray-700'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                selectedAnswer === option
                                  ? 'border-indigo-600 bg-indigo-600'
                                  : 'border-gray-300'
                              }`}>
                                {selectedAnswer === option && (
                                  <div className="w-2 h-2 bg-white rounded-full"></div>
                                )}
                              </div>
                              <span className="font-medium">{option}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Submit Button */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-600">
              {language === 'bn' 
                ? `মোট ${totalQuestions}টি প্রশ্নের মধ্যে ${answeredCount}টি উত্তর দেওয়া হয়েছে`
                : `Answered ${answeredCount} out of ${totalQuestions} questions`}
            </div>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`px-8 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 shadow-lg ${
                isSubmitting
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700'
              }`}
            >
              {isSubmitting ? t.reviewing : t.submit}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Assessment
