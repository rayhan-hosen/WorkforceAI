import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import JobCard from './JobCard'
import JobDetailsModal from './JobDetailsModal'

function JobMatching() {
  const navigate = useNavigate()
  const { language, toggleLanguage } = useLanguage()
  const [userData, setUserData] = useState(null)
  const [jobData, setJobData] = useState(null)
  const [jobs, setJobs] = useState([])
  const [filteredJobs, setFilteredJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedJob, setSelectedJob] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedLocation, setSelectedLocation] = useState('all')
  const [sortBy, setSortBy] = useState('match') // 'match', 'salary', 'distance'
  const [salaryRange, setSalaryRange] = useState({ min: 0, max: 100000 })
  const [userSkills, setUserSkills] = useState([])
  const [learningProgress, setLearningProgress] = useState(null)

  useEffect(() => {
    const storedData = localStorage.getItem('userData')
    if (!storedData) {
      navigate('/register')
      return
    }
    const user = JSON.parse(storedData)
    setUserData(user)

    // Load user's learning progress to calculate skills
    const professionKey = (user.profession || 'electrician').toLowerCase().replace(/\s+/g, '-')
    
    Promise.all([
      fetch('/learningData.json').then(res => res.json()),
      fetch('/jobMatchingData.json').then(res => res.json())
    ]).then(([learningData, jobData]) => {
      const professionLevels = learningData.professions?.[professionKey] || []
      const savedProgressKey = `learningProgress_${professionKey}`
      const savedProgress = localStorage.getItem(savedProgressKey)
      
      // Calculate completed skills
      let completedSkills = []
      if (savedProgress) {
        const progress = JSON.parse(savedProgress)
        professionLevels.forEach(level => {
          const savedLevel = progress.levels?.find(l => l.id === level.id)
          if (savedLevel && savedLevel.completed) {
            completedSkills.push(level.name_en || level.name_bn)
          } else if (savedLevel) {
            // Partially completed
            const completedModules = savedLevel.modules?.filter(m => m.completed).length || 0
            if (completedModules > 0) {
              completedSkills.push(`${level.name_en || level.name_bn} (${completedModules}/${level.modules.length})`)
            }
          }
        })
      }
      setUserSkills(completedSkills)
      setLearningProgress({ professionLevels, savedProgress })
      
      setJobData(jobData)
      
      // Load assessment result for earnings prediction
      const assessmentResult = JSON.parse(localStorage.getItem('assessmentResult') || 'null')
      const predictedEarnings = assessmentResult?.predictedEarningBoost 
        ? Math.round(20000 * (1 + assessmentResult.predictedEarningBoost / 100))
        : 25000

      // Enhance jobs with personalized matching
      const enhancedJobs = jobData.jobs.map(job => {
        const enhancedMatch = calculateEnhancedMatchScore(job, user, completedSkills, language, predictedEarnings)
        return {
          ...job,
          matchScore: enhancedMatch.score,
          matchReasons: enhancedMatch.reasons,
          skillsMatch: enhancedMatch.skillsMatch,
          missingSkills: enhancedMatch.missingSkills,
          personalizedReason: enhancedMatch.personalizedReason
        }
      })
      
      // Sort by matchScore (highest first), with profession matches prioritized
      const sortedJobs = enhancedJobs.sort((a, b) => {
        // First priority: Match score (highest first)
        if (b.matchScore !== a.matchScore) {
          return b.matchScore - a.matchScore
        }
        // Second priority: Profession match (if scores are equal, profession matches come first)
        const aProfessionMatch = a.matchReasons?.some(r => 
          r.includes('profession') || r.includes('পেশা')
        ) || false
        const bProfessionMatch = b.matchReasons?.some(r => 
          r.includes('profession') || r.includes('পেশা')
        ) || false
        if (aProfessionMatch && !bProfessionMatch) return -1
        if (!aProfessionMatch && bProfessionMatch) return 1
        // Third priority: Skills match count (more skills matched = better)
        const aSkillsCount = a.skillsMatch?.length || 0
        const bSkillsCount = b.skillsMatch?.length || 0
        if (bSkillsCount !== aSkillsCount) {
          return bSkillsCount - aSkillsCount
        }
        // Fourth priority: Salary (higher salary if all else equal)
        return (b.salary || 0) - (a.salary || 0)
      })
      setJobs(sortedJobs)
      setFilteredJobs(sortedJobs)
      
      // Simulate AI analysis delay
      setTimeout(() => {
        setLoading(false)
      }, 2000)
    }).catch(err => {
      console.error('Error loading data:', err)
      setLoading(false)
    })
  }, [navigate, language])

  // Enhanced match score calculation
  const calculateEnhancedMatchScore = (job, user, userSkills, lang, predictedEarnings) => {
    let score = job.matchScore || 50
    const reasons = []
    const skillsMatch = []
    const missingSkills = []

    // Check profession match - Strict matching logic (only related works)
    const userProfession = (user.profession || '').toLowerCase().replace(/\s+/g, '-')
    const jobCategory = (job.category || '').toLowerCase()
    const jobTitle = (lang === 'bn' ? job.title_bn : job.title_en || '').toLowerCase()
    const jobDescription = (lang === 'bn' ? job.description_bn : job.description_en || '').toLowerCase()
    
    // Strict profession matching keywords - only direct matches
    const professionKeywords = {
      'electrician': ['electrician', 'electrical', 'wiring', 'electrical work', 'electrical service', 'electrical repair'],
      'plumber': ['plumber', 'plumbing', 'pipe', 'water', 'plumbing service', 'plumbing repair'],
      'ac-technician': ['ac', 'air conditioning', 'cooling', 'refrigeration', 'ac service', 'ac repair', 'ac maintenance'],
      'carpenter': ['carpenter', 'carpentry', 'wood', 'furniture', 'carpentry work', 'woodwork'],
      'mechanic': ['mechanic', 'automotive', 'vehicle', 'repair', 'auto repair', 'car repair'],
      'painter': ['painter', 'painting', 'paint', 'painting work', 'wall painting']
    }
    
    const userProfessionKey = userProfession.replace(/\s+/g, '-')
    const keywords = professionKeywords[userProfessionKey] || []
    
    // Strict matching: job must contain profession keywords in category or title (not just description)
    // This ensures only directly related jobs get profession match bonus
    const professionMatch = keywords.length > 0 && keywords.some(keyword => {
      const categoryMatch = jobCategory.includes(keyword) || keyword.includes(jobCategory)
      const titleMatch = jobTitle.includes(keyword) || keyword.includes(jobTitle)
      // Only match if category or title contains the keyword (more strict)
      return categoryMatch || titleMatch
    })
    
    if (professionMatch) {
      score += 25 // Increased bonus for strict profession matches
      reasons.push(lang === 'bn' ? 'আপনার পেশার সাথে সরাসরি মিলে যায়' : 'Directly matches your profession')
    } else {
      // If profession doesn't match, reduce score significantly
      score -= 10
    }

    // Check skills match
    const jobSkills = job.skillsRequired || []
    jobSkills.forEach(skill => {
      const userHasSkill = userSkills.some(us => 
        us.toLowerCase().includes(skill.toLowerCase()) || 
        skill.toLowerCase().includes(us.toLowerCase())
      )
      if (userHasSkill) {
        score += 10
        skillsMatch.push(skill)
        reasons.push(lang === 'bn' 
          ? `আপনার ${skill} দক্ষতা আছে` 
          : `You have ${skill} skill`)
      } else {
        missingSkills.push(skill)
      }
    })

    // Check location preference (if user has location data)
    if (user.location && job.location_en) {
      if (user.location.toLowerCase() === job.location_en.toLowerCase()) {
        score += 5
        reasons.push(lang === 'bn' ? 'আপনার এলাকায় কাজ' : 'Job in your area')
      }
    }

    // Check salary expectation vs job salary
    if (job.salary) {
      const expectedSalary = predictedEarnings || 20000
      if (job.salary >= expectedSalary * 0.9) {
        score += 5
        reasons.push(lang === 'bn' ? 'আয় বৃদ্ধির সম্ভাবনা' : 'Potential income increase')
      }
    }

    // Cap score at 100
    score = Math.min(100, score)

    // Generate personalized reason
    const personalizedReason = generatePersonalizedReason(job, user, skillsMatch, missingSkills, reasons, lang)

    return {
      score,
      reasons,
      skillsMatch,
      missingSkills,
      personalizedReason
    }
  }

  const generatePersonalizedReason = (job, user, skillsMatch, missingSkills, reasons, lang) => {
    if (lang === 'bn') {
      if (skillsMatch.length > 0 && missingSkills.length === 0) {
        return `আপনার ${skillsMatch.join(', ')} দক্ষতা এই কাজের জন্য উপযুক্ত। ${reasons.slice(0, 2).join(' ')}।`
      } else if (skillsMatch.length > 0) {
        return `আপনার ${skillsMatch.join(', ')} দক্ষতা আছে। ${missingSkills.join(', ')} শিখতে হবে।`
      } else {
        return `এই কাজটি আপনার পেশার সাথে মিলে যায়। ${missingSkills.join(', ')} দক্ষতা শিখলে আরও ভালো ম্যাচ হবে।`
      }
    } else {
      if (skillsMatch.length > 0 && missingSkills.length === 0) {
        return `Your ${skillsMatch.join(', ')} skills are perfect for this job. ${reasons.slice(0, 2).join(' ')}.`
      } else if (skillsMatch.length > 0) {
        return `You have ${skillsMatch.join(', ')} skills. Need to learn ${missingSkills.join(', ')}.`
      } else {
        return `This job matches your profession. Learning ${missingSkills.join(', ')} will improve your match.`
      }
    }
  }

  // Filter and sort jobs
  useEffect(() => {
    if (!jobs || jobs.length === 0) return

    let filtered = [...jobs]

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(job => {
        const title = language === 'bn' ? job.title_bn : job.title_en
        const location = language === 'bn' ? job.location_bn : job.location_en
        const category = job.category || ''
        return title.toLowerCase().includes(searchQuery.toLowerCase()) ||
               location.toLowerCase().includes(searchQuery.toLowerCase()) ||
               category.toLowerCase().includes(searchQuery.toLowerCase())
      })
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(job => job.category === selectedCategory)
    }

    // Filter by location
    if (selectedLocation !== 'all') {
      filtered = filtered.filter(job => {
        const location = language === 'bn' ? job.location_bn : job.location_en
        return location === selectedLocation
      })
    }

    // Filter by salary range
    filtered = filtered.filter(job => {
      return job.salary >= salaryRange.min && job.salary <= salaryRange.max
    })

    // Sort jobs
    filtered.sort((a, b) => {
      if (sortBy === 'match') {
        // Primary sort: Match score (highest first)
        if (b.matchScore !== a.matchScore) {
          return b.matchScore - a.matchScore
        }
        // Secondary sort: Profession match priority
        const aProfessionMatch = a.matchReasons?.some(r => 
          r.includes('profession') || r.includes('পেশা')
        ) || false
        const bProfessionMatch = b.matchReasons?.some(r => 
          r.includes('profession') || r.includes('পেশা')
        ) || false
        if (aProfessionMatch && !bProfessionMatch) return -1
        if (!aProfessionMatch && bProfessionMatch) return 1
        // Tertiary sort: Skills match count
        const aSkillsCount = a.skillsMatch?.length || 0
        const bSkillsCount = b.skillsMatch?.length || 0
        if (bSkillsCount !== aSkillsCount) {
          return bSkillsCount - aSkillsCount
        }
        // Final sort: Salary
        return (b.salary || 0) - (a.salary || 0)
      } else if (sortBy === 'salary') {
        return b.salary - a.salary
      } else if (sortBy === 'distance') {
        const aDist = parseFloat(a.distance) || 999
        const bDist = parseFloat(b.distance) || 999
        return aDist - bDist
      }
      return 0
    })

    setFilteredJobs(filtered)
  }, [searchQuery, selectedCategory, selectedLocation, jobs, language, sortBy, salaryRange])

  const getUniqueCategories = () => {
    if (!jobs || jobs.length === 0) return []
    return [...new Set(jobs.map(job => job.category))]
  }

  const getUniqueLocations = () => {
    if (!jobs || jobs.length === 0) return []
    const locations = jobs.map(job => language === 'bn' ? job.location_bn : job.location_en)
    return [...new Set(locations)]
  }

  const getTopMatches = () => {
    return filteredJobs.filter(job => job.matchScore >= 85).slice(0, 3)
  }

  const getAverageSalary = () => {
    if (filteredJobs.length === 0) return 0
    const total = filteredJobs.reduce((sum, job) => sum + (job.salary || 0), 0)
    return Math.round(total / filteredJobs.length)
  }

  const getSkillsCoverage = () => {
    if (!userSkills || userSkills.length === 0 || filteredJobs.length === 0) return 0
    const allRequiredSkills = new Set()
    filteredJobs.forEach(job => {
      (job.skillsRequired || []).forEach(skill => allRequiredSkills.add(skill))
    })
    const matchedSkills = userSkills.filter(us => 
      Array.from(allRequiredSkills).some(rs => 
        us.toLowerCase().includes(rs.toLowerCase()) || 
        rs.toLowerCase().includes(us.toLowerCase())
      )
    )
    return allRequiredSkills.size > 0 
      ? Math.round((matchedSkills.length / allRequiredSkills.size) * 100)
      : 0
  }


  if (!userData || !jobData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-blue-100">
        <div className="text-gray-600 text-xl">Loading...</div>
      </div>
    )
  }

  const translations = jobData.translations

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50">

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Stats Overview */}
        {!loading && filteredJobs.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20">
              <div className="text-sm text-gray-600 mb-1">{language === 'bn' ? 'মোট চাকরি' : 'Total Jobs'}</div>
              <div className="text-2xl font-bold text-indigo-600">{filteredJobs.length}</div>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20">
              <div className="text-sm text-gray-600 mb-1">{language === 'bn' ? 'উচ্চ ম্যাচ' : 'High Match'}</div>
              <div className="text-2xl font-bold text-green-600">{filteredJobs.filter(j => j.matchScore >= 85).length}</div>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20">
              <div className="text-sm text-gray-600 mb-1">{language === 'bn' ? 'গড় বেতন' : 'Avg Salary'}</div>
              <div className="text-2xl font-bold text-blue-600">৳{getAverageSalary().toLocaleString()}</div>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20">
              <div className="text-sm text-gray-600 mb-1">{language === 'bn' ? 'দক্ষতা কভারেজ' : 'Skills Coverage'}</div>
              <div className="text-2xl font-bold text-purple-600">{getSkillsCoverage()}%</div>
            </div>
          </div>
        )}

        {/* Search and Filter Bar */}
        {!loading && (
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 mb-6 border border-white/20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'bn' ? 'অনুসন্ধান' : 'Search'}
                </label>
                <input
                  type="text"
                  placeholder={translations[language]?.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none shadow-sm"
                />
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {translations[language]?.category}
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none shadow-sm bg-white"
                >
                  <option value="all">{translations[language]?.allCategories}</option>
                  {getUniqueCategories().map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Location Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {translations[language]?.location}
                </label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none shadow-sm bg-white"
                >
                  <option value="all">{translations[language]?.allLocations}</option>
                  {getUniqueLocations().map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Advanced Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'bn' ? 'সাজান' : 'Sort By'}
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none shadow-sm bg-white"
                >
                  <option value="match">{language === 'bn' ? 'ম্যাচ স্কোর' : 'Match Score'}</option>
                  <option value="salary">{language === 'bn' ? 'বেতন' : 'Salary'}</option>
                  <option value="distance">{language === 'bn' ? 'দূরত্ব' : 'Distance'}</option>
                </select>
              </div>

              {/* Salary Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'bn' ? `বেতন: ৳${salaryRange.min.toLocaleString()} - ৳${salaryRange.max.toLocaleString()}` : `Salary: ৳${salaryRange.min.toLocaleString()} - ৳${salaryRange.max.toLocaleString()}`}
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="0"
                    max="100000"
                    step="5000"
                    value={salaryRange.max}
                    onChange={(e) => setSalaryRange({ ...salaryRange, max: parseInt(e.target.value) })}
                    className="flex-1"
                  />
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory('all')
                    setSelectedLocation('all')
                    setSortBy('match')
                    setSalaryRange({ min: 0, max: 100000 })
                  }}
                  className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  {language === 'bn' ? 'রিসেট করুন' : 'Reset Filters'}
                </button>
              </div>
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
                  <svg className="w-8 h-8 text-indigo-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
              </div>
            </div>
            <p className="text-xl text-indigo-500 animate-pulse font-semibold">
              {translations[language]?.analyzing}
            </p>
          </div>
        )}

        {/* Top Recommendations */}
        {!loading && getTopMatches().length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <span className="mr-2">⭐</span>
                {language === 'bn' ? 'শীর্ষ সুপারিশ' : 'Top Recommendations'}
              </h2>
              <span className="text-sm text-gray-500">
                {language === 'bn' ? '৯০%+ ম্যাচ' : '90%+ Match'}
              </span>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {getTopMatches().map(job => (
                <JobCard
                  key={job.id}
                  job={job}
                  translations={translations}
                  onCardClick={setSelectedJob}
                  isPremium={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Jobs */}
        {!loading && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                {translations[language]?.recommended} ({filteredJobs.length})
              </h2>
              <div className="text-sm text-gray-600">
                {language === 'bn' ? 'সব চাকরি দেখাচ্ছে' : 'Showing all jobs'}
              </div>
            </div>
            {filteredJobs.length === 0 ? (
              <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-12 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-gray-600 text-xl mb-2">
                  {language === 'bn' ? 'কোন কাজ পাওয়া যায়নি' : 'No jobs found'}
                </p>
                <p className="text-gray-500 text-sm">
                  {language === 'bn' ? 'ফিল্টার পরিবর্তন করুন বা নতুন চাকরির জন্য অপেক্ষা করুন' : 'Try changing filters or check back for new jobs'}
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredJobs.map(job => (
                  <JobCard
                    key={job.id}
                    job={job}
                    translations={translations}
                    onCardClick={setSelectedJob}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Job Details Modal */}
      {selectedJob && (
        <JobDetailsModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          translations={translations}
        />
      )}
    </div>
  )
}

export default JobMatching

