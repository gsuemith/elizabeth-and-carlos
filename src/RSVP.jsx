import { useState } from 'react'
import './Landing.css'

function RSVP({ onBack }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [address, setAddress] = useState({
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)
    setSubmitSuccess(false)

    // Validate password match
    if (address.password !== address.confirmPassword) {
      setSubmitError('Passwords do not match. Please try again.')
      setIsSubmitting(false)
      return
    }

    try {
      // Step 1: Create/register the invitee
      const inviteeData = {
        names: guests.map(guest => guest.name),
        mailing_address: {
          address_line_1: address.line1,
          address_line_2: address.line2 || undefined,
          city: address.city,
          state: address.state,
          postal_code: address.postalCode
        },
        email: address.email,
        password: address.password,
        phone_number: address.phone
      }

      // Register or login the invitee
      const inviteeResponse = await fetch(`${API_BASE_URL}/guest/event/${MAIN_EVENT_ID}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inviteeData)
      })

      if (!inviteeResponse.ok) {
        const errorData = await inviteeResponse.json()
        throw new Error(errorData.detail || 'Failed to create invitee')
      }

      const inviteeResult = await inviteeResponse.json()
      
      // Extract mailing_address_id and invitee IDs from response
      // The response structure may vary, but typically contains mailing_address_id and invitees array
      const mailingAddressId = inviteeResult.mailing_address_id || inviteeResult.mailing_address?.id
      const invitees = inviteeResult.invitees || []
      
      if (!mailingAddressId) {
        throw new Error('Failed to get mailing address ID from response')
      }

      // Step 2: Loop over sub-events and post RSVPs
      for (const [eventKey, eventId] of Object.entries(EVENT_IDS)) {
        // Build invitees array with RSVP responses for this event
        const inviteesWithRSVP = guests.map((guest, index) => {
          // Find matching invitee by name
          const matchingInvitee = invitees.find(inv => 
            inv.full_name === guest.name || inv.name === guest.name
          )
          
          if (!matchingInvitee) {
            // If no match found, use index-based matching (assuming order is preserved)
            const invitee = invitees[index]
            if (!invitee) return null
            
            return {
              invitee_id: invitee.id || invitee.invitee_id,
              rsvp_response: guest[eventKey] === 'yes' ? 'yes' : 'no'
            }
          }
          
          return {
            invitee_id: matchingInvitee.id || matchingInvitee.invitee_id,
            rsvp_response: guest[eventKey] === 'yes' ? 'yes' : 'no'
          }
        }).filter(inv => inv !== null) // Remove any null entries

        // Post RSVP for this event
        const rsvpData = {
          mailing_address_id: mailingAddressId,
          event_id: eventId,
          invitees: inviteesWithRSVP
        }

        const rsvpResponse = await fetch(`${API_BASE_URL}/rsvp`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(rsvpData)
        })

        if (!rsvpResponse.ok) {
          const errorData = await rsvpResponse.json()
          throw new Error(errorData.detail || `Failed to create RSVP for ${eventKey}`)
        }
      }

      setSubmitSuccess(true)
      // Reset form after successful submission
      setTimeout(() => {
        setAddress({
          line1: '',
          line2: '',
          city: '',
          state: '',
          postalCode: '',
          phone: '',
          email: '',
          password: '',
          confirmPassword: ''
        })
        setGuests([{
          name: '',
          welcomeGathering: 'no',
          ceremony: 'yes',
          reception: 'yes',
          brunch: 'no'
        }])
        setSubmitSuccess(false)
      }, 3000)
    } catch (error) {
      console.error('RSVP submission error:', error)
      setSubmitError(error.message || 'Failed to submit RSVP. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
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
              <div className="rsvp-contact-row">
                <div className="rsvp-field-group">
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={address.phone}
                    onChange={(e) => handleAddressChange('phone', e.target.value)}
                    className="rsvp-input"
                    required
                  />
                </div>
                <div className="rsvp-field-group">
                  <input
                    type="email"
                    placeholder="Email"
                    value={address.email}
                    onChange={(e) => handleAddressChange('email', e.target.value)}
                    className="rsvp-input"
                    required
                  />
                </div>
              </div>
              <div className="rsvp-password-row">
                <div className="rsvp-field-group">
                  <input
                    type="password"
                    placeholder="Password"
                    value={address.password}
                    onChange={(e) => handleAddressChange('password', e.target.value)}
                    className="rsvp-input"
                    required
                  />
                </div>
                <div className="rsvp-field-group">
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    value={address.confirmPassword}
                    onChange={(e) => handleAddressChange('confirmPassword', e.target.value)}
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

            {submitError && (
              <div className="rsvp-message rsvp-error">
                {submitError}
              </div>
            )}
            {submitSuccess && (
              <div className="rsvp-message rsvp-success">
                RSVP submitted successfully! Thank you for responding.
              </div>
            )}
            <div className="rsvp-actions">
              <button
                type="button"
                onClick={addGuest}
                className="rsvp-add-guest"
                disabled={isSubmitting}
              >
                + Add Guest
              </button>
              <button 
                type="submit" 
                className="rsvp-submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit RSVP'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default RSVP

