import { useLanguage } from '../context/LanguageContext'

function CertificateModal({ level, userData, isOpen, onClose, onDownload, translations }) {
  const { language } = useLanguage()

  if (!isOpen || !level) return null

  const generateCertificate = () => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      // Portrait orientation - A4 size (8.5x11 inches at 96 DPI)
      canvas.width = 816
      canvas.height = 1056
      const ctx = canvas.getContext('2d')
      
      // Elegant background gradient (light blue/purple → darker purple)
      const bgGradient = ctx.createLinearGradient(0, 0, 816, 1056)
      bgGradient.addColorStop(0, '#e0f2fe') // Light blue
      bgGradient.addColorStop(0.5, '#ddd6fe') // Light purple
      bgGradient.addColorStop(1, '#c4b5fd') // Darker purple
      ctx.fillStyle = bgGradient
      ctx.fillRect(0, 0, 816, 1056)
      
      // Subtle white sparkles across background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
      for (let i = 0; i < 30; i++) {
        const x = Math.random() * 816
        const y = Math.random() * 1056
        const size = 1 + Math.random() * 2
        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fill()
      }
      
      // Double border (outer purple, inner gold)
      ctx.strokeStyle = '#8b5cf6'
      ctx.lineWidth = 3
      ctx.strokeRect(50, 50, 716, 956)
      
      ctx.strokeStyle = '#fbbf24'
      ctx.lineWidth = 2
      ctx.strokeRect(60, 60, 696, 936)
      
      // Title - "ShebaWorkforce Certificate of Completion"
      ctx.fillStyle = '#1e293b'
      ctx.font = 'bold 36px "Inter", sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('ShebaWorkforce', 408, 140)
      
      ctx.fillStyle = '#8b5cf6'
      ctx.font = 'bold 48px "Inter", sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('Certificate of Completion', 408, 200)
      
      // "Awarded to" text
      ctx.fillStyle = '#1e293b'
      ctx.font = '28px "Inter", sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('Awarded to', 408, 280)
      
      // User Image - try profileImage first, then profileImagePath
      const imageUrl = userData?.profileImage || userData?.profileImagePath
      if (imageUrl) {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
          // Draw circular profile image
          ctx.save()
          ctx.beginPath()
          ctx.arc(408, 360, 50, 0, Math.PI * 2)
          ctx.clip()
          ctx.drawImage(img, 358, 310, 100, 100)
          ctx.restore()
          
          // Border around image
          ctx.strokeStyle = '#8b5cf6'
          ctx.lineWidth = 3
          ctx.beginPath()
          ctx.arc(408, 360, 50, 0, Math.PI * 2)
          ctx.stroke()
          
          // User Name - Large and prominent
          if (userData?.name) {
            ctx.fillStyle = '#1e293b'
            ctx.font = 'bold 56px "Georgia", serif'
            ctx.textAlign = 'center'
            ctx.fillText(userData.name, 408, 460)
          }
          
          // Contact information
          if (userData?.phone) {
            ctx.fillStyle = '#64748b'
            ctx.font = '24px "Inter", sans-serif'
            ctx.textAlign = 'center'
            ctx.fillText(userData.phone, 408, 500)
          } else if (userData?.email) {
            ctx.fillStyle = '#64748b'
            ctx.font = '24px "Inter", sans-serif'
            ctx.textAlign = 'center'
            ctx.fillText(userData.email, 408, 500)
          }
          
          // Course info text
          ctx.fillStyle = '#1e293b'
          ctx.font = '28px "Inter", sans-serif'
          ctx.textAlign = 'center'
          const levelText = level.name_en || level.name_bn
          ctx.fillText(`for successfully completing Level ${level.id}`, 408, 560)
          
          // Bottom section
          drawBottomSection(ctx, language, userData)
          
          resolve(canvas)
        }
        img.onerror = () => {
          // If image fails to load, continue without image
          drawTextOnly(ctx)
          resolve(canvas)
        }
        img.src = imageUrl
      } else {
        drawTextOnly(ctx)
        resolve(canvas)
      }
      
      function drawTextOnly(ctx) {
        // User Name - Large and prominent
        if (userData?.name) {
          ctx.fillStyle = '#1e293b'
          ctx.font = 'bold 56px "Georgia", serif'
          ctx.textAlign = 'center'
          ctx.fillText(userData.name, 408, 360)
        }
        
        // Contact information
        if (userData?.phone) {
          ctx.fillStyle = '#64748b'
          ctx.font = '24px "Inter", sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText(userData.phone, 408, 400)
        } else if (userData?.email) {
          ctx.fillStyle = '#64748b'
          ctx.font = '24px "Inter", sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText(userData.email, 408, 400)
        }
        
        // Course info text
        ctx.fillStyle = '#1e293b'
        ctx.font = '28px "Inter", sans-serif'
        ctx.textAlign = 'center'
        const levelText = level.name_en || level.name_bn
        ctx.fillText(`for successfully completing Level ${level.id}`, 408, 460)
        
        // Bottom section
        drawBottomSection(ctx, language, userData)
        
        resolve(canvas)
      }
      
      function drawBottomSection(ctx, lang, user) {
        const baseY = 960
        
        // Date section (bottom left) - "Date : [Download date]"
        const date = new Date().toLocaleDateString('en-US', {
          month: 'numeric',
          day: 'numeric',
          year: 'numeric'
        })
        const dateText = `Date : ${date}`
        
        ctx.fillStyle = '#1e293b'
        ctx.font = '24px "Inter", sans-serif'
        ctx.textAlign = 'left'
        ctx.fillText(dateText, 150, baseY)
        
        // Authorization section (bottom right)
        ctx.fillStyle = '#1e293b'
        ctx.font = 'italic 22px "Georgia", serif'
        ctx.textAlign = 'right'
        ctx.fillText('Authorized by', 666, baseY - 10)
        
        // Underline beneath "Authorized by"
        ctx.strokeStyle = '#1e293b'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(516, baseY - 5)
        ctx.lineTo(666, baseY - 5)
        ctx.stroke()
        
        // "Instructor signature" below the underline
        ctx.fillStyle = '#64748b'
        ctx.font = '18px "Inter", sans-serif'
        ctx.textAlign = 'right'
        ctx.fillText('Instructor signature', 666, baseY + 15)
        
        // Tagline - Centered at very bottom
        ctx.fillStyle = '#1e293b'
        ctx.font = '20px "Inter", sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(
          'Empowering Skilled Professionals for the Future of Work',
          408, 1030
        )
      }
    })
  }

  const handleDownload = async () => {
    const canvas = await generateCertificate()
    
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `certificate-level-${level.id}-${userData?.name?.replace(/\s+/g, '-') || 'user'}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }, 'image/png')
    
    // Only call onDownload callback if it exists, but don't trigger another download
    if (onDownload) {
      onDownload(level.id)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header - No animations */}
        <div className="relative overflow-hidden rounded-t-2xl">
          <div className="relative bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white p-6 text-center">
            <div className="text-5xl mb-2">🎉</div>
            <h2 className="text-2xl font-bold mb-2">
              {translations[language]?.congratulations || (language === 'bn' ? 'অভিনন্দন!' : 'Congratulations!')}
            </h2>
            <p className="text-base text-purple-100">
              {translations[language]?.levelCompleted || (language === 'bn' ? 'লেভেল সম্পন্ন হয়েছে!' : 'Level Completed!')}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              {language === 'bn' ? level.name_bn : level.name_en}
            </h3>
            {userData && (
              <div className="flex flex-col items-center space-y-3 mb-4">
                {(userData.profileImage || userData.profileImagePath) && (
                  <img
                    src={userData.profileImage || userData.profileImagePath}
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover border-3 border-purple-500 shadow-lg"
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  />
                )}
                <div>
                  <p className="text-gray-800 font-bold text-lg">{userData.name}</p>
                  {userData.phone && (
                    <p className="text-sm text-gray-600 mt-1">📞 {userData.phone}</p>
                  )}
                </div>
              </div>
            )}
            <p className="text-sm text-gray-500">
              {new Date().toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>

          <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border-2 border-purple-200">
            <p className="text-sm text-gray-700">
              {translations[language]?.allModulesCompleted || (language === 'bn' ? 'সমস্ত মডিউল সম্পন্ন হয়েছে' : 'All modules completed')}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleDownload}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg flex items-center justify-center space-x-2"
            >
              <span>📜</span>
              <span>{translations[language]?.certificate || (language === 'bn' ? 'সার্টিফিকেট ডাউনলোড' : 'Download Certificate')}</span>
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all"
            >
              {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CertificateModal
