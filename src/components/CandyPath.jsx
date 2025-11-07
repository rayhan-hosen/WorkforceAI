function CandyPath({ fromY, toY, isUnlocked, index }) {
  // Calculate control points for Candy Crush-style zigzag curve with more dynamic curves
  const zigzagIntensity = index % 2 === 0 ? 80 : -80 // More pronounced zigzag
  const height = toY
  const midY = height / 2
  
  const startX = 0
  const endX = 0
  const startY = 0
  
  // Create smoother curved path using cubic Bezier for more natural flow
  const controlX1 = zigzagIntensity * 0.5
  const controlY1 = height * 0.3
  const controlX2 = zigzagIntensity * 0.5
  const controlY2 = height * 0.7
  const path = `M ${startX} ${startY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${height}`
  
  return (
    <svg
      className="absolute left-1/2 transform -translate-x-1/2 pointer-events-none"
      style={{ 
        top: '0',
        height: `${height}px`,
        width: '100%',
        maxWidth: '450px',
        zIndex: 0
      }}
      viewBox={`-225 0 450 ${height}`}
      preserveAspectRatio="none"
    >
      <defs>
        {/* Enhanced Candy stripe pattern - Orange and White with gradient */}
        <pattern 
          id={`candyStripe-${index}`} 
          x="0" 
          y="0" 
          width="35" 
          height="35" 
          patternUnits="userSpaceOnUse"
        >
          <rect width="18" height="35" fill="#ff8c42" opacity="1"/>
          <rect x="18" width="17" height="35" fill="#ffffff" opacity="1"/>
          {/* Subtle gradient overlay */}
          <rect width="18" height="35" fill={`url(#orangeGrad-${index})`} opacity="0.3"/>
        </pattern>
        
        {/* Pink and Cream alternative with gradient */}
        <pattern 
          id={`candyStripePink-${index}`} 
          x="0" 
          y="0" 
          width="35" 
          height="35" 
          patternUnits="userSpaceOnUse"
        >
          <rect width="18" height="35" fill="#ff6b9d" opacity="1"/>
          <rect x="18" width="17" height="35" fill="#fff8e1" opacity="1"/>
          <rect width="18" height="35" fill={`url(#pinkGrad-${index})`} opacity="0.3"/>
        </pattern>
        
        {/* Gradient definitions */}
        <linearGradient id={`orangeGrad-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffa500" stopOpacity="0.5"/>
          <stop offset="100%" stopColor="#ff8c42" stopOpacity="0.8"/>
        </linearGradient>
        <linearGradient id={`pinkGrad-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff91c7" stopOpacity="0.5"/>
          <stop offset="100%" stopColor="#ff6b9d" stopOpacity="0.8"/>
        </linearGradient>
        
        {/* Enhanced road shadow/depth */}
        <filter id={`roadShadow-${index}`}>
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feOffset in="coloredBlur" dx="0" dy="4" result="offsetBlur"/>
          <feMerge>
            <feMergeNode in="offsetBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        
        {/* Enhanced glow effect */}
        <filter id={`candyGlow-${index}`}>
          <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        
        {/* Animated shimmer effect */}
        <linearGradient id={`shimmer-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="transparent" stopOpacity="0"/>
          <stop offset="50%" stopColor="white" stopOpacity="0.6"/>
          <stop offset="100%" stopColor="transparent" stopOpacity="0"/>
          <animate attributeName="x1" values="0%;100%" dur="2s" repeatCount="indefinite"/>
          <animate attributeName="x2" values="100%;200%" dur="2s" repeatCount="indefinite"/>
        </linearGradient>
      </defs>
      
      {/* Road shadow layer - Enhanced depth */}
      <path
        d={path}
        fill="none"
        stroke={isUnlocked ? '#d97706' : '#9ca3af'}
        strokeWidth={isUnlocked ? '24' : '18'}
        strokeLinecap="round"
        opacity={isUnlocked ? '0.4' : '0.25'}
        filter={`url(#roadShadow-${index})`}
      />
      
      {/* Main candy-striped path - Enhanced width and glow */}
      <path
        d={path}
        fill="none"
        stroke={isUnlocked ? `url(#${index % 2 === 0 ? 'candyStripe' : 'candyStripePink'}-${index})` : '#d1d5db'}
        strokeWidth={isUnlocked ? '18' : '14'}
        strokeLinecap="round"
        strokeDasharray={isUnlocked ? '0' : '15,10'}
        filter={isUnlocked ? `url(#candyGlow-${index})` : undefined}
        style={{
          transition: 'all 0.8s ease-in-out',
          filter: isUnlocked ? `url(#candyGlow-${index}) drop-shadow(0 0 8px rgba(255,140,66,0.6))` : undefined
        }}
      />
      
      {/* Animated shimmer overlay */}
      {isUnlocked && (
        <path
          d={path}
          fill="none"
          stroke={`url(#shimmer-${index})`}
          strokeWidth="20"
          strokeLinecap="round"
          opacity="0.7"
        />
      )}
      
      {/* White center dashed line - Enhanced */}
      {isUnlocked && (
        <path
          d={path}
          fill="none"
          stroke="white"
          strokeWidth="3"
          strokeDasharray="10, 8"
          opacity="0.9"
          style={{
            filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.8))'
          }}
        />
      )}
      
      {/* Flowing energy particles on path */}
      {isUnlocked && (
        <>
          {[0.15, 0.35, 0.55, 0.75, 0.9].map((offset, i) => {
            // Calculate position on cubic Bezier curve
            const t = offset
            const x = Math.pow(1-t, 3) * startX + 
                      3 * Math.pow(1-t, 2) * t * controlX1 + 
                      3 * (1-t) * Math.pow(t, 2) * controlX2 + 
                      Math.pow(t, 3) * endX
            const y = Math.pow(1-t, 3) * startY + 
                      3 * Math.pow(1-t, 2) * t * controlY1 + 
                      3 * (1-t) * Math.pow(t, 2) * controlY2 + 
                      Math.pow(t, 3) * height
            
            return (
              <g key={i} style={{ transformOrigin: `${x}px ${y}px` }}>
                {/* Outer glow ring */}
                <circle
                  cx={x}
                  cy={y}
                  r="7"
                  fill="none"
                  stroke="rgba(255,255,255,0.6)"
                  strokeWidth="1.5"
                  style={{
                    animation: `pulseRing 2s ease-in-out infinite`,
                    animationDelay: `${i * 0.5}s`
                  }}
                />
                {/* Main glowing particle */}
                <circle
                  cx={x}
                  cy={y}
                  r="5"
                  fill="white"
                  style={{
                    filter: 'drop-shadow(0 0 8px rgba(255,255,255,1))',
                    animation: `flowUp 2.5s ease-in-out infinite`,
                    animationDelay: `${i * 0.5}s`
                  }}
                />
                {/* Inner bright core */}
                <circle
                  cx={x}
                  cy={y}
                  r="2"
                  fill="#ffd700"
                  opacity="0.9"
                  style={{
                    animation: `pulseRing 1.5s ease-in-out infinite`,
                    animationDelay: `${i * 0.5}s`
                  }}
                />
              </g>
            )
          })}
        </>
      )}
      
      {/* Checkpoint markers along the path */}
      {isUnlocked && (
        <>
          {[0.25, 0.5, 0.75].map((offset, i) => {
            const t = offset
            const x = Math.pow(1-t, 3) * startX + 
                      3 * Math.pow(1-t, 2) * t * controlX1 + 
                      3 * (1-t) * Math.pow(t, 2) * controlX2 + 
                      Math.pow(t, 3) * endX
            const y = Math.pow(1-t, 3) * startY + 
                      3 * Math.pow(1-t, 2) * t * controlY1 + 
                      3 * (1-t) * Math.pow(t, 2) * controlY2 + 
                      Math.pow(t, 3) * height
            
            return (
              <g key={`checkpoint-${i}`}>
                {/* Checkpoint circle */}
                <circle
                  cx={x}
                  cy={y}
                  r="8"
                  fill="white"
                  opacity="0.8"
                  style={{
                    filter: 'drop-shadow(0 0 8px rgba(255,215,0,0.8))',
                    animation: `checkpointPulse 2s ease-in-out infinite`,
                    animationDelay: `${i * 0.7}s`
                  }}
                />
                {/* Inner star */}
                <circle
                  cx={x}
                  cy={y}
                  r="3"
                  fill="#ffd700"
                  opacity="1"
                />
              </g>
            )
          })}
        </>
      )}
      
      {/* Locked path - Enhanced visual feedback */}
      {!isUnlocked && (
        <>
          {[0.3, 0.7].map((offset, i) => {
            const t = offset
            const x = Math.pow(1-t, 3) * startX + 
                      3 * Math.pow(1-t, 2) * t * controlX1 + 
                      3 * (1-t) * Math.pow(t, 2) * controlX2 + 
                      Math.pow(t, 3) * endX
            const y = Math.pow(1-t, 3) * startY + 
                      3 * Math.pow(1-t, 2) * t * controlY1 + 
                      3 * (1-t) * Math.pow(t, 2) * controlY2 + 
                      Math.pow(t, 3) * height
            
            return (
              <g key={`lock-${i}`}>
                <circle
                  cx={x}
                  cy={y}
                  r="6"
                  fill="#9ca3af"
                  opacity="0.6"
                />
                <text
                  x={x}
                  y={y + 2}
                  textAnchor="middle"
                  fontSize="8"
                  fill="white"
                  fontWeight="bold"
                >
                  🔒
                </text>
              </g>
            )
          })}
        </>
      )}
    </svg>
  )
}

export default CandyPath
