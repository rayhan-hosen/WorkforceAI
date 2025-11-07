import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'

function NextSkills({ recommended, translations }) {
  const navigate = useNavigate()
  const { language } = useLanguage()

  return (
    <div className="shadow-lg rounded-2xl bg-white p-6 transition-all hover:shadow-2xl">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        {translations[language]?.nextSkills}
      </h3>
      <div className="space-y-4">
        {recommended.map((course, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 hover:shadow-md transition-all"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 mb-1">
                  {language === 'bn' ? course.course_bn : course.course_en}
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  {language === 'bn' ? course.description_bn : course.description_en}
                </p>
              </div>
              <div className="ml-4 text-right">
                <div className="text-sm text-gray-600 mb-1">
                  {translations[language]?.projectedEarning}
                </div>
                <div className="text-lg font-bold text-green-600">
                  +{course.predictedEarningBoost}
                </div>
              </div>
            </div>
            <button 
              onClick={() => navigate('/learning')}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-purple-900 transition-all transform hover:scale-[1.02]"
            >
              {translations[language]?.startCourse}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default NextSkills

