import { useState } from 'react'
import './Landing.css'

function RSVP({ onBack }) {
  const [address, setAddress] = useState({
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: ''
  })

  const [guests, setGuests] = useState([
    {
      name: '',
      welcomeGathering: 'no',
      ceremony: 'yes',
      reception: 'yes',
      brunch: 'no'
    }
  ])

  const handleAddressChange = (field, value) => {
    setAddress(prev => ({ ...prev, [field]: value }))
  }

  const handleGuestChange = (index, field, value) => {
    setGuests(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const addGuest = () => {
    setGuests(prev => [...prev, {
      name: '',
      welcomeGathering: 'no',
      ceremony: 'yes',
      reception: 'yes',
      brunch: 'no'
    }])
  }

  const removeGuest = (index) => {
    if (guests.length > 1) {
      setGuests(prev => prev.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle form submission here
    console.log({ address, guests })
  }

  return (
    <div className="invitation-page">
      <button className="back-button back-button-right" onClick={onBack}>
        Return to Website →
      </button>
      <div className="invitation-container">
        <div className="rsvp-scroll-container">
          <h2 className="rsvp-page-title">RSVP</h2>
          
          <form className="rsvp-form" onSubmit={handleSubmit}>
            {/* Address Card */}
            <div className="rsvp-section-card">
              <h3 className="info-heading">Address</h3>
              <div className="rsvp-field-group">
                <input
                  type="text"
                  placeholder="Address Line 1"
                  value={address.line1}
                  onChange={(e) => handleAddressChange('line1', e.target.value)}
                  className="rsvp-input"
                  required
                />
              </div>
              <div className="rsvp-field-group">
                <input
                  type="text"
                  placeholder="Address Line 2 (optional)"
                  value={address.line2}
                  onChange={(e) => handleAddressChange('line2', e.target.value)}
                  className="rsvp-input"
                />
              </div>
              <div className="rsvp-address-row">
                <div className="rsvp-field-group rsvp-field-city">
                  <input
                    type="text"
                    placeholder="City"
                    value={address.city}
                    onChange={(e) => handleAddressChange('city', e.target.value)}
                    className="rsvp-input"
                    required
                  />
                </div>
                <div className="rsvp-field-group rsvp-field-state">
                  <input
                    type="text"
                    placeholder="State"
                    value={address.state}
                    onChange={(e) => handleAddressChange('state', e.target.value)}
                    className="rsvp-input"
                    required
                  />
                </div>
                <div className="rsvp-field-group rsvp-field-postal">
                  <input
                    type="text"
                    placeholder="Postal Code"
                    value={address.postalCode}
                    onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                    className="rsvp-input"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Guest Cards */}
            {guests.map((guest, index) => (
              <div key={index} className="rsvp-section-card">
                <div className="rsvp-guest-header">
                  <h3 className="rsvp-guest-title">Guest {index + 1}</h3>
                  {guests.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeGuest(index)}
                      className="rsvp-remove-guest"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="rsvp-field-group">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={guest.name}
                    onChange={(e) => handleGuestChange(index, 'name', e.target.value)}
                    className="rsvp-input"
                    required
                  />
                </div>
                <div className="rsvp-events-row">
                  <div className="rsvp-toggle-group">
                    <label className="rsvp-event-label">Welcome Gathering</label>
                    <button
                      type="button"
                      onClick={() => handleGuestChange(index, 'welcomeGathering', guest.welcomeGathering === 'yes' ? 'no' : 'yes')}
                      className={`rsvp-toggle-button ${guest.welcomeGathering === 'yes' ? 'active' : ''}`}
                    >
                      {guest.welcomeGathering === 'yes' ? 'Attending' : 'Not Attending'}
                    </button>
                  </div>
                  <div className="rsvp-toggle-group">
                    <label className="rsvp-event-label">Ceremony</label>
                    <button
                      type="button"
                      onClick={() => handleGuestChange(index, 'ceremony', guest.ceremony === 'yes' ? 'no' : 'yes')}
                      className={`rsvp-toggle-button ${guest.ceremony === 'yes' ? 'active' : ''}`}
                    >
                      {guest.ceremony === 'yes' ? 'Attending' : 'Not Attending'}
                    </button>
                  </div>
                  <div className="rsvp-toggle-group">
                    <label className="rsvp-event-label">Reception</label>
                    <button
                      type="button"
                      onClick={() => handleGuestChange(index, 'reception', guest.reception === 'yes' ? 'no' : 'yes')}
                      className={`rsvp-toggle-button ${guest.reception === 'yes' ? 'active' : ''}`}
                    >
                      {guest.reception === 'yes' ? 'Attending' : 'Not Attending'}
                    </button>
                  </div>
                  <div className="rsvp-toggle-group">
                    <label className="rsvp-event-label">Brunch</label>
                    <button
                      type="button"
                      onClick={() => handleGuestChange(index, 'brunch', guest.brunch === 'yes' ? 'no' : 'yes')}
                      className={`rsvp-toggle-button ${guest.brunch === 'yes' ? 'active' : ''}`}
                    >
                      {guest.brunch === 'yes' ? 'Attending' : 'Not Attending'}
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <div className="rsvp-actions">
              <button
                type="button"
                onClick={addGuest}
                className="rsvp-add-guest"
              >
                + Add Guest
              </button>
              <button type="submit" className="rsvp-submit-button">
                Submit RSVP
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default RSVP

