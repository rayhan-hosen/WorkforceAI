import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { saveUserData } from '../utils/storageUtils'

function ProfileEditor() {
  const navigate = useNavigate()
  const { language } = useLanguage()
  const [userData, setUserData] = useState(null)
  const [formData, setFormData] = useState({
    description_bn: '',
    description_en: '',
    seoTitle_bn: '',
    seoTitle_en: '',
    seoDescription_bn: '',
    seoDescription_en: '',
    seoKeywords_bn: '',
    seoKeywords_en: '',
    hourlyRate: '',
    available: true,
    location: ''
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const storedData = localStorage.getItem('userData')
    if (!storedData) {
      navigate('/register')
      return
    }
    const user = JSON.parse(storedData)
    setUserData(user)
    
    // Load existing profile data
    setFormData({
      description_bn: user.description_bn || '',
      description_en: user.description_en || '',
      seoTitle_bn: user.seoTitle_bn || `${user.name} - ${user.profession}`,
      seoTitle_en: user.seoTitle_en || `${user.name} - ${user.profession}`,
      seoDescription_bn: user.seoDescription_bn || '',
      seoDescription_en: user.seoDescription_en || '',
      seoKeywords_bn: user.seoKeywords_bn || `${user.profession}, ${user.name}`,
      seoKeywords_en: user.seoKeywords_en || `${user.profession}, ${user.name}`,
      hourlyRate: user.hourlyRate || '',
      available: user.available !== undefined ? user.available : true,
      location: user.location || ''
    })
  }, [navigate])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setSaving(true)
    
    // Update user data with profile information
    const updatedUserData = {
      ...userData,
      ...formData,
      lastUpdated: new Date().toISOString()
    }
    
    const saved = saveUserData(updatedUserData)
    if (!saved) {
      alert(language === 'bn' ? 'ডেটা সেভ করতে ব্যর্থ হয়েছে' : 'Failed to save data')
      setSaving(false)
      return
    }
    
    setSaving(false)
    setSaved(true)
    
    setTimeout(() => {
      setSaved(false)
      navigate('/marketplace')
    }, 2000)
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-blue-100">
        <div className="text-gray-600 text-xl">Loading...</div>
      </div>
    )
  }

  const translations = {
    bn: {
      title: 'প্রোফাইল সম্পাদনা',
      subtitle: 'আপনার প্রোফাইল সম্পাদনা করুন যাতে হায়ারাররা আপনাকে সহজে খুঁজে পায়',
      description: 'বর্ণনা',
      descriptionPlaceholder_bn: 'আপনার সম্পর্কে লিখুন... (বাংলা)',
      descriptionPlaceholder_en: 'আপনার সম্পর্কে লিখুন... (English)',
      seoTitle: 'SEO শিরোনাম',
      seoTitlePlaceholder_bn: 'প্রোফাইল শিরোনাম (বাংলা)',
      seoTitlePlaceholder_en: 'প্রোফাইল শিরোনাম (English)',
      seoDescription: 'SEO বর্ণনা',
      seoDescriptionPlaceholder_bn: 'সংক্ষিপ্ত বর্ণনা যা সার্চে দেখা যাবে (বাংলা)',
      seoDescriptionPlaceholder_en: 'সংক্ষিপ্ত বর্ণনা যা সার্চে দেখা যাবে (English)',
      seoKeywords: 'SEO কীওয়ার্ড',
      seoKeywordsPlaceholder_bn: 'কমা দ্বারা আলাদা কীওয়ার্ড (বাংলা)',
      seoKeywordsPlaceholder_en: 'কমা দ্বারা আলাদা কীওয়ার্ড (English)',
      hourlyRate: 'প্রতি ঘন্টার মূল্য (৳)',
      available: 'সার্ভিস পাওয়া যায়',
      location: 'অবস্থান',
      save: 'সেভ করুন',
      saving: 'সেভ হচ্ছে...',
      saved: 'সফলভাবে সেভ হয়েছে!',
      cancel: 'বাতিল করুন'
    },
    en: {
      title: 'Edit Profile',
      subtitle: 'Edit your profile to help hirers find you easily',
      description: 'Description',
      descriptionPlaceholder_bn: 'Write about yourself... (Bengali)',
      descriptionPlaceholder_en: 'Write about yourself... (English)',
      seoTitle: 'SEO Title',
      seoTitlePlaceholder_bn: 'Profile title (Bengali)',
      seoTitlePlaceholder_en: 'Profile title (English)',
      seoDescription: 'SEO Description',
      seoDescriptionPlaceholder_bn: 'Brief description visible in search (Bengali)',
      seoDescriptionPlaceholder_en: 'Brief description visible in search (English)',
      seoKeywords: 'SEO Keywords',
      seoKeywordsPlaceholder_bn: 'Keywords separated by commas (Bengali)',
      seoKeywordsPlaceholder_en: 'Keywords separated by commas (English)',
      hourlyRate: 'Hourly Rate (৳)',
      available: 'Service Available',
      location: 'Location',
      save: 'Save Profile',
      saving: 'Saving...',
      saved: 'Profile saved successfully!',
      cancel: 'Cancel'
    }
  }

  const t = translations[language]

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{t.title}</h1>
          <p className="text-gray-600">{t.subtitle}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 space-y-6">
          {/* Description */}
          <div>
            <label className="block text-lg font-semibold text-gray-800 mb-3">
              {t.description}
            </label>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  বাংলা (Bengali)
                </label>
                <textarea
                  name="description_bn"
                  value={formData.description_bn}
                  onChange={handleChange}
                  placeholder={t.descriptionPlaceholder_bn}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  English
                </label>
                <textarea
                  name="description_en"
                  value={formData.description_en}
                  onChange={handleChange}
                  placeholder={t.descriptionPlaceholder_en}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
          </div>

          {/* SEO Title */}
          <div>
            <label className="block text-lg font-semibold text-gray-800 mb-3">
              {t.seoTitle}
            </label>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  বাংলা (Bengali)
                </label>
                <input
                  type="text"
                  name="seoTitle_bn"
                  value={formData.seoTitle_bn}
                  onChange={handleChange}
                  placeholder={t.seoTitlePlaceholder_bn}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  English
                </label>
                <input
                  type="text"
                  name="seoTitle_en"
                  value={formData.seoTitle_en}
                  onChange={handleChange}
                  placeholder={t.seoTitlePlaceholder_en}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
          </div>

          {/* SEO Description */}
          <div>
            <label className="block text-lg font-semibold text-gray-800 mb-3">
              {t.seoDescription}
            </label>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  বাংলা (Bengali)
                </label>
                <textarea
                  name="seoDescription_bn"
                  value={formData.seoDescription_bn}
                  onChange={handleChange}
                  placeholder={t.seoDescriptionPlaceholder_bn}
                  rows={3}
                  maxLength={160}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.seoDescription_bn.length}/160 {language === 'bn' ? 'অক্ষর' : 'characters'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  English
                </label>
                <textarea
                  name="seoDescription_en"
                  value={formData.seoDescription_en}
                  onChange={handleChange}
                  placeholder={t.seoDescriptionPlaceholder_en}
                  rows={3}
                  maxLength={160}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.seoDescription_en.length}/160 {language === 'bn' ? 'অক্ষর' : 'characters'}
                </p>
              </div>
            </div>
          </div>

          {/* SEO Keywords */}
          <div>
            <label className="block text-lg font-semibold text-gray-800 mb-3">
              {t.seoKeywords}
            </label>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  বাংলা (Bengali)
                </label>
                <input
                  type="text"
                  name="seoKeywords_bn"
                  value={formData.seoKeywords_bn}
                  onChange={handleChange}
                  placeholder={t.seoKeywordsPlaceholder_bn}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  English
                </label>
                <input
                  type="text"
                  name="seoKeywords_en"
                  value={formData.seoKeywords_en}
                  onChange={handleChange}
                  placeholder={t.seoKeywordsPlaceholder_en}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.hourlyRate}
              </label>
              <input
                type="number"
                name="hourlyRate"
                value={formData.hourlyRate}
                onChange={handleChange}
                placeholder="500"
                min="0"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.location}
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder={language === 'bn' ? 'ঢাকা, বাংলাদেশ' : 'Dhaka, Bangladesh'}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Available Toggle */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              name="available"
              checked={formData.available}
              onChange={handleChange}
              className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label className="text-sm font-medium text-gray-700">
              {t.available}
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={saving}
              className={`flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-800 transition-all ${
                saving ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {saving ? t.saving : saved ? t.saved : t.save}
            </button>
            <button
              type="button"
              onClick={() => navigate('/marketplace')}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              {t.cancel}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProfileEditor

