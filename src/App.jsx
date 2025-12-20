import { useState, useMemo } from 'react'
import './App.css'

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
        hang: 0.3 + Math.random() * 0.4
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
          hang: 0.2 + Math.random() * 0.3
        })
        letterIndex++
      }

      // Add bulb between words (not after last word)
      if (wordIndex < words.length - 1) {
        result.push({
          type: 'bulb',
          color: bulbColors[colorIndex % bulbColors.length],
          id: `bulb-mid-${wordIndex}`,
          hang: 0.3 + Math.random() * 0.4
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
        hang: 0.3 + Math.random() * 0.4
      })
      colorIndex++
    }

    return result
  }, [])

  return (
    <div className="string-lights-header">
      <svg className="string-wire-header" viewBox="0 0 100 6" preserveAspectRatio="none">
        <path
          d="M0,3 Q25,5 50,3 Q75,1 100,3"
          fill="none"
          stroke="#1a3d1a"
          strokeWidth="0.4"
        />
      </svg>
      <div className="items-container">
        {items.map((item, index) => {
          if (item.type === 'space') {
            return <div key={item.id} className="header-space" />
          } else if (item.type === 'letter') {
            return (
              <div
                key={item.id}
                className="hanging-letter"
                style={{ '--flag-color': item.color, '--hang-offset': `${item.hang}rem` }}
              >
                <div className="letter-hook" />
                <div className="letter-ornament">{item.char}</div>
              </div>
            )
          } else {
            return (
              <div
                key={item.id}
                className="header-bulb"
                style={{
                  '--bulb-color': item.color,
                  '--glow-delay': `${index * 0.15}s`,
                  '--hang-offset': `${item.hang}rem`,
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

// Holiday photos
const samplePhotos = [
  { id: 1, src: '/photo1.jpeg', alt: 'Reindeer Girl' },
  { id: 2, src: '/photo2.jpeg', alt: 'Santa Hats' },
  { id: 3, src: 'https://placehold.co/200x200/c41e3a/white?text=Photo+3', alt: 'Holiday Photo 3' },
  { id: 4, src: 'https://placehold.co/200x200/1a472a/white?text=Photo+4', alt: 'Holiday Photo 4' },
  { id: 5, src: 'https://placehold.co/200x200/c41e3a/white?text=Photo+5', alt: 'Holiday Photo 5' },
  { id: 6, src: 'https://placehold.co/200x200/1a472a/white?text=Photo+6', alt: 'Holiday Photo 6' },
]

// Positions for ornaments on the tree - organic/natural placement
const ornamentPositions = [
  { top: '33%', left: '50%' },   // Near top center
  { top: '42%', left: '45%' },   // Upper left
  { top: '45%', left: '55%' },   // Upper right
  { top: '58%', left: '46%' },   // Middle left
  { top: '62%', left: '56%' },   // Middle right
  { top: '75%', left: '42%' },   // Lower left
]

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

  return (
    <div className="app">
      <div className="background-container">
        <img src="/stripes.png" alt="Background" className="background-stripes" />
        <img src="/tree.png" alt="Christmas Tree" className="tree-image" />
      </div>

      <StringLights />

      <div className="tree-ornaments">
        {samplePhotos.map((photo, index) => (
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
