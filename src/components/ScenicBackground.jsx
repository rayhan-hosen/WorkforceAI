function ScenicBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Sky Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-300 via-pink-200 to-yellow-200"></div>
      
      {/* Clouds - Multiple layers for parallax */}
      <div className="absolute top-10 left-10 w-32 h-20 bg-white/60 rounded-full blur-xl animate-float"></div>
      <div className="absolute top-20 right-20 w-40 h-24 bg-white/60 rounded-full blur-xl animate-float" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-40 left-1/3 w-36 h-22 bg-white/60 rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-60 right-1/4 w-44 h-28 bg-white/60 rounded-full blur-xl animate-float" style={{ animationDelay: '0.5s' }}></div>
      <div className="absolute top-80 left-2/3 w-38 h-24 bg-white/60 rounded-full blur-xl animate-float" style={{ animationDelay: '1.5s' }}></div>
      
      {/* Rolling Hills - Green gradient hills */}
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-green-400 via-green-300 to-green-200 rounded-t-full transform translate-y-1/2"></div>
      <div className="absolute bottom-0 left-1/4 right-0 h-48 bg-gradient-to-t from-emerald-400 via-emerald-300 to-emerald-200 rounded-t-full transform translate-y-1/2 opacity-80"></div>
      <div className="absolute bottom-0 left-2/3 right-0 h-56 bg-gradient-to-t from-lime-400 via-lime-300 to-lime-200 rounded-t-full transform translate-y-1/2 opacity-70"></div>
      
      {/* Small White Flowers */}
      {[...Array(20)].map((_, i) => {
        const x = (i * 5) % 100
        const y = 70 + (i * 3) % 20
        return (
          <div
            key={i}
            className="absolute bottom-0"
            style={{
              left: `${x}%`,
              bottom: `${y}px`,
              animationDelay: `${i * 0.3}s`
            }}
          >
            <div className="w-3 h-3 bg-white rounded-full shadow-sm animate-pulse"></div>
            <div className="absolute top-1 left-1 w-1 h-1 bg-white rounded-full"></div>
            <div className="absolute top-1 right-1 w-1 h-1 bg-white rounded-full"></div>
            <div className="absolute bottom-1 left-1 w-1 h-1 bg-white rounded-full"></div>
            <div className="absolute bottom-1 right-1 w-1 h-1 bg-white rounded-full"></div>
          </div>
        )
      })}
      
      {/* Candy-shaped Plants */}
      {[...Array(8)].map((_, i) => {
        const x = (i * 12.5) % 100
        const y = 60 + (i * 5) % 15
        const colors = [
          'from-pink-300 to-pink-400',
          'from-purple-300 to-purple-400',
          'from-yellow-300 to-yellow-400',
          'from-blue-300 to-blue-400'
        ]
        const color = colors[i % colors.length]
        return (
          <div
            key={i}
            className="absolute bottom-0 animate-float"
            style={{
              left: `${x}%`,
              bottom: `${y}px`,
              animationDelay: `${i * 0.4}s`
            }}
          >
            <div className={`w-6 h-6 bg-gradient-to-br ${color} rounded-full shadow-md`}></div>
            <div className="absolute top-2 left-1 w-2 h-2 bg-white/60 rounded-full"></div>
          </div>
        )
      })}
      
      {/* Floating Sparkle Particles */}
      {[...Array(30)].map((_, i) => {
        const x = Math.random() * 100
        const y = Math.random() * 100
        const delay = Math.random() * 3
        const duration = 3 + Math.random() * 2
        return (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full animate-pulse"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
              boxShadow: '0 0 6px rgba(255,255,255,0.8)'
            }}
          />
        )
      })}
    </div>
  )
}

export default ScenicBackground

