/**
 * Detects if input text is in Bangla or English
 * @param {string} text - Input text to detect
 * @returns {string} - 'bn' for Bangla, 'en' for English
 */
export function detectLanguage(text) {
  if (!text || text.trim().length === 0) {
    return 'en' // Default to English for empty input
  }

  // Bangla Unicode range: 0980-09FF
  const banglaRegex = /[\u0980-\u09FF]/
  
  // Check if text contains Bangla characters
  if (banglaRegex.test(text)) {
    return 'bn'
  }
  
  return 'en'
}

/**
 * Gets response type based on keywords in the message
 * @param {string} message - User message
 * @param {string} language - Language code ('bn' or 'en')
 * @param {object} keywords - Keywords object from assistantData
 * @returns {string} - Response type key
 */
export function getResponseType(message, language, keywords) {
  const lowerMessage = message.toLowerCase()
  const langKeywords = keywords[language] || keywords.en

  // Check for job-related keywords
  if (langKeywords.job.some(keyword => lowerMessage.includes(keyword))) {
    if (lowerMessage.includes('match') || lowerMessage.includes('ম্যাচ')) {
      return 'jobMatch'
    }
    return 'jobAdvice'
  }

  // Check for skill-related keywords
  if (langKeywords.skill.some(keyword => lowerMessage.includes(keyword))) {
    if (lowerMessage.includes('next') || lowerMessage.includes('পরবর্তী')) {
      return 'learningPath'
    }
    return 'skillSuggestion'
  }

  // Check for earning-related keywords
  if (langKeywords.earning.some(keyword => lowerMessage.includes(keyword))) {
    return 'earningInsight'
  }

  // Check for demand-related keywords
  if (langKeywords.demand.some(keyword => lowerMessage.includes(keyword))) {
    return 'demandInfo'
  }

  // Check for help-related keywords
  if (langKeywords.help.some(keyword => lowerMessage.includes(keyword))) {
    return 'help'
  }

  return 'default'
}

