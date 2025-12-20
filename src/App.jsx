import { useState, useMemo } from 'react'
import './App.css'
import { useApprovedPhotos } from './hooks/useApprovedPhotos'

// Christmas bulb colors
const bulbColors = ['#ff3333', '#33ff33', '#ffdd00', '#3366ff', '#ff66cc', '#ff9933']

// Header text with letters and bulbs
const headerText = '2026 Holiday Memories'

function StringLights() {
  const items = useMemo(() => {
    const result = []
    let colorIndex = 0
    let letterIndex = 0
    const letterColors = ['#c41e3a', '#1a472a']

    // Add bulbs on the left
    for (let i = 0; i < 4; i++) {
      result.push({
        type: 'bulb',
        color: bulbColors[colorIndex % bulbColors.length],
        id: `bulb-left-${i}`,
        hang: 0.3 + Math.random() * 0.4,
        animDelay: Math.random() * 2,
        animDuration: 1.3 + Math.random() * 0.6
      })
      colorIndex++
    }

    // Add letters with bulbs only between words
    const words = headerText.split(' ')
    words.forEach((word, wordIndex) => {
      // Add each letter in the word
      for (let i = 0; i < word.length; i++) {
        result.push({
          type: 'letter',
          char: word[i],
          id: `letter-${wordIndex}-${i}`,
          color: letterColors[letterIndex % 2],
          hang: 0.2 + Math.random() * 0.3,
          hookLength: 8 + Math.random() * 12,
          animDelay: Math.random() * 3,
          animDuration: 2.5 + Math.random() * 1.5
        })
        letterIndex++
      }

      // Add bulb between words (not after last word)
      if (wordIndex < words.length - 1) {
        result.push({
          type: 'bulb',
          color: bulbColors[colorIndex % bulbColors.length],
          id: `bulb-mid-${wordIndex}`,
          hang: 0.3 + Math.random() * 0.4,
          animDelay: Math.random() * 2,
          animDuration: 1.3 + Math.random() * 0.6
        })
        colorIndex++
        // Add small gap after the bulb
        result.push({ type: 'space', id: `space-${wordIndex}` })
      }
    })

    // Add bulbs on the right
    for (let i = 0; i < 4; i++) {
      result.push({
        type: 'bulb',
        color: bulbColors[colorIndex % bulbColors.length],
        id: `bulb-right-${i}`,
        hang: 0.3 + Math.random() * 0.4,
        animDelay: Math.random() * 2,
        animDuration: 1.3 + Math.random() * 0.6
      })
      colorIndex++
    }

    return result
  }, [])

  return (
    <div className="string-lights-header">
      <svg className="string-wire-header" viewBox="0 0 100 12" preserveAspectRatio="none">
        <path
          d="M0,2 Q12,8 25,5 Q38,2 50,6 Q62,10 75,4 Q88,0 100,3"
          fill="none"
          stroke="#000000"
          strokeWidth="0.5"
        />
      </svg>
      <div className="items-container">
        {items.map(item => {
          if (item.type === 'space') {
            return <div key={item.id} className="header-space" />
          } else if (item.type === 'letter') {
            return (
              <div
                key={item.id}
                className="hanging-letter"
                style={{
                  '--flag-color': item.color,
                  '--hang-offset': `${item.hang}rem`,
                  '--hook-length': `${item.hookLength}px`,
                  '--anim-delay': `${item.animDelay}s`,
                  '--anim-duration': `${item.animDuration}s`
                }}
              >
                <div className="letter-hook" />
                <div className="pennant-border">
                  <div className="letter-ornament">{item.char}</div>
                </div>
              </div>
            )
          } else {
            return (
              <div
                key={item.id}
                className="header-bulb"
                style={{
                  '--bulb-color': item.color,
                  '--hang-offset': `${item.hang}rem`,
                  '--anim-delay': `${item.animDelay}s`,
                  '--anim-duration': `${item.animDuration}s`
                }}
              >
                <div className="bulb-hook" />
                <svg viewBox="0 0 20 32" className="bulb-svg">
                  <rect x="7" y="0" width="6" height="6" fill="#2a2a2a" rx="1" />
                  <path
                    d="M10,6 C15,6 16,12 16,16 C16,24 13,30 10,30 C7,30 4,24 4,16 C4,12 5,6 10,6"
                    fill={item.color}
                    className="bulb-glass"
                  />
                  <ellipse cx="7" cy="14" rx="2" ry="4" fill="rgba(255,255,255,0.4)" />
                </svg>
                <div className="bulb-glow"></div>
              </div>
            )
          }
        })}
      </div>
    </div>
  )
}

