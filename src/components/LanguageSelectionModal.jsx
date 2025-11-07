import { useState } from 'react'
import { useLanguage } from '../context/LanguageContext'

function LanguageSelectionModal({ onLanguageSelected }) {
  const { setLanguage: setLanguageDirectly } = useLanguage()
  const [selected, setSelected] = useState(null)

  const handleLanguageSelect = (lang) => {
    setSelected(lang)
    setLanguageDirectly(lang)
    
    // Small delay for visual feedback
    setTimeout(() => {
      onLanguageSelected(lang)
    }, 300)
  }

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        // Close dialog when clicking on backdrop
        if (e.target === e.currentTarget) {
          handleLanguageSelect(selected || 'bn')
        }
      }}
    >
      {/* Dialog Box */}
      <div 
        className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 rounded-3xl shadow-2xl max-w-2xl w-full p-8 md:p-12 animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl">
          <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Close Button */}
        <button
          onClick={() => handleLanguageSelect(selected || 'bn')}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200 z-10"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Main Content */}
        <div className="relative z-10 text-center">
          {/* Logo/Title */}
          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              ShebaWorkforceAI
            </h2>
            <p className="text-lg md:text-xl text-white/80">
              Select Your Language / আপনার ভাষা নির্বাচন করুন
            </p>
          </div>

          {/* Language Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center mb-6">
            {/* Bengali Button */}
            <button
              onClick={() => handleLanguageSelect('bn')}
              className={`group relative px-8 md:px-12 py-5 md:py-6 bg-white/10 backdrop-blur-md rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                selected === 'bn' 
                  ? 'border-white bg-white/20 shadow-2xl shadow-white/50 scale-105' 
                  : 'border-white/30 hover:border-white/60 hover:bg-white/15'
              }`}
            >
              <div className="flex flex-col items-center space-y-2 md:space-y-3">
                <div className="text-5xl md:text-6xl">🇧🇩</div>
                <div className="text-xl md:text-2xl font-bold text-white">বাংলা</div>
                <div className="text-base md:text-lg text-white/70">Bengali</div>
              </div>
              {selected === 'bn' && (
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                  <span className="text-white text-xl">✓</span>
                </div>
              )}
            </button>

            {/* English Button */}
            <button
              onClick={() => handleLanguageSelect('en')}
              className={`group relative px-8 md:px-12 py-5 md:py-6 bg-white/10 backdrop-blur-md rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                selected === 'en' 
                  ? 'border-white bg-white/20 shadow-2xl shadow-white/50 scale-105' 
                  : 'border-white/30 hover:border-white/60 hover:bg-white/15'
              }`}
            >
              <div className="flex flex-col items-center space-y-2 md:space-y-3">
                <div className="text-5xl md:text-6xl">🇬🇧</div>
                <div className="text-xl md:text-2xl font-bold text-white">English</div>
                <div className="text-base md:text-lg text-white/70">ইংরেজি</div>
              </div>
              {selected === 'en' && (
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                  <span className="text-white text-xl">✓</span>
                </div>
              )}
            </button>
          </div>

          {/* Instruction Text */}
          <p className="text-white/60 text-sm md:text-base">
            Choose your preferred language to continue
          </p>
        </div>
      </div>
    </div>
  )
}

export default LanguageSelectionModal

