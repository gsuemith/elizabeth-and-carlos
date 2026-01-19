import { useState, useRef } from 'react'
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import './App.css'
import { useLanguage } from './LanguageContext'
import { translations } from './translations'
import Landing from './Landing'
import SaveTheDateCard from './SaveTheDateCard'
import RSVP from './RSVP'
import Story from './Story'
import EditRSVP from './EditRSVP'
import GuestList from './GuestList'
import GuestBook from './GuestBook'

function NavButtons({ onStoryClick, onSaveTheDateClick, onRSVPClick, onGuestBookClick, onToggleLanguage }) {
  const { language } = useLanguage()
  const t = translations[language]
  const navigate = useNavigate()

  return (
    <>
      <nav className="main-nav main-nav-right">
        <button 
          className="nav-button"
          onClick={onGuestBookClick || (() => navigate('/guest-book'))}
        >
          {t.guestBook}
        </button>
        <button 
          className="nav-button"
          onClick={onSaveTheDateClick}
        >
          {t.saveTheDate}
        </button>
        <button 
          className="nav-button"
          onClick={onStoryClick}
        >
          {t.ourStory}
        </button>
      </nav>
      <nav className="main-nav main-nav-left">
        <button 
          className="nav-button"
          onClick={onRSVPClick}
        >
          RSVP
        </button>
        <a
          href="https://www.zola.com/registry/elizabethandcarlosjuly17"
          target="_blank"
          rel="noopener noreferrer"
          className="nav-button"
        >
          {t.registry}
        </a>
        <button 
          className="nav-button"
          onClick={onToggleLanguage}
        >
          {language === 'en' ? 'Español' : 'English'}
        </button>
      </nav>
    </>
  )
}

