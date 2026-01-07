import { useState } from 'react'
import './App.css'
import Landing from './Landing'
import SaveTheDateCard from './SaveTheDateCard'
import RSVP from './RSVP'
import Story from './Story'
import EditRSVP from './EditRSVP'

function App() {
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

  if (showRSVP && isSlidingEditRSVP) {
    return (
      <div className="app">
        <div className="rsvp-container slide-out-right">
          <RSVP onBack={handleRSVPBackClick} onEditRSVP={handleEditRSVPClick} />
        </div>
        <div className="edit-rsvp-container slide-in-left">
          <EditRSVP onBack={() => {}} />
        </div>
      </div>
    )
  }

  if (showEditRSVP && !isSlidingEditRSVP) {
    return (
      <div className="app">
        <div className={`edit-rsvp-container ${isSlidingBackEditRSVP ? 'slide-out-left' : ''}`}>
          <EditRSVP onBack={handleEditRSVPBackClick} />
        </div>
        {isSlidingBackEditRSVP && (
          <div className="landing-container slide-in-right">
            <nav className="main-nav main-nav-right">
              <button 
                className="nav-button"
                onClick={handleStoryClick}
              >
                Story
              </button>
              <button 
                className="nav-button"
                onClick={handleSaveTheDateClick}
              >
                Save the Date Card
              </button>
            </nav>
            <nav className="main-nav main-nav-left">
              <button 
                className="nav-button"
                onClick={handleRSVPClick}
              >
                RSVP
              </button>
            </nav>
            <Landing onBack={() => {}} />
          </div>
        )}
      </div>
    )
  }

  if (showRSVP && !isSlidingEditRSVP) {
    return (
      <div className="app">
        <div className={`rsvp-container ${isSlidingBackRSVP ? 'slide-out-left' : ''}`}>
          <RSVP onBack={handleRSVPBackClick} onEditRSVP={handleEditRSVPClick} />
        </div>
        {isSlidingBackRSVP && (
          <div className="landing-container slide-in-right">
            <nav className="main-nav main-nav-right">
              <button 
                className="nav-button"
                onClick={handleStoryClick}
              >
                Story
              </button>
              <button 
                className="nav-button"
                onClick={handleSaveTheDateClick}
              >
                Save the Date
              </button>
            </nav>
            <nav className="main-nav main-nav-left">
              <button 
                className="nav-button"
                onClick={handleRSVPClick}
              >
                RSVP
              </button>
            </nav>
            <Landing onBack={() => {}} />
          </div>
        )}
      </div>
    )
  }

  if (showStory) {
    return (
      <div className="app">
        <div className={`story-container ${isSlidingBackStory ? 'slide-out-right' : ''}`}>
          <Story onBack={handleStoryBackClick} />
        </div>
        {isSlidingBackStory && (
          <div className="landing-container slide-in-left">
            <nav className="main-nav main-nav-right">
              <button 
                className="nav-button"
                onClick={handleStoryClick}
              >
                Story
              </button>
              <button 
                className="nav-button"
                onClick={handleSaveTheDateClick}
              >
                Save the Date Card
              </button>
            </nav>
            <nav className="main-nav main-nav-left">
              <button 
                className="nav-button"
                onClick={handleRSVPClick}
              >
                RSVP
              </button>
            </nav>
            <Landing onBack={() => {}} />
          </div>
        )}
      </div>
    )
  }

  if (showSaveTheDate) {
    return (
      <div className="app">
        <div className={`save-date-container ${isSlidingBack ? 'slide-out-right' : ''}`}>
          <SaveTheDateCard onBack={handleBackClick} />
        </div>
        {isSlidingBack && (
          <div className="landing-container slide-in-left">
            <nav className="main-nav main-nav-right">
              <button 
                className="nav-button"
                onClick={handleStoryClick}
              >
                Story
              </button>
              <button 
                className="nav-button"
                onClick={handleSaveTheDateClick}
              >
                Save the Date Card
              </button>
            </nav>
            <nav className="main-nav main-nav-left">
              <button 
                className="nav-button"
                onClick={handleRSVPClick}
              >
                RSVP
              </button>
            </nav>
            <Landing onBack={() => {}} />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="app">
      <div className={`landing-container ${isSliding ? 'slide-out-left' : isSlidingRSVP ? 'slide-out-right' : isSlidingStory ? 'slide-out-left' : ''}`}>
        <nav className="main-nav main-nav-right">
          <button 
            className="nav-button"
            onClick={handleStoryClick}
          >
            Our Story
          </button>
          <button 
            className="nav-button"
            onClick={handleSaveTheDateClick}
          >
            Save the Date
          </button>
        </nav>
        <nav className="main-nav main-nav-left">
          <button 
            className="nav-button"
            onClick={handleRSVPClick}
          >
            RSVP
          </button>
        </nav>
        <Landing onBack={() => {}} />
      </div>
      {isSliding && (
        <div className="save-date-container slide-in-right">
          <SaveTheDateCard onBack={() => {}} />
        </div>
      )}
      {isSlidingRSVP && (
        <div className="rsvp-container slide-in-left">
          <RSVP onBack={() => {}} onEditRSVP={handleEditRSVPClick} />
        </div>
      )}
      {isSlidingStory && (
        <div className="story-container slide-in-right">
          <Story onBack={() => {}} />
        </div>
      )}
      {isSlidingEditRSVP && (
        <div className="edit-rsvp-container slide-in-left">
          <EditRSVP onBack={() => {}} />
        </div>
      )}
    </div>
  )
}

export default App

