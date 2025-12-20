import { useState, useEffect } from 'react'
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'

function generateInviteCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

const POSITION_OPTIONS = [
  { value: '', label: 'Auto' },
  { value: 'star', label: 'Star' },
  { value: '1', label: 'Ornament 1 (Top)' },
  { value: '2', label: 'Ornament 2' },
  { value: '3', label: 'Ornament 3' },
  { value: '4', label: 'Ornament 4' },
  { value: '5', label: 'Ornament 5' },
  { value: '6', label: 'Ornament 6' },
  { value: '7', label: 'Ornament 7' },
  { value: '8', label: 'Ornament 8' },
  { value: '9', label: 'Ornament 9' },
  { value: '10', label: 'Ornament 10' },
  { value: '11', label: 'Ornament 11' },
  { value: '12', label: 'Ornament 12' },
  { value: '13', label: 'Ornament 13' },
]

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [invites, setInvites] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [activeTab, setActiveTab] = useState('pending')
  const [copiedId, setCopiedId] = useState(null)

  // Check password against hash
  const handleLogin = (e) => {
    e.preventDefault()
    const hash = import.meta.env.VITE_ADMIN_PASSWORD_HASH
    // Simple check - in production use proper hashing
    if (password === hash || btoa(password) === hash) {
      setIsAuthenticated(true)
      localStorage.setItem('admin_auth', 'true')
    } else {
      alert('Incorrect password')
    }
  }

  // Check for existing auth
  useEffect(() => {
    if (localStorage.getItem('admin_auth') === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  // Listen to invites
  useEffect(() => {
    if (!isAuthenticated) return

    const q = query(collection(db, 'invites'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setInvites(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    })
    return () => unsubscribe()
  }, [isAuthenticated])

  // Listen to submissions
  useEffect(() => {
    if (!isAuthenticated) return

    const q = query(collection(db, 'submissions'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSubmissions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    })
    return () => unsubscribe()
  }, [isAuthenticated])

  const createInvite = async () => {
    const code = generateInviteCode()
    await addDoc(collection(db, 'invites'), {
      code,
      createdAt: serverTimestamp()
    })
  }

  const handleApprove = async (submissionId, position = '') => {
    await updateDoc(doc(db, 'submissions', submissionId), {
      status: 'approved',
      position: position || null,
      reviewedAt: serverTimestamp()
    })
  }

  const handleReject = async (submissionId) => {
    await updateDoc(doc(db, 'submissions', submissionId), {
      status: 'rejected',
      position: null,
      reviewedAt: serverTimestamp()
    })
  }

  const handleRevoke = async (submissionId) => {
    if (confirm('Are you sure you want to revoke this approval? The photo will be removed from the tree.')) {
      await updateDoc(doc(db, 'submissions', submissionId), {
        status: 'rejected',
        position: null,
        reviewedAt: serverTimestamp()
      })
    }
  }

  const handlePositionChange = async (submissionId, newPosition) => {
    await updateDoc(doc(db, 'submissions', submissionId), {
      position: newPosition || null
    })
  }

  const copyInviteLink = (code) => {
    const link = `${window.location.origin}/submit?invite=${code}`
    navigator.clipboard.writeText(link)
    setCopiedId(code)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const pendingSubmissions = submissions.filter(s => s.status === 'pending')
  const approvedSubmissions = submissions.filter(s => s.status === 'approved')
  const rejectedSubmissions = submissions.filter(s => s.status === 'rejected')

  // Styles
  const containerStyle = {
    minHeight: '100vh',
    background: '#f5f5f5',
    padding: '20px'
  }

  const cardStyle = {
    background: '#fff',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  }

  const buttonStyle = {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'opacity 0.2s'
  }

  const smallButtonStyle = {
    padding: '6px 12px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '0.85rem'
  }

  const tabStyle = (active) => ({
    padding: '12px 24px',
    border: 'none',
    background: active ? '#1a472a' : '#ddd',
    color: active ? '#fff' : '#333',
    cursor: 'pointer',
    fontWeight: 'bold',
    borderRadius: '6px 6px 0 0'
  })

  const selectStyle = {
    padding: '6px 10px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '0.85rem',
    background: '#fff'
  }

  if (!isAuthenticated) {
    return (
      <div style={{
        ...containerStyle,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ ...cardStyle, maxWidth: '400px', width: '100%' }}>
          <h1 style={{ marginBottom: '20px', color: '#1a472a' }}>Admin Login</h1>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #ddd',
                borderRadius: '6px',
                marginBottom: '16px',
                fontSize: '1rem'
              }}
            />
            <button
              type="submit"
              style={{
                ...buttonStyle,
                width: '100%',
                background: '#1a472a',
                color: '#fff'
              }}
            >
              Login
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div style={containerStyle}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 style={{ color: '#1a472a', margin: 0 }}>Holiday Tree Admin</h1>
          <button
            style={{ ...buttonStyle, background: '#666', color: '#fff' }}
            onClick={() => {
              localStorage.removeItem('admin_auth')
              setIsAuthenticated(false)
            }}
          >
            Logout
          </button>
        </div>

        {/* Invites Section */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ margin: 0, color: '#333' }}>Invite Links</h2>
            <button
              style={{ ...buttonStyle, background: '#1a472a', color: '#fff' }}
              onClick={createInvite}
            >
              + Create Invite
            </button>
          </div>

          {invites.length === 0 ? (
            <p style={{ color: '#666' }}>No invites created yet</p>
          ) : (
            <div style={{ display: 'grid', gap: '8px' }}>
              {invites.map(invite => (
                <div
                  key={invite.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px',
                    background: invite.usedAt ? '#f0f0f0' : '#f9f9f9',
                    borderRadius: '6px'
                  }}
                >
                  <div>
                    <code style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{invite.code}</code>
                    {invite.usedBy && (
                      <span style={{ marginLeft: '12px', color: '#666', fontSize: '0.9rem' }}>
                        Used by {invite.usedBy} {invite.usedByPhone && `(${invite.usedByPhone})`}
                      </span>
                    )}
                  </div>
                  <button
                    style={{
                      ...buttonStyle,
                      background: copiedId === invite.code ? '#4caf50' : '#2196f3',
                      color: '#fff',
                      opacity: invite.usedAt ? 0.5 : 1
                    }}
                    onClick={() => copyInviteLink(invite.code)}
                    disabled={invite.usedAt}
                  >
                    {copiedId === invite.code ? 'Copied!' : 'Copy Link'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submissions Section */}
        <div style={cardStyle}>
          <div style={{ marginBottom: '16px', display: 'flex', gap: '4px' }}>
            <button style={tabStyle(activeTab === 'pending')} onClick={() => setActiveTab('pending')}>
              Pending ({pendingSubmissions.length})
            </button>
            <button style={tabStyle(activeTab === 'approved')} onClick={() => setActiveTab('approved')}>
              Approved ({approvedSubmissions.length})
            </button>
            <button style={tabStyle(activeTab === 'rejected')} onClick={() => setActiveTab('rejected')}>
              Rejected ({rejectedSubmissions.length})
            </button>
          </div>

          {/* Pending Tab */}
          {activeTab === 'pending' && (
            pendingSubmissions.length === 0 ? (
              <p style={{ color: '#666', textAlign: 'center', padding: '40px' }}>
                No pending submissions
              </p>
            ) : (
              <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                {pendingSubmissions.map(submission => (
                  <PendingCard
                    key={submission.id}
                    submission={submission}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    buttonStyle={buttonStyle}
                    selectStyle={selectStyle}
                  />
                ))}
              </div>
            )
          )}

          {/* Approved Tab */}
          {activeTab === 'approved' && (
            approvedSubmissions.length === 0 ? (
              <p style={{ color: '#666', textAlign: 'center', padding: '40px' }}>
                No approved submissions yet
              </p>
            ) : (
              <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                {approvedSubmissions.map(submission => (
                  <div
                    key={submission.id}
                    style={{
                      border: '2px solid #4caf50',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      background: '#fff'
                    }}
                  >
                    <img
                      src={submission.imageUrl}
                      alt={submission.name}
                      style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                    />
                    <div style={{ padding: '12px' }}>
                      <p style={{ margin: '0 0 4px', fontWeight: 'bold' }}>{submission.name}</p>
                      <p style={{ margin: '0 0 8px', color: '#666', fontSize: '0.9rem' }}>{submission.phone}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <label style={{ fontSize: '0.85rem', color: '#666' }}>Position:</label>
                        <select
                          value={submission.position || ''}
                          onChange={(e) => handlePositionChange(submission.id, e.target.value)}
                          style={selectStyle}
                        >
                          {POSITION_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                      <button
                        style={{ ...smallButtonStyle, background: '#f44336', color: '#fff', width: '100%' }}
                        onClick={() => handleRevoke(submission.id)}
                      >
                        Revoke Approval
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* Rejected Tab */}
          {activeTab === 'rejected' && (
            rejectedSubmissions.length === 0 ? (
              <p style={{ color: '#666', textAlign: 'center', padding: '40px' }}>
                No rejected submissions
              </p>
            ) : (
              <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                {rejectedSubmissions.map(submission => (
                  <div
                    key={submission.id}
                    style={{
                      border: '2px solid #f44336',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      background: '#fff',
                      opacity: 0.7
                    }}
                  >
                    <img
                      src={submission.imageUrl}
                      alt={submission.name}
                      style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                    />
                    <div style={{ padding: '12px' }}>
                      <p style={{ margin: '0 0 4px', fontWeight: 'bold' }}>{submission.name}</p>
                      <p style={{ margin: '0 0 8px', color: '#666', fontSize: '0.9rem' }}>{submission.phone}</p>
                      <p style={{ margin: '0', color: '#f44336', fontSize: '0.85rem', fontWeight: 'bold' }}>
                        Rejected
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}

// Separate component for pending cards with position selection
function PendingCard({ submission, onApprove, onReject, buttonStyle, selectStyle }) {
  const [selectedPosition, setSelectedPosition] = useState('')

  return (
    <div
      style={{
        border: '2px solid #ffc107',
        borderRadius: '8px',
        overflow: 'hidden',
        background: '#fff'
      }}
    >
      <img
        src={submission.imageUrl}
        alt={submission.name}
        style={{ width: '100%', height: '200px', objectFit: 'cover' }}
      />
      <div style={{ padding: '12px' }}>
        <p style={{ margin: '0 0 4px', fontWeight: 'bold' }}>{submission.name}</p>
        <p style={{ margin: '0 0 8px', color: '#666', fontSize: '0.9rem' }}>{submission.phone}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <label style={{ fontSize: '0.85rem', color: '#666' }}>Position:</label>
          <select
            value={selectedPosition}
            onChange={(e) => setSelectedPosition(e.target.value)}
            style={selectStyle}
          >
            {POSITION_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            style={{ ...buttonStyle, flex: 1, background: '#4caf50', color: '#fff' }}
            onClick={() => onApprove(submission.id, selectedPosition)}
          >
            Approve
          </button>
          <button
            style={{ ...buttonStyle, flex: 1, background: '#f44336', color: '#fff' }}
            onClick={() => onReject(submission.id)}
          >
            Deny
          </button>
        </div>
      </div>
    </div>
  )
}
