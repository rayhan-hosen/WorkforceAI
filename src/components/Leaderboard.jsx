import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import LeaderCard from './LeaderCard'
import ProfileModal from './ProfileModal'

function Leaderboard() {
  const navigate = useNavigate()
  const { language, toggleLanguage } = useLanguage()
  const [userData, setUserData] = useState(null)
  const [leaderboardData, setLeaderboardData] = useState(null)
  const [technicians, setTechnicians] = useState([])
  const [filteredTechnicians, setFilteredTechnicians] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedTechnician, setSelectedTechnician] = useState(null)

  useEffect(() => {
    const storedData = localStorage.getItem('userData')
    if (!storedData) {
      navigate('/register')
      return
    }
    setUserData(JSON.parse(storedData))

    // Load leaderboard data
    fetch('/leaderboardData.json')
      .then(res => res.json())
      .then(data => {
        setLeaderboardData(data)
        // Sort by points (already sorted, but ensure)
        const sorted = [...data.technicians].sort((a, b) => b.points - a.points)
        setTechnicians(sorted)
        setFilteredTechnicians(sorted)
        // Simulate loading delay
        setTimeout(() => {
          setLoading(false)
        }, 1000)
      })
      .catch(err => {
        console.error('Error loading leaderboard data:', err)
        setLoading(false)
      })
  }, [navigate])

  // Filter by category
  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredTechnicians(technicians)
    } else {
      setFilteredTechnicians(technicians.filter(t => t.category === selectedCategory))
    }
  }, [selectedCategory, technicians])

  const getUniqueCategories = () => {
    if (!technicians || technicians.length === 0) return []
    return [...new Set(technicians.map(t => t.category))]
  }

  const maxPoints = technicians.length > 0 ? Math.max(...technicians.map(t => t.points)) : 1000

  if (!userData || !leaderboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-indigo-100">
        <div className="text-gray-600 text-xl">Loading...</div>
      </div>
    )
  }

  const translations = leaderboardData.translations

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100">
      {/* Header */}
      

      {/* Top Banner */}
      <div className="max-w-7xl mx-auto p-6 mb-6">
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-2xl shadow-xl p-6 text-center">
          <div className="text-4xl mb-2">🏆</div>
          <h2 className="text-2xl font-bold mb-2">
            {translations[language]?.topPerformers}
          </h2>
          <p className="text-yellow-100">
            {language === 'bn' 
              ? 'আমাদের সহকর্মীদের দক্ষতা এবং অর্জন দেখুন' 
              : 'See our technicians skills and achievements'}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Filter Bar */}
        {!loading && (
          <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-semibold text-gray-700">
                {translations[language]?.category}:
              </span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              >
                <option value="all">{translations[language]?.allCategories}</option>
                {getUniqueCategories().map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="mb-6">
              <div className="relative inline-block">
                <div className="w-20 h-20 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl">🏅</span>
                </div>
              </div>
            </div>
            <p className="text-xl text-indigo-500 animate-pulse font-semibold">
              {translations[language]?.fetching}
            </p>
          </div>
        )}

        {/* Leaderboard Grid */}
        {!loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTechnicians.map(technician => (
              <LeaderCard
                key={technician.id}
                technician={technician}
                maxPoints={maxPoints}
                translations={translations}
                onCardClick={setSelectedTechnician}
              />
            ))}
          </div>
        )}

        {!loading && filteredTechnicians.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <p className="text-gray-600 text-lg">
              {language === 'bn' ? 'কোন কর্মী পাওয়া যায়নি' : 'No technicians found'}
            </p>
          </div>
        )}
      </div>

      {/* Profile Modal */}
      {selectedTechnician && (
        <ProfileModal
          technician={selectedTechnician}
          onClose={() => setSelectedTechnician(null)}
          translations={translations}
        />
      )}
    </div>
  )
}

export default Leaderboard

