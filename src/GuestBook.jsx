import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import './Landing.css'
import { useLanguage } from './LanguageContext'
import { translations } from './translations'
// import sampleCommentsData from './sampleComments.json'

const API_BASE_URL = 'https://wedding-rsvp-one-gamma.vercel.app'
const COMMENTS_PER_PAGE = 11
const MAIN_EVENT_ID = '010e9472-8ea4-4239-9882-f8c3fe676f2b'

function GuestBook() {
  const navigate = useNavigate()
  const { language, toggleLanguage } = useLanguage()
  const t = translations[language]
  const [allComments, setAllComments] = useState([])
  const [comments, setComments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [isSliding, setIsSliding] = useState(false)
  const [displayComments, setDisplayComments] = useState([])
  const [incomingComments, setIncomingComments] = useState([])
  const [isSlidingIn, setIsSlidingIn] = useState(false)
  const isTransitioningRef = useRef(false)
  const isInitialLoadRef = useRef(true)
  
  // Swipe gesture refs for pagination
  const touchStartRef = useRef(null)
  const touchEndRef = useRef(null)
  const touchStartYRef = useRef(null)
  const isSwipeRef = useRef(false)
  const minSwipeDistance = 50
  
  // Modal states
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showNonAttendeeModal, setShowNonAttendeeModal] = useState(false)
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState(null)
  const [invitees, setInvitees] = useState([])
  const [selectedInviteeId, setSelectedInviteeId] = useState('')
  const [messageText, setMessageText] = useState('')
  const [messageError, setMessageError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Non-attendee form state
  const [nonAttendeeForm, setNonAttendeeForm] = useState({
    name: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [nonAttendeeError, setNonAttendeeError] = useState(null)
  const [isSubmittingNonAttendee, setIsSubmittingNonAttendee] = useState(false)

  useEffect(() => {
    const loadComments = async () => {
      try {
        // Only show loading on initial load, not during pagination
        if (isInitialLoadRef.current) {
          setIsLoading(true)
          isInitialLoadRef.current = false
        }
        setError(null)

        // Fetch comments from API (pagination is 1-indexed)
        const response = await fetch(`${API_BASE_URL}/comments?page=${currentPage + 1}&page_size=${COMMENTS_PER_PAGE}`)
        if (!response.ok) {
          throw new Error('Failed to fetch comments')
        }
        
        const data = await response.json()
        const fetchedComments = data.comments || []
        
        // If we have allComments (from newly added comment), merge with fetched
        // Otherwise use fetched comments
        let commentsToUse = fetchedComments
        if (allComments.length > 0 && currentPage === 0) {
          // Merge: new comments from allComments + fetched comments, avoiding duplicates
          const existingIds = new Set(allComments.map(c => c.id))
          const newFetched = fetchedComments.filter(c => !existingIds.has(c.id))
          commentsToUse = [...allComments, ...newFetched]
        }
        
        // Calculate pagination from API response
        const totalPagesCount = data.total_pages || 0
        
        setComments(commentsToUse)
        setTotalPages(totalPagesCount)
        
        // If we were transitioning, set incoming comments to fade in
        if (isTransitioningRef.current) {
          setIncomingComments(commentsToUse)
          // After fade-in animation completes, replace displayComments with incomingComments
          setTimeout(() => {
            setDisplayComments(commentsToUse)
            setIncomingComments([])
            setIsSlidingIn(false)
            setIsSliding(false)
            isTransitioningRef.current = false
          }, 300) // Fade-in animation duration
        } else {
          setDisplayComments(commentsToUse)
          setIncomingComments([])
          // Scroll to top immediately if not transitioning
          // Use instant scroll on mobile, smooth on desktop
          const isMobile = window.innerWidth <= 768
          window.scrollTo({ top: 0, behavior: isMobile ? 'auto' : 'smooth' })
        }

        // Use sample data instead of API (commented out)
        // let commentsToUse = allComments.length > 0 ? allComments : (sampleCommentsData.comments || [])
        // if (allComments.length === 0 && commentsToUse.length > 0) {
        //   setAllComments(commentsToUse)
        // }
        // 
        // // Calculate pagination
        // const startIndex = currentPage * COMMENTS_PER_PAGE
        // const endIndex = startIndex + COMMENTS_PER_PAGE
        // const newComments = commentsToUse.slice(startIndex, endIndex)
        // const totalPagesCount = Math.ceil(commentsToUse.length / COMMENTS_PER_PAGE)
        // 
        // setComments(newComments)
        // setTotalPages(totalPagesCount)
      } catch (err) {
        console.error('Error loading comments:', err)
        setError(err.message || 'Failed to load comments')
        setIsSliding(false)
        setIsSlidingIn(false)
        isTransitioningRef.current = false
      } finally {
        setIsLoading(false)
      }
    }

    loadComments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage])

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const calculateNoteWidth = (messageText, authorName, dateString) => {
    if (!messageText) return 180
    const charCount = messageText.length
    
    // Calculate width so text fills the row height (300px)
    // Available height for text: ~250px (300px - 30px padding - 20px for name/date lines)
    // Line height: ~25.6px (1.6 * 16px font-size)
    // Target lines: ~9-10 lines to fill the height (leaving room for name/date)
    const availableHeight = 250
    const lineHeight = 25.6
    const targetLines = Math.floor(availableHeight / lineHeight) // ~9-10 lines
    
    // Calculate optimal width: characters per line * average char width
    // Average character width at 1rem: ~8-9px
    // But we want to fit the text across targetLines, so:
    const charsPerLine = Math.ceil(charCount / targetLines)
    const avgCharWidth = 8.5
    const calculatedWidth = charsPerLine * avgCharWidth + 40 // +40 for padding
    
    // Ensure minimum width to fit the date on one line
    // Date format is typically ~30-40 characters, estimate ~300-350px needed
    const dateWidth = dateString ? dateString.length * 8.5 + 40 : 0
    const authorWidth = authorName ? authorName.length * 8.5 + 40 : 0
    const minWidthForSignature = Math.max(dateWidth, authorWidth, 300)
    
    return Math.max(minWidthForSignature, Math.min(600, calculatedWidth))
  }

  const handlePageChange = (newPage) => {
    if (newPage < 0 || newPage >= totalPages || newPage === currentPage || isSliding) return
    
    setIsSliding(true)
    setIsSlidingIn(false)
    isTransitioningRef.current = true
    
    // Scroll to top immediately when page change starts
    // Use instant scroll on mobile, smooth on desktop
    const isMobile = window.innerWidth <= 768
    window.scrollTo({ top: 0, behavior: isMobile ? 'auto' : 'smooth' })
    
    // Fade out current page, then fetch new page
    setTimeout(() => {
      setCurrentPage(newPage)
      setIsSlidingIn(true)
    }, 300) // Half of fade-out duration
  }

  const onTouchStart = (e) => {
    // Only enable swipe on mobile
    if (window.innerWidth > 768) return
    // Don't trigger swipe if touching interactive elements (buttons, links, inputs, textareas, selects)
    if (e.target.closest('button') || e.target.closest('a') || e.target.closest('input') || e.target.closest('textarea') || e.target.closest('select')) {
      return
    }
    touchEndRef.current = null
    touchStartRef.current = e.targetTouches[0].clientX
    touchStartYRef.current = e.targetTouches[0].clientY
    isSwipeRef.current = false
  }

  const onTouchMove = (e) => {
    // Only enable swipe on mobile
    if (window.innerWidth > 768) return
    if (touchStartRef.current !== null && touchStartYRef.current !== null) {
      const currentX = e.targetTouches[0].clientX
      const currentY = e.targetTouches[0].clientY
      const deltaX = Math.abs(currentX - touchStartRef.current)
      const deltaY = Math.abs(currentY - touchStartYRef.current)
      
      // If horizontal movement is greater than vertical, it's a swipe
      if (deltaX > deltaY && deltaX > 10) {
        isSwipeRef.current = true
        touchEndRef.current = currentX
      }
    }
  }

  const onTouchEnd = (e) => {
    // Only enable swipe on mobile
    if (window.innerWidth > 768) return
    
    if (!touchStartRef.current || touchEndRef.current === null) {
      touchStartRef.current = null
      touchEndRef.current = null
      touchStartYRef.current = null
      isSwipeRef.current = false
      return
    }
    
    const distance = touchStartRef.current - touchEndRef.current
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    // Only trigger pagination if it was a swipe and we're not in a modal
    if (isSwipeRef.current && !showAuthModal && !showNonAttendeeModal && !showMessageModal) {
      if (isLeftSwipe) {
        // Swipe left → next page
        e.preventDefault()
        handlePageChange(currentPage + 1)
      } else if (isRightSwipe) {
        // Swipe right → previous page
        e.preventDefault()
        handlePageChange(currentPage - 1)
      }
    }
    
    // Reset touch references
    touchStartRef.current = null
    touchEndRef.current = null
    touchStartYRef.current = null
    isSwipeRef.current = false
  }

  const handleBackClick = () => {
    navigate('/')
  }

  const handleWriteNoteClick = () => {
    setShowAuthModal(true)
    setEmail('')
    setPassword('')
    setAuthError(null)
  }

  const handleAuthSubmit = async (e) => {
    e.preventDefault()
    setAuthError(null)
    
    try {
      const response = await fetch(`${API_BASE_URL}/comments/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Authentication failed')
      }

      const data = await response.json()
      setInvitees(data.invitees || [])
      setShowAuthModal(false)
      setShowMessageModal(true)
      setSelectedInviteeId('')
      setMessageText('')
      setMessageError(null)
    } catch (err) {
      console.error('Auth error:', err)
      setAuthError(err.message || 'Failed to authenticate. Please check your email and password.')
    }
  }

  const handleMessageSubmit = async (e) => {
    e.preventDefault()
    setMessageError(null)

    if (!selectedInviteeId) {
      setMessageError('Please select your name')
      return
    }

    if (!messageText.trim()) {
      setMessageError('Please enter a message')
      return
    }

    if (messageText.length > 1200) {
      setMessageError('Message must be 1200 characters or less')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`${API_BASE_URL}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invitee_id: selectedInviteeId,
          message_text: messageText.trim(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to submit message')
      }

      const newComment = await response.json()
      
      // Add the new comment to the beginning of the list
      // Ensure the comment has the expected structure
      const formattedComment = {
        id: newComment.id || Date.now().toString(),
        message_text: newComment.message_text || newComment.message || '',
        invitee_id: newComment.invitee_id || selectedInviteeId,
        invitee_name: invitees.find(inv => inv.id === selectedInviteeId)?.name || 'Anonymous',
        created_at: newComment.created_at || new Date().toISOString()
      }
      
      // Add to allComments and reset to first page
      // The useEffect will handle updating the display
      setAllComments(prev => [formattedComment, ...prev])
      setCurrentPage(0)
      
      // Close modal and reset
      setShowMessageModal(false)
      setEmail('')
      setPassword('')
      setSelectedInviteeId('')
      setMessageText('')
      setInvitees([])
    } catch (err) {
      console.error('Message submit error:', err)
      setMessageError(err.message || 'Failed to submit message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCloseAuthModal = () => {
    setShowAuthModal(false)
    setEmail('')
    setPassword('')
    setAuthError(null)
  }

  const handleCloseNonAttendeeModal = () => {
    setShowNonAttendeeModal(false)
    setNonAttendeeForm({
      name: '',
      line1: '',
      line2: '',
      city: '',
      state: '',
      postalCode: '',
      phone: '',
      email: '',
      password: '',
      confirmPassword: ''
    })
    setNonAttendeeError(null)
  }

  const handleNonAttendeeSubmit = async (e) => {
    e.preventDefault()
    setNonAttendeeError(null)
    
    // Validate password match
    if (nonAttendeeForm.password !== nonAttendeeForm.confirmPassword) {
      setNonAttendeeError('Passwords do not match. Please try again.')
      return
    }
    
    setIsSubmittingNonAttendee(true)
    
    try {
      const response = await fetch(`${API_BASE_URL}/comments/non_attendee`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_id: MAIN_EVENT_ID,
          name: nonAttendeeForm.name,
          mailing_address: {
            address_line_1: nonAttendeeForm.line1,
            address_line_2: nonAttendeeForm.line2 || '',
            city: nonAttendeeForm.city,
            state: nonAttendeeForm.state,
            postal_code: nonAttendeeForm.postalCode,
            email: nonAttendeeForm.email,
            phone_number: nonAttendeeForm.phone,
            password: nonAttendeeForm.password,
          }
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Registration failed')
      }

      const data = await response.json()
      setInvitees(data.invitees || [])
      setShowNonAttendeeModal(false)
      setShowMessageModal(true)
      setSelectedInviteeId('')
      setMessageText('')
      setMessageError(null)
    } catch (err) {
      console.error('Non-attendee registration error:', err)
      setNonAttendeeError(err.message || 'Failed to register. Please try again.')
    } finally {
      setIsSubmittingNonAttendee(false)
    }
  }

  const handleCloseMessageModal = () => {
    setShowMessageModal(false)
    setSelectedInviteeId('')
    setMessageText('')
    setMessageError(null)
    setInvitees([])
  }

  if (isLoading) {
    return (
      <div className="guest-book-container">
        <div className="guest-book-card">
          <h1 className="guest-book-title">{t.guestBook}</h1>
          <div className="guest-book-loading">{t.loadingMessages}</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="guest-book-container">
        <div className="guest-book-card">
          <h1 className="guest-book-title">{t.guestBook}</h1>
          <div className="guest-book-error">{t.error}: {error}</div>
          <button className="guest-book-back-button" onClick={handleBackClick}>
            {t.returnToWebsite}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="guest-book-container">
      <div className="guest-book-card">
        <div className="guest-book-header">
          <h1 className="guest-book-title">{t.guestBook}</h1>
          <div className="guest-book-header-buttons">
            <button className="guest-book-write-button" onClick={handleWriteNoteClick}>
              {t.writeUsANote}
            </button>
            <button className="guest-book-language-toggle" onClick={toggleLanguage}>
              {language === 'en' ? 'Español' : 'English'}
            </button>
            <button className="guest-book-back-button" onClick={handleBackClick}>
              {t.returnToWebsite}
            </button>
          </div>
        </div>
        
        {comments.length === 0 ? (
          <div className="guest-book-empty">
            <p>{t.noMessagesYet}</p>
          </div>
        ) : (
          <>
            <div 
              className="guest-book-notes-container"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              {/* Outgoing comments (fading out) */}
              {isSliding && !isSlidingIn && displayComments.length > 0 && (
                <div className="guest-book-notes fade-out">
                  {displayComments.map((comment) => (
                    <div 
                      key={comment.id} 
                      className="guest-book-note"
                      style={{ width: `${calculateNoteWidth(comment.message_text, comment.invitee_name, formatDate(comment.created_at))}px` }}
                    >
                      <div className="guest-book-note-content">
                        <p className="guest-book-note-text">
                          {comment.message_text}
                          <br />
                          <br />
                          <div className="guest-book-note-signature">
                            <div className="guest-book-note-author">{comment.invitee_name || 'Anonymous'}</div>
                            <div className="guest-book-note-date">{formatDate(comment.created_at)}</div>
                          </div>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Incoming comments (fading in) */}
              {isSlidingIn && incomingComments.length > 0 && (
                <div className="guest-book-notes fade-in">
                  {incomingComments.map((comment) => (
                    <div 
                      key={comment.id} 
                      className="guest-book-note"
                      style={{ width: `${calculateNoteWidth(comment.message_text, comment.invitee_name, formatDate(comment.created_at))}px` }}
                    >
                      <div className="guest-book-note-content">
                        <p className="guest-book-note-text">
                          {comment.message_text}
                          <br />
                          <br />
                          <div className="guest-book-note-signature">
                            <div className="guest-book-note-author">{comment.invitee_name || 'Anonymous'}</div>
                            <div className="guest-book-note-date">{formatDate(comment.created_at)}</div>
                          </div>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Normal display (no transition) */}
              {!isSliding && !isSlidingIn && displayComments.length > 0 && incomingComments.length === 0 && (
                <div className="guest-book-notes">
                  {displayComments.map((comment) => (
                    <div 
                      key={comment.id} 
                      className="guest-book-note"
                      style={{ width: `${calculateNoteWidth(comment.message_text, comment.invitee_name, formatDate(comment.created_at))}px` }}
                    >
                      <div className="guest-book-note-content">
                        <p className="guest-book-note-text">
                          {comment.message_text}
                          <br />
                          <br />
                          <div className="guest-book-note-signature">
                            <div className="guest-book-note-author">{comment.invitee_name || 'Anonymous'}</div>
                            <div className="guest-book-note-date">{formatDate(comment.created_at)}</div>
                          </div>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="guest-book-pagination">
                <button
                  className="guest-book-page-button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0 || isSliding}
                >
                  {t.previous}
                </button>
                <span className="guest-book-page-info">
                  {t.page} {currentPage + 1} {t.of} {totalPages}
                </span>
                <button
                  className="guest-book-page-button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1 || isSliding}
                >
                  {t.next}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="guest-book-modal-overlay" onClick={handleCloseAuthModal}>
          <div className="guest-book-modal" onClick={(e) => e.stopPropagation()}>
            <div className="guest-book-modal-header">
              <h2 className="guest-book-modal-title">{t.writeUsANote}</h2>
              <button className="guest-book-modal-close" onClick={handleCloseAuthModal}>×</button>
            </div>
            <form className="guest-book-modal-form" onSubmit={handleAuthSubmit}>
              <p className="guest-book-auth-message">{t.authFormMessage}</p>
              <div className="guest-book-form-group">
                <input
                  type="email"
                  id="email"
                  placeholder={t.email}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="guest-book-form-input"
                />
              </div>
              <div className="guest-book-form-group">
                <input
                  type="password"
                  id="password"
                  placeholder={t.password}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="guest-book-form-input"
                />
              </div>
              {authError && (
                <div className="guest-book-form-error">{authError}</div>
              )}
              <div className="guest-book-modal-actions">
                <button type="button" className="guest-book-modal-cancel" onClick={handleCloseAuthModal}>
                  {t.cancel}
                </button>
                <button type="submit" className="guest-book-modal-submit">
                  {t.continue}
                </button>
              </div>
              <div className="guest-book-non-attendee-link">
                <button 
                  type="button" 
                  className="guest-book-link-button"
                  onClick={() => {
                    setShowAuthModal(false)
                    setShowNonAttendeeModal(true)
                  }}
                >
                  {t.notAttendingButWantToWrite}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Non-Attendee Registration Modal */}
      {showNonAttendeeModal && (
        <div className="guest-book-modal-overlay" onClick={handleCloseNonAttendeeModal}>
          <div className="guest-book-modal" onClick={(e) => e.stopPropagation()}>
            <div className="guest-book-modal-header">
              <h2 className="guest-book-modal-title">{t.writeUsANote}</h2>
              <button className="guest-book-modal-close" onClick={handleCloseNonAttendeeModal}>×</button>
            </div>
            <form className="guest-book-modal-form" onSubmit={handleNonAttendeeSubmit}>
              <p className="guest-book-auth-message">{t.nonAttendeeFormMessage}</p>
              <div className="guest-book-form-group">
                <input
                  type="text"
                  id="nonAttendee-name"
                  placeholder={t.fullName}
                  value={nonAttendeeForm.name}
                  onChange={(e) => setNonAttendeeForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="guest-book-form-input"
                />
              </div>
              <div className="guest-book-form-group">
                <input
                  type="text"
                  id="nonAttendee-line1"
                  placeholder={t.addressLine1}
                  value={nonAttendeeForm.line1}
                  onChange={(e) => setNonAttendeeForm(prev => ({ ...prev, line1: e.target.value }))}
                  required
                  className="guest-book-form-input"
                />
              </div>
              <div className="guest-book-form-group">
                <input
                  type="text"
                  id="nonAttendee-line2"
                  placeholder={t.addressLine2}
                  value={nonAttendeeForm.line2}
                  onChange={(e) => setNonAttendeeForm(prev => ({ ...prev, line2: e.target.value }))}
                  className="guest-book-form-input"
                />
              </div>
              <div className="guest-book-form-row">
                <div className="guest-book-form-group">
                  <input
                    type="text"
                    id="nonAttendee-city"
                    placeholder={t.city}
                    value={nonAttendeeForm.city}
                    onChange={(e) => setNonAttendeeForm(prev => ({ ...prev, city: e.target.value }))}
                    required
                    className="guest-book-form-input"
                  />
                </div>
                <div className="guest-book-form-group">
                  <input
                    type="text"
                    id="nonAttendee-state"
                    placeholder={t.state}
                    value={nonAttendeeForm.state}
                    onChange={(e) => setNonAttendeeForm(prev => ({ ...prev, state: e.target.value }))}
                    required
                    className="guest-book-form-input"
                  />
                </div>
                <div className="guest-book-form-group">
                  <input
                    type="text"
                    id="nonAttendee-postalCode"
                    placeholder={t.postalCode}
                    value={nonAttendeeForm.postalCode}
                    onChange={(e) => setNonAttendeeForm(prev => ({ ...prev, postalCode: e.target.value }))}
                    required
                    className="guest-book-form-input"
                  />
                </div>
              </div>
              <div className="guest-book-form-group">
                <input
                  type="tel"
                  id="nonAttendee-phone"
                  placeholder={t.phone}
                  value={nonAttendeeForm.phone}
                  onChange={(e) => setNonAttendeeForm(prev => ({ ...prev, phone: e.target.value }))}
                  required
                  className="guest-book-form-input"
                />
              </div>
              <div className="guest-book-form-group">
                <input
                  type="email"
                  id="nonAttendee-email"
                  placeholder={t.email}
                  value={nonAttendeeForm.email}
                  onChange={(e) => setNonAttendeeForm(prev => ({ ...prev, email: e.target.value }))}
                  required
                  className="guest-book-form-input"
                />
              </div>
              <div className="guest-book-form-group">
                <input
                  type="password"
                  id="nonAttendee-password"
                  placeholder={t.password}
                  value={nonAttendeeForm.password}
                  onChange={(e) => setNonAttendeeForm(prev => ({ ...prev, password: e.target.value }))}
                  required
                  className="guest-book-form-input"
                />
              </div>
              <div className="guest-book-form-group">
                <input
                  type="password"
                  id="nonAttendee-confirmPassword"
                  placeholder={t.confirmPassword}
                  value={nonAttendeeForm.confirmPassword}
                  onChange={(e) => setNonAttendeeForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                  className="guest-book-form-input"
                />
              </div>
              {nonAttendeeError && (
                <div className="guest-book-form-error">{nonAttendeeError}</div>
              )}
              <div className="guest-book-modal-actions">
                <button type="button" className="guest-book-modal-cancel" onClick={handleCloseNonAttendeeModal}>
                  {t.cancel}
                </button>
                <button type="submit" className="guest-book-modal-submit" disabled={isSubmittingNonAttendee}>
                  {isSubmittingNonAttendee ? t.submitting : t.submit}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {showMessageModal && (
        <div className="guest-book-modal-overlay" onClick={handleCloseMessageModal}>
          <div className="guest-book-modal" onClick={(e) => e.stopPropagation()}>
            <div className="guest-book-modal-header">
              <h2 className="guest-book-modal-title">{t.writeYourMessage}</h2>
              <button className="guest-book-modal-close" onClick={handleCloseMessageModal}>×</button>
            </div>
            <form className="guest-book-modal-form" onSubmit={handleMessageSubmit}>
              <div className="guest-book-form-group">
                <select
                  id="invitee"
                  value={selectedInviteeId}
                  onChange={(e) => setSelectedInviteeId(e.target.value)}
                  required
                  className="guest-book-form-input"
                >
                  <option value="">{t.selectYourName}</option>
                  {invitees.map((invitee) => (
                    <option key={invitee.id} value={invitee.id}>
                      {invitee.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="guest-book-form-group">
                <textarea
                  id="message"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  maxLength={1200}
                  rows={8}
                  required
                  className="guest-book-form-textarea"
                  placeholder={`${t.message} (${messageText.length}/1200)`}
                />
              </div>
              {messageError && (
                <div className="guest-book-form-error">{messageError}</div>
              )}
              <div className="guest-book-modal-actions">
                <button type="button" className="guest-book-modal-cancel" onClick={handleCloseMessageModal}>
                  {t.cancel}
                </button>
                <button type="submit" className="guest-book-modal-submit" disabled={isSubmitting}>
                  {isSubmitting ? t.submitting : t.submit}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default GuestBook

