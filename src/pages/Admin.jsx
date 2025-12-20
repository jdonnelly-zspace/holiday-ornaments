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

  const handleApprove = async (submissionId) => {
    await updateDoc(doc(db, 'submissions', submissionId), {
      status: 'approved',
      reviewedAt: serverTimestamp()
    })
  }

  const handleReject = async (submissionId) => {
    await updateDoc(doc(db, 'submissions', submissionId), {
      status: 'rejected',
      reviewedAt: serverTimestamp()
    })
  }

  const copyInviteLink = (code) => {
    const link = `${window.location.origin}/submit?invite=${code}`
    navigator.clipboard.writeText(link)
    setCopiedId(code)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const pendingSubmissions = submissions.filter(s => s.status === 'pending')
  const reviewedSubmissions = submissions.filter(s => s.status !== 'pending')

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

  const tabStyle = (active) => ({
    padding: '12px 24px',
    border: 'none',
    background: active ? '#1a472a' : '#ddd',
    color: active ? '#fff' : '#333',
    cursor: 'pointer',
    fontWeight: 'bold',
    borderRadius: '6px 6px 0 0'
  })

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
                    background: '#f9f9f9',
                    borderRadius: '6px'
                  }}
                >
                  <div>
                    <code style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{invite.code}</code>
                    {invite.usedBy && (
                      <span style={{ marginLeft: '12px', color: '#666', fontSize: '0.9rem' }}>
                        Used by {invite.usedBy}
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
          <div style={{ marginBottom: '16px' }}>
            <button style={tabStyle(activeTab === 'pending')} onClick={() => setActiveTab('pending')}>
              Pending ({pendingSubmissions.length})
            </button>
            <button style={tabStyle(activeTab === 'reviewed')} onClick={() => setActiveTab('reviewed')}>
              Reviewed ({reviewedSubmissions.length})
            </button>
          </div>

          {activeTab === 'pending' && (
            pendingSubmissions.length === 0 ? (
              <p style={{ color: '#666', textAlign: 'center', padding: '40px' }}>
                No pending submissions
              </p>
            ) : (
              <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                {pendingSubmissions.map(submission => (
                  <div
                    key={submission.id}
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
                      <p style={{ margin: '0 0 12px', color: '#666', fontSize: '0.9rem' }}>{submission.phone}</p>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          style={{ ...buttonStyle, flex: 1, background: '#4caf50', color: '#fff' }}
                          onClick={() => handleApprove(submission.id)}
                        >
                          Approve
                        </button>
                        <button
                          style={{ ...buttonStyle, flex: 1, background: '#f44336', color: '#fff' }}
                          onClick={() => handleReject(submission.id)}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {activeTab === 'reviewed' && (
            reviewedSubmissions.length === 0 ? (
              <p style={{ color: '#666', textAlign: 'center', padding: '40px' }}>
                No reviewed submissions yet
              </p>
            ) : (
              <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                {reviewedSubmissions.map(submission => (
                  <div
                    key={submission.id}
                    style={{
                      border: `2px solid ${submission.status === 'approved' ? '#4caf50' : '#f44336'}`,
                      borderRadius: '8px',
                      overflow: 'hidden',
                      background: '#fff',
                      opacity: submission.status === 'rejected' ? 0.6 : 1
                    }}
                  >
                    <img
                      src={submission.imageUrl}
                      alt={submission.name}
                      style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                    />
                    <div style={{ padding: '12px' }}>
                      <p style={{ margin: '0 0 4px', fontWeight: 'bold' }}>{submission.name}</p>
                      <p style={{ margin: '0', color: '#666', fontSize: '0.9rem' }}>
                        {submission.status === 'approved' ? 'Approved' : 'Rejected'}
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
