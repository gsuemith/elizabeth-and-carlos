import { useState } from 'react'
import './Landing.css'

function SaveTheDateCard({ onBack }) {
  const [isOpen, setIsOpen] = useState(false)
  
  const handleWebsiteClick = (e) => {
    e.stopPropagation() // Prevent card from opening when clicking the website
    onBack()
  }

  return (
    <div className="invitation-page">
      <button className="back-button" onClick={onBack}>
        ← Return to Website
      </button>
      <button 
        className="back-button back-button-right" 
        onClick={() => window.open('/save-the-date.pdf', '_blank')}
      >
        Download PDF
      </button>
      <div className="invitation-container">
        <div 
          className={`invitation-card portrait ${isOpen ? 'open' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="card-front">
            <div className="front-content front-content-with-info">
              <div className="front-photo-section">
                <img 
                  src="/carlos-elizabeth-seated.jpeg" 
                  alt="Elizabeth and Carlos" 
                  className="invitation-front-photo" 
                />
              </div>
              <div className="front-wedding-info">
                <p 
                  className="info-website" 
                  onClick={handleWebsiteClick}
                  style={{ cursor: 'pointer' }}
                >
                  www.CarlosAndElizabeth2026.com
                </p>
                <h2 className="info-title">Save the Date!</h2>
                
                <div className="info-section">
                  <h3 className="info-heading">Welcome Gathering, Location TBD</h3>
                  <p className="info-date">Thursday, July 16th</p>
                  <p className="info-time">7:00 PM</p>
                </div>

                <div className="info-section">
                  <h3 className="info-heading">Ceremony at Memorial Chapel</h3>
                  <a 
                    href="https://www.google.com/maps/search/?api=1&query=Memorial+Chapel+Chapel+Dr+Lake+Junaluska+NC+28745"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="info-address"
                  >
                    Chapel Dr., Lake Junaluska, NC 28745
                  </a>
                  <p className="info-date">Friday, July 17th</p>
                  <p className="info-time">5:30 PM</p>
                </div>

                <p className="info-closing">We can't wait to celebrate with you!</p>
                <p className="info-signature">With love,<br />Elizabeth & Carlos</p>
              </div>
            </div>
          </div>
          
          <div className="card-back">
            <div className="back-photo-card-only">
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

export default SaveTheDateCard

