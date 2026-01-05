import { useState } from 'react'
import './Landing.css'

function RSVP({ onBack }) {
  return (
    <div className="invitation-page">
      <button className="back-button back-button-right" onClick={onBack}>
        Return to Website →
      </button>
      <div className="invitation-container">
        <div className="rsvp-content">
          <h1>RSVP</h1>
          <p>RSVP form will go here</p>
        </div>
      </div>
    </div>
  )
}

export default RSVP

