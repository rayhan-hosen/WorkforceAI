import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import TechCard from './TechCard'
import TechModal from './TechModal'

function Marketplace() {
  const navigate = useNavigate()
  const { language, toggleLanguage } = useLanguage()
  const [userData, setUserData] = useState(null)
  const [marketplaceData, setMarketplaceData] = useState(null)
  const [technicians, setTechnicians] = useState([])
  const [filteredTechnicians, setFilteredTechnicians] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedDistrict, setSelectedDistrict] = useState('all')
  const [minRating, setMinRating] = useState(0)
  const [selectedTechnician, setSelectedTechnician] = useState(null)

  useEffect(() => {
    // Marketplace is accessible to everyone, but check if user is logged in
    const storedData = localStorage.getItem('userData')
    if (storedData) {
      setUserData(JSON.parse(storedData))
    }

    // Load marketplace data and real user profiles
    fetch('/marketplaceData.json')
      .then(res => res.json())
      .then(marketplaceData => {
        setMarketplaceData(marketplaceData)
        
        // Load current user's profile if available
        const currentUser = localStorage.getItem('userData')
        const userProfiles = []
        
        if (currentUser) {
          const user = JSON.parse(currentUser)
          // Convert user data to technician format
          userProfiles.push({
            id: `user_${user.phone}`,
            name_bn: user.name,
            name_en: user.name,
            rating: 4.5, // Default rating
            aiMatch: 95, // High match for own profile
            available: user.available !== undefined ? user.available : true,
            district_bn: user.location || 'ঢাকা',
            district_en: user.location || 'Dhaka',
            category: user.profession || 'Electrician',
            skills_bn: [user.profession || 'Electrician'],
            skills_en: [user.profession || 'Electrician'],
            hourlyRate: user.hourlyRate || 500,
            bio_bn: user.description_bn || `${user.name} - ${user.profession || 'Professional'}`,
            bio_en: user.description_en || `${user.name} - ${user.profession || 'Professional'}`,
            completedJobs: 0,
            certificates: [],
            aiMatch_bn: 'আপনার প্রোফাইল',
            aiMatch_en: 'Your Profile',
            isUserProfile: true,
            profileImage: user.profileImage,
            profileImagePath: user.profileImagePath
          })
        }
        
        // Combine mock technicians with real user profiles
        const allTechnicians = [
          ...userProfiles,
          ...marketplaceData.technicians
        ]
        
        // Sort by rating and AI match
        const sorted = allTechnicians.sort((a, b) => {
          const scoreA = (a.rating * 10) + a.aiMatch
          const scoreB = (b.rating * 10) + b.aiMatch
          return scoreB - scoreA
        })
        
        setTechnicians(sorted)
        setFilteredTechnicians(sorted)
        
        // Simulate AI finding delay
        setTimeout(() => {
          setLoading(false)
        }, 2000)
      })
      .catch(err => {
        console.error('Error loading marketplace data:', err)
        setLoading(false)
      })
  }, [navigate])

  // Filter technicians
  useEffect(() => {
    if (!technicians || technicians.length === 0) return

    let filtered = [...technicians]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(tech => {
        const name = language === 'bn' ? tech.name_bn : tech.name_en
        const district = language === 'bn' ? tech.district_bn : tech.district_en
        const searchLower = searchQuery.toLowerCase()
        return name.toLowerCase().includes(searchLower) ||
               district.toLowerCase().includes(searchLower) ||
               tech.category.toLowerCase().includes(searchLower)
      })
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(tech => tech.category === selectedCategory)
    }

    // District filter
    if (selectedDistrict !== 'all') {
      filtered = filtered.filter(tech => {
        const district = language === 'bn' ? tech.district_bn : tech.district_en
        return district === selectedDistrict
      })
    }

    // Rating filter
    if (minRating > 0) {
      filtered = filtered.filter(tech => tech.rating >= minRating)
    }

    setFilteredTechnicians(filtered)
  }, [searchQuery, selectedCategory, selectedDistrict, minRating, technicians, language])

  const getUniqueCategories = () => {
    if (!technicians || technicians.length === 0) return []
    return [...new Set(technicians.map(tech => tech.category))]
  }

  const getUniqueDistricts = () => {
    if (!technicians || technicians.length === 0) return []
    const districts = technicians.map(tech => language === 'bn' ? tech.district_bn : tech.district_en)
    return [...new Set(districts)]
  }

  const handleHireClick = (technician) => {
    if (!technician.available) return
    const message = language === 'bn' 
      ? '🎉 টেকনিশিয়ান সফলভাবে বুক করা হয়েছে (ডেমো)'
      : '🎉 Technician booked successfully (demo)'
    alert(message)
  }

  if (!marketplaceData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-blue-100">
        <div className="text-gray-600 text-xl">Loading...</div>
      </div>
    )
  }

  const translations = marketplaceData.translations

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100">
      {/* Header */}
      <div className="bg-white shadow-lg p-4 mb-6 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-indigo-700 flex items-center">
              <span className="mr-2">💼</span>
              {translations[language]?.title}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            {userData ? (
              <>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
                >
                  {language === 'bn' ? 'ড্যাশবোর্ড' : 'Dashboard'}
                </button>
                <button
                  onClick={() => navigate('/profile-edit')}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-lg hover:from-indigo-700 hover:to-purple-800 transition-colors font-medium text-sm"
                >
                  {language === 'bn' ? 'প্রোফাইল সম্পাদনা' : 'Edit Profile'}
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate('/register')}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-lg hover:from-indigo-700 hover:to-purple-800 transition-colors font-medium text-sm"
              >
                {language === 'bn' ? 'একাউন্ট তৈরি করুন' : 'Create Account'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Loading State */}
        {loading && (
          <div className="text-center py-12 mb-6">
            <div className="mb-6">
              <div className="relative inline-block">
                <div className="w-20 h-20 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl">🔍</span>
                </div>
              </div>
            </div>
            <p className="text-xl text-indigo-500 animate-pulse font-semibold">
              {translations[language]?.finding}
            </p>
          </div>
        )}

        {/* Search and Filter Bar */}
        {!loading && (
          <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
            <div className="space-y-4">
              {/* Search */}
              <div>
                <input
                  type="text"
                  placeholder={translations[language]?.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {translations[language]?.category}
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  >
                    <option value="all">{translations[language]?.allCategories}</option>
                    {getUniqueCategories().map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* District Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {translations[language]?.location}
                  </label>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  >
                    <option value="all">{translations[language]?.allDistricts}</option>
                    {getUniqueDistricts().map(district => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </select>
                </div>

                {/* Rating Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {translations[language]?.minRating} ({minRating.toFixed(1)} ⭐)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.1"
                    value={minRating}
                    onChange={(e) => setMinRating(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Count */}
        {!loading && (
          <div className="mb-4">
            <p className="text-gray-600">
              {language === 'bn' 
                ? `${filteredTechnicians.length} জন টেকনিশিয়ান পাওয়া গেছে`
                : `Found ${filteredTechnicians.length} technicians`}
            </p>
          </div>
        )}

        {/* Technician Cards Grid */}
        {!loading && (
          <>
            {filteredTechnicians.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <p className="text-gray-600 text-lg">
                  {language === 'bn' ? 'কোন টেকনিশিয়ান পাওয়া যায়নি' : 'No technicians found'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTechnicians.map(technician => (
                  <TechCard
                    key={technician.id}
                    technician={technician}
                    translations={translations}
                    onCardClick={setSelectedTechnician}
                    onHireClick={handleHireClick}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Technician Profile Modal */}
      {selectedTechnician && (
        <TechModal
          technician={selectedTechnician}
          onClose={() => setSelectedTechnician(null)}
          translations={translations}
        />
      )}
    </div>
  )
}

export default Marketplace

