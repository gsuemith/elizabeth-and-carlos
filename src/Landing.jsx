import { useState, useRef, useEffect } from 'react'
import './Landing.css'

function Landing({ onBack }) {
  const [isOpen, setIsOpen] = useState(false)
  const [backPage, setBackPage] = useState('photo') // 'photo' or 'details'
  const photoCardRef = useRef(null)

  useEffect(() => {
    if (isOpen && backPage === 'photo' && photoCardRef.current) {
      const card = photoCardRef.current
      let scrollPosition = 0
      const scrollSpeed = 0.6 // pixels per frame
      
      const scrollInterval = setInterval(() => {
        const maxScroll = card.scrollHeight - card.clientHeight
        if (maxScroll > 0) {
          if (scrollPosition < maxScroll) {
            scrollPosition += scrollSpeed
            card.scrollTop = scrollPosition
          } else {
            // Reset to top when reaching bottom
            scrollPosition = 0
            card.scrollTop = 0
          }
        }
      }, 16) // ~60fps

      return () => clearInterval(scrollInterval)
    } else if (photoCardRef.current) {
      // Reset scroll position when not active
      photoCardRef.current.scrollTop = 0
    }
  }, [isOpen, backPage])

  return (
    <div className="invitation-page">
      <div className="invitation-container">
        <div 
          className={`invitation-card ${isOpen ? 'open' : ''}`}
          onClick={() => {
            setIsOpen(!isOpen)
            if (!isOpen) {
              setBackPage('details')
            }
          }}
        >
          <div className="card-front">
            <div className="front-content">
              <div className="front-text">
                <h1 className="invitation-names">Elizabeth & Carlos</h1>
                <p className="invitation-date">Friday, July 17, 2026</p>
              </div>
              <img 
                src="/carlos-elizabeth-seated.jpeg" 
                alt="Elizabeth and Carlos" 
                className="invitation-seated-photo" 
              />
            </div>
          </div>
          
          <div className="card-back">
            <div 
              className={`back-details-card ${backPage === 'details' ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation()
                setBackPage('photo')
              }}
            >
              <div className="wedding-info">
                <h2 className="info-title">Wedding Details</h2>
                
                <div className="info-section">
                  <h3 className="info-heading">Welcome Gathering</h3>
                  <p className="info-venue">Location TBD</p>
                  <p className="info-date">Thursday, July 16th</p>
                  <p className="info-time">7:00 PM</p>
                </div>

                <div className="info-section">
                  <h3 className="info-heading">Ceremony</h3>
                  <p className="info-venue">Memorial Chapel</p>
                  <a 
                    href="https://www.google.com/maps/search/?api=1&query=Memorial+Chapel+Chapel+Dr+Lake+Junaluska+NC+28745"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="info-address"
                  >
                    Chapel Dr., Lake Junaluska, NC 28745
                  </a>
                  <p className="info-time">5:30 PM</p>
                </div>

                <div className="info-section">
                  <h3 className="info-heading">Reception</h3>
                  <p className="info-venue">Warren Center</p>
                  <a 
                    href="https://www.google.com/maps/search/?api=1&query=575+North+Lake+Shore+Dr+Lake+Junaluska+NC+28745"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="info-address"
                  >
                    575 North Lake Shore Dr., Lake Junaluska, NC 28745
                  </a>
                  <p className="info-time">6:30 PM</p>
                  <p className="info-dress">Cocktail Attire</p>
                  <p className="info-dress-note">Semi-formal, elegant attire in bright summer colors</p>
                </div>

                <div className="info-section">
                  <h3 className="info-heading">Brunch</h3>
                  <p className="info-venue">Location TBD</p>
                  <p className="info-date">Saturday, July 18th</p>
                  <p className="info-time">Time TBD</p>
                </div>

                <p className="info-closing">We can't wait to celebrate with you!</p>
              </div>
            </div>
            <div 
              ref={photoCardRef}
              className={`back-photo-card ${backPage === 'photo' ? 'active' : ''}`}
            >
              <img 
                src="/carlos-elizabeth-carried.jpeg" 
                alt="Elizabeth and Carlos" 
                className="invitation-back-photo" 
              />
            </div>
          </div>
        </div>
        <p className="invitation-hint">Click the card to open</p>
      </div>
    </div>
  )
}

export default Landing

