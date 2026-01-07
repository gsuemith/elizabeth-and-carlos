import { useState } from 'react'
import './Landing.css'

function SaveTheDateCard({ onBack }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="invitation-page">
      <button className="back-button" onClick={onBack}>
        ← Return to Website
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
                <p className="info-website">www.CarlosAndElizabeth2026.com</p>
                <h2 className="info-title">Save the Date!</h2>
                
                <div className="info-section">
                  <h3 className="info-heading">Welcome Gathering, Location TBD</h3>
                  <a 
                    href="https://www.google.com/calendar/render?action=TEMPLATE&text=Welcome+Gathering+-+Elizabeth+%26+Carlos+Wedding&dates=20260716T190000/20260716T200000&details=Welcome+Gathering+for+Elizabeth+%26+Carlos+Wedding&location=Location+TBD"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="info-date info-date-link"
                    data-tooltip="Add to Calendar"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span>Thursday, July 16th</span> <span className="info-time">7:00 PM</span>
                  </a>
                </div>

                <div className="info-section ceremony-section">
                  <h3 className="info-heading">Ceremony at Memorial Chapel</h3>
                  <a 
                    href="https://www.google.com/maps/search/?api=1&query=Memorial+Chapel+Chapel+Dr+Lake+Junaluska+NC+28745"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="info-address"
                  >
                    Chapel Dr., Lake Junaluska, NC 28745
                  </a>
                  <a 
                    href="https://www.google.com/calendar/render?action=TEMPLATE&text=Ceremony+-+Elizabeth+%26+Carlos+Wedding&dates=20260717T173000/20260717T183000&details=Ceremony+for+Elizabeth+%26+Carlos+Wedding&location=Memorial+Chapel%2C+Chapel+Dr.%2C+Lake+Junaluska%2C+NC+28745"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="info-date info-date-link"
                    data-tooltip="Add to Calendar"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span>Friday, July 17th</span> <span className="info-time">5:30 PM</span>
                  </a>
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

