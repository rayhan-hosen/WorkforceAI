import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { saveUserData } from '../utils/storageUtils'

function Register() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    profession: '',
    profileImage: null
  })

  const professions = ['Electrician', 'Plumber', 'AC Technician', 'Carpenter']

  const handleChange = (e) => {
    const { name, value, files } = e.target
    if (name === 'profileImage') {
      setFormData({ ...formData, [name]: files[0] })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Convert image to base64 for permanent storage
    const convertImageToBase64 = (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
    }
    
    let profileImageBase64 = null
    let profileImagePath = null
    
    // Handle image upload - convert to base64 for permanent storage
    if (formData.profileImage) {
      try {
        // Convert to base64 for permanent storage in localStorage
        profileImageBase64 = await convertImageToBase64(formData.profileImage)
        
        // Create a folder path structure (for future server upload)
        const timestamp = Date.now()
        const fileName = `profile_${timestamp}_${formData.profileImage.name}`
        profileImagePath = `/uploads/profiles/${fileName}`
        
        // Save to localStorage with base64 image (permanent storage)
        const userData = {
          name: formData.name,
          phone: formData.phone,
          password: formData.password, // In production, hash this
          profession: formData.profession,
          profileImage: profileImageBase64, // Base64 for permanent storage
          profileImagePath: profileImagePath, // Store the folder path
          registeredAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          // Profile fields for marketplace
          description_bn: '',
          description_en: '',
          seoTitle_bn: `${formData.name} - ${formData.profession}`,
          seoTitle_en: `${formData.name} - ${formData.profession}`,
          seoDescription_bn: '',
          seoDescription_en: '',
          seoKeywords_bn: `${formData.profession}, ${formData.name}`,
          seoKeywords_en: `${formData.profession}, ${formData.name}`,
          hourlyRate: '',
          available: true,
          location: ''
        }
        
        // Store with explicit expiration handling
        const saved = saveUserData(userData)
        if (!saved) {
          alert('Failed to save user data. Please try again.')
          return
        }
        
        // Redirect to assessment for first-time users
        navigate('/assessment')
      } catch (error) {
        console.error('Error handling image:', error)
        // Fallback: save without image
        const userData = {
          ...formData,
          profileImage: null,
          profileImagePath: null,
          registeredAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          // Profile fields for marketplace
          description_bn: '',
          description_en: '',
          seoTitle_bn: `${formData.name} - ${formData.profession}`,
          seoTitle_en: `${formData.name} - ${formData.profession}`,
          seoDescription_bn: '',
          seoDescription_en: '',
          seoKeywords_bn: `${formData.profession}, ${formData.name}`,
          seoKeywords_en: `${formData.profession}, ${formData.name}`,
          hourlyRate: '',
          available: true,
          location: ''
        }
        const saved = saveUserData(userData)
        if (!saved) {
          alert('Failed to save user data. Please try again.')
          return
        }
        navigate('/assessment')
      }
    } else {
      // No image, save normally
      const userData = {
        ...formData,
        profileImage: null,
        profileImagePath: null,
        registeredAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        // Profile fields for marketplace
        description_bn: '',
        description_en: '',
        seoTitle_bn: `${formData.name} - ${formData.profession}`,
        seoTitle_en: `${formData.name} - ${formData.profession}`,
        seoDescription_bn: '',
        seoDescription_en: '',
        seoKeywords_bn: `${formData.profession}, ${formData.name}`,
        seoKeywords_en: `${formData.profession}, ${formData.name}`,
        hourlyRate: '',
        available: true,
        location: ''
      }
      const saved = saveUserData(userData)
      if (!saved) {
        alert('Failed to save user data. Please try again.')
        return
      }
      // Redirect to assessment for first-time users
      navigate('/assessment')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="w-full max-w-md">
        <div className="shadow-xl rounded-2xl p-6 bg-white">
          <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">
            Welcome to ShebaWorkforceAI
          </h1>
          <p className="text-center text-gray-600 mb-6">
            Register to start your journey
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                placeholder="Enter your phone number"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                placeholder="Create a password"
              />
            </div>

            <div>
              <label htmlFor="profession" className="block text-sm font-medium text-gray-700 mb-1">
                Profession
              </label>
              <select
                id="profession"
                name="profession"
                required
                value={formData.profession}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              >
                <option value="">Select your profession</option>
                {professions.map((prof) => (
                  <option key={prof} value={prof.toLowerCase().replace(/\s+/g, '-')}>
                    {prof}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="profileImage" className="block text-sm font-medium text-gray-700 mb-1">
                Profile Image
              </label>
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {formData.profileImage ? (
                    <img
                      src={URL.createObjectURL(formData.profileImage)}
                      alt="Profile preview"
                      className="h-16 w-16 rounded-full object-cover border-2 border-purple-500"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                      <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>
                <label className="flex-1 cursor-pointer">
                  <input
                    type="file"
                    id="profileImage"
                    name="profileImage"
                    accept="image/*"
                    onChange={handleChange}
                    className="hidden"
                  />
                  <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors inline-block">
                    {formData.profileImage ? 'Change Image' : 'Upload Image'}
                  </span>
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Image will be saved to uploads/profiles folder
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-purple-900 transition-all transform hover:scale-[1.02] shadow-lg"
            >
              Register
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Register
