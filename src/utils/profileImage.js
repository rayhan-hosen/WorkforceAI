/**
 * Get profile image URL from userData
 * Handles both blob URLs and file paths
 */
export function getProfileImageUrl(userData) {
  if (!userData) return null
  
  // If profileImagePath exists, use it (for server-stored images)
  if (userData.profileImagePath) {
    // In production, this would be the server path
    // For now, check if profileImage exists (blob URL)
    return userData.profileImage || userData.profileImagePath
  }
  
  // Fallback to profileImage (blob URL or direct URL)
  return userData.profileImage || null
}

/**
 * Get profile image with fallback to initial
 */
export function getProfileImage(userData, size = 16) {
  const imageUrl = getProfileImageUrl(userData)
  
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt="Profile"
        className={`w-${size} h-${size} rounded-full object-cover border-2 border-purple-500 shadow-lg`}
      />
    )
  }
  
  return (
    <div className={`w-${size} h-${size} rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center shadow-lg`}>
      <span className="text-white font-bold text-xl">
        {userData?.name?.charAt(0).toUpperCase() || 'U'}
      </span>
    </div>
  )
}

