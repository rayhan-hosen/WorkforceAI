/**
 * Utility functions for localStorage persistence
 */

/**
 * Saves user data to localStorage with persistence tracking
 * @param {Object} userData - User data object to save
 * @returns {boolean} - Success status
 */
export function saveUserData(userData) {
  try {
    const dataToSave = {
      ...userData,
      lastUpdated: new Date().toISOString()
    }
    
    localStorage.setItem('userData', JSON.stringify(dataToSave))
    localStorage.setItem('userDataStored', 'true')
    localStorage.setItem('userDataTimestamp', Date.now().toString())
    
    // Refresh storage periodically to keep it active
    if (typeof window !== 'undefined' && window.addEventListener) {
      // Listen for storage events to detect clearing
      window.addEventListener('storage', handleStorageChange)
      
      // Periodically refresh timestamp (every 24 hours)
      const lastRefresh = localStorage.getItem('lastStorageRefresh')
      const now = Date.now()
      const oneDay = 24 * 60 * 60 * 1000
      
      if (!lastRefresh || (now - parseInt(lastRefresh)) > oneDay) {
        localStorage.setItem('lastStorageRefresh', now.toString())
        // Refresh all user data
        localStorage.setItem('userDataTimestamp', now.toString())
      }
    }
    
    return true
  } catch (error) {
    console.error('Error saving user data:', error)
    if (error.name === 'QuotaExceededError') {
      // Try to clean up old data
      try {
        const keysToKeep = ['userData', 'userDataStored', 'userDataTimestamp', 'languageSelected']
        const allKeys = Object.keys(localStorage)
        allKeys.forEach(key => {
          if (!keysToKeep.includes(key) && key.startsWith('learningProgress_')) {
            // Keep learning progress, but clean other temporary data
          } else if (!keysToKeep.includes(key) && !key.startsWith('learningProgress_')) {
            localStorage.removeItem(key)
          }
        })
        // Try again
        localStorage.setItem('userData', JSON.stringify(dataToSave))
        localStorage.setItem('userDataStored', 'true')
        localStorage.setItem('userDataTimestamp', Date.now().toString())
        return true
      } catch (retryError) {
        console.error('Retry failed:', retryError)
        return false
      }
    }
    return false
  }
}

/**
 * Gets user data from localStorage
 * @returns {Object|null} - User data or null
 */
export function getUserData() {
  try {
    const userData = localStorage.getItem('userData')
    if (!userData) return null
    
    const parsed = JSON.parse(userData)
    
    // Verify data integrity
    if (!parsed.name || !parsed.phone) {
      console.warn('User data appears corrupted')
      return null
    }
    
    // Refresh timestamp to keep data active
    localStorage.setItem('userDataTimestamp', Date.now().toString())
    
    return parsed
  } catch (error) {
    console.error('Error reading user data:', error)
    return null
  }
}

/**
 * Handles storage change events
 */
function handleStorageChange(e) {
  if (e.key === 'userData' && !e.newValue) {
    console.warn('User data was cleared from localStorage')
    // Could trigger a re-login or data recovery flow
  }
}

/**
 * Checks if user data exists and is valid
 * @returns {boolean}
 */
export function hasUserData() {
  const userData = getUserData()
  const stored = localStorage.getItem('userDataStored')
  return userData !== null && stored === 'true'
}

/**
 * Refreshes user data timestamp to keep it active
 */
export function refreshUserDataTimestamp() {
  try {
    const userData = getUserData()
    if (userData) {
      saveUserData(userData)
    }
  } catch (error) {
    console.error('Error refreshing timestamp:', error)
  }
}

// Auto-refresh on page load and every hour
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    refreshUserDataTimestamp()
    
    // Refresh every hour
    setInterval(() => {
      refreshUserDataTimestamp()
    }, 60 * 60 * 1000) // 1 hour
  })
}

