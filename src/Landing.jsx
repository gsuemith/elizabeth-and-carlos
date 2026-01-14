import { useState, useRef, useEffect } from 'react'
import './Landing.css'
import { useLanguage } from './LanguageContext'
import { translations } from './translations'

function Landing({ onBack }) {
  const { language } = useLanguage()
  const t = translations[language]
  const [isOpen, setIsOpen] = useState(false)
  const [backPage, setBackPage] = useState('photo') // 'photo' or 'details'
  const photoCardRef = useRef(null)

  useEffect(() => {
    // Only enable panning on desktop (screen width > 768px)
    const isMobile = window.innerWidth <= 768
    if (isMobile) return

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
                <h1 className="invitation-names">Elizabeth {t.and} Carlos</h1>
                <p className="invitation-date">{language === 'es' ? 'Viernes, 17 de Julio, 2026' : 'Friday, July 17, 2026'}</p>
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
                <h2 className="info-title">{t.weddingDetails}</h2>
                
                <div className="info-section">
                  <h3 className="info-heading">{t.welcomeGathering}</h3>
                  <p className="info-venue">{t.locationTBD}</p>
                  <a 
                    href="https://www.google.com/calendar/render?action=TEMPLATE&text=Welcome+Gathering+-+Elizabeth+%26+Carlos+Wedding&dates=20260716T230000/20260717T000000&details=Welcome+Gathering+for+Elizabeth+%26+Carlos+Wedding&location=Location+TBD"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="info-date info-date-link"
                    data-tooltip={t.addToCalendar}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {language === 'es' ? 'Jueves, 16 de julio' : 'Thursday, July 16th'} <span className="info-time">7:00 PM</span>
                  </a>
                </div>
                

                <div className="info-section">
                  <h3 className="info-heading">{t.ceremony}</h3>
                  <p className="info-venue">Memorial Chapel</p>
                  <div className="info-address-container">
                    <a 
                      href="https://www.google.com/maps/search/?api=1&query=Memorial+Chapel+Chapel+Dr+Lake+Junaluska+NC+28745"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="info-directions-icon"
                      aria-label={t.navigate}
                      data-tooltip={t.navigate}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
                      </svg>
                    </a>
                    <span className="info-address-text">Chapel Dr., Lake Junaluska, NC 28745</span>
                  </div>
                  <a 
                    href="https://www.google.com/calendar/render?action=TEMPLATE&text=Ceremony+-+Elizabeth+%26+Carlos+Wedding&dates=20260717T213000/20260717T223000&details=Ceremony+for+Elizabeth+%26+Carlos+Wedding&location=Memorial+Chapel%2C+Chapel+Dr.%2C+Lake+Junaluska%2C+NC+28745"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="info-date info-date-link"
                    data-tooltip={t.addToCalendar}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {language === 'es' ? 'Viernes, 17 de julio' : 'Friday, July 17th'} <span className="info-time">5:30 PM</span>
                  </a>
                  <p>{t.receptionToFollow}</p>
                </div>

                

                <div className="info-section">
                  <h3 className="info-heading">{t.reception}</h3>
                  <p className="info-venue">Warren Center</p>
                  <div className="info-address-container">
                    <a 
                      href="https://www.google.com/maps/search/?api=1&query=575+North+Lake+Shore+Dr+Lake+Junaluska+NC+28745"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="info-directions-icon"
                      aria-label={t.navigate}
                      data-tooltip={t.navigate}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
                      </svg>
                    </a>
                    <span className="info-address-text">575 North Lake Shore Dr., Lake Junaluska, NC 28745</span>
                  </div>
                  <a 
                    href="https://www.google.com/calendar/render?action=TEMPLATE&text=Reception+-+Elizabeth+%26+Carlos+Wedding&dates=20260717T223000/20260718T010000&details=Reception+for+Elizabeth+%26+Carlos+Wedding%0ACocktail+Attire%3A+Semi-formal%2C+elegant+attire+in+bright+summer+colors&location=Warren+Center%2C+575+North+Lake+Shore+Dr.%2C+Lake+Junaluska%2C+NC+28745"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="info-date info-date-link"
                    data-tooltip={t.addToCalendar}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {language === 'es' ? 'Viernes, 17 de julio' : 'Friday, July 17th'} <span className="info-time">6:30 PM</span>
                  </a>
                  <p className="info-dress">{t.cocktailAttire}</p>
                  <p className="info-dress-note">{t.cocktailAttireNote}</p>
                </div>

                <div className="info-section info-section-brunch">
                  <h3 className="info-heading">{t.brunch}</h3>
                  <p className="info-venue">{t.locationTBD}</p>
                  <a 
                    href="https://www.google.com/calendar/render?action=TEMPLATE&text=Brunch+-+Elizabeth+%26+Carlos+Wedding&dates=20260718T120000/20260718T140000&details=Brunch+for+Elizabeth+%26+Carlos+Wedding&location=Location+TBD"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="info-date info-date-link"
                    data-tooltip={t.addToCalendar}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {language === 'es' ? 'Sábado, 18 de julio' : 'Saturday, July 18th'} <span className="info-time">{t.timeTBD}</span>
                  </a>
                </div>
                

                <p className="info-closing">{t.closing}</p>
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
        <p className="invitation-hint">{t.clickCard}</p>
      </div>
    </div>
  )
}

export default Landing

