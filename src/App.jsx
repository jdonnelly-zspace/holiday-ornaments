import { useState } from 'react'
import './App.css'

// Sample placeholder photos - replace with your actual holiday photos
const samplePhotos = [
  { id: 1, src: 'https://placehold.co/200x200/c41e3a/white?text=Photo+1', alt: 'Holiday Photo 1' },
  { id: 2, src: 'https://placehold.co/200x200/1a472a/white?text=Photo+2', alt: 'Holiday Photo 2' },
  { id: 3, src: 'https://placehold.co/200x200/c41e3a/white?text=Photo+3', alt: 'Holiday Photo 3' },
  { id: 4, src: 'https://placehold.co/200x200/1a472a/white?text=Photo+4', alt: 'Holiday Photo 4' },
  { id: 5, src: 'https://placehold.co/200x200/c41e3a/white?text=Photo+5', alt: 'Holiday Photo 5' },
  { id: 6, src: 'https://placehold.co/200x200/1a472a/white?text=Photo+6', alt: 'Holiday Photo 6' },
]

function Ornament({ photo, onClick, style }) {
  return (
    <div className="ornament-container" style={style}>
      <div className="ornament-hook"></div>
      <div className="ornament-string"></div>
      <button className="ornament" onClick={() => onClick(photo)}>
        <img src={photo.src} alt={photo.alt} />
        <div className="ornament-shine"></div>
      </button>
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
        <img src="/background.png" alt="Ada's Tree" className="background-image" />
      </div>

      <header className="header">
        <h1>Our Holiday Memories</h1>
        <p>Click an ornament to view the photo</p>
      </header>

      <div className="ornaments-grid">
        {samplePhotos.map((photo, index) => (
          <Ornament
            key={photo.id}
            photo={photo}
            onClick={setSelectedPhoto}
            style={{ animationDelay: `${index * 0.1}s` }}
          />
        ))}
      </div>

      <Modal photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
    </div>
  )
}

export default App
