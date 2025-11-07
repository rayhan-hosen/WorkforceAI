import { useState, useEffect } from 'react'
import { useLanguage } from '../context/LanguageContext'

function AISuggestions({ suggestions, translations }) {
  const { language } = useLanguage()
  const [displayedSuggestions, setDisplayedSuggestions] = useState([])
  const [isTyping, setIsTyping] = useState(true)

  useEffect(() => {
    setDisplayedSuggestions([])
    setIsTyping(true)

    let suggestionIndex = 0
    let charIndex = 0
    const displayed = []

    const typingInterval = setInterval(() => {
      if (suggestionIndex >= suggestions.length) {
        setIsTyping(false)
        clearInterval(typingInterval)
        return
      }

      const currentSuggestion = suggestions[suggestionIndex]
      if (charIndex < currentSuggestion.length) {
        displayed[suggestionIndex] = currentSuggestion.slice(0, charIndex + 1)
        setDisplayedSuggestions([...displayed])
        charIndex++
      } else {
        // Move to next suggestion
        suggestionIndex++
        charIndex = 0
        if (suggestionIndex >= suggestions.length) {
          setIsTyping(false)
          clearInterval(typingInterval)
        }
      }
    }, 30) // 30ms per character

    return () => clearInterval(typingInterval)
  }, [suggestions, language])

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-blue-100 rounded-2xl shadow-lg p-6 border-2 border-indigo-200">
      <div className="flex items-center space-x-2 mb-4">
        <span className="text-2xl">🤖</span>
        <h3 className="text-xl font-semibold text-gray-800">
          {translations[language]?.aiSuggestions}
        </h3>
      </div>

      {isTyping && displayedSuggestions.length === 0 && (
        <div className="flex items-center space-x-2 text-indigo-600 mb-4">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          <span className="text-sm font-semibold">{translations[language]?.aiAnalyzing}</span>
        </div>
      )}

      <div className="space-y-3">
        {suggestions.map((suggestion, index) => {
          const displayText = displayedSuggestions[index] || ''
          const isCurrentSuggestion = index === displayedSuggestions.length - 1
          const isTypingThis = isTyping && isCurrentSuggestion && displayText.length < suggestion.length

          // Only show suggestions that have started typing
          if (!displayText && index > 0) return null

          return (
            <div
              key={index}
              className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-indigo-500"
            >
              <div className="flex items-start space-x-3">
                <span className="text-indigo-600 font-bold">#{index + 1}</span>
                <p className="text-gray-700 leading-relaxed flex-1">
                  {displayText}
                  {isTypingThis && <span className="animate-pulse">|</span>}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default AISuggestions

