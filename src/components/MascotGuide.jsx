import { useLanguage } from '../context/LanguageContext'

function MascotGuide({ currentLevel, translations }) {
  const { language } = useLanguage()

  if (!currentLevel || currentLevel.completed) return null

  const messages = {
    bn: {
      start: "চলুন শেখা শুরু করি! প্রথম লেভেলটি ক্লিক করুন।",
      progress: "চমৎকার! আপনি এগিয়ে যাচ্ছেন!",
      almost: "আর একটু! আপনি এটা করতে পারবেন!"
    },
    en: {
      start: "Let's start learning! Click on the first level.",
      progress: "Great job! You're making progress!",
      almost: "Almost there! You can do it!"
    }
  }

  const getMessage = () => {
    const completed = currentLevel.modules.filter(m => m.completed).length
    const total = currentLevel.modules.length
    const progress = completed / total

    if (progress === 0) return messages[language].start
    if (progress < 0.5) return messages[language].progress
    return messages[language].almost
  }

  return null
}

export default MascotGuide

