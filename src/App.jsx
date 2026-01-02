import { useState } from 'react'
import './App.css'
import Landing from './Landing'
import SaveTheDateCard from './SaveTheDateCard'

function App() {
  const [showSaveTheDate, setShowSaveTheDate] = useState(false)
  const [isSliding, setIsSliding] = useState(false)
  const [isSlidingBack, setIsSlidingBack] = useState(false)

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

  if (showSaveTheDate) {
    return (
      <div className="app">
        <div className={`save-date-container ${isSlidingBack ? 'slide-out-right' : ''}`}>
          <SaveTheDateCard onBack={handleBackClick} />
        </div>
        {isSlidingBack && (
          <div className="landing-container slide-in-left">
            <nav className="main-nav">
              <button 
                className="nav-button"
                onClick={handleSaveTheDateClick}
              >
                Save the Date Card
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
      <div className={`landing-container ${isSliding ? 'slide-out-left' : ''}`}>
        <nav className="main-nav">
          <button 
            className="nav-button"
            onClick={handleSaveTheDateClick}
          >
            Save the Date Card
          </button>
        </nav>
        <Landing onBack={() => {}} />
      </div>
      {isSliding && (
        <div className="save-date-container slide-in-right">
          <SaveTheDateCard onBack={() => {}} />
        </div>
      )}
    </div>
  )
}

export default App