// Placeholder photos (used when no approved photos exist)
const placeholderPhotos = [
  { id: 'p1', src: '/photo1.jpeg', alt: 'Reindeer Girl' },
  { id: 'p2', src: '/photo2.jpeg', alt: 'Santa Hats' },
  { id: 'p3', src: 'https://placehold.co/200x200/c41e3a/white?text=Photo+3', alt: 'Holiday Photo 3' },
  { id: 'p4', src: 'https://placehold.co/200x200/1a472a/white?text=Photo+4', alt: 'Holiday Photo 4' },
  { id: 'p5', src: 'https://placehold.co/200x200/c41e3a/white?text=Photo+5', alt: 'Holiday Photo 5' },
  { id: 'p6', src: 'https://placehold.co/200x200/1a472a/white?text=Photo+6', alt: 'Holiday Photo 6' },
  { id: 'p7', src: 'https://placehold.co/200x200/c41e3a/white?text=Photo+7', alt: 'Holiday Photo 7' },
  { id: 'p8', src: 'https://placehold.co/200x200/1a472a/white?text=Photo+8', alt: 'Holiday Photo 8' },
  { id: 'p9', src: 'https://placehold.co/200x200/c41e3a/white?text=Photo+9', alt: 'Holiday Photo 9' },
  { id: 'p10', src: 'https://placehold.co/200x200/1a472a/white?text=Photo+10', alt: 'Holiday Photo 10' },
  { id: 'p11', src: 'https://placehold.co/200x200/c41e3a/white?text=Photo+11', alt: 'Holiday Photo 11' },
  { id: 'p12', src: 'https://placehold.co/200x200/1a472a/white?text=Photo+12', alt: 'Holiday Photo 12' },
  { id: 'p13', src: 'https://placehold.co/200x200/c41e3a/white?text=Photo+13', alt: 'Holiday Photo 13' },
]

// Default star placeholder
const defaultStarPhoto = { id: 'star-default', src: 'https://placehold.co/200x200/ffd700/white?text=Star', alt: 'Tree Topper' }

// Positions for ornaments on the tree - triangular distribution spread toward bottom
// Tree bounds: top ~35%, bottom ~90%
const ornamentPositions = [
  // Top section: 1 ornament
  { top: '36%', left: '50%' },
  // Upper section: 2 ornaments
  { top: '47%', left: '45%' },
  { top: '51%', left: '55%' },
  // Middle section: 3 ornaments
  { top: '62%', left: '39%' },
  { top: '63%', left: '50%' },
  { top: '64%', left: '61%' },
  // Lower section: 4 ornaments (more spread out)
  { top: '76%', left: '35%' },
  { top: '77%', left: '46%' },
  { top: '75%', left: '55%' },
  { top: '84%', left: '65%' },
  // Bottom: 1 ornament below 7 and 8
  { top: '92%', left: '40%' },
  // Between photo 8 and 9
  { top: '90%', left: '49%' },
  // Between photo 12 and 10
  { top: '92%', left: '59%' },
]

