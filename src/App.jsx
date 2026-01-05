import { useState } from 'react'
import './App.css'
import Landing from './Landing'
import SaveTheDateCard from './SaveTheDateCard'
import RSVP from './RSVP'

function App() {
  const [showSaveTheDate, setShowSaveTheDate] = useState(false)
  const [showRSVP, setShowRSVP] = useState(false)
  const [isSliding, setIsSliding] = useState(false)
  const [isSlidingBack, setIsSlidingBack] = useState(false)
  const [isSlidingRSVP, setIsSlidingRSVP] = useState(false)
  const [isSlidingBackRSVP, setIsSlidingBackRSVP] = useState(false)

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

  if (showRSVP) {
    return (
      <div className="app">
        <div className={`rsvp-container ${isSlidingBackRSVP ? 'slide-out-left' : ''}`}>
          <RSVP onBack={handleRSVPBackClick} />
        </div>
        {isSlidingBackRSVP && (
          <div className="landing-container slide-in-right">
            <nav className="main-nav main-nav-right">
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
      <div className={`landing-container ${isSliding ? 'slide-out-left' : isSlidingRSVP ? 'slide-out-right' : ''}`}>
        <nav className="main-nav main-nav-right">
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
      {isSliding && (
        <div className="save-date-container slide-in-right">
          <SaveTheDateCard onBack={() => {}} />
        </div>
      )}
      {isSlidingRSVP && (
        <div className="rsvp-container slide-in-left">
          <RSVP onBack={() => {}} />
        </div>
      )}
    </div>
  )
}

export default App

