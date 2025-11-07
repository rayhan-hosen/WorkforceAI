import { useEffect, useState, useRef } from 'react'
import { useLanguage } from '../context/LanguageContext'
import ChatBubble from './ChatBubble'
import TypingIndicator from './TypingIndicator'
import { detectLanguage, getResponseType } from '../utils/LanguageDetector'

function FloatingChatBox() {
  const { language: globalLanguage } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(true)
  const [userData, setUserData] = useState(null)
  const [assistantData, setAssistantData] = useState(null)
  const [learningProgress, setLearningProgress] = useState(null)
  const [assessmentResult, setAssessmentResult] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  // Load user data and progress
  useEffect(() => {
    const storedData = localStorage.getItem('userData')
    if (!storedData) return
    
    const parsedData = JSON.parse(storedData)
    setUserData(parsedData)

    // Load learning progress
    const professionKey = (parsedData.profession || 'electrician').toLowerCase().replace(/\s+/g, '-')
    const savedProgressKey = `learningProgress_${professionKey}`
    const savedProgress = localStorage.getItem(savedProgressKey)
    if (savedProgress) {
      setLearningProgress(JSON.parse(savedProgress))
    }

    // Load assessment result
    const storedAssessment = localStorage.getItem('assessmentResult')
    if (storedAssessment) {
      setAssessmentResult(JSON.parse(storedAssessment))
    }

    // Load assistant data
    fetch('/assistantData.json')
      .then(res => res.json())
      .then(data => {
        setAssistantData(data)
        // Load progress after state is set
        setTimeout(() => {
          const greeting = getPersonalizedGreeting(parsedData, professionKey, savedProgress, storedAssessment, globalLanguage, data)
          setMessages([{
            id: Date.now(),
            text: greeting,
            isAI: true,
            language: globalLanguage
          }])
        }, 100)
      })
      .catch(err => {
        console.error('Error loading assistant data:', err)
      })
  }, [globalLanguage])

  // Calculate user statistics
  const getUserStats = () => {
    if (!learningProgress || !learningProgress.levels) return null

    const levels = learningProgress.levels
    const totalLevels = levels.length
    const completedLevels = levels.filter(l => l.completed).length
    const totalModules = levels.reduce((sum, level) => sum + (level.modules?.length || 0), 0)
    const completedModules = levels.reduce((sum, level) => 
      sum + (level.modules?.filter(m => m.completed).length || 0), 0
    )
    const currentLevel = levels.find(l => l.unlocked && !l.completed) || levels[0]
    const nextLevel = levels.find(l => !l.unlocked)

    return {
      totalLevels,
      completedLevels,
      totalModules,
      completedModules,
      completionRate: totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0,
      currentLevel,
      nextLevel
    }
  }

  // Get personalized greeting
  const getPersonalizedGreeting = (userData, professionKey, savedProgress, storedAssessment, lang, assistantData) => {
    // Try to get stats, but don't rely on state yet
    let stats = null
    if (savedProgress) {
      try {
        const progress = JSON.parse(savedProgress)
        if (progress.levels) {
          const levels = progress.levels
          const totalModules = levels.reduce((sum, level) => sum + (level.modules?.length || 0), 0)
          const completedModules = levels.reduce((sum, level) => 
            sum + (level.modules?.filter(m => m.completed).length || 0), 0
          )
          stats = {
            totalModules,
            completedModules,
            completionRate: totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0
          }
        }
      } catch (e) {
        console.error('Error parsing progress:', e)
      }
    }
    
    const profession = (userData.profession || 'electrician').replace(/-/g, ' ')
    
    if (lang === 'bn') {
      if (stats && stats.completedModules > 0) {
        return `হ্যালো ${userData.name}! 👋 আপনার ${stats.completedModules}/${stats.totalModules}টি মডিউল সম্পন্ন হয়েছে (${stats.completionRate}%)। কীভাবে সাহায্য করতে পারি?`
      }
      return `হ্যালো ${userData.name}! 👋 আমি আপনার ব্যক্তিগত AI সহায়ক। ${profession} হিসেবে আপনার শেখার যাত্রায় সাহায্য করতে পারি।`
    } else {
      if (stats && stats.completedModules > 0) {
        return `Hello ${userData.name}! 👋 You've completed ${stats.completedModules}/${stats.totalModules} modules (${stats.completionRate}%). How can I help?`
      }
      return `Hello ${userData.name}! 👋 I'm your Personal AI Assistant. I can help you with your learning journey as a ${profession}.`
    }
  }

  // Generate contextual response
  const generateContextualResponse = (userMessage, detectedLang) => {
    const stats = getUserStats()
    const profession = userData?.profession?.replace(/-/g, ' ') || 'electrician'
    const rank = assessmentResult?.rank || 'Bronze'
    
    const lowerMessage = userMessage.toLowerCase()
    
    // Check for specific contextual queries first (these always have responses)
    if (lowerMessage.includes('progress') || lowerMessage.includes('অগ্রগতি') || lowerMessage.includes('কতটা')) {
      if (stats) {
        return detectedLang === 'bn'
          ? `আপনার অগ্রগতি: ${stats.completedLevels}/${stats.totalLevels} লেভেল সম্পন্ন, ${stats.completedModules}/${stats.totalModules} মডিউল সম্পন্ন (${stats.completionRate}%)। ${stats.currentLevel ? `বর্তমান লেভেল: ${stats.currentLevel.name_bn}` : ''}`
          : `Your Progress: ${stats.completedLevels}/${stats.totalLevels} levels completed, ${stats.completedModules}/${stats.totalModules} modules completed (${stats.completionRate}%). ${stats.currentLevel ? `Current Level: ${stats.currentLevel.name_en}` : ''}`
      }
    }

    if (lowerMessage.includes('next') || lowerMessage.includes('পরবর্তী') || lowerMessage.includes('কোর্স')) {
      if (stats && stats.nextLevel) {
        return detectedLang === 'bn'
          ? `আপনার পরবর্তী লেভেল: "${stats.nextLevel.name_bn}"। এটি সম্পন্ন করতে আপনার বর্তমান লেভেল শেষ করুন।`
          : `Your next level: "${stats.nextLevel.name_en}". Complete your current level to unlock it.`
      } else if (stats && stats.currentLevel) {
        return detectedLang === 'bn'
          ? `আপনার বর্তমান লেভেল: "${stats.currentLevel.name_bn}"। এটি সম্পন্ন করুন!`
          : `Your current level: "${stats.currentLevel.name_en}". Complete it!`
      }
    }

    if (lowerMessage.includes('earning') || lowerMessage.includes('আয়') || lowerMessage.includes('বেতন')) {
      const baseEarnings = {
        'Bronze': 12000,
        'Silver': 18500,
        'Gold': 28000,
        'Platinum': 40000
      }
      const currentEarning = baseEarnings[rank] || 12000
      const boost = assessmentResult?.predictedEarningBoost || '15%'
      
      return detectedLang === 'bn'
        ? `আপনার বর্তমান র্যাঙ্ক: ${rank}। গড় মাসিক আয়: ৳${currentEarning.toLocaleString()}। পরবর্তী কোর্স সম্পন্ন করলে ${boost} বৃদ্ধি হতে পারে।`
        : `Your current rank: ${rank}. Average monthly earning: BDT ${currentEarning.toLocaleString()}. Completing next courses can increase by ${boost}.`
    }

    if (lowerMessage.includes('level') || lowerMessage.includes('লেভেল') || lowerMessage.includes('মডিউল')) {
      if (stats && stats.currentLevel) {
        const completedInLevel = stats.currentLevel.modules?.filter(m => m.completed).length || 0
        const totalInLevel = stats.currentLevel.modules?.length || 0
        return detectedLang === 'bn'
          ? `বর্তমান লেভেল: "${stats.currentLevel.name_bn}" - ${completedInLevel}/${totalInLevel} মডিউল সম্পন্ন।`
          : `Current Level: "${stats.currentLevel.name_en}" - ${completedInLevel}/${totalInLevel} modules completed.`
      }
    }

    if (lowerMessage.includes('rank') || lowerMessage.includes('র্যাঙ্ক') || lowerMessage.includes('স্ট্যাটাস')) {
      return detectedLang === 'bn'
        ? `আপনার বর্তমান দক্ষতা র্যাঙ্ক: ${rank}। আরও শিখে Gold বা Platinum র্যাঙ্ক অর্জন করুন!`
        : `Your current skill rank: ${rank}. Keep learning to reach Gold or Platinum rank!`
    }

    const responseType = getResponseType(userMessage, detectedLang, assistantData?.keywords)
    const response = assistantData?.responses[detectedLang]?.[responseType] || 
           assistantData?.responses[detectedLang]?.default ||
           assistantData?.responses.en?.default
    
    // If no response found, return demo mode message
    if (!response) {
      return detectedLang === 'bn'
        ? 'আমাদের AI মডেলটি বর্তমানে আপডেট করা হয়নি, আমরা ডেমো মোডে কাজ করছি। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।'
        : 'Our AI model is not currently updated, we are working in demo mode. Please try again later.'
    }
    
    return response
  }

  // Auto-scroll to bottom
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isTyping, isOpen, isMinimized])


  const handleSend = async (text = input) => {
    if (!text.trim() || !assistantData) return

    const userMessage = text.trim()
    setInput('')
    
    const userMsg = {
      id: Date.now(),
      text: userMessage,
      isAI: false,
      language: detectLanguage(userMessage)
    }
    setMessages(prev => [...prev, userMsg])
    setIsTyping(true)

    setTimeout(() => {
      setIsTyping(false)
      const detectedLang = detectLanguage(userMessage)
      const response = generateContextualResponse(userMessage, detectedLang)

      const aiMsg = {
        id: Date.now() + 1,
        text: response,
        isAI: true,
        language: detectedLang
      }
      setMessages(prev => [...prev, aiMsg])
    }, 1500)
  }

  const handleQuickAction = (action) => {
    const questions = {
      'progress': globalLanguage === 'bn' ? 'আমার অগ্রগতি কতটা?' : 'What is my progress?',
      'nextLevel': globalLanguage === 'bn' ? 'পরবর্তী লেভেল কী?' : 'What is my next level?',
      'earning': globalLanguage === 'bn' ? 'আমার আয় কত?' : 'What is my earning?',
      'help': globalLanguage === 'bn' ? 'সাহায্য করুন' : 'Help me'
    }

    const question = questions[action]
    if (question) {
      handleSend(question)
    }
  }

  if (!userData || !assistantData) {
    return null
  }

  const stats = getUserStats()

  return (
    <>
      {/* Chat Button - Always Visible */}
      <button
        onClick={() => {
          setIsOpen(true)
          setIsMinimized(false)
        }}
        className={`fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-2xl hover:shadow-3xl transition-all transform hover:scale-110 flex items-center justify-center text-2xl ${
          isOpen ? 'hidden' : 'flex'
        }`}
        title={globalLanguage === 'bn' ? 'ব্যক্তিগত AI সহায়ক' : 'Personal AI Assistant'}
      >
        🤖
      </button>

      {/* Chat Box - Floating */}
      {isOpen && (
        <div className={`fixed bottom-6 right-6 z-50 w-96 bg-white rounded-2xl shadow-2xl transition-all duration-300 ${
          isMinimized ? 'h-16' : 'h-[600px]'
        } flex flex-col`}>
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl">
                🤖
              </div>
              <div>
                <h3 className="font-bold">{globalLanguage === 'bn' ? 'ব্যক্তিগত AI সহায়ক' : 'Personal AI Assistant'}</h3>
                {stats && (
                  <p className="text-xs text-white/80">
                    {stats.completionRate}% {globalLanguage === 'bn' ? 'সম্পন্ন' : 'Complete'}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                title={isMinimized ? (globalLanguage === 'bn' ? 'বড় করুন' : 'Expand') : (globalLanguage === 'bn' ? 'ছোট করুন' : 'Minimize')}
              >
                {isMinimized ? '⬆️' : '⬇️'}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                title={globalLanguage === 'bn' ? 'বন্ধ করুন' : 'Close'}
              >
                ✕
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Quick Actions */}
              <div className="p-3 bg-gray-50 border-b border-gray-200 flex flex-wrap gap-2">
                {['progress', 'nextLevel', 'earning', 'help'].map(action => (
                  <button
                    key={action}
                    onClick={() => handleQuickAction(action)}
                    className="px-3 py-1 bg-white text-indigo-600 rounded-full text-xs font-semibold hover:bg-indigo-50 transition-colors border border-indigo-200"
                  >
                    {globalLanguage === 'bn' 
                      ? {
                          'progress': '📊 অগ্রগতি',
                          'nextLevel': '➡️ পরবর্তী',
                          'earning': '💰 আয়',
                          'help': '❓ সাহায্য'
                        }[action]
                      : {
                          'progress': '📊 Progress',
                          'nextLevel': '➡️ Next',
                          'earning': '💰 Earning',
                          'help': '❓ Help'
                        }[action]}
                  </button>
                ))}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((message) => (
                  <ChatBubble
                    key={message.id}
                    message={message.text}
                    isAI={message.isAI}
                  />
                ))}
                {isTyping && <TypingIndicator />}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 bg-white border-t border-gray-200 rounded-b-2xl">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSend()
                      }
                    }}
                    placeholder={globalLanguage === 'bn' ? 'মেসেজ...' : 'Message...'}
                    className="flex-1 p-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                  <button
                    onClick={() => handleSend()}
                    disabled={!input.trim()}
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      input.trim()
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    ➤
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}

export default FloatingChatBox

