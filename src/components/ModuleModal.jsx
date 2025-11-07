import { useState, useEffect } from 'react'
import { useLanguage } from '../context/LanguageContext'

function ModuleModal({ module, level, onClose, onComplete, translations }) {
  const { language } = useLanguage()
  const [quizData, setQuizData] = useState(null)
  const [showQuiz, setShowQuiz] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  // Function to get demo image URL - uses local image or placeholder
  const getDemoImageUrl = () => {
    // Try to use a local demo image first, fallback to placeholder service
    // You can add demo images to /public/images/learning/ folder
    const moduleId = module?.id || 101
    // Try local image first
    return `/compressed_image.jpeg`
  }

  useEffect(() => {
    // Load quiz data for this module
    fetch('/quizData.json')
      .then(res => res.json())
      .then(data => {
        const quiz = data.quizzes[module.id.toString()]
        if (quiz) {
          setQuizData(quiz)
        }
      })
      .catch(err => console.error('Error loading quiz:', err))
  }, [module.id])

  const handleStartQuiz = () => {
    setShowQuiz(true)
  }

  const handleSubmit = () => {
    if (selectedAnswer === null) return
    
    setIsAnalyzing(true)
    
    // Simulate AI analysis
    setTimeout(() => {
      const correct = selectedAnswer === quizData.correct
      setIsCorrect(correct)
      setIsAnalyzing(false)
      setShowResult(true)

      // If correct, mark as completed after a moment
      if (correct) {
        setTimeout(() => {
          onComplete(module.id)
          setTimeout(() => onClose(), 1000)
        }, 2000)
      }
    }, 2000)
  }

  if (!module) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-purple-800 text-white p-6 rounded-t-2xl z-50 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">
                {language === 'bn' ? module.title_bn : module.title_en}
              </h2>
              <p className="text-purple-100 text-sm">
                {language === 'bn' ? level.name_bn : level.name_en}
              </p>
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
        <div className="p-6">
          {!showQuiz && !showResult && (
            <>
              {/* Lesson Image */}
              <div className="mb-6 relative z-0">
                <div className="relative w-full h-64 bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 rounded-lg overflow-hidden shadow-md">
                  {module.image ? (
                    <img
                      src={module.image}
                      alt={language === 'bn' ? module.title_bn : module.title_en}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to demo image if provided image fails to load
                        e.target.onerror = null
                        e.target.src = getDemoImageUrl()
                      }}
                    />
                  ) : (
                    <div className="w-full h-full relative">
                      <img
                        src={getDemoImageUrl()}
                        alt="Demo"
                        className="w-full h-full object-cover opacity-90"
                        onError={(e) => {
                          // If demo image also fails, show SVG placeholder
                          e.target.style.display = 'none'
                          const placeholder = e.target.nextElementSibling
                          if (placeholder) {
                            placeholder.style.display = 'flex'
                          }
                        }}
                      />
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-purple-200 via-pink-100 to-blue-200" style={{ display: 'none' }}>
                        <svg className="w-24 h-24 text-purple-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-purple-600 font-semibold text-lg">
                          {language === 'bn' ? 'ডেমো ছবি' : 'Demo Image'}
                        </p>
                        <p className="text-purple-500 text-sm mt-1 text-center px-4">
                          {language === 'bn' ? module.title_bn : module.title_en}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Lesson Content */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  {translations[language]?.lesson || 'Lesson'}
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 text-gray-700 whitespace-pre-line">
                  {language === 'bn' ? module.lesson_bn : module.lesson_en}
                </div>
              </div>

              {/* Start Quiz Button */}
              <button
                onClick={handleStartQuiz}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-purple-900 transition-all transform hover:scale-[1.02] shadow-lg"
              >
                {translations[language]?.startQuiz}
              </button>
            </>
          )}

          {showQuiz && !isAnalyzing && !showResult && quizData && (
            <>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  {translations[language]?.quiz || 'Quiz'}
                </h3>
                <p className="text-xl font-medium text-gray-700 mb-6">
                  {language === 'bn' ? quizData.question_bn : quizData.question_en}
                </p>
                <div className="space-y-3">
                  {(language === 'bn' ? quizData.options_bn : quizData.options_en).map((option, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedAnswer(index)}
                      className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                        selectedAnswer === index
                          ? 'border-purple-600 bg-purple-50 text-purple-900'
                          : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          selectedAnswer === index
                            ? 'border-purple-600 bg-purple-600'
                            : 'border-gray-300'
                        }`}>
                          {selectedAnswer === index && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <span>{option}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={handleSubmit}
                disabled={selectedAnswer === null}
                className={`w-full py-3 rounded-lg font-semibold transition-all transform hover:scale-[1.02] shadow-lg ${
                  selectedAnswer === null
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-purple-800 text-white hover:from-purple-700 hover:to-purple-900'
                }`}
              >
                Submit Answer
              </button>
            </>
          )}

          {isAnalyzing && (
            <div className="text-center py-12">
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
              <h3 className="text-2xl font-bold text-gray-800 mb-2">AI is analyzing...</h3>
              <p className="text-gray-600">Evaluating your answer</p>
            </div>
          )}

          {showResult && (
            <div className="text-center py-12">
              {isCorrect ? (
                <>
                  <div className="text-6xl mb-4 animate-bounce">🎉</div>
                  <h3 className="text-3xl font-bold text-green-600 mb-2">
                    {translations[language]?.congratulations}
                  </h3>
                  <p className="text-xl text-gray-700 mb-4">Correct Answer!</p>
                  <p className="text-gray-600">Module completed successfully!</p>
                </>
              ) : (
                <>
                  <div className="text-6xl mb-4">❌</div>
                  <h3 className="text-3xl font-bold text-red-600 mb-2">Incorrect</h3>
                  <p className="text-gray-700 mb-4">Please try again</p>
                  <button
                    onClick={() => {
                      setShowResult(false)
                      setSelectedAnswer(null)
                    }}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Try Again
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ModuleModal