// Background crisscross lights
function BackgroundLights() {
  const lines = useMemo(() => {
    const result = []
    // Create diagonal lines going both directions
    const numLines = 6
    for (let i = 0; i < numLines; i++) {
      // Left-to-right diagonal
      const bulbsLR = []
      const numBulbs = 8 + Math.floor(Math.random() * 4)
      for (let j = 0; j < numBulbs; j++) {
        bulbsLR.push({
          id: `lr-${i}-${j}`,
          color: bulbColors[Math.floor(Math.random() * bulbColors.length)],
          delay: Math.random() * 3,
          duration: 0.8 + Math.random() * 1.2
        })
      }
      result.push({
        id: `line-lr-${i}`,
        direction: 'lr',
        top: 25 + i * 12,
        bulbs: bulbsLR
      })

      // Right-to-left diagonal
      const bulbsRL = []
      const numBulbsRL = 8 + Math.floor(Math.random() * 4)
      for (let j = 0; j < numBulbsRL; j++) {
        bulbsRL.push({
          id: `rl-${i}-${j}`,
          color: bulbColors[Math.floor(Math.random() * bulbColors.length)],
          delay: Math.random() * 3,
          duration: 0.8 + Math.random() * 1.2
        })
      }
      result.push({
        id: `line-rl-${i}`,
        direction: 'rl',
        top: 30 + i * 12,
        bulbs: bulbsRL
      })
    }
    return result
  }, [])

  return (
    <div className="background-lights">
      {lines.map(line => (
        <div
          key={line.id}
          className={`light-string ${line.direction}`}
          style={{ '--top': `${line.top}%` }}
        >
          {line.bulbs.map(bulb => (
            <div
              key={bulb.id}
              className="bg-bulb"
              style={{
                '--bulb-color': bulb.color,
                '--flash-delay': `${bulb.delay}s`,
                '--flash-duration': `${bulb.duration}s`
              }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

// Tree sparkle lights - small white lights scattered on tree
function TreeSparkles() {
  const sparkles = useMemo(() => {
    const result = []
    // Create sparkles within tree bounds, avoiding ornament areas
    // Tree is roughly a triangle: narrow at top (35%), wide at bottom (90%)
    const numSparkles = 75

    for (let i = 0; i < numSparkles; i++) {
      // Random vertical position within tree bounds
      const top = 30 + Math.random() * 65 // 30% to 95%

      // Calculate horizontal bounds based on tree shape (triangle)
      // At top (30%), tree is narrow ~45-55%
      // At bottom (95%), tree is wide ~25-75%
      const treeProgress = (top - 30) / 65 // 0 at top, 1 at bottom
      const halfWidth = 5 + treeProgress * 20 // 5% at top, 25% at bottom
      const left = 50 + (Math.random() - 0.5) * 2 * halfWidth

      result.push({
        id: `tree-sparkle-${i}`,
        top,
        left,
        delay: Math.random() * 4,
        duration: 1.5 + Math.random() * 2,
        size: 3 + Math.random() * 4
      })
    }
    return result
  }, [])

  return (
    <div className="tree-sparkles">
      {sparkles.map(sparkle => (
        <div
          key={sparkle.id}
          className="tree-sparkle-light"
          style={{
            top: `${sparkle.top}%`,
            left: `${sparkle.left}%`,
            '--sparkle-delay': `${sparkle.delay}s`,
            '--sparkle-duration': `${sparkle.duration}s`,
            '--sparkle-size': `${sparkle.size}px`
          }}
        />
      ))}
    </div>
  )
}

const STAR_POINTS = '50,5 61,40 98,40 68,62 79,97 50,75 21,97 32,62 2,40 39,40'

function Star({ photo, onSelect }) {
  const [isAnimating, setIsAnimating] = useState(false)

  const handleClick = () => {
    setIsAnimating(true)
    setTimeout(() => {
      setIsAnimating(false)
      onSelect(photo)
    }, 400)
  }

  return (
    <div className={`tree-star ${isAnimating ? 'star-pop-animation' : ''}`}>
      <button className="star-btn" onClick={handleClick}>
        <svg viewBox="0 0 100 100" className="star-svg">
          <defs>
            <clipPath id="starClip">
              <polygon points={STAR_POINTS} />
            </clipPath>
          </defs>
          <polygon
            points={STAR_POINTS}
            fill="#ffd700"
            stroke="#daa520"
            strokeWidth="2"
          />
          <image
            href={photo.src}
            x="15" y="20"
            width="70" height="70"
            clipPath="url(#starClip)"
            preserveAspectRatio="xMidYMid slice"
          />
          <polygon
            points={STAR_POINTS}
            fill="none"
            stroke="#daa520"
            strokeWidth="3"
          />
        </svg>
        <div className="star-glow"></div>
        <div className="star-glow star-glow-2"></div>
        <div className="star-sparkles">
          <span className="star-sparkle" style={{'--delay': '0s', '--x': '-30px', '--y': '-20px'}}>✦</span>
          <span className="star-sparkle" style={{'--delay': '0.5s', '--x': '25px', '--y': '-25px'}}>✦</span>
          <span className="star-sparkle" style={{'--delay': '1s', '--x': '-35px', '--y': '15px'}}>✦</span>
          <span className="star-sparkle" style={{'--delay': '1.5s', '--x': '30px', '--y': '20px'}}>✦</span>
          <span className="star-sparkle" style={{'--delay': '2s', '--x': '0px', '--y': '-35px'}}>✦</span>
          <span className="star-sparkle" style={{'--delay': '2.5s', '--x': '-20px', '--y': '30px'}}>✦</span>
        </div>
      </button>
      {isAnimating && (
        <div className="sparkles">
          <span className="sparkle">✨</span>
          <span className="sparkle">✨</span>
          <span className="sparkle">✨</span>
          <span className="sparkle">✨</span>
        </div>
      )}
    </div>
  )
}

function Ornament({ photo, position, onSelect }) {
  const [isAnimating, setIsAnimating] = useState(false)

  const handleClick = () => {
    setIsAnimating(true)
    // Wait for animation to complete before opening modal
    setTimeout(() => {
      setIsAnimating(false)
      onSelect(photo)
    }, 400)
  }

  return (
    <div
      className={`tree-ornament ${isAnimating ? 'pop-animation' : ''}`}
      style={{ top: position.top, left: position.left }}
    >
      <button className="ornament-btn" onClick={handleClick}>
        <img src={photo.src} alt={photo.alt} />
        <div className="ornament-shine"></div>
      </button>
      {isAnimating && (
        <div className="sparkles">
          <span className="sparkle">✨</span>
          <span className="sparkle">✨</span>
          <span className="sparkle">✨</span>
          <span className="sparkle">✨</span>
        </div>
      )}
    </div>
  )
}

function Modal({ photo, onClose }) {
  if (!photo) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        <img src={photo.src} alt={photo.alt} />
        <p className="modal-caption">{photo.alt}</p>
      </div>
    </div>
  )
}

function App() {
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const { photos: approvedPhotos, loading } = useApprovedPhotos()

  // Convert approved photos to display format
  const displayPhotos = useMemo(() => {
    if (approvedPhotos.length === 0) {
      return placeholderPhotos
    }

    // Map approved photos to display format
    const approved = approvedPhotos.map(p => ({
      id: p.id,
      src: p.imageUrl,
      alt: p.name
    }))

    // Fill remaining slots with placeholders if needed
    const totalSlots = ornamentPositions.length
    if (approved.length >= totalSlots) {
      return approved.slice(0, totalSlots)
    }

    // Pad with placeholders
    const remaining = placeholderPhotos.slice(approved.length, totalSlots)
    return [...approved, ...remaining]
  }, [approvedPhotos])

  // Star uses first approved photo or default
  const starPhoto = useMemo(() => {
    if (approvedPhotos.length > 0) {
      const first = approvedPhotos[0]
      return { id: first.id, src: first.imageUrl, alt: first.name }
    }
    return defaultStarPhoto
  }, [approvedPhotos])

  return (
    <div className="app">
      <div className="background-container">
        <img src="/stripes.png" alt="Background" className="background-stripes" />
        <BackgroundLights />
        <img src="/tree.png" alt="Christmas Tree" className="tree-image" />
        <TreeSparkles />
      </div>

      <StringLights />

      <div className="tree-ornaments">
        <Star photo={starPhoto} onSelect={setSelectedPhoto} />
        {displayPhotos.map((photo, index) => (
          <Ornament
            key={photo.id}
            photo={photo}
            position={ornamentPositions[index]}
            onSelect={setSelectedPhoto}
          />
        ))}
      </div>

      <Modal photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
    </div>
  )
}

export default App
