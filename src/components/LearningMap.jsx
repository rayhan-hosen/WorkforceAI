import { useEffect, useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import LevelNode from './LevelNode'
import ModulePanel from './ModulePanel'
import ProgressBar from './ProgressBar'
import CertificateModal from './CertificateModal'
import ModuleModal from './ModuleModal'
import CelebrationAnimation from './CelebrationAnimation'
import CandyPath from './CandyPath'
import MascotGuide from './MascotGuide'
import XPJourneyBar from './XPJourneyBar'
import ScenicBackground from './ScenicBackground'

function LearningMap() {
  const navigate = useNavigate()
  const { levelId } = useParams()
  const { language, toggleLanguage } = useLanguage()
  const [userData, setUserData] = useState(null)
  const [learningData, setLearningData] = useState(null)
  const [levels, setLevels] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedModule, setSelectedModule] = useState(null)
  const [selectedLevel, setSelectedLevel] = useState(null)
  const [showCelebration, setShowCelebration] = useState(false)
  const [celebratedLevel, setCelebratedLevel] = useState(null)
  const [showCertificateModal, setShowCertificateModal] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)
  const [currentLevelId, setCurrentLevelId] = useState(null)
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024)
  const levelRefs = useRef({})

  // Update window width for responsive calculations
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const storedData = localStorage.getItem('userData')
    if (!storedData) {
      navigate('/register')
      return
    }
    const user = JSON.parse(storedData)
    setUserData(user)

    // Get user's profession from stored data
    const userProfession = user.profession || 'electrician' // Default to electrician if not set

    // Load learning data
    fetch('/learningData.json')
      .then(res => res.json())
      .then(data => {
        setLearningData(data)
        
        // Get profession-specific levels
        const professionKey = userProfession.toLowerCase().replace(/\s+/g, '-')
        const professionLevels = data.professions?.[professionKey] || data.professions?.electrician || []
        
        // Load saved progress from localStorage (profession-specific)
        const savedProgressKey = `learningProgress_${professionKey}`
        const savedProgress = localStorage.getItem(savedProgressKey)
        let initialLevels = professionLevels
        
        if (savedProgress) {
          const progress = JSON.parse(savedProgress)
          // Merge saved progress with default data
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
        
        // Update unlocked levels based on completion
        const updatedLevels = updateUnlockedLevels(initialLevels)
        setLevels(updatedLevels)
        setLoading(false)

        // Handle levelId from URL
        if (levelId) {
          const level = updatedLevels.find(l => l.id === parseInt(levelId))
          if (level) {
            setCurrentLevelId(level.id)
            setPanelOpen(true)
          }
        }
      })
      .catch(err => {
        console.error('Error loading learning data:', err)
        setLoading(false)
      })
  }, [navigate, levelId])

  useEffect(() => {
    // Scroll to current level on load
    if (!loading && levels.length > 0) {
      const firstUnlockedIndex = levels.findIndex(l => l.unlocked && !l.completed)
      if (firstUnlockedIndex >= 0) {
        setTimeout(() => {
          const levelId = levels[firstUnlockedIndex].id
          if (levelRefs.current[levelId]) {
            levelRefs.current[levelId].scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        }, 500)
      }
    }
  }, [loading, levels])

  const updateUnlockedLevels = (levelsData) => {
    const updatedLevels = levelsData.map((level, index) => {
      if (index === 0) {
        return { ...level, unlocked: true }
      }
      const previousLevel = levelsData[index - 1]
      return { ...level, unlocked: previousLevel.completed || false }
    })
    return updatedLevels
  }

  const handleLevelClick = (level) => {
    if (!level.unlocked) return
    
    setCurrentLevelId(level.id)
    setPanelOpen(true)
    navigate(`/learning/${level.id}`)
  }

  const handleModuleClick = (module, level) => {
    setSelectedModule(module)
    setSelectedLevel(level)
    setPanelOpen(false)
  }

  const handleModuleComplete = (moduleId) => {
    const updatedLevels = levels.map(level => {
      if (level.id === selectedLevel.id) {
        const updatedModules = level.modules.map(module =>
          module.id === moduleId ? { ...module, completed: true } : module
        )
        
        // Check if all modules are completed
        const allCompleted = updatedModules.every(m => m.completed)
        const wasCompleted = level.completed
        
        // Unlock next level if this level is now completed
        if (allCompleted && !wasCompleted) {
          // Show celebration
          setShowCelebration(true)
          setCelebratedLevel(level)
          setTimeout(() => {
            setShowCelebration(false)
            setShowCertificateModal(true)
          }, 3000)
        }
        
        return {
          ...level,
          modules: updatedModules,
          completed: allCompleted
        }
      }
      return level
    })

    // Unlock next level if current level is completed
    const finalLevels = updateUnlockedLevels(updatedLevels)
    setLevels(finalLevels)
    
    // Save progress to localStorage (profession-specific)
    if (userData?.profession) {
      const professionKey = userData.profession.toLowerCase().replace(/\s+/g, '-')
      const savedProgressKey = `learningProgress_${professionKey}`
      localStorage.setItem(savedProgressKey, JSON.stringify({ levels: finalLevels }))
    }
  }

  const handleDownloadCertificate = (levelId) => {
    // Certificate download is now handled by CertificateModal component
    // This callback is just for tracking/logging purposes
    console.log('Certificate downloaded for level:', levelId)
    // Don't close modal here - let user close it manually
  }

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

  if (loading || !userData || !learningData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-300 via-pink-200 to-yellow-200">
        <div className="text-gray-600 text-xl">Loading...</div>
      </div>
    )
  }

  const translations = learningData.translations
  const currentLevel = currentLevelId ? levels.find(l => l.id === currentLevelId) : null

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-300 via-pink-200 to-yellow-200 relative overflow-x-hidden">
      {/* Scenic Background - Hills, Clouds, Flowers, Sparkles */}
      <ScenicBackground />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-5 md:py-6 pb-32 md:pb-40 relative z-10 overflow-x-hidden">
        {/* Progress Bar */}
        <div className="mb-3 sm:mb-4 md:mb-6">
          <ProgressBar levels={levels} currentRank="Silver" nextRank="Gold" />
        </div>

        {/* Title Section */}
        <div className="text-center mb-6 sm:mb-7 md:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 mb-3 sm:mb-3.5 md:mb-4 drop-shadow-lg px-2 leading-tight" style={{
            textShadow: '2px 2px 4px rgba(255,255,255,0.5)',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}>
            {translations[language]?.title}
          </h1>
          {userData?.profession && (
            <div className="inline-flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-3 bg-gradient-to-r from-pink-100 via-purple-100 to-blue-100 rounded-full border-2 sm:border-3 border-white shadow-xl backdrop-blur-sm">
              <span className="text-xs sm:text-sm md:text-base font-bold text-purple-700 whitespace-nowrap">
                {language === 'bn' ? 'পেশা' : 'Profession'}: 
              </span>
              <span className="text-xs sm:text-sm md:text-base font-black text-purple-800 capitalize whitespace-nowrap">
                {userData.profession.replace(/-/g, ' ')}
                </span>
              </div>
            )}
      </div>

        {/* Candy Crush-Style Learning Path */}
        <div className="flex flex-col items-center gap-12 sm:gap-16 md:gap-20 relative py-4 md:py-12 overflow-visible">
          {levels.map((level, index) => {
            const isActive = level.unlocked && !level.completed
            const previousLevel = index > 0 ? levels[index - 1] : null
            const isPathUnlocked = previousLevel ? previousLevel.completed : true

            // Calculate positions for zigzag candy path with perspective - responsive
            const nodeSpacing = windowWidth < 640 ? 140 : windowWidth < 768 ? 160 : windowWidth < 1024 ? 180 : 220
            const scale = windowWidth < 640 ? Math.max(0.9 - (index * 0.02), 0.75) : Math.max(1 - (index * 0.05), 0.7)
            const opacity = windowWidth < 640 ? Math.max(1 - (index * 0.03), 0.85) : Math.max(1 - (index * 0.1), 0.6)

            return (
              <div
                key={level.id}
                ref={el => { levelRefs.current[level.id] = el }}
                className="relative w-full flex flex-col items-center"
                style={{ 
                  minHeight: `${nodeSpacing}px`, 
                  position: 'relative',
                  transform: `scale(${Math.max(scale, 0.7)})`,
                  opacity: Math.max(opacity, 0.6),
                  zIndex: levels.length - index
                }}
              >
                {/* Candy Path Connector */}
              {index > 0 && (
                  <CandyPath
                    fromY={0}
                    toY={nodeSpacing}
                    isUnlocked={isPathUnlocked}
                    index={index}
                  />
              )}
              
                {/* Level Node */}
                <div className="relative z-20">
                  <LevelNode
                  level={level}
                    index={index}
                    isActive={isActive}
                    onClick={() => handleLevelClick(level)}
                  translations={translations}
                />
                    </div>
                  </div>
            )
          })}
        </div>
      </div>

      {/* Module Panel */}
      <ModulePanel
        level={currentLevel}
        isOpen={panelOpen}
        onClose={() => {
          setPanelOpen(false)
          navigate('/learning')
        }}
        onModuleClick={handleModuleClick}
        onDownloadCertificate={(levelId) => {
          const level = levels.find(l => l.id === levelId)
          if (level) {
            setCelebratedLevel(level)
            setShowCertificateModal(true)
          }
        }}
        translations={translations}
      />

      {/* Module Modal */}
      {selectedModule && selectedLevel && (
        <ModuleModal
          module={selectedModule}
          level={selectedLevel}
          onClose={() => {
            setSelectedModule(null)
            setSelectedLevel(null)
            if (currentLevelId) {
              setPanelOpen(true)
            }
          }}
          onComplete={handleModuleComplete}
          translations={translations}
        />
      )}

      {/* Celebration Animation */}
      {showCelebration && celebratedLevel && (
        <CelebrationAnimation
          level={celebratedLevel}
          translations={translations}
          onClose={() => {
            setShowCelebration(false)
            setCelebratedLevel(null)
          }}
        />
      )}

      {/* Certificate Modal */}
      {showCertificateModal && celebratedLevel && (
        <CertificateModal
          level={celebratedLevel}
          userData={userData}
          isOpen={showCertificateModal}
          onClose={() => setShowCertificateModal(false)}
          onDownload={() => handleDownloadCertificate(celebratedLevel.id)}
          translations={translations}
        />
      )}

      {/* Mascot Guide */}
      {currentLevel && (
        <MascotGuide
          currentLevel={currentLevel}
          translations={translations}
        />
      )}

      {/* Footer XP Journey Bar */}
      <XPJourneyBar currentRank="Silver" />
    </div>
  )
}

export default LearningMap
