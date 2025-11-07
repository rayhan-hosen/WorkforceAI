import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import SkillGraph from './SkillGraph'
import EarningsCard from './EarningsCard'
import ProgressCard from './ProgressCard'
import NextSkills from './NextSkills'

function Dashboard() {
  const navigate = useNavigate()
  const { language, toggleLanguage } = useLanguage()
  const [userData, setUserData] = useState(null)
  const [learningData, setLearningData] = useState(null)
  const [levels, setLevels] = useState([])
  const [loading, setLoading] = useState(true)
  const [assessmentResult, setAssessmentResult] = useState(null)
  const [showWorkflow, setShowWorkflow] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [recommended, setRecommended] = useState([])

  useEffect(() => {
    const storedData = localStorage.getItem('userData')
    if (!storedData) {
      navigate('/register')
      return
    }
    const user = JSON.parse(storedData)
    setUserData(user)

    // Check if assessment is completed - redirect to assessment if not
    const storedAssessment = localStorage.getItem('assessmentResult')
    if (!storedAssessment) {
      // No assessment result, redirect to assessment
      navigate('/assessment')
      return
    }
    
    try {
      const assessment = JSON.parse(storedAssessment)
      // If assessment doesn't have completedAt, redirect to assessment
      if (!assessment.completedAt) {
        navigate('/assessment')
        return
      }
      // Assessment is completed, load the result
      setAssessmentResult(assessment)
    } catch (error) {
      console.error('Error parsing assessment result:', error)
      // If parsing fails, redirect to assessment
      navigate('/assessment')
      return
    }

    // Get user's profession
    const userProfession = user.profession || 'electrician'
    const professionKey = userProfession.toLowerCase().replace(/\s+/g, '-')

    // Load learning data
    fetch('/learningData.json')
      .then(res => res.json())
      .then(data => {
        setLearningData(data)
        
        // Get profession-specific levels
        const professionLevels = data.professions?.[professionKey] || data.professions?.electrician || []
        
        // Load saved progress from localStorage
        const savedProgressKey = `learningProgress_${professionKey}`
        const savedProgress = localStorage.getItem(savedProgressKey)
        let initialLevels = professionLevels
        
        if (savedProgress) {
          const progress = JSON.parse(savedProgress)
          initialLevels = professionLevels.map(level => {
            const savedLevel = progress.levels?.find(l => l.id === level.id)
            if (savedLevel) {
              return {
                ...level,
                completed: savedLevel.completed || level.completed,
                unlocked: savedLevel.unlocked !== undefined ? savedLevel.unlocked : level.unlocked,
                modules: level.modules.map(module => {
                  const savedModule = savedLevel.modules?.find(m => m.id === module.id)
                  return savedModule ? { ...module, completed: savedModule.completed } : module
                })
              }
            }
            return level
          })
        }
        
        setLevels(initialLevels)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error loading learning data:', err)
        setLoading(false)
      })
  }, [navigate])

  // Calculate user's actual rank based on progress
  const calculateRank = () => {
    if (!levels || levels.length === 0) return 'Bronze'
    
    const totalModules = levels.reduce((sum, level) => sum + level.modules.length, 0)
    const completedModules = levels.reduce(
      (sum, level) => sum + level.modules.filter(m => m.completed).length,
      0
    )
    const completionRate = totalModules > 0 ? (completedModules / totalModules) * 100 : 0
    
    if (completionRate >= 75) return 'Platinum'
    if (completionRate >= 50) return 'Gold'
    if (completionRate >= 25) return 'Silver'
    return 'Bronze'
  }

  // Calculate skills from learning levels
  const calculateSkills = () => {
    if (!levels || levels.length === 0) return []
    
    return levels.map((level, index) => {
      const completedModules = level.modules.filter(m => m.completed).length
      const totalModules = level.modules.length
      const completion = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0
      
      // Calculate value boost based on level completion
      const valueBoost = completion >= 100 ? (index + 1) * 8 : completion * 0.1
      
      return {
        id: level.id,
        name_bn: level.name_bn,
        name_en: level.name_en,
        completion: completion,
        valueBoost: Math.round(valueBoost),
        x: 100 + (index * 200),
        y: 150,
        connectedTo: index < levels.length - 1 ? [level.id + 1] : []
      }
    })
  }

  // Calculate earnings prediction based on progress and skills
  const calculateEarnings = (calculatedSkills) => {
    // Calculate progress
    const totalModules = levels.reduce((sum, level) => sum + level.modules.length, 0)
    const completedModules = levels.reduce(
      (sum, level) => sum + level.modules.filter(m => m.completed).length,
      0
    )
    const progressRate = totalModules > 0 ? (completedModules / totalModules) : 0
    
    // Check if user is new (no completed modules)
    const isNewUser = completedModules === 0
    
    // Base prediction based on profession and progress
    // For new users, start with a base prediction
    // For existing users, calculate based on completed skills
    const profession = userData?.profession || 'electrician'
    const professionBaseEarnings = {
      'electrician': 15000,
      'plumber': 14000,
      'mechanic': 16000,
      'carpenter': 13000,
      'painter': 12000
    }
    
    // Base monthly earning prediction
    let baseEarning = professionBaseEarnings[profession.toLowerCase()] || 15000
    
    // Calculate earning boost from completed skills
    const skillBoost = calculatedSkills.reduce((sum, skill) => {
      // Each completed skill adds value based on completion percentage
      const skillValue = (skill.completion / 100) * (skill.id * 500)
      return sum + skillValue
    }, 0)
    
    // Current predicted earning (base + skill boost)
    const currentPredicted = Math.round(baseEarning + skillBoost)
    
    // Predict next month based on progress rate
    // More progress = higher potential increase
    const potentialIncrease = Math.min(progressRate * 35, 30) // Max 30% increase
    const predictedNext = Math.round(currentPredicted * (1 + potentialIncrease / 100))
    
    // For new users, show potential starting earning
    const startingEarning = isNewUser ? baseEarning : currentPredicted
    
    return {
      isNewUser,
      currentPredicted: startingEarning,
      predictedNext,
      potentialIncrease: isNewUser ? 25 : potentialIncrease, // Show 25% potential for new users
      progressRate
    }
  }

  // Get recommended courses based on progress
  const getRecommendedCourses = () => {
    if (!levels || !learningData) return []
    
    const unlockedIncompleteLevels = levels.filter(l => l.unlocked && !l.completed)
    const lockedLevels = levels.filter(l => !l.unlocked)
    
    const recommendations = []
    
    // Add first unlocked incomplete level
    if (unlockedIncompleteLevels.length > 0) {
      const nextLevel = unlockedIncompleteLevels[0]
      const completedModules = nextLevel.modules.filter(m => m.completed).length
      const totalModules = nextLevel.modules.length
      const progress = (completedModules / totalModules) * 100
      
      recommendations.push({
        course_bn: nextLevel.name_bn,
        course_en: nextLevel.name_en,
        description_bn: `আপনার বর্তমান লেভেল ${Math.round(progress)}% সম্পন্ন হয়েছে। এটি সম্পন্ন করুন!`,
        description_en: `Your current level is ${Math.round(progress)}% complete. Complete it!`,
        predictedEarningBoost: `${Math.round((nextLevel.id * 5) + 10)}%`
      })
    }
    
    // Add first locked level
    if (lockedLevels.length > 0) {
      const futureLevel = lockedLevels[0]
      recommendations.push({
        course_bn: futureLevel.name_bn,
        course_en: futureLevel.name_en,
        description_bn: "পরবর্তী লেভেল আনলক করতে বর্তমান লেভেল সম্পন্ন করুন।",
        description_en: "Complete current level to unlock this next level.",
        predictedEarningBoost: `${Math.round((futureLevel.id * 8) + 15)}%`
      })
    }
    
    // If no recommendations, add generic ones
    if (recommendations.length === 0 && levels.length > 0) {
      const firstLevel = levels[0]
      recommendations.push({
        course_bn: firstLevel.name_bn,
        course_en: firstLevel.name_en,
        description_bn: "শেখা শুরু করুন এবং আপনার আয় বৃদ্ধি করুন।",
        description_en: "Start learning and increase your earnings.",
        predictedEarningBoost: "15%"
      })
    }
    
    return recommendations
  }

  // Handle workflow creation
  const handleCreateWorkflow = () => {
    setShowWorkflow(true)
    setIsAnalyzing(true)

    // Simulate AI analysis
    setTimeout(() => {
      setIsAnalyzing(false)
      const recommendations = getRecommendedCourses()
      setRecommended(recommendations)
    }, 3000) // 3 seconds analysis
  }

  const getRankColor = (rank) => {
    switch (rank) {
      case 'Bronze':
        return 'text-amber-700 bg-amber-100'
      case 'Silver':
        return 'text-gray-600 bg-gray-100'
      case 'Gold':
        return 'text-yellow-600 bg-yellow-100'
      case 'Platinum':
        return 'text-blue-600 bg-blue-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  if (loading || !userData || !learningData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="text-gray-600 text-xl">Loading...</div>
      </div>
    )
  }

  const currentRank = assessmentResult?.rank || calculateRank()
  const skills = calculateSkills()
  const earnings = calculateEarnings(skills)

  const translations = {
    bn: {
      dashboardTitle: "আমার ড্যাশবোর্ড",
      earnings: "আয়",
      progress: "অগ্রগতি",
      nextSkills: "পরবর্তী দক্ষতা",
      predictedIncrease: "আয় বৃদ্ধি সম্ভাবনা",
      startCourse: "কোর্স শুরু করুন",
      lastMonth: "গত মাস",
      nextMonth: "আগামী মাস",
      currentEarning: "বর্তমান আয় পূর্বাভাস",
      potentialEarning: "সম্ভাব্য আয়",
      newUserMotivation: "আপনার আয় কেন বৃদ্ধি পাবে",
      newUserTitle: "আপনার আয় বৃদ্ধির সম্ভাবনা",
      newUserDesc1: "নতুন দক্ষতা শিখে আপনার আয় ২৫% পর্যন্ত বৃদ্ধি করতে পারেন",
      newUserDesc2: "প্রতিটি সম্পন্ন কোর্স আপনার আয়ের সম্ভাবনা বাড়িয়ে দেয়",
      newUserDesc3: "AI-চালিত শেখার মাধ্যমে দ্রুত দক্ষতা অর্জন করুন",
      whyBoost: "কেন আপনার আয় বৃদ্ধি পাবে",
      skillProgress: "দক্ষতা অগ্রগতি",
      currentLevel: "বর্তমান স্তর",
      projectedEarning: "আয় বৃদ্ধি সম্ভাবনা",
      description: "বর্ণনা",
      profession: "পেশা",
      totalLevels: "মোট লেভেল",
      completedLevels: "সম্পন্ন লেভেল",
      totalModules: "মোট মডিউল",
      completedModules: "সম্পন্ন মডিউল",
      welcome: "স্বাগতম",
      continueLearning: "শেখা চালিয়ে যান",
      createWorkflow: "আমার আপস্কিল ওয়ার্কফ্লো তৈরি করুন",
      analyzing: "AI মডেল বিশ্লেষণ করছে...",
      analyzingDesc: "আপনার দক্ষতা, অগ্রগতি এবং লক্ষ্য বিশ্লেষণ করে ব্যক্তিগতকৃত কোর্স সুপারিশ তৈরি করা হচ্ছে"
    },
    en: {
      dashboardTitle: "My Dashboard",
      earnings: "Earnings",
      progress: "Progress",
      nextSkills: "Next Skills",
      predictedIncrease: "Predicted Income Increase",
      startCourse: "Start Course",
      lastMonth: "Last Month",
      nextMonth: "Next Month",
      currentEarning: "Current Earning Prediction",
      potentialEarning: "Potential Earning",
      newUserMotivation: "Why Your Earnings Will Boost",
      newUserTitle: "Your Earning Potential",
      newUserDesc1: "Learn new skills and increase your earnings by up to 25%",
      newUserDesc2: "Each completed course increases your earning potential",
      newUserDesc3: "Build skills faster with AI-powered learning",
      whyBoost: "Why Your Earnings Will Boost",
      skillProgress: "Skill Progress",
      currentLevel: "Current Level",
      projectedEarning: "Projected Earning Increase",
      description: "Description",
      profession: "Profession",
      totalLevels: "Total Levels",
      completedLevels: "Completed Levels",
      totalModules: "Total Modules",
      completedModules: "Completed Modules",
      welcome: "Welcome",
      continueLearning: "Continue Learning",
      createWorkflow: "Create My Upskill Workflow",
      analyzing: "AI Model is Analyzing...",
      analyzingDesc: "Analyzing your skills, progress, and goals to create personalized course recommendations"
    }
  }

  const t = translations[language]
  const totalLevels = levels.length
  const completedLevels = levels.filter(l => l.completed).length
  const totalModules = levels.reduce((sum, level) => sum + level.modules.length, 0)
  const completedModules = levels.reduce(
    (sum, level) => sum + level.modules.filter(m => m.completed).length,
    0
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 pt-6">
      {/* Premium Split Design Hero Section with Dashboard Image */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="grid md:grid-cols-2 gap-4 md:gap-6">
          {/* Left Side - Image with Overlay */}
          <div className="relative group overflow-hidden rounded-2xl md:rounded-3xl shadow-2xl h-80 md:h-[450px]">
            <img 
              src="/dashboard.jpeg" 
              alt="Dashboard Inspiration" 
              className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/80 via-purple-900/70 to-transparent"></div>
            
            {/* Floating Badge */}
            <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-md rounded-full px-4 py-2 border border-white/30">
              <span className="text-white font-bold text-sm md:text-base tracking-wider">SHEBA WORKFORCE</span>
            </div>

            {/* Bottom Quote Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6">
              <p className="text-white text-lg md:text-xl font-bold mb-2 drop-shadow-lg">
                {language === 'bn' 
                  ? 'নতুন দক্ষতা শিখুন AI এর সাথে'
                  : 'LEARN NEW SKILLS WITH AI'}
              </p>
              <p className="text-white/90 text-sm md:text-base drop-shadow-md">
                {language === 'bn' 
                  ? 'আপনার সম্ভাবনা উন্মুক্ত করুন'
                  : 'Unlock your potential'}
              </p>
            </div>
          </div>

          {/* Right Side - Content Card */}
          <div className="flex flex-col justify-center space-y-6">
            {/* Main Quote Card */}
            <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-2xl transform hover:scale-[1.02] transition-transform duration-300">
              <div className="flex items-start space-x-4 mb-4">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl md:text-3xl">💡</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white mb-3 leading-tight">
                    {language === 'bn' 
                      ? 'আপনার দক্ষতা বিকাশ করুন'
                      : 'Develop Your Skills'}
                  </h2>
                  <p className="text-white/95 text-base md:text-lg font-medium leading-relaxed">
                    {language === 'bn' 
                      ? 'ডিজিটাল যুগের জন্য দক্ষতা তৈরি করুন এবং আপনার আয় বৃদ্ধি করুন'
                      : 'Build skills for the digital age and increase your income'}
                  </p>
                </div>
              </div>
            </div>

            {/* Secondary Quote Card */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-xl border-2 border-indigo-200/50 hover:border-indigo-300 transition-all duration-300">
              <div className="flex items-start space-x-3">
                <div className="text-3xl md:text-4xl flex-shrink-0">✨</div>
                <div>
                  <p className="text-gray-800 text-base md:text-lg font-semibold italic mb-3 leading-relaxed">
                    {language === 'bn' 
                      ? '"প্রতিটি নতুন দক্ষতা আপনার ভবিষ্যতের জন্য একটি বিনিয়োগ। AI-এর সাহায্যে আজই আপনার যাত্রা শুরু করুন।"'
                      : '"Every new skill is an investment in your future. Start your journey today with the power of AI."'}
                  </p>
                  <p className="text-indigo-600 text-sm md:text-base font-bold">
                    — ShebaWorkforceAI
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Cards Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl md:rounded-2xl p-4 md:p-5 shadow-lg text-center transform hover:scale-105 transition-transform duration-300">
                <div className="text-3xl md:text-4xl mb-2">📊</div>
                <div className="text-white text-xs md:text-sm font-medium mb-1">{t.progress}</div>
                <div className="text-white text-lg md:text-xl font-bold">{currentRank}</div>
              </div>
              <div className="bg-gradient-to-br from-pink-500 to-orange-500 rounded-xl md:rounded-2xl p-4 md:p-5 shadow-lg text-center transform hover:scale-105 transition-transform duration-300">
                <div className="text-3xl md:text-4xl mb-2">🎯</div>
                <div className="text-white text-xs md:text-sm font-medium mb-1">{language === 'bn' ? 'লেভেল' : 'Levels'}</div>
                <div className="text-white text-lg md:text-xl font-bold">{completedLevels}/{totalLevels}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            {t.welcome}, {userData.name.split(' ')[0]}!
          </h1>
        </div>

        {/* Premium Feature Cards */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {language === 'bn' ? '📚 সকল বৈশিষ্ট্য' : '📚 All Features'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Learning Path Card */}
            <div 
              onClick={() => navigate('/learning')}
              className="group relative bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl md:rounded-2xl p-5 md:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] md:hover:scale-105 cursor-pointer overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 backdrop-blur-md rounded-lg md:rounded-xl flex items-center justify-center mb-3 md:mb-4 text-3xl md:text-4xl group-hover:rotate-12 transition-transform">
                  📚
                </div>
                <h3 className="text-lg md:text-xl font-bold text-white mb-1 md:mb-2">
                  {t.continueLearning}
                </h3>
                <p className="text-white/90 text-xs md:text-sm mb-3 md:mb-4 line-clamp-2">
                  {language === 'bn' ? 'ইন্টার‍্যাকটিভ শেখার পথে এগিয়ে যান' : 'Continue your interactive learning journey'}
                </p>
                <div className="flex items-center text-white font-semibold text-sm md:text-base">
                  <span>Explore →</span>
                </div>
              </div>
            </div>

            {/* Job Demand Card */}
            <div 
              onClick={() => navigate('/job-demand')}
              className="group relative bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-xl md:rounded-2xl p-5 md:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] md:hover:scale-105 cursor-pointer overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 backdrop-blur-md rounded-lg md:rounded-xl flex items-center justify-center mb-3 md:mb-4 text-3xl md:text-4xl group-hover:rotate-12 transition-transform">
                  🗺️
                </div>
                <h3 className="text-lg md:text-xl font-bold text-white mb-1 md:mb-2">
                  {language === 'bn' ? 'দক্ষতা চাহিদা মানচিত্র' : 'Skill Demand Map'}
                </h3>
                <p className="text-white/90 text-xs md:text-sm mb-3 md:mb-4 line-clamp-2">
                  {language === 'bn' ? 'জেলাভিত্তিক চাকরির চাহিদা দেখুন' : 'View district-wise job demand'}
                </p>
                <div className="flex items-center text-white font-semibold text-sm md:text-base">
                  <span>Explore →</span>
                </div>
              </div>
            </div>

            {/* Job Matching Card */}
            <div 
              onClick={() => navigate('/job-matching')}
              className="group relative bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-xl md:rounded-2xl p-5 md:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] md:hover:scale-105 cursor-pointer overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 backdrop-blur-md rounded-lg md:rounded-xl flex items-center justify-center mb-3 md:mb-4 text-3xl md:text-4xl group-hover:rotate-12 transition-transform">
                  💼
                </div>
                <h3 className="text-lg md:text-xl font-bold text-white mb-1 md:mb-2">
                  {language === 'bn' ? 'স্মার্ট চাকরি ম্যাচিং' : 'Smart Job Matching'}
                </h3>
                <p className="text-white/90 text-xs md:text-sm mb-3 md:mb-4 line-clamp-2">
                  {language === 'bn' ? 'আপনার দক্ষতার সাথে মিলে যাওয়া চাকরি খুঁজুন' : 'Find jobs matching your skills'}
                </p>
                <div className="flex items-center text-white font-semibold text-sm md:text-base">
                  <span>Explore →</span>
                </div>
              </div>
            </div>

            {/* Leaderboard Card */}
            <div 
              onClick={() => navigate('/leaderboard')}
              className="group relative bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500 rounded-xl md:rounded-2xl p-5 md:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] md:hover:scale-105 cursor-pointer overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 backdrop-blur-md rounded-lg md:rounded-xl flex items-center justify-center mb-3 md:mb-4 text-3xl md:text-4xl group-hover:rotate-12 transition-transform">
                  🏅
                </div>
                <h3 className="text-lg md:text-xl font-bold text-white mb-1 md:mb-2">
                  {language === 'bn' ? 'শীর্ষ তালিকা' : 'Top List'}
                </h3>
                <p className="text-white/90 text-xs md:text-sm mb-3 md:mb-4 line-clamp-2">
                  {language === 'bn' ? 'শীর্ষ টেকনিশিয়ানদের তালিকা দেখুন' : 'View list of top technicians'}
                </p>
                <div className="flex items-center text-white font-semibold text-sm md:text-base">
                  <span>Explore →</span>
                </div>
              </div>
            </div>

            {/* Marketplace Card */}
            {/* <div 
              onClick={() => navigate('/marketplace')}
              className="group relative bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 rounded-xl md:rounded-2xl p-5 md:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] md:hover:scale-105 cursor-pointer overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 backdrop-blur-md rounded-lg md:rounded-xl flex items-center justify-center mb-3 md:mb-4 text-3xl md:text-4xl group-hover:rotate-12 transition-transform">
                  🛒
                </div>
                <h3 className="text-lg md:text-xl font-bold text-white mb-1 md:mb-2">
                  {language === 'bn' ? 'মার্কেটপ্লেস' : 'Marketplace'}
                </h3>
                <p className="text-white/90 text-xs md:text-sm mb-3 md:mb-4 line-clamp-2">
                  {language === 'bn' ? 'টুল এবং রিসোর্স কিনুন' : 'Buy tools and resources'}
                </p>
                <div className="flex items-center text-white font-semibold text-sm md:text-base">
                  <span>Explore →</span>
                </div>
              </div>
            </div> */}

            {/* Community Card */}
            <div 
              onClick={() => navigate('/community')}
              className="group relative bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 rounded-xl md:rounded-2xl p-5 md:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] md:hover:scale-105 cursor-pointer overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 backdrop-blur-md rounded-lg md:rounded-xl flex items-center justify-center mb-3 md:mb-4 text-3xl md:text-4xl group-hover:rotate-12 transition-transform">
                  👥
                </div>
                <h3 className="text-lg md:text-xl font-bold text-white mb-1 md:mb-2">
                  {language === 'bn' ? 'কমিউনিটি' : 'Community'}
                </h3>
                <p className="text-white/90 text-xs md:text-sm mb-3 md:mb-4 line-clamp-2">
                  {language === 'bn' ? 'অন্যান্য পেশাজীবীদের সাথে সংযুক্ত হন' : 'Connect with other professionals'}
                </p>
                <div className="flex items-center text-white font-semibold text-sm md:text-base">
                  <span>Explore →</span>
                </div>
              </div>
            </div>

            {/* Insights Card */}
            <div 
              onClick={() => navigate('/insights')}
              className="group relative bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-500 rounded-xl md:rounded-2xl p-5 md:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] md:hover:scale-105 cursor-pointer overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 backdrop-blur-md rounded-lg md:rounded-xl flex items-center justify-center mb-3 md:mb-4 text-3xl md:text-4xl group-hover:rotate-12 transition-transform">
                  📊
                </div>
                <h3 className="text-lg md:text-xl font-bold text-white mb-1 md:mb-2">
                  {language === 'bn' ? 'পারফরম্যান্স ইনসাইটস' : 'Performance Insights'}
                </h3>
                <p className="text-white/90 text-xs md:text-sm mb-3 md:mb-4 line-clamp-2">
                  {language === 'bn' ? 'আপনার অগ্রগতি এবং পরিসংখ্যান বিশ্লেষণ করুন' : 'Analyze your progress and stats'}
                </p>
                <div className="flex items-center text-white font-semibold text-sm md:text-base">
                  <span>Explore →</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Premium Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6">
          {/* Total Levels */}
          <div className="group relative bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 rounded-2xl p-6 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <span className="text-2xl">📚</span>
                </div>
                <div className="text-white/20 text-4xl font-bold">{totalLevels}</div>
              </div>
              <div className="text-white/80 text-sm font-medium mb-1">{t.totalLevels}</div>
              <div className="text-3xl font-extrabold text-white">{totalLevels}</div>
            </div>
          </div>

          {/* Completed Levels */}
          <div className="group relative bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600 rounded-2xl p-6 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <span className="text-2xl">✅</span>
                </div>
                <div className="text-white/20 text-4xl font-bold">{completedLevels}</div>
              </div>
              <div className="text-white/80 text-sm font-medium mb-1">{t.completedLevels}</div>
              <div className="text-3xl font-extrabold text-white">{completedLevels}</div>
              {totalLevels > 0 && (
                <div className="mt-2 text-xs text-white/70">
                  {Math.round((completedLevels / totalLevels) * 100)}% Complete
                </div>
              )}
            </div>
          </div>

          {/* Total Modules */}
          <div className="group relative bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-600 rounded-2xl p-6 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <span className="text-2xl">📦</span>
                </div>
                <div className="text-white/20 text-4xl font-bold">{totalModules}</div>
              </div>
              <div className="text-white/80 text-sm font-medium mb-1">{t.totalModules}</div>
              <div className="text-3xl font-extrabold text-white">{totalModules}</div>
            </div>
          </div>

          {/* Completed Modules */}
          <div className="group relative bg-gradient-to-br from-purple-500 via-pink-600 to-rose-600 rounded-2xl p-6 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🎯</span>
                </div>
                <div className="text-white/20 text-4xl font-bold">{completedModules}</div>
              </div>
              <div className="text-white/80 text-sm font-medium mb-1">{t.completedModules}</div>
              <div className="text-3xl font-extrabold text-white">{completedModules}</div>
              {totalModules > 0 && (
                <div className="mt-2 text-xs text-white/70">
                  {Math.round((completedModules / totalModules) * 100)}% Complete
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Premium Skill Progress Section */}
        {skills.length > 0 && (
          <div className="mb-6">
            <div className="bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/30 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-2xl border-2 border-indigo-100/50 transition-all hover:shadow-3xl hover:border-indigo-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {t.skillProgress}
                </h3>
                <div className="text-sm font-semibold text-gray-600 bg-white/80 px-4 py-2 rounded-full">
                  {Math.round(skills.reduce((sum, skill) => sum + skill.completion, 0) / skills.length)}% Overall
                </div>
              </div>
              
              {/* Individual Level Progress */}
              <div className="space-y-4">
                {skills.map((skill, index) => {
                  const name = language === 'bn' ? skill.name_bn : skill.name_en
                  const isCompleted = skill.completion === 100
                  const isCurrent = skill.completion > 0 && skill.completion < 100
                  
                  return (
                    <div 
                      key={skill.id}
                      className={`relative overflow-hidden rounded-2xl p-5 md:p-6 transition-all duration-300 hover:shadow-lg ${
                        isCompleted 
                          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200' 
                          : isCurrent
                          ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200'
                          : 'bg-gray-50 border-2 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${
                            isCompleted 
                              ? 'bg-green-500 text-white' 
                              : isCurrent
                              ? 'bg-indigo-500 text-white'
                              : 'bg-gray-300 text-gray-600'
                          }`}>
                            {isCompleted ? '✓' : index + 1}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-800 text-base md:text-lg">
                              {name}
                            </h4>
                            <p className="text-xs text-gray-500">
                              Level {skill.id}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl md:text-3xl font-extrabold ${
                            isCompleted ? 'text-green-600' : isCurrent ? 'text-indigo-600' : 'text-gray-400'
                          }`}>
                            {skill.completion}%
                          </div>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${
                            isCompleted
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                              : isCurrent
                              ? 'bg-gradient-to-r from-indigo-500 to-purple-500'
                              : 'bg-gray-300'
                          }`}
                          style={{ width: `${skill.completion}%` }}
                        >
                          {isCurrent && (
                            <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                          )}
                        </div>
                        {isCompleted && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">✓ Completed</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Earnings & Progress Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <EarningsCard 
            earnings={earnings} 
            translations={translations}
            userData={userData}
            completedModules={completedModules}
            totalModules={totalModules}
          />
          <ProgressCard skills={skills} translations={translations} />
        </div>

        {/* Premium Next Skills Recommendations */}
        <div className="mb-6">
          {!showWorkflow ? (
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 md:p-12 shadow-2xl border-2 border-white/20">
              {/* Decorative Background Elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
              <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-white/5 rounded-full"></div>
              
              <div className="relative z-10 text-center">
                {/* Animated Rocket Icon */}
                <div className="inline-block mb-6 transform hover:scale-110 hover:rotate-12 transition-all duration-300">
                  <div className="w-24 h-24 md:w-28 md:h-28 mx-auto bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border-4 border-white/30 shadow-2xl">
                    <span className="text-5xl md:text-6xl animate-bounce">🚀</span>
                  </div>
                </div>

                {/* Heading */}
                <h3 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4 drop-shadow-lg">
                  {t.nextSkills}
                </h3>

                {/* Description */}
                <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
                  {language === 'bn' 
                    ? 'AI-চালিত ব্যক্তিগতকৃত কোর্স সুপারিশ পেতে আপনার আপস্কিল ওয়ার্কফ্লো তৈরি করুন'
                    : 'Create your upskill workflow to get AI-powered personalized course recommendations'}
                </p>

                {/* CTA Button */}
                <button
                  onClick={handleCreateWorkflow}
                  className="group relative inline-flex items-center space-x-3 px-8 md:px-12 py-4 md:py-5 bg-white text-indigo-600 rounded-2xl font-bold text-lg md:text-xl hover:bg-indigo-50 transition-all transform hover:scale-110 shadow-2xl hover:shadow-3xl overflow-hidden"
                >
                  {/* Shine Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  
                  <span className="text-2xl md:text-3xl relative z-10">✨</span>
                  <span className="relative z-10">{t.createWorkflow}</span>
                  
                  {/* Arrow Icon */}
                  <svg className="w-6 h-6 relative z-10 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>

                {/* Additional Info */}
                <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-white/80">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">⚡</span>
                    <span className="text-sm md:text-base">AI-Powered</span>
                  </div>
                  <div className="w-1 h-1 bg-white/40 rounded-full"></div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">🎯</span>
                    <span className="text-sm md:text-base">Personalized</span>
                  </div>
                  <div className="w-1 h-1 bg-white/40 rounded-full"></div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">📈</span>
                    <span className="text-sm md:text-base">Smart Recommendations</span>
                  </div>
                </div>
              </div>
            </div>
          ) : isAnalyzing ? (
            <div className="shadow-xl rounded-2xl bg-white/90 backdrop-blur-sm p-8 border border-white/20">
              <div className="text-center">
                <div className="relative inline-block mb-6">
                  <div className="w-24 h-24 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-12 h-12 text-purple-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{t.analyzing}</h3>
                <p className="text-gray-600">{t.analyzingDesc}</p>
                <div className="mt-6 flex justify-center space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                  <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          ) : recommended.length > 0 ? (
            <div>
              <NextSkills recommended={recommended} translations={translations} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
