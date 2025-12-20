import { useState, useRef, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { collection, query, where, getDocs, addDoc, updateDoc, doc, serverTimestamp, increment } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '../lib/firebase'
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

function centerAspectCrop(mediaWidth, mediaHeight) {
  return centerCrop(
    makeAspectCrop({ unit: '%', width: 90 }, 1, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight
  )
}

export default function Submit() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const inviteCode = searchParams.get('invite')

  const [step, setStep] = useState('validating') // validating, form, cropping, submitting, success, error
  const [invite, setInvite] = useState(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [imgSrc, setImgSrc] = useState('')
  const [crop, setCrop] = useState()
  const [completedCrop, setCompletedCrop] = useState()
  const [error, setError] = useState('')
  const [remainingUses, setRemainingUses] = useState(0)
  const [submissionCount, setSubmissionCount] = useState(0)

  const imgRef = useRef(null)
  const canvasRef = useRef(null)

  // Validate invite code on mount
  useState(() => {
    async function validateInvite() {
      if (!inviteCode) {
        setError('No invite code provided')
        setStep('error')
        return
      }

      try {
        const q = query(
          collection(db, 'invites'),
          where('code', '==', inviteCode)
        )
        const snapshot = await getDocs(q)

        if (snapshot.empty) {
          setError('Invalid invite code')
          setStep('error')
          return
        }

        const inviteDoc = snapshot.docs[0]
        const inviteData = { id: inviteDoc.id, ...inviteDoc.data() }

        // Check expiration (for new invites with expiresAt)
        if (inviteData.expiresAt) {
          const expiresAt = inviteData.expiresAt.toDate?.() || new Date(inviteData.expiresAt)
          if (Date.now() > expiresAt.getTime()) {
            setError('This invite link has expired')
            setStep('error')
            return
          }

          // Check max uses
          const useCount = inviteData.useCount || 0
          const maxUses = inviteData.maxUses || 3
          if (useCount >= maxUses) {
            setError('This invite has reached its maximum number of uses')
            setStep('error')
            return
          }

          setRemainingUses(maxUses - useCount)
        } else {
          // Legacy invite - check usedAt
          if (inviteData.usedAt) {
            setError('This invite has already been used')
            setStep('error')
            return
          }
          setRemainingUses(1)
        }

        setInvite(inviteData)
        setStep('form')
      } catch (err) {
        console.error('Error validating invite:', err)
        setError('Error validating invite code')
        setStep('error')
      }
    }

    validateInvite()
  }, [inviteCode])

  const onSelectFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0])
      const reader = new FileReader()
      reader.addEventListener('load', () => {
        setImgSrc(reader.result?.toString() || '')
        setStep('cropping')
      })
      reader.readAsDataURL(e.target.files[0])
    }
  }

  const onImageLoad = useCallback((e) => {
    const { width, height } = e.currentTarget
    setCrop(centerAspectCrop(width, height))
  }, [])

  const getCroppedImg = useCallback(() => {
    const image = imgRef.current
    const canvas = canvasRef.current
    if (!image || !canvas || !completedCrop) return null

    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height
    const ctx = canvas.getContext('2d')

    const pixelRatio = window.devicePixelRatio
    const cropWidth = completedCrop.width * scaleX
    const cropHeight = completedCrop.height * scaleY

    canvas.width = Math.floor(cropWidth * pixelRatio)
    canvas.height = Math.floor(cropHeight * pixelRatio)

    ctx.scale(pixelRatio, pixelRatio)
    ctx.imageSmoothingQuality = 'high'

    const cropX = completedCrop.x * scaleX
    const cropY = completedCrop.y * scaleY

    ctx.drawImage(
      image,
      cropX, cropY, cropWidth, cropHeight,
      0, 0, cropWidth, cropHeight
    )

    return new Promise((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', 0.9)
    })
  }, [completedCrop])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!name.trim() || !phone.trim()) {
      setError('Please fill in all fields')
      return
    }

    if (!completedCrop) {
      setError('Please crop your photo')
      return
    }

    setStep('submitting')

    try {
      // Get cropped image blob
      const croppedBlob = await getCroppedImg()
      if (!croppedBlob) {
        throw new Error('Failed to crop image')
      }

      // Upload to Firebase Storage
      const fileName = `submissions/${Date.now()}-${invite.id}.jpg`
      const storageRef = ref(storage, fileName)
      await uploadBytes(storageRef, croppedBlob)
      const imageUrl = await getDownloadURL(storageRef)

      // Create submission document
      await addDoc(collection(db, 'submissions'), {
        inviteId: invite.id,
        name: name.trim(),
        phone: phone.trim(),
        imageUrl,
        status: 'pending',
        createdAt: serverTimestamp()
      })

      // Update invite usage
      await updateDoc(doc(db, 'invites', invite.id), {
        usedBy: name.trim(),
        usedByPhone: phone.trim(),
        useCount: increment(1),
        lastUsedAt: serverTimestamp()
      })

      // Update local state
      setRemainingUses(prev => prev - 1)
      setSubmissionCount(prev => prev + 1)
      setStep('success')
    } catch (err) {
      console.error('Error submitting photo:', err)
      setError('Failed to submit photo. Please try again.')
      setStep('form')
    }
  }

  // Styles
  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1a472a 0%, #2d5a3d 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px'
  }

  const cardStyle = {
    background: '#fff',
    borderRadius: '16px',
    padding: '32px',
    maxWidth: '450px',
    width: '100%',
    boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
  }

  const titleStyle = {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    color: '#1a472a',
    marginBottom: '8px',
    textAlign: 'center'
  }

  const subtitleStyle = {
    color: '#666',
    textAlign: 'center',
    marginBottom: '24px'
  }

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #ddd',
    borderRadius: '8px',
    fontSize: '1rem',
    marginBottom: '16px',
    outline: 'none',
    transition: 'border-color 0.2s'
  }

  const buttonStyle = {
    width: '100%',
    padding: '14px',
    background: '#c41e3a',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background 0.2s'
  }

  const fileInputStyle = {
    display: 'block',
    width: '100%',
    padding: '40px 20px',
    border: '2px dashed #ccc',
    borderRadius: '8px',
    textAlign: 'center',
    cursor: 'pointer',
    marginBottom: '16px',
    background: '#f9f9f9'
  }

  if (step === 'validating') {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <p style={{ textAlign: 'center' }}>Validating invite...</p>
        </div>
      </div>
    )
  }

  if (step === 'error') {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <h1 style={{ ...titleStyle, color: '#c41e3a' }}>Oops!</h1>
          <p style={{ textAlign: 'center', color: '#666' }}>{error}</p>
        </div>
      </div>
    )
  }

  if (step === 'success') {
    const resetForNewSubmission = () => {
      setSelectedFile(null)
      setImgSrc('')
      setCrop(undefined)
      setCompletedCrop(undefined)
      setError('')
      setStep('form')
    }

    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <h1 style={titleStyle}>Thank You!</h1>
          <p style={subtitleStyle}>
            Your photo has been submitted for review. Once approved, it will appear on the holiday tree!
          </p>
          {submissionCount > 0 && (
            <p style={{ textAlign: 'center', color: '#666', marginBottom: '16px', fontSize: '0.9rem' }}>
              You've submitted {submissionCount} photo{submissionCount > 1 ? 's' : ''} so far.
            </p>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {remainingUses > 0 && (
              <button style={buttonStyle} onClick={resetForNewSubmission}>
                Submit Another Photo ({remainingUses} remaining)
              </button>
            )}
            <button
              style={{ ...buttonStyle, background: remainingUses > 0 ? '#666' : '#c41e3a' }}
              onClick={() => navigate('/')}
            >
              View the Tree
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'cropping') {
    return (
      <div style={containerStyle}>
        <div style={{ ...cardStyle, maxWidth: '600px' }}>
          <h1 style={titleStyle}>Crop Your Photo</h1>
          <p style={subtitleStyle}>Adjust the square to select the best part of your photo</p>

          <div style={{ marginBottom: '16px' }}>
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={1}
              circularCrop
            >
              <img
                ref={imgRef}
                src={imgSrc}
                alt="Crop preview"
                onLoad={onImageLoad}
                style={{ maxWidth: '100%', maxHeight: '400px' }}
              />
            </ReactCrop>
          </div>

          <canvas ref={canvasRef} style={{ display: 'none' }} />

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              style={{ ...buttonStyle, background: '#666' }}
              onClick={() => {
                setImgSrc('')
                setSelectedFile(null)
                setStep('form')
              }}
            >
              Back
            </button>
            <button style={buttonStyle} onClick={handleSubmit}>
              Submit Photo
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'submitting') {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <h1 style={titleStyle}>Uploading...</h1>
          <p style={subtitleStyle}>Please wait while we upload your photo</p>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #ddd',
            borderTop: '4px solid #c41e3a',
            borderRadius: '50%',
            margin: '20px auto',
            animation: 'spin 1s linear infinite'
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    )
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>Share a Holiday Memory</h1>
        <p style={subtitleStyle}>Upload a photo to appear on our holiday tree!</p>
        {remainingUses > 0 && (
          <p style={{ textAlign: 'center', color: '#1a472a', marginBottom: '16px', fontSize: '0.9rem', fontWeight: 'bold' }}>
            You can submit up to {remainingUses} photo{remainingUses > 1 ? 's' : ''} with this link.
          </p>
        )}

        {error && (
          <p style={{ color: '#c41e3a', textAlign: 'center', marginBottom: '16px' }}>{error}</p>
        )}

        <form onSubmit={(e) => e.preventDefault()}>
          <input
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={inputStyle}
          />

          <input
            type="tel"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={inputStyle}
          />

          <label style={fileInputStyle}>
            <input
              type="file"
              accept="image/*"
              onChange={onSelectFile}
              style={{ display: 'none' }}
            />
            {selectedFile ? selectedFile.name : 'Click to select a photo'}
          </label>

          <button
            type="button"
            style={{
              ...buttonStyle,
              opacity: (!name || !phone || !selectedFile) ? 0.5 : 1,
              cursor: (!name || !phone || !selectedFile) ? 'not-allowed' : 'pointer'
            }}
            disabled={!name || !phone || !selectedFile}
            onClick={() => selectedFile && setStep('cropping')}
          >
            Continue to Crop
          </button>
        </form>
      </div>
    </div>
  )
}
