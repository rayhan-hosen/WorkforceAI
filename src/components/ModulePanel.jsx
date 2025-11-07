import { useState, useEffect } from 'react'
import { useLanguage } from '../context/LanguageContext'

function ModulePanel({ level, isOpen, onClose, onModuleClick, onDownloadCertificate, translations }) {
  const { language } = useLanguage()
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (!isOpen || !level) return null

  const completedCount = level.modules.filter(m => m.completed).length
  const totalModules = level.modules.length
  const progress = (completedCount / totalModules) * 100

  const panelClasses = isMobile
    ? 'fixed inset-0 z-50 bg-white animate-slideInUp'
    : 'fixed right-0 top-0 h-full w-96 z-50 bg-white shadow-2xl animate-slideInRight'

  return (
    <>
      {/* Backdrop */}
      {isMobile && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div className={panelClasses}>
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">
              {language === 'bn' ? level.name_bn : level.name_en}
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span>{translations[language]?.progress || 'Progress'}</span>
              <span>{completedCount}/{totalModules}</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
              <div
                className="bg-white h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Modules List */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: isMobile ? 'calc(100vh - 280px)' : 'calc(100vh - 260px)' }}>
          <div className="space-y-3">
            {level.modules.map((module, index) => (
              <div
                key={module.id}
                className={`relative p-4 rounded-lg border-2 transition-all ${
                  module.completed
                    ? 'bg-green-50 border-green-300'
                    : level.unlocked
                    ? 'bg-indigo-50 border-indigo-300 hover:border-indigo-500 hover:shadow-md cursor-pointer'
                    : 'bg-gray-50 border-gray-300 opacity-50 cursor-not-allowed'
                }`}
                onClick={() => level.unlocked && !module.completed && onModuleClick(module, level)}
              >
                {/* Module Number Badge */}
                <div className="flex items-start space-x-3">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                    module.completed
                      ? 'bg-green-500 text-white'
                      : level.unlocked
                      ? 'bg-indigo-500 text-white'
                      : 'bg-gray-400 text-white'
                  }`}>
                    {module.completed ? '⭐' : index + 1}
                  </div>

                  <div className="flex-1">
                    <h3 className={`font-semibold mb-1 ${
                      module.completed ? 'text-green-800' : 
                      level.unlocked ? 'text-indigo-800' : 
                      'text-gray-600'
                    }`}>
                      {language === 'bn' ? module.title_bn : module.title_en}
                    </h3>
                    {module.completed && (
                      <span className="text-xs text-green-600 font-medium">
                        ✅ {translations[language]?.complete || 'Complete'}
                      </span>
                    )}
                    {!module.completed && level.unlocked && (
                      <span className="text-xs text-indigo-600 font-medium">
                        {translations[language]?.startQuiz || 'Start Quiz'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Completion Checkmark */}
                {module.completed && (
                  <div className="absolute top-2 right-2">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Certificate Download Section - Show when level is completed */}
          {level.completed && (
            <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border-2 border-yellow-300">
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">🎉</div>
                <p className="font-semibold text-yellow-800 mb-1">
                  {translations[language]?.levelCompleted || 'Level Completed!'}
                </p>
                <p className="text-sm text-yellow-700 mb-4">
                  {translations[language]?.allModulesCompleted || 'All modules completed'}
                </p>
                {onDownloadCertificate && (
                  <button
                    onClick={() => onDownloadCertificate(level.id)}
                    className="w-full px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg font-bold hover:from-yellow-600 hover:to-orange-600 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
                  >
                    <span className="text-2xl">📜</span>
                    <span>{translations[language]?.downloadCertificate || 'Download Certificate'}</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default ModulePanel
