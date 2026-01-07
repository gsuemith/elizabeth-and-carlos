import './Landing.css'
import { useLanguage } from './LanguageContext'
import { translations } from './translations'

function Story({ onBack }) {
  const { language } = useLanguage()
  const t = translations[language]
  
  return (
    <div className="invitation-page">
      <button className="back-button" onClick={onBack}>
        {t.returnToWebsiteStory}
      </button>
      <div className="story-content-container">
        <div className="story-card story-card-full">
        <h2 className="story-title">{t.howWeMet}</h2>
          <div className="story-image-placeholder">
            <img src="/two-salsa-dancers.jpeg" alt="Two salsa dancers" className="story-image-gradient" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Story

