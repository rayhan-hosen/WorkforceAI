import { useEffect, useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import ChatBubble from './ChatBubble'
import TypingIndicator from './TypingIndicator'
import { detectLanguage, getResponseType } from '../utils/LanguageDetector'

function Assistant() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { language: globalLanguage, toggleLanguage } = useLanguage()
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
    if (!storedData) {
      navigate('/register')
      return
    }
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
        // Add personalized greeting
        const greeting = getPersonalizedGreeting(parsedData, professionKey, savedProgress, storedAssessment, globalLanguage, data)
        const initialMessages = [{
          id: Date.now(),
          text: greeting,
          isAI: true,
          language: globalLanguage
        }]
        
        // Check if there's an initial message from URL params
        const initialMessage = searchParams.get('message')
        if (initialMessage) {
          // Add user message and trigger response
          const decodedMessage = decodeURIComponent(initialMessage)
          initialMessages.push({
            id: Date.now() + 1,
            text: decodedMessage,
            isAI: false,
            language: detectLanguage(decodedMessage)
          })
          setMessages(initialMessages)
          // Trigger response after a short delay
          setTimeout(() => {
            handleInitialMessage(decodedMessage, data, globalLanguage)
          }, 500)
        } else {
          setMessages(initialMessages)
        }
      })
      .catch(err => {
        console.error('Error loading assistant data:', err)
        // Set demo mode message
        const greeting = globalLanguage === 'bn' 
          ? 'হ্যালো! আমি আপনার ব্যক্তিগত AI সহায়ক।' 
          : 'Hello! I am your Personal AI Assistant.'
        setMessages([{
          id: Date.now(),
          text: greeting,
          isAI: true,
          language: globalLanguage
        }])
      })
  }, [navigate, globalLanguage, searchParams])

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
    const stats = getUserStats()
    const profession = (userData.profession || 'electrician').replace(/-/g, ' ')
    
    if (lang === 'bn') {
      if (stats && stats.completedModules > 0) {
        return `হ্যালো ${userData.name}! 👋 আপনার ${stats.completedModules}/${stats.totalModules}টি মডিউল সম্পন্ন হয়েছে (${stats.completionRate}%)। কীভাবে সাহায্য করতে পারি?`
      }
      return `হ্যালো ${userData.name}! 👋 আমি আপনার ব্যক্তিগত AI সহায়ক। ${profession} হিসেবে আপনার শেখার যাত্রায় সাহায্য করতে পারি। কী জানতে চান?`
    } else {
      if (stats && stats.completedModules > 0) {
        return `Hello ${userData.name}! 👋 You've completed ${stats.completedModules}/${stats.totalModules} modules (${stats.completionRate}%). How can I help you?`
      }
      return `Hello ${userData.name}! 👋 I'm your Personal AI Assistant. I can help you with your learning journey as a ${profession}. What would you like to know?`
    }
  }

  // Handle initial message from URL
  const handleInitialMessage = (message, data, lang) => {
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      const detectedLang = detectLanguage(message)
      const response = generateContextualResponse(message, detectedLang, data)
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: response,
        isAI: true,
        language: detectedLang
      }])
    }, 1500)
  }

  // Generate contextual response
  const generateContextualResponse = (userMessage, detectedLang, data = assistantData) => {
    const stats = getUserStats()
    const profession = userData?.profession?.replace(/-/g, ' ') || 'electrician'
    const rank = assessmentResult?.rank || 'Bronze'
    
    // Convert message to lowercase for matching
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

    // Use keyword-based response
    const responseType = getResponseType(userMessage, detectedLang, data?.keywords)
    const response = data?.responses[detectedLang]?.[responseType] || 
           data?.responses[detectedLang]?.default ||
           data?.responses.en?.default
    
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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])


  const handleSend = async (text = input) => {
    if (!text.trim() || !assistantData) return

    const userMessage = text.trim()
    setInput('')
    
    // Add user message
    const userMsg = {
      id: Date.now(),
      text: userMessage,
      isAI: false,
      language: detectLanguage(userMessage)
    }
    setMessages(prev => [...prev, userMsg])

    // Show typing indicator
    setIsTyping(true)

    // Simulate AI thinking delay
    setTimeout(() => {
      setIsTyping(false)

      // Detect language and generate contextual response
      const detectedLang = detectLanguage(userMessage)
      const response = generateContextualResponse(userMessage, detectedLang, assistantData)

      // Add AI response
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
    const stats = getUserStats()
    const profession = userData?.profession?.replace(/-/g, ' ') || 'electrician'
    
    const questions = {
      'progress': globalLanguage === 'bn' ? 'আমার অগ্রগতি কতটা?' : 'What is my progress?',
      'nextLevel': globalLanguage === 'bn' ? 'পরবর্তী লেভেল কী?' : 'What is my next level?',
      'earning': globalLanguage === 'bn' ? 'আমার আয় কত?' : 'What is my earning?',
      'currentLevel': globalLanguage === 'bn' ? 'আমার বর্তমান লেভেল কী?' : 'What is my current level?',
      'help': globalLanguage === 'bn' ? 'সাহায্য করুন' : 'Help me'
    }

    const question = questions[action]
    if (question) {
      handleSend(question)
    }
  }

  if (!userData || !assistantData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100">
        <div className="text-center">
          <div className="text-gray-600 text-xl mb-2">Loading assistant...</div>
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    )
  }

  const stats = getUserStats()

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 to-blue-100">
      {/* Header */}
      <div className="bg-white shadow-lg p-4 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-400 to-purple-500 flex items-center justify-center text-white text-2xl">
              🤖
            </div>
            <div>
              <h1 className="text-xl font-bold text-indigo-700">
                {globalLanguage === 'bn' ? 'ব্যক্তিগত AI সহায়ক' : 'Personal AI Assistant'}
              </h1>
              <p className="text-sm text-gray-600">
                {globalLanguage === 'bn' 
                  ? `${userData.name} • ${stats ? `${stats.completionRate}% সম্পন্ন` : 'শেখা শুরু করুন'}`
                  : `${userData.name} • ${stats ? `${stats.completionRate}% Complete` : 'Start Learning'}`}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/learning')}
              className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors font-medium text-sm"
            >
              {globalLanguage === 'bn' ? 'শেখা' : 'Learn'}
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
            >
              Dashboard
            </button>
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-medium text-sm"
            >
              <span>🌐</span>
              <span>{globalLanguage === 'bn' ? 'বাংলা' : 'English'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-4xl mx-auto w-full px-6 py-4">
        <div className="flex flex-wrap gap-2">
          {['progress', 'nextLevel', 'earning', 'currentLevel', 'help'].map(action => (
            <button
              key={action}
              onClick={() => handleQuickAction(action)}
              className="px-4 py-2 bg-white text-indigo-600 rounded-full text-sm font-semibold hover:bg-indigo-50 transition-colors shadow-sm border border-indigo-200"
            >
              {globalLanguage === 'bn' 
                ? {
                    'progress': '📊 অগ্রগতি',
                    'nextLevel': '➡️ পরবর্তী লেভেল',
                    'earning': '💰 আয়',
                    'currentLevel': '📚 বর্তমান লেভেল',
                    'help': '❓ সাহায্য'
                  }[action]
                : {
                    'progress': '📊 Progress',
                    'nextLevel': '➡️ Next Level',
                    'earning': '💰 Earning',
                    'currentLevel': '📚 Current Level',
                    'help': '❓ Help'
                  }[action]}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 overflow-y-auto mb-4 px-6">
        <div className="max-w-4xl mx-auto py-4">
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
      </div>

      {/* Input Box */}
      <div className="bg-white shadow-lg p-4 sticky bottom-0 z-40">
        <div className="max-w-4xl mx-auto flex gap-2">
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
            placeholder={globalLanguage === 'bn' ? 'আপনার প্রশ্ন টাইপ করুন...' : 'Type your question...'}
            className="flex-1 p-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim()}
            className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              input.trim()
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  )
}

export default Assistant
