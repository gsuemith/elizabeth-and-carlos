import { useState, useEffect } from 'react'
import './Landing.css'
import { useLanguage } from './LanguageContext'
import { translations } from './translations'

function Story({ onBack }) {
  const { language } = useLanguage()
  const t = translations[language]
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isImageModalOpen) {
        setIsImageModalOpen(false)
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isImageModalOpen])
  
  return (
    <div className="invitation-page">
      <button className="back-button" onClick={onBack}>
        {t.returnToWebsiteStory}
      </button>
      <div className="story-content-container">
        <div className="story-card story-card-full">
        <h2 className="story-title">{t.howWeMet}</h2>
          <div className="story-image-placeholder">
            <img 
              src="/two-salsa-dancers.jpeg" 
              alt="Two salsa dancers" 
              className="story-image"
              onClick={() => setIsImageModalOpen(true)}
              style={{ cursor: 'pointer' }}
            />
          </div>
        </div>
      </div>
      {isImageModalOpen && (
        <div 
          className="story-image-modal-overlay"
          onClick={() => setIsImageModalOpen(false)}
        >
          <img 
            src="/two-salsa-dancers.jpeg" 
            alt="Two salsa dancers" 
            className="story-image-modal"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}

export default Story

