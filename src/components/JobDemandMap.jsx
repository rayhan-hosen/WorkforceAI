import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import BangladeshMap from './BangladeshMap'
import DistrictTooltip from './DistrictTooltip'

function JobDemandMap() {
  const navigate = useNavigate()
  const { language, toggleLanguage } = useLanguage()
  const [userData, setUserData] = useState(null)
  const [jobData, setJobData] = useState(null)
  const [districts, setDistricts] = useState([])
  const [loading, setLoading] = useState(true)
  const [hoveredDistrict, setHoveredDistrict] = useState(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const [selectedDistrict, setSelectedDistrict] = useState(null)
  const [autoMode, setAutoMode] = useState(false) // Disabled by default
  const [autoIndex, setAutoIndex] = useState(0)
  const [filterByProfession, setFilterByProfession] = useState(true)
  const svgRef = useRef(null)

  useEffect(() => {
    const storedData = localStorage.getItem('userData')
    if (!storedData) {
      navigate('/register')
      return
    }
    const user = JSON.parse(storedData)
    setUserData(user)

    // Load job demand data
    fetch('/jobDemandData.json')
      .then(res => res.json())
      .then(data => {
        setJobData(data)
        // Filter districts based on user profession if enabled
        let filteredDistricts = data.districts
        if (filterByProfession && user.profession) {
          filteredDistricts = filterDistrictsByProfession(data.districts, user.profession)
        }
        setDistricts(filteredDistricts)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error loading job demand data:', err)
        setLoading(false)
      })
  }, [navigate, filterByProfession])

  // Filter districts based on user profession
  const filterDistrictsByProfession = (districts, profession) => {
    const professionKey = profession.toLowerCase().replace(/\s+/g, '-')
    const professionMap = {
      'electrician': ['electrical', 'ac servicing'],
      'plumber': ['plumbing'],
      'ac-technician': ['ac servicing'],
      'carpenter': ['carpentry']
    }

    const keywords = professionMap[professionKey] || []
    if (keywords.length === 0) return districts

    return districts.map(district => {
      const dominantService = (district.dominantService_en || '').toLowerCase()
      const matchesProfession = keywords.some(keyword => 
        dominantService.includes(keyword)
      )
      
      // Boost demand index if it matches user's profession
      if (matchesProfession) {
        return {
          ...district,
          demandIndex: Math.min(100, district.demandIndex + 5),
          userRelevant: true,
          matchScore: calculateMatchScore(district, profession)
        }
      }
      
      return {
        ...district,
        userRelevant: false,
        matchScore: calculateMatchScore(district, profession)
      }
    }).sort((a, b) => {
      // Sort by relevance: user-relevant first, then by demand index
      if (a.userRelevant && !b.userRelevant) return -1
      if (!a.userRelevant && b.userRelevant) return 1
      return b.demandIndex - a.demandIndex
    })
  }

  // Calculate match score based on user profession and district services
  const calculateMatchScore = (district, profession) => {
    const professionKey = profession.toLowerCase().replace(/\s+/g, '-')
    const dominantService = (district.dominantService_en || '').toLowerCase()
    
    if (professionKey === 'electrician' && dominantService.includes('electrical')) return 95
    if (professionKey === 'plumber' && dominantService.includes('plumbing')) return 95
    if (professionKey === 'ac-technician' && dominantService.includes('ac')) return 95
    if (professionKey === 'carpenter' && dominantService.includes('carpentry')) return 95
    
    // Partial matches
    if (professionKey === 'electrician' && dominantService.includes('ac')) return 70
    if (professionKey === 'plumber' && dominantService.includes('water')) return 70
    
    return 50 // Default match score
  }

  // Auto-rotation mode - only runs when enabled and no manual interaction
  useEffect(() => {
    if (!autoMode || !districts || districts.length === 0 || selectedDistrict) {
      if (!selectedDistrict && autoMode) {
        setHoveredDistrict(null)
      }
      return
    }

    const relevantDistricts = districts.filter(d => d.userRelevant || d.demandIndex >= 70)
    const districtsToShow = relevantDistricts.length > 0 ? relevantDistricts : districts

    const interval = setInterval(() => {
      // Only auto-rotate if no district is manually hovered
      if (!hoveredDistrict || hoveredDistrict.id === districtsToShow[autoIndex]?.id) {
        setAutoIndex((prev) => {
          const nextIndex = (prev + 1) % districtsToShow.length
          const district = districtsToShow[nextIndex]
          if (district) {
            setHoveredDistrict(district)
          }
          return nextIndex
        })
      }
    }, 4000) // Slower rotation

    return () => clearInterval(interval)
  }, [autoMode, districts, selectedDistrict]) // Removed hoveredDistrict from deps to prevent conflicts

  // Handle mouse move for tooltip positioning - only when manually hovering
  useEffect(() => {
    if (!hoveredDistrict || selectedDistrict || autoMode) {
      return
    }

    const handleMouseMove = (e) => {
      setTooltipPosition({
        x: e.clientX,
        y: e.clientY
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [hoveredDistrict, selectedDistrict, autoMode])

  const handleDistrictHover = (district) => {
    // Stop auto mode when user manually hovers
    if (autoMode) {
      setAutoMode(false)
    }
    setHoveredDistrict(district)
  }

  const handleDistrictClick = (district) => {
    // Stop auto mode and clear hover when clicking
    setAutoMode(false)
    setSelectedDistrict(district)
    setHoveredDistrict(null)
  }

  const handleCloseModal = () => {
    setSelectedDistrict(null)
  }

  // Get top districts for user's profession
  const getTopDistrictsForUser = () => {
    if (!userData || !districts) return []
    const userRelevantDistricts = districts
      .filter(d => d.userRelevant)
      .slice(0, 5)
    return userRelevantDistricts.length > 0 
      ? userRelevantDistricts 
      : districts.slice(0, 5)
  }

  if (loading || !userData || !jobData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-50 to-indigo-100">
        <div className="text-gray-600 text-xl">Loading...</div>
      </div>
    )
  }

  const translations = jobData.translations
  const userProfession = userData.profession?.replace(/-/g, ' ') || 'Worker'
  const topDistricts = getTopDistrictsForUser()

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-indigo-100 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-lg p-3 sm:p-4 mb-3 sm:mb-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-col gap-3 sm:gap-4">
          <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
            {userData.profileImage || userData.profileImagePath ? (
              <img
                src={userData.profileImage || userData.profileImagePath}
                alt="Profile"
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-purple-500 flex-shrink-0"
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.nextSibling.style.display = 'flex'
                }}
              />
            ) : null}
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 ${userData.profileImage || userData.profileImagePath ? 'hidden' : ''}`}>
              <span className="text-purple-600 font-semibold text-sm sm:text-base">
                {userData.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 truncate">
                {translations[language]?.title}
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 capitalize truncate">
                {language === 'bn' ? 'পেশা' : 'Profession'}: {userProfession}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center space-x-1.5 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors text-xs sm:text-sm">
              <input
                type="checkbox"
                checked={filterByProfession}
                onChange={(e) => setFilterByProfession(e.target.checked)}
                className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600 rounded focus:ring-purple-500 flex-shrink-0"
              />
              <span className="text-gray-700 whitespace-nowrap">
                {language === 'bn' ? 'আমার পেশা অনুযায়ী' : 'Filter by My Profession'}
              </span>
            </label>
            <button
              onClick={() => setAutoMode(!autoMode)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                autoMode
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {autoMode ? '⏸️ ' + translations[language]?.autoMode : '▶️ ' + translations[language]?.manualMode}
            </button>
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-medium text-xs sm:text-sm whitespace-nowrap"
            >
              <span>🌐</span>
              <span className="hidden sm:inline">{language === 'bn' ? 'বাংলা' : 'English'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* User-Specific Insights Banner */}
      {filterByProfession && topDistricts.length > 0 && (
        <div className="max-w-7xl mx-auto px-3 sm:px-4 mb-3 sm:mb-4">
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl p-3 sm:p-4 shadow-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base sm:text-lg mb-1.5 sm:mb-1">
                  {language === 'bn' 
                    ? `🎯 ${userProfession} এর জন্য সর্বোচ্চ চাহিদা` 
                    : `🎯 Top Demand for ${userProfession}`}
                </h3>
                <p className="text-xs sm:text-sm opacity-90">
                  {language === 'bn' 
                    ? `আপনার দক্ষতার জন্য ${topDistricts[0]?.name_bn || topDistricts[0]?.name_en} জেলায় ${topDistricts[0]?.demandIndex || 0}% চাহিদা রয়েছে`
                    : `${topDistricts[0]?.name_en || 'District'} has ${topDistricts[0]?.demandIndex || 0}% demand for your skills`}
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5 sm:gap-2 w-full sm:w-auto">
                {topDistricts.slice(0, 3).map((district, idx) => (
                  <div key={district.id} className="bg-white/20 backdrop-blur-sm rounded-lg px-2 sm:px-3 py-1 text-xs sm:text-sm font-semibold whitespace-nowrap">
                    {language === 'bn' ? district.name_bn : district.name_en}: {district.demandIndex}%
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 p-2 sm:p-4 max-w-7xl mx-auto w-full pb-20 sm:pb-4">
        {/* Map Container */}
        <div className="relative bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 md:p-6 overflow-hidden">
          <div className="text-center mb-3 sm:mb-4 text-xs sm:text-sm text-gray-600">
            {translations[language]?.clickDistrict}
          </div>
          
          {/* Bangladesh Map */}
          <div className="relative" ref={svgRef}>
            <BangladeshMap
              districts={districts}
              onDistrictHover={handleDistrictHover}
              onDistrictClick={handleDistrictClick}
              hoveredDistrict={hoveredDistrict}
              selectedDistrict={selectedDistrict}
              userProfession={userData.profession}
              topDistricts={topDistricts}
              translations={translations}
            />
          </div>

          {/* Tooltip - Only show when manually hovering (not auto mode) */}
          {hoveredDistrict && !selectedDistrict && !autoMode && (
            <DistrictTooltip
              district={hoveredDistrict}
              x={tooltipPosition.x || 0}
              y={tooltipPosition.y || 0}
              translations={translations}
              userMatchScore={hoveredDistrict.matchScore}
            />
          )}
        </div>

      </div>
    </div>
  )
}

export default JobDemandMap