function AppContent() {
  const { language, toggleLanguage } = useLanguage()
  const t = translations[language]
  const navigate = useNavigate()
  const touchStartRef = useRef(null)
  const touchEndRef = useRef(null)
  const touchStartYRef = useRef(null)
  const isSwipeRef = useRef(false)
  const minSwipeDistance = 50
  const [showSaveTheDate, setShowSaveTheDate] = useState(false)
  const [showRSVP, setShowRSVP] = useState(false)
  const [showStory, setShowStory] = useState(false)
  const [showEditRSVP, setShowEditRSVP] = useState(false)
  const [isSliding, setIsSliding] = useState(false)
  const [isSlidingBack, setIsSlidingBack] = useState(false)
  const [isSlidingRSVP, setIsSlidingRSVP] = useState(false)
  const [isSlidingBackRSVP, setIsSlidingBackRSVP] = useState(false)
  const [isSlidingStory, setIsSlidingStory] = useState(false)
  const [isSlidingBackStory, setIsSlidingBackStory] = useState(false)
  const [isSlidingEditRSVP, setIsSlidingEditRSVP] = useState(false)
  const [isSlidingBackEditRSVP, setIsSlidingBackEditRSVP] = useState(false)

  const handleSaveTheDateClick = () => {
    setIsSliding(true)
    setTimeout(() => {
      setShowSaveTheDate(true)
      setIsSliding(false)
    }, 600) // Match animation duration
  }

  const handleBackClick = () => {
    setIsSlidingBack(true)
    setTimeout(() => {
      setShowSaveTheDate(false)
      setIsSlidingBack(false)
    }, 600) // Match animation duration
  }

  const handleRSVPClick = () => {
    setIsSlidingRSVP(true)
    setTimeout(() => {
      setShowRSVP(true)
      setIsSlidingRSVP(false)
    }, 600) // Match animation duration
  }

  const handleRSVPBackClick = () => {
    setIsSlidingBackRSVP(true)
    setTimeout(() => {
      setShowRSVP(false)
      setIsSlidingBackRSVP(false)
    }, 600) // Match animation duration
  }

  const handleStoryClick = () => {
    setIsSlidingStory(true)
    setTimeout(() => {
      setShowStory(true)
      setIsSlidingStory(false)
    }, 600) // Match animation duration
  }

  const handleStoryBackClick = () => {
    setIsSlidingBackStory(true)
    setTimeout(() => {
      setShowStory(false)
      setIsSlidingBackStory(false)
    }, 600) // Match animation duration
  }

  const handleEditRSVPClick = () => {
    setIsSlidingEditRSVP(true)
    setTimeout(() => {
      setShowRSVP(false)
      setShowEditRSVP(true)
      setIsSlidingEditRSVP(false)
    }, 600) // Match animation duration
  }

  const handleEditRSVPBackClick = () => {
    setIsSlidingBackEditRSVP(true)
    setTimeout(() => {
      setShowEditRSVP(false)
      setShowRSVP(false)
      setIsSlidingBackEditRSVP(false)
    }, 600) // Match animation duration
  }

  const onTouchStart = (e) => {
    // Only enable swipe on mobile
    if (window.innerWidth > 768) return
    // Don't trigger swipe if touching interactive elements (buttons, links, inputs) or image modal
    if (e.target.closest('button') || e.target.closest('a') || e.target.closest('input') || e.target.closest('textarea') || e.target.closest('select') || e.target.closest('.story-image-modal-overlay') || e.target.closest('.story-image-modal')) {
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

    // Handle swipes on landing page
    if (isSwipeRef.current && !showRSVP && !showStory && !showSaveTheDate && !showEditRSVP) {
      if (isLeftSwipe) {
        // Swipe left → Our Story
        e.preventDefault()
        handleStoryClick()
      } else if (isRightSwipe) {
        // Swipe right → RSVP
        e.preventDefault()
        handleRSVPClick()
      }
    }
    
    // Handle swipes on RSVP page
    if (isSwipeRef.current && showRSVP && !showEditRSVP) {
      if (isLeftSwipe) {
        // Swipe left → Return to landing page
        e.preventDefault()
        handleRSVPBackClick()
      } else if (isRightSwipe) {
        // Swipe right → Edit RSVP form
        e.preventDefault()
        handleEditRSVPClick()
      }
    }
    
    // Handle swipes on Edit RSVP page (swipe left to go back to RSVP form)
    if (isSwipeRef.current && showEditRSVP) {
      if (isLeftSwipe) {
        // Swipe left → Return to RSVP form
        e.preventDefault()
        handleEditRSVPBackClick()
      }
    }
    
    // Handle swipes on Story page (but not when image modal is open)
    if (isSwipeRef.current && showStory) {
      // Don't trigger swipe if touching the image modal
      if (e.target.closest('.story-image-modal-overlay') || e.target.closest('.story-image-modal')) {
        return
      }
      if (isRightSwipe) {
        // Swipe right → Return to landing page
        e.preventDefault()
        handleStoryBackClick()
      }
    }
    
    // Handle swipes on Save the Date page (swipe left to go back to landing page)
    if (isSwipeRef.current && showSaveTheDate) {
      if (isLeftSwipe) {
        // Swipe left → Return to landing page
        e.preventDefault()
        handleBackClick()
      }
    }
    
    // Reset touch references
    touchStartRef.current = null
    touchEndRef.current = null
    touchStartYRef.current = null
    isSwipeRef.current = false
  }

  if (showRSVP && isSlidingEditRSVP) {
    return (
      <div className="app">
        <div 
          className="rsvp-container slide-out-right"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <RSVP onBack={handleRSVPBackClick} onEditRSVP={handleEditRSVPClick} />
        </div>
        <div 
          className="edit-rsvp-container slide-in-left"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <EditRSVP onBack={() => {}} />
        </div>
      </div>
    )
  }

  if (showEditRSVP && !isSlidingEditRSVP) {
    return (
      <div className="app">
        <div 
          className={`edit-rsvp-container ${isSlidingBackEditRSVP ? 'slide-out-left' : ''}`}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <EditRSVP onBack={handleEditRSVPBackClick} />
        </div>
        {isSlidingBackEditRSVP && (
          <div className="landing-container slide-in-right">
            <NavButtons
              onStoryClick={handleStoryClick}
              onSaveTheDateClick={handleSaveTheDateClick}
              onRSVPClick={handleRSVPClick}
              onToggleLanguage={toggleLanguage}
            />
            <Landing onBack={() => {}} />
          </div>
        )}
      </div>
    )
  }

  if (showRSVP && !isSlidingEditRSVP) {
    return (
      <div className="app">
        <div 
          className={`rsvp-container ${isSlidingBackRSVP ? 'slide-out-left' : ''}`}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <RSVP onBack={handleRSVPBackClick} onEditRSVP={handleEditRSVPClick} />
        </div>
        {isSlidingBackRSVP && (
          <div className="landing-container slide-in-right">
            <NavButtons
              onStoryClick={handleStoryClick}
              onSaveTheDateClick={handleSaveTheDateClick}
              onRSVPClick={handleRSVPClick}
              onToggleLanguage={toggleLanguage}
            />
            <Landing onBack={() => {}} />
          </div>
        )}
      </div>
    )
  }

  if (showStory) {
    return (
      <div className="app">
        <div 
          className={`story-container ${isSlidingBackStory ? 'slide-out-right' : ''}`}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <Story onBack={handleStoryBackClick} />
        </div>
        {isSlidingBackStory && (
          <div className="landing-container slide-in-left">
            <NavButtons
              onStoryClick={handleStoryClick}
              onSaveTheDateClick={handleSaveTheDateClick}
              onRSVPClick={handleRSVPClick}
              onToggleLanguage={toggleLanguage}
            />
            <Landing onBack={() => {}} />
          </div>
        )}
      </div>
    )
  }

  if (showSaveTheDate) {
    return (
      <div className="app">
        <div 
          className={`save-date-container ${isSlidingBack ? 'slide-out-right' : ''}`}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <SaveTheDateCard onBack={handleBackClick} />
        </div>
        {isSlidingBack && (
          <div className="landing-container slide-in-left">
            <NavButtons
              onStoryClick={handleStoryClick}
              onSaveTheDateClick={handleSaveTheDateClick}
              onRSVPClick={handleRSVPClick}
              onToggleLanguage={toggleLanguage}
            />
            <Landing onBack={() => {}} />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="app">
      <div 
        className={`landing-container ${isSliding ? 'slide-out-left' : isSlidingRSVP ? 'slide-out-right' : isSlidingStory ? 'slide-out-left' : ''}`}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <NavButtons
          onStoryClick={handleStoryClick}
          onSaveTheDateClick={handleSaveTheDateClick}
          onRSVPClick={handleRSVPClick}
          onToggleLanguage={toggleLanguage}
        />
        <Landing onBack={() => {}} />
      </div>
      {isSliding && (
        <div 
          className="save-date-container slide-in-right"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <SaveTheDateCard onBack={() => {}} />
        </div>
      )}
      {isSlidingRSVP && (
        <div 
          className="rsvp-container slide-in-left"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <RSVP onBack={() => {}} onEditRSVP={handleEditRSVPClick} />
        </div>
      )}
      {isSlidingStory && (
        <div 
          className="story-container slide-in-right"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <Story onBack={() => {}} />
        </div>
      )}
      {isSlidingEditRSVP && (
        <div 
          className="edit-rsvp-container slide-in-left"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <EditRSVP onBack={() => {}} />
        </div>
      )}
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/guest-list" element={<GuestList />} />
      <Route path="/guest-book" element={<GuestBook />} />
      <Route path="*" element={<AppContent />} />
    </Routes>
  )
}

export default App

