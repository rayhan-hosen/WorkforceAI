import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import GroupCard from './GroupCard'
import MentorCard from './MentorCard'
import ChallengeCard from './ChallengeCard'

function Community() {
  const navigate = useNavigate()
  const { language, toggleLanguage } = useLanguage()
  const [userData, setUserData] = useState(null)
  const [communityData, setCommunityData] = useState(null)
  const [groups, setGroups] = useState([])
  const [mentors, setMentors] = useState([])
  const [challenges, setChallenges] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('groups')
  const [selectedGroup, setSelectedGroup] = useState(null)

  useEffect(() => {
    const storedData = localStorage.getItem('userData')
    if (!storedData) {
      navigate('/register')
      return
    }
    setUserData(JSON.parse(storedData))

    // Load community data
    fetch('/communityData.json')
      .then(res => res.json())
      .then(data => {
        setCommunityData(data)
        setGroups(data.groups)
        setMentors(data.mentors)
        setChallenges(data.challenges)
        // Simulate loading delay
        setTimeout(() => {
          setLoading(false)
        }, 1500)
      })
      .catch(err => {
        console.error('Error loading community data:', err)
        setLoading(false)
      })
  }, [navigate])

  const handleViewFeed = (group) => {
    setSelectedGroup(group)
    // In a real app, this would navigate to a group feed page
    // For demo, we'll show an alert
    const message = language === 'bn' 
      ? `${group.name_bn} - ফিড দেখুন (ডেমো)`
      : `${group.name_en} - View Feed (demo)`
    alert(message)
  }

  if (!userData || !communityData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-50 to-blue-100">
        <div className="text-gray-600 text-xl">Loading...</div>
      </div>
    )
  }

  const translations = communityData.translations

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-blue-100">
      {/* Header */}
      

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Tabs */}
        <div className="bg-white rounded-full shadow-lg p-2 mb-6 flex justify-center gap-2">
          <button
            onClick={() => setActiveTab('groups')}
            className={`px-6 py-2 rounded-full font-semibold transition-all ${
              activeTab === 'groups'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-700 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className="mr-2">🧰</span>
            {translations[language]?.groups}
          </button>
          <button
            onClick={() => setActiveTab('mentors')}
            className={`px-6 py-2 rounded-full font-semibold transition-all ${
              activeTab === 'mentors'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-700 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className="mr-2">🧑‍🏫</span>
            {translations[language]?.mentors}
          </button>
          <button
            onClick={() => setActiveTab('challenges')}
            className={`px-6 py-2 rounded-full font-semibold transition-all ${
              activeTab === 'challenges'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-700 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className="mr-2">🔥</span>
            {translations[language]?.challenges}
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="mb-6">
              <div className="relative inline-block">
                <div className="w-20 h-20 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl">👥</span>
                </div>
              </div>
            </div>
            <p className="text-xl text-indigo-500 animate-pulse font-semibold">
              {language === 'bn' ? 'কমিউনিটি লোড হচ্ছে...' : 'Loading community...'}
            </p>
          </div>
        )}

        {/* Groups Tab */}
        {!loading && activeTab === 'groups' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map(group => (
              <GroupCard
                key={group.id}
                group={group}
                translations={translations}
                onViewFeed={handleViewFeed}
              />
            ))}
          </div>
        )}

        {/* Mentors Tab */}
        {!loading && activeTab === 'mentors' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentors.map(mentor => (
              <MentorCard
                key={mentor.id}
                mentor={mentor}
                translations={translations}
              />
            ))}
          </div>
        )}

        {/* Challenges Tab */}
        {!loading && activeTab === 'challenges' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {challenges.map(challenge => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                translations={translations}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Community

