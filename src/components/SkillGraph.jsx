import { useState, useRef, useEffect } from 'react'
import { useLanguage } from '../context/LanguageContext'

function SkillGraph({ skills, translations }) {
  const { language } = useLanguage()
  const [hoveredNode, setHoveredNode] = useState(null)
  const containerRef = useRef(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        })
      }
    }
    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  const getNodeSize = (completion) => {
    if (completion >= 80) return 50
    if (completion > 0) return 40
    return 30
  }

  // Calculate responsive positions
  const getNodePositions = () => {
    if (dimensions.width === 0 || dimensions.height === 0) {
      // Use fallback positions until dimensions are calculated
      const fallbackWidth = 600
      const fallbackHeight = 280
      const spacing = fallbackWidth / (skills.length + 1)
      
      return skills.map((skill, index) => ({
        ...skill,
        x: spacing * (index + 1),
        y: fallbackHeight / 2
      }))
    }
    
    const width = dimensions.width
    const height = dimensions.height
    const spacing = width / (skills.length + 1)
    
    return skills.map((skill, index) => ({
      ...skill,
      x: spacing * (index + 1),
      y: height / 2
    }))
  }

  const positionedSkills = getNodePositions()

  return (
    <div ref={containerRef} className="border rounded-lg bg-white p-4 h-80 overflow-visible relative">
      <svg 
        width="100%" 
        height="100%" 
        className="absolute inset-0" 
        style={{ minHeight: '280px' }}
        viewBox={`0 0 ${dimensions.width || 600} ${dimensions.height || 280}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Draw connections */}
        {positionedSkills.map((skill) =>
          skill.connectedTo?.map((targetId) => {
            const target = positionedSkills.find((s) => s.id === targetId)
            if (!target) return null
            return (
              <line
                key={`${skill.id}-${targetId}`}
                x1={skill.x}
                y1={skill.y}
                x2={target.x}
                y2={target.y}
                stroke="#cbd5e1"
                strokeWidth="2"
                strokeDasharray={skill.completion > 0 && target.completion > 0 ? "0" : "5,5"}
              />
            )
          })
        )}

        {/* Draw nodes */}
        {positionedSkills.map((skill) => {
          const size = getNodeSize(skill.completion)
          const isHovered = hoveredNode === skill.id

          return (
            <g key={skill.id}>
              <circle
                cx={skill.x}
                cy={skill.y}
                r={size / 2}
                fill={skill.completion >= 80 ? '#10b981' : skill.completion > 0 ? '#facc15' : '#d1d5db'}
                stroke={isHovered ? '#8b5cf6' : '#fff'}
                strokeWidth={isHovered ? 3 : 2}
                className="cursor-pointer transition-all"
                onMouseEnter={() => setHoveredNode(skill.id)}
                onMouseLeave={() => setHoveredNode(null)}
              />
              {/* Completion percentage inside circle */}
              <text
                x={skill.x}
                y={skill.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-white font-bold"
                style={{ fontSize: '12px' }}
              >
                {skill.completion}%
              </text>
              {/* Skill name below circle */}
              <text
                x={skill.x}
                y={skill.y + size / 2 + 20}
                textAnchor="middle"
                className="fill-gray-700 font-medium"
                style={{ fontSize: '11px' }}
              >
                {(language === 'bn' ? skill.name_bn : skill.name_en).substring(0, 20)}
              </text>
            </g>
          )
        })}
      </svg>

      {/* Tooltip */}
      {hoveredNode && (() => {
        const skill = positionedSkills.find((s) => s.id === hoveredNode)
        if (!skill) return null
        return (
          <div
            className="absolute bg-gray-900 text-white p-3 rounded-lg shadow-xl z-10 min-w-[200px] pointer-events-none"
            style={{
              left: `${skill.x}px`,
              top: `${skill.y - 100}px`,
              transform: 'translateX(-50%)'
            }}
          >
            <div className="font-semibold mb-2">
              {language === 'bn' ? skill.name_bn : skill.name_en}
            </div>
            <div className="text-sm text-gray-300 mb-1">
              {translations[language]?.progress}: {skill.completion}%
            </div>
            <div className="text-sm text-green-400">
              {translations[language]?.predictedIncrease}: +{skill.valueBoost}%
            </div>
          </div>
        )
      })()}
    </div>
  )
}

export default SkillGraph

