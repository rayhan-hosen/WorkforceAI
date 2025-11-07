import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { getUserData, hasUserData } from '../utils/storageUtils'

function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { language, toggleLanguage } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [userData, setUserData] = useState(null)
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false)

  useEffect(() => {
    // Check if user is logged in and has valid data
    const user = getUserData()
    if (user && user.name && user.phone) {
      setUserData(user)
    } else {
      setUserData(null)
    }

    // Handle scroll effect
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [location.pathname]) // Re-check when route changes

  // Don't show navbar on landing page or register page
  const hideNavbar = location.pathname === '/' || location.pathname === '/register'

  if (hideNavbar) return null

  const translations = {
    bn: {
      home: 'হোম',
      dashboard: 'ড্যাশবোর্ড',
      learning: 'ইন্টার‍্যাকটিভ লার্নিং',
      jobDemand: 'দক্ষতা চাহিদা মানচিত্র',
      jobMatching: 'স্মার্ট চাকরি ম্যাচিং',
      leaderboard: 'শীর্ষ তালিকা',
      marketplace: 'মার্কেটপ্লেস',
      community: 'কমিউনিটি',
      insights: 'পারফরম্যান্স ইনসাইট'
    },
    en: {
      home: 'Home',
      dashboard: 'Dashboard',
      learning: 'Interactive Learning',
      jobDemand: 'Skill Demand Map',
      jobMatching: 'Smart Job Matching',
      leaderboard: 'Top List',
      marketplace: 'Marketplace',
      community: 'Community',
      insights: 'Performance Insights'
    }
  }

  const t = translations[language]

  // Only show navigation items if user has valid account
  const hasValidAccount = userData && userData.name && userData.phone
  
  const navItems = hasValidAccount ? [
    { path: '/dashboard', label: t.dashboard, icon: '📊', color: 'from-purple-500 to-indigo-600' },
    { path: '/learning', label: t.learning, icon: '📚', color: 'from-blue-500 to-cyan-600' },
    { path: '/job-demand', label: t.jobDemand, icon: '🗺️', color: 'from-green-500 to-emerald-600' },
    { path: '/job-matching', label: t.jobMatching, icon: '💼', color: 'from-indigo-500 to-purple-600' },
    { path: '/leaderboard', label: t.leaderboard, icon: '🏅', color: 'from-yellow-500 to-orange-600' },
    { path: '/community', label: t.community, icon: '👥', color: 'from-violet-500 to-purple-600' },
    { path: '/insights', label: t.insights, icon: '📈', color: 'from-cyan-500 to-blue-600' }
  ] : []
  
  // Marketplace should always be accessible (public)
  const publicNavItems = [
    { path: '/marketplace', label: t.marketplace, icon: '🛒', color: 'from-teal-500 to-cyan-600' }
  ]

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/')

  return (
    <>
      {/* Premium Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-xl border-b border-gray-200/50' 
          : 'bg-white/90 backdrop-blur-sm shadow-lg'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20 gap-4">
            {/* Logo/Brand */}
            <div 
              onClick={() => hasValidAccount ? navigate('/dashboard') : navigate('/')}
              className="flex items-center space-x-2 sm:space-x-3 cursor-pointer group flex-shrink-0"
            >
              <img 
                src="/sheba-logo.jpeg" 
                alt="Sheba Workforce AI" 
                className="w-10 h-10 md:w-12 md:h-12 rounded-xl shadow-lg group-hover:shadow-xl transition-all transform group-hover:scale-110 object-cover flex-shrink-0"
              />
              <div className="hidden sm:block xl:hidden">
                <h1 className="text-sm md:text-base font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent whitespace-nowrap">
                  ShebaWorkforceAI
                </h1>
                <p className="text-xs text-gray-500 hidden md:block whitespace-nowrap">AI Skill Graph</p>
              </div>
              <div className="hidden xl:block">
                <h1 className="text-base font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent whitespace-nowrap">
                  ShebaWorkforceAI
                </h1>
              </div>
            </div>

            {/* Desktop Navigation - Only show if user has valid account */}
            {hasValidAccount ? (
              <div className="hidden lg:flex items-center space-x-1 flex-1 justify-center mx-2 xl:mx-4 min-w-0">
                {/* Primary Navigation - Only 3 items visible */}
                {navItems.slice(0, 3).map((item) => (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path)
                      setIsOpen(false)
                    }}
                    className={`relative px-2 xl:px-3 py-2 rounded-lg font-medium text-xs xl:text-sm transition-all duration-200 whitespace-nowrap ${
                      isActive(item.path)
                        ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                    title={item.label}
                  >
                    <span className="flex items-center space-x-1 xl:space-x-1.5">
                      <span className="text-sm xl:text-base">{item.icon}</span>
                      <span className="hidden xl:inline">{item.label}</span>
                    </span>
                    {isActive(item.path) && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>
                    )}
                  </button>
                ))}
                
                {/* More Menu Dropdown - All remaining items */}
                {navItems.length > 3 && (
                  <div className="relative group">
                    <button
                      className={`relative px-2 xl:px-3 py-2 rounded-lg font-medium text-xs xl:text-sm transition-all duration-200 whitespace-nowrap ${
                        navItems.slice(3).some(item => isActive(item.path))
                          ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                      title="More"
                    >
                      <span className="flex items-center space-x-1 xl:space-x-1.5">
                        <span className="text-sm xl:text-base">⋯</span>
                        <span className="hidden xl:inline">{language === 'bn' ? 'আরও' : 'More'}</span>
                      </span>
                    </button>
                    
                    {/* Dropdown Menu */}
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="py-2">
                        {navItems.slice(3).map((item) => (
                          <button
                            key={item.path}
                            onClick={() => {
                              navigate(item.path)
                              setIsOpen(false)
                            }}
                            className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-all duration-200 ${
                              isActive(item.path)
                                ? `bg-gradient-to-r ${item.color} text-white`
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <span className="text-lg">{item.icon}</span>
                            <span className="font-medium">{item.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Public Navigation - Marketplace always accessible when no account */
              <div className="hidden lg:flex items-center space-x-1 flex-1 justify-center mx-2 xl:mx-4 min-w-0">
                {publicNavItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path)
                      setIsOpen(false)
                    }}
                    className={`relative px-2 xl:px-3 py-2 rounded-lg font-medium text-xs xl:text-sm transition-all duration-200 whitespace-nowrap ${
                      isActive(item.path)
                        ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                    title={item.label}
                  >
                    <span className="flex items-center space-x-1 xl:space-x-1.5">
                      <span className="text-sm xl:text-base">{item.icon}</span>
                      <span className="hidden xl:inline">{item.label}</span>
                    </span>
                    {isActive(item.path) && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Right Side - User Profile & Actions */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 min-w-0">
              {/* User Profile - Only show if valid user data exists */}
              {userData && userData.name && userData.phone ? (
                <>
                  <div 
                    onClick={() => navigate('/dashboard')}
                    className="hidden md:flex items-center gap-2 cursor-pointer group flex-shrink-0"
                  >
                  {userData.profileImage || userData.profileImagePath ? (
                    <img
                      src={userData.profileImage || userData.profileImagePath}
                      alt="Profile"
                      className="w-10 h-10 rounded-full object-cover border-2 border-purple-500 shadow-md group-hover:shadow-lg transition-all flex-shrink-0"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextSibling.style.display = 'flex'
                      }}
                    />
                  ) : null}
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center shadow-md group-hover:shadow-lg transition-all flex-shrink-0 ${userData.profileImage || userData.profileImagePath ? 'hidden' : ''}`}>
                    <span className="text-white font-bold text-lg">
                      {userData.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="hidden lg:block min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{userData.name?.split(' ')[0]}</p>
                    <p className="text-xs text-gray-500 capitalize truncate">{userData.profession?.replace(/-/g, ' ') || ''}</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/profile-edit')}
                  className="hidden md:flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 rounded-lg hover:from-indigo-200 hover:to-purple-200 transition-all font-medium text-xs whitespace-nowrap flex-shrink-0"
                  title={language === 'bn' ? 'প্রোফাইল সম্পাদনা' : 'Edit Profile'}
                >
                  <span>✏️</span>
                  <span className="hidden xl:inline">{language === 'bn' ? 'প্রোফাইল' : 'Profile'}</span>
                </button>
                </>
              ) : (
                /* Create Profile Button - Show when no valid user data */
                <button
                  onClick={() => navigate('/register')}
                  className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all font-medium text-sm shadow-md hover:shadow-lg whitespace-nowrap flex-shrink-0"
                >
                  <span>👤</span>
                  <span>{language === 'bn' ? 'প্রোফাইল তৈরি করুন' : 'Create Profile'}</span>
                </button>
              )}

              {/* Language Dropdown */}
              <div className="hidden md:block relative flex-shrink-0">
                <button
                  onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
                  onBlur={() => setTimeout(() => setLanguageDropdownOpen(false), 200)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 rounded-lg hover:from-purple-200 hover:to-indigo-200 transition-all font-medium shadow-md hover:shadow-lg whitespace-nowrap"
                >
                  <span>🌐</span>
                  <span className="font-semibold text-xs sm:text-sm">{language === 'bn' ? 'বাংলা' : 'English'}</span>
                  <svg 
                    className={`w-3.5 h-3.5 transition-transform duration-200 flex-shrink-0 ${languageDropdownOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Dropdown Menu */}
                {languageDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
                    <button
                      onClick={() => {
                        if (language !== 'bn') {
                          toggleLanguage()
                        }
                        setLanguageDropdownOpen(false)
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-all duration-200 ${
                        language === 'bn'
                          ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-lg">🇧🇩</span>
                      <span className="font-medium">বাংলা</span>
                      {language === 'bn' && <span className="ml-auto">✓</span>}
                    </button>
                    <button
                      onClick={() => {
                        if (language !== 'en') {
                          toggleLanguage()
                        }
                        setLanguageDropdownOpen(false)
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-all duration-200 ${
                        language === 'en'
                          ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-lg">🇬🇧</span>
                      <span className="font-medium">English</span>
                      {language === 'en' && <span className="ml-auto">✓</span>}
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label="Toggle menu"
              >
                <div className="w-6 h-6 flex flex-col justify-center space-y-1.5">
                  <span className={`block h-0.5 w-6 bg-gray-700 transition-all duration-300 ${
                    isOpen ? 'rotate-45 translate-y-2' : ''
                  }`}></span>
                  <span className={`block h-0.5 w-6 bg-gray-700 transition-all duration-300 ${
                    isOpen ? 'opacity-0' : ''
                  }`}></span>
                  <span className={`block h-0.5 w-6 bg-gray-700 transition-all duration-300 ${
                    isOpen ? '-rotate-45 -translate-y-2' : ''
                  }`}></span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="px-4 pb-4 space-y-2 border-t border-gray-200">
            {/* Show navigation items only if user has valid account */}
            {hasValidAccount ? (
              navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path)
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    isActive(item.path)
                      ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                      : 'text-gray-700 bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))
            ) : (
              /* Show only public items (Marketplace) when no account */
              publicNavItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path)
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    isActive(item.path)
                      ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                      : 'text-gray-700 bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))
            )}
            {/* User Profile Section in Mobile Menu */}
            {userData && userData.name && userData.phone ? (
              <div className="pt-2 border-t border-gray-200">
                <div 
                  onClick={() => {
                    navigate('/dashboard')
                    setIsOpen(false)
                  }}
                  className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 cursor-pointer mb-2"
                >
                  {userData.profileImage || userData.profileImagePath ? (
                    <img
                      src={userData.profileImage || userData.profileImagePath}
                      alt="Profile"
                      className="w-10 h-10 rounded-full object-cover border-2 border-purple-500"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextSibling.style.display = 'flex'
                      }}
                    />
                  ) : null}
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center ${userData.profileImage || userData.profileImagePath ? 'hidden' : ''}`}>
                    <span className="text-white font-bold">
                      {userData.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{userData.name?.split(' ')[0]}</p>
                    <p className="text-xs text-gray-500 capitalize">{userData.profession?.replace(/-/g, ' ') || ''}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    navigate('/profile-edit')
                    setIsOpen(false)
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 hover:from-indigo-200 hover:to-purple-200 transition-all"
                >
                  <span>✏️</span>
                  <span>{language === 'bn' ? 'প্রোফাইল সম্পাদনা' : 'Edit Profile'}</span>
                </button>
              </div>
            ) : (
              <div className="pt-2 border-t border-gray-200">
                <button
                  onClick={() => {
                    navigate('/register')
                    setIsOpen(false)
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md"
                >
                  <span>👤</span>
                  <span>{language === 'bn' ? 'প্রোফাইল তৈরি করুন' : 'Create Profile'}</span>
                </button>
              </div>
            )}

            {/* Language Selection */}
            <div className="pt-2 border-t border-gray-200">
              <div className="space-y-1">
                <button
                  onClick={() => {
                    if (language !== 'bn') {
                      toggleLanguage()
                    }
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all ${
                    language === 'bn'
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span>🇧🇩</span>
                  <span>বাংলা</span>
                  {language === 'bn' && <span className="ml-auto">✓</span>}
                </button>
                <button
                  onClick={() => {
                    if (language !== 'en') {
                      toggleLanguage()
                    }
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all ${
                    language === 'en'
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span>🇬🇧</span>
                  <span>English</span>
                  {language === 'en' && <span className="ml-auto">✓</span>}
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer to prevent content from going under fixed navbar */}
      <div className="h-16 md:h-20"></div>
    </>
  )
}

export default Navbar

