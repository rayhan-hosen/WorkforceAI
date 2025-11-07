import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import LanguageSelectionModal from './LanguageSelectionModal'

function LandingPage() {
  const navigate = useNavigate()
  const { language } = useLanguage()
  const [showLanguageModal, setShowLanguageModal] = useState(false)

  useEffect(() => {
    // Check if language has been selected
    const languageSelected = localStorage.getItem('languageSelected')
    if (!languageSelected) {
      setShowLanguageModal(true)
    }
  }, [])

  const handleLanguageSelected = () => {
    setShowLanguageModal(false)
  }

  const translations = {
    bn: {
      title: "ShebaWorkforceAI",
      subtitle: "Empowering every worker to learn, earn, and grow with AI.",
      description: "বাংলাদেশের কর্মীদের জন্য AI-চালিত দক্ষতা উন্নয়ন এবং আয় বৃদ্ধির প্ল্যাটফর্ম",
      features: {
        skillGraph: "দক্ষতার মানচিত্র",
        skillGraphDesc: "আপনার দক্ষতা ভিজ্যুয়ালাইজ করুন এবং আয় বৃদ্ধির পথ খুঁজে পান",
        earningPredictor: "আয় পূর্বাভাস",
        earningPredictorDesc: "AI-চালিত পূর্বাভাস দিয়ে আপনার আয় বৃদ্ধির সম্ভাবনা জানুন",
        gamifiedLearning: "আকর্ষণীয় শেখার উপায়",
        gamifiedLearningDesc: "সহজ, আকর্ষণীয় ও ক্যান্ডি ক্রাশ গেম-স্টাইল শেখার মাধ্যমে দক্ষতা অর্জন করুন",
        jobMatching: "স্মার্ট জব ম্যাচিং",
        jobMatchingDesc: "আপনার দক্ষতার সাথে মিলে যাওয়া চাকরি খুঁজুন",
        realTimeDemand: "বাজারের চাহিদা বিশ্লেষণ",
        realTimeDemandDesc: "জেলা-ভিত্তিক চাকরির চাহিদা এবং প্রবণতা দেখুন"
      },
      cta: "শুরু করুন",
      ctaDesc: "আপনার যাত্রা শুরু করতে এখনই নিবন্ধন করুন"
    },
    en: {
      title: "ShebaWorkforceAI",
      subtitle: "Empowering every worker to learn, earn, and grow with AI.",
      description: "AI-powered skill development and income growth platform for Bangladesh's workforce",
      features: {
        skillGraph: "Skill Map",
        skillGraphDesc: "Visualize your skills and discover pathways to income growth",
        earningPredictor: "Earning Predictor",
        earningPredictorDesc: "Know your income growth potential with AI-powered predictions",
        gamifiedLearning: "Interactive Learning",
        gamifiedLearningDesc: "MGain skills through easy, engaging, and Candy Crush–style learning.",
        jobMatching: "Smart Job Matching",
        jobMatchingDesc: "Find jobs that match your skills perfectly",
        realTimeDemand: "Market Demand Insights",
        realTimeDemandDesc: "See district-wise job demand and trends"
      },
      cta: "Get Started",
      ctaDesc: "Register now to begin your journey"
    }
  }

  const t = translations[language]

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Language Selection Popup Dialog */}
      {showLanguageModal && (
        <LanguageSelectionModal onLanguageSelected={handleLanguageSelected} />
      )}
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-20 text-center">
          <h1 className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-3 leading-tight tracking-tight break-words max-w-[20ch] mx-auto"
  style={{ fontSize: 'clamp(28px, 8vw, 72px)' }}>
            {t.title}
          </h1>
          <p className="text-2xl md:text-3xl text-gray-700 mb-6 font-semibold">
            {t.subtitle}
          </p>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
            {t.description}
          </p>
        </div>
      </div>

      {/* Motivational Quote Section */}
      <div className="max-w-5xl mx-auto px-6 pt-4 pb-16">
        <div className="bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 rounded-3xl p-8 md:p-12 shadow-2xl border-4 border-yellow-300 relative overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0 opacity-10">
            <img
              src="/compressed_image.jpeg"
              alt="Background"
              className="w-full h-full object-cover rounded-3xl"
            />
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-200 rounded-full blur-3xl opacity-20"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-200 rounded-full blur-3xl opacity-20"></div>
          
          <div className="relative z-10">
            {/* Image and Quote Layout */}
            <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
              {/* Quote Image */}
              <div className="flex-shrink-0">
                <div className="relative">
                  <img
                    src="/compressed_image.jpeg"
                    alt={language === 'bn' ? 'দক্ষ শ্রমিক' : 'Skilled Worker'}
                    className="w-48 h-48 md:w-64 md:h-64 rounded-2xl object-cover shadow-2xl border-4 border-white transform hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
                </div>
              </div>
              
              {/* Quote Content */}
              <div className="flex-1">
                {/* Quote Icon */}
                <div className="text-6xl mb-4 text-center md:text-left">💡</div>
                
                {/* Quote Text */}
                <blockquote className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 mb-6 leading-relaxed italic">
                  {language === 'bn' ? (
                    <>
                      "পরবর্তী প্রজন্মের মিলিয়নিয়াররা আসবে দক্ষ শ্রমিকদের কাছ থেকে - যেমন বৈদ্যুতিক এবং প্লাম্বার - টেকনোলজি থেকে নয়, কারণ অবকাঠামো নির্মাণের জন্য হাতেকলমে শ্রমের ব্যাপক চাহিদা রয়েছে।"
                    </>
                  ) : (
                    <>
                      "The next generation of millionaires will come from skilled trades like electricians and plumbers, not tech, because of the massive demand for hands-on labor to build infrastructure."
                    </>
                  )}
                </blockquote>
              </div>
            </div>
            
            {/* Attribution */}
            <div className="text-center">
              <div className="inline-flex items-center space-x-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg">
                {/* Profile Image */}
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    JH
                  </div>
                </div>
                <div className="text-left">
                  <div className="font-bold text-gray-800">
                    {language === 'bn' ? 'জেনসেন হুয়াং' : 'Jensen Huang'}
                  </div>
                  <div className="text-sm text-gray-600">
                    {language === 'bn' ? 'NVIDIA-এর CEO' : 'CEO, NVIDIA'}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Motivational Message */}
            
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1: Skill Graph */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              {t.features.skillGraph}
            </h3>
            <p className="text-gray-600">
              {t.features.skillGraphDesc}
            </p>
          </div>

          {/* Feature 2: Earning Predictor */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="text-5xl mb-4">💰</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              {t.features.earningPredictor}
            </h3>
            <p className="text-gray-600">
              {t.features.earningPredictorDesc}
            </p>
          </div>

          {/* Feature 3: Gamified Learning */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="text-5xl mb-4">🎮</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              {t.features.gamifiedLearning}
            </h3>
            <p className="text-gray-600">
              {t.features.gamifiedLearningDesc}
            </p>
          </div>

          {/* Feature 4: Job Matching */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="text-5xl mb-4">🎯</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              {t.features.jobMatching}
            </h3>
            <p className="text-gray-600">
              {t.features.jobMatchingDesc}
            </p>
          </div>

          {/* Feature 5: Real-Time Demand */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="text-5xl mb-4">🗺️</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              {t.features.realTimeDemand}
            </h3>
            <p className="text-gray-600">
              {t.features.realTimeDemandDesc}
            </p>
          </div>

          {/* Feature 6: AI Assistant */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="text-5xl mb-4">🤖</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              {language === 'bn' ? 'ব্যক্তিগত AI সহায়ক' : 'Personalized AI Assistant'}
            </h3>
            <p className="text-gray-600">
              {language === 'bn' ? 'আপনার জন্য অনুমতি পান' : 'Get personalized assistance'}
            </p>
          </div>

          {/* Feature 7: Marketplace */}
          <div 
            onClick={() => navigate('/marketplace')}
            className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
          >
            <div className="text-5xl mb-4">💼</div>
            <h3 className="text-2xl font-bold text-white mb-3">
              {language === 'bn' ? 'মার্কেটপ্লেস' : 'Marketplace'}
            </h3>
            <p className="text-white/90 mb-4">
              {language === 'bn' 
                ? 'দক্ষ টেকনিশিয়ান খুঁজুন এবং হায়ার করুন' 
                : 'Find and hire skilled technicians'}
            </p>
            <button className="mt-4 px-6 py-2 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              {language === 'bn' ? 'এখনই দেখুন →' : 'Browse Now →'}
            </button>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl font-bold mb-4">
            {t.ctaDesc}
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-6">
            <button
              onClick={() => navigate('/register')}
              className="px-10 py-4 bg-white text-indigo-600 text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              {t.cta} →
            </button>
            <button
              onClick={() => navigate('/marketplace')}
              className="px-10 py-4 bg-transparent border-2 border-white text-white text-lg font-semibold rounded-xl hover:bg-white hover:text-indigo-600 transform hover:scale-105 transition-all duration-300"
            >
              {language === 'bn' ? 'মার্কেটপ্লেস দেখুন' : 'Browse Marketplace'} →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LandingPage

