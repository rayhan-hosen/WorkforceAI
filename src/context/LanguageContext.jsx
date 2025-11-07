import { createContext, useContext, useState, useEffect } from 'react'

const LanguageContext = createContext()

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    // Check if language has been selected
    const savedLanguage = localStorage.getItem('language')
    const languageSelected = localStorage.getItem('languageSelected')
    
    if (languageSelected && savedLanguage) {
      return savedLanguage
    }
    return 'bn' // Default to Bengali
  })

  useEffect(() => {
    // Load saved language preference from localStorage
    const savedLanguage = localStorage.getItem('language')
    const languageSelected = localStorage.getItem('languageSelected')
    
    if (languageSelected && savedLanguage) {
      setLanguage(savedLanguage)
    }
  }, [])

  const toggleLanguage = () => {
    const newLanguage = language === 'bn' ? 'en' : 'bn'
    setLanguage(newLanguage)
    localStorage.setItem('language', newLanguage)
    localStorage.setItem('languageSelected', 'true')
  }

  const setLanguageDirectly = (lang) => {
    setLanguage(lang)
    localStorage.setItem('language', lang)
    localStorage.setItem('languageSelected', 'true')
  }

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, setLanguage: setLanguageDirectly }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}

