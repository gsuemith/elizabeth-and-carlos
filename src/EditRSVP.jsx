import { useState } from 'react'
import './Landing.css'

const API_BASE_URL = 'https://wedding-rsvp-one-gamma.vercel.app'
const MAIN_EVENT_ID = '010e9472-8ea4-4239-9882-f8c3fe676f2b'
const EVENT_IDS = {
  welcomeGathering: '3d8d906d-2f37-4fb9-9e93-52c3cfbaaf28',
  ceremony: '3d6f9509-9f01-4ed6-bb56-caaeb4989128',
  reception: 'b2d1a136-7ac4-4df9-83f2-ce8ab7be6dfa',
  brunch: 'c727c901-c122-46f9-8c2a-fa6fb845f80a'
}

function EditRSVP({ onBack }) {
  const [credentials, setCredentials] = useState({
    phone: '',
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState(null)
  const [showEditForm, setShowEditForm] = useState(false)
  const [mailingAddress, setMailingAddress] = useState(null)
  const [existingGuests, setExistingGuests] = useState([])
  const [newGuests, setNewGuests] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const handleCredentialChange = (field, value) => {
    setCredentials(prev => ({ ...prev, [field]: value }))
  }

  const handleExistingGuestRSVPChange = (guestId, eventKey, value) => {
    setExistingGuests(prev => prev.map(guest => {
      if (guest.id === guestId) {
        return { ...guest, [eventKey]: value }
      }
      return guest
    }))
  }

  const handleExistingGuestNameChange = (guestId, value) => {
    setExistingGuests(prev => prev.map(guest => {
      if (guest.id === guestId) {
        return { ...guest, full_name: value }
      }
      return guest
    }))
  }

  const handleNewGuestChange = (index, field, value) => {
    setNewGuests(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const handleAddressChange = (field, value) => {
    setMailingAddress(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addNewGuest = () => {
    setNewGuests(prev => [...prev, {
      name: '',
      welcomeGathering: 'no',
      ceremony: 'yes',
      reception: 'yes',
      brunch: 'no'
    }])
  }

  const removeNewGuest = (index) => {
    setNewGuests(prev => prev.filter((_, i) => i !== index))
  }

  const handleAuthSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setAuthError(null)

    try {
      // Try to authenticate with each sub-event
      const eventResponses = []
      for (const [eventKey, eventId] of Object.entries(EVENT_IDS)) {
        const response = await fetch(`${API_BASE_URL}/guest/rsvp-info`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: credentials.email,
            phone_number: credentials.phone,
            password: credentials.password,
            event_id: eventId
          })
        })

        if (response.ok) {
          const data = await response.json()
          eventResponses.push({ eventKey, data })
        } else if (response.status === 404 || response.status === 401) {
          // Continue trying other events
          continue
        } else {
          const errorData = await response.json()
          throw new Error(errorData.detail || 'Authentication failed')
        }
      }

      if (eventResponses.length === 0) {
        throw new Error('No RSVP found with the provided credentials')
      }

      // Use the first successful response to populate the form
      const firstResponse = eventResponses[0].data
      setMailingAddress(firstResponse.mailing_address)
      
      // Collect all existing guests from all events
      // Use a Map keyed by guest ID to ensure no duplicates
      // Also track by name as fallback in case IDs differ across events
      const allGuestsById = new Map()
      const allGuestsByName = new Map()
      
      // First pass: collect all unique guests by ID
      eventResponses.forEach(({ eventKey, data }) => {
        if (data.event && data.event.guests) {
          data.event.guests.forEach(guest => {
            // Check by ID first
            if (!allGuestsById.has(guest.id)) {
              // Also check by name to catch duplicates with different IDs
              const existingByName = allGuestsByName.get(guest.full_name)
              if (!existingByName) {
                const guestObj = {
                  id: guest.id,
                  full_name: guest.full_name,
                  welcomeGathering: 'no',
                  ceremony: 'no',
                  reception: 'no',
                  brunch: 'no'
                }
                allGuestsById.set(guest.id, guestObj)
                allGuestsByName.set(guest.full_name, guestObj)
              } else {
                // Use existing guest object if found by name
                allGuestsById.set(guest.id, existingByName)
              }
            }
          })
        }
      })
      
      // Second pass: update RSVP responses for each event
      eventResponses.forEach(({ eventKey, data }) => {
        if (data.event && data.event.guests) {
          data.event.guests.forEach(guest => {
            // Find guest by ID or name
            let guestData = allGuestsById.get(guest.id)
            if (!guestData) {
              guestData = allGuestsByName.get(guest.full_name)
            }
            if (guestData && guest.rsvp_response) {
              guestData[eventKey] = guest.rsvp_response
            }
          })
        }
      })

      // Convert to array, deduplicating by name to ensure truly unique guests
      const guestsArray = Array.from(allGuestsById.values())
      const uniqueGuests = []
      const seenNames = new Set()
      
      guestsArray.forEach(guest => {
        if (!seenNames.has(guest.full_name)) {
          seenNames.add(guest.full_name)
          uniqueGuests.push(guest)
        }
      })
      
      setExistingGuests(uniqueGuests)
      setNewGuests([])
      setShowEditForm(true)
    } catch (error) {
      console.error('Authentication error:', error)
      setAuthError(error.message || 'Failed to authenticate. Please check your credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)
    setSubmitSuccess(false)

    try {
      // Combine existing and new guests
      const allGuests = [
        ...existingGuests.map(guest => ({
          ...guest,
          isExisting: true
        })),
        ...newGuests.map((guest, index) => ({
          ...guest,
          isExisting: false,
          tempId: `new-${index}`
        }))
      ]

      // Post RSVP for each sub-event
      for (const [eventKey, eventId] of Object.entries(EVENT_IDS)) {
        const invitees = allGuests.map(guest => {
          const rsvpResponse = guest[eventKey] === 'yes' ? 'yes' : 'no'
          
          if (guest.isExisting) {
            return {
              invitee_id: guest.id,
              rsvp_response: rsvpResponse,
              name: guest.full_name
            }
          } else {
            // For new guests, we'll need to create them - but for now, include name
            return {
              rsvp_response: rsvpResponse,
              name: guest.name
            }
          }
        })

        const rsvpData = {
          mailing_address_id: mailingAddress.id,
          mailing_address: {
            address_line_1: mailingAddress.address_line_1,
            address_line_2: mailingAddress.address_line_2 || '',
            city: mailingAddress.city,
            state: mailingAddress.state,
            postal_code: mailingAddress.postal_code,
            email: mailingAddress.email,
            phone_number: mailingAddress.phone_number
          },
          event_id: eventId,
          invitees: invitees
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
          throw new Error(errorData.detail || `Failed to update RSVP for ${eventKey}`)
        }
      }

      // Check for guests who are not attending all sub-events
      const guestsNotAttendingAll = allGuests.filter(guest => {
        return guest.welcomeGathering === 'no' &&
               guest.ceremony === 'no' &&
               guest.reception === 'no' &&
               guest.brunch === 'no'
      })

      // Post to main event for guests not attending any sub-events
      if (guestsNotAttendingAll.length > 0) {
        const mainEventInvitees = guestsNotAttendingAll.map(guest => {
          if (guest.isExisting) {
            return {
              invitee_id: guest.id,
              rsvp_response: 'no',
              name: guest.full_name
            }
          } else {
            return {
              rsvp_response: 'no',
              name: guest.name
            }
          }
        })

        const mainEventRSVP = {
          mailing_address_id: mailingAddress.id,
          mailing_address: {
            address_line_1: mailingAddress.address_line_1,
            address_line_2: mailingAddress.address_line_2 || '',
            city: mailingAddress.city,
            state: mailingAddress.state,
            postal_code: mailingAddress.postal_code,
            email: mailingAddress.email,
            phone_number: mailingAddress.phone_number
          },
          event_id: MAIN_EVENT_ID,
          invitees: mainEventInvitees
        }

        const mainEventResponse = await fetch(`${API_BASE_URL}/rsvp`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(mainEventRSVP)
        })

        if (!mainEventResponse.ok) {
          const errorData = await mainEventResponse.json()
          throw new Error(errorData.detail || 'Failed to update main event RSVP')
        }
      }

      setSubmitSuccess(true)
      setTimeout(() => {
        setShowEditForm(false)
        setCredentials({ phone: '', email: '', password: '' })
        setSubmitSuccess(false)
        if (onBack) {
          onBack()
        }
      }, 3000)
    } catch (error) {
      console.error('RSVP update error:', error)
      setSubmitError(error.message || 'Failed to update RSVP. Please try again.')
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
        {!showEditForm ? (
          <div className="rsvp-scroll-container">
            <h2 className="rsvp-page-title">Edit RSVP</h2>
            <form className="rsvp-form" onSubmit={handleAuthSubmit}>
              <div className="rsvp-section-card">
                <h3 className="info-heading">Enter Your Information</h3>
                <div className="rsvp-field-group">
                  <input
                    type="email"
                    placeholder="Email"
                    value={credentials.email}
                    onChange={(e) => handleCredentialChange('email', e.target.value)}
                    className="rsvp-input"
                    required
                  />
                </div>
                <div className="rsvp-phone-password-row">
                  <div className="rsvp-field-group">
                    <input
                      type="tel"
                      placeholder="Phone"
                      value={credentials.phone}
                      onChange={(e) => handleCredentialChange('phone', e.target.value)}
                      className="rsvp-input"
                      required
                    />
                  </div>
                  <div className="rsvp-field-group">
                    <input
                      type="password"
                      placeholder="Password"
                      value={credentials.password}
                      onChange={(e) => handleCredentialChange('password', e.target.value)}
                      className="rsvp-input"
                      required
                    />
                  </div>
                </div>
                {authError && (
                  <div className="rsvp-message rsvp-error">
                    {authError}
                  </div>
                )}
                <div className="rsvp-auth-actions">
                  <button
                    type="button"
                    onClick={onBack}
                    className="rsvp-cancel-button"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rsvp-submit-button"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Loading...' : 'Continue'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        ) : (
          <div className="rsvp-edit-form-container slide-up">
            <div className="rsvp-scroll-container">
              <h2 className="rsvp-page-title">Edit Your RSVP</h2>
              <form className="rsvp-form" onSubmit={handleEditSubmit}>
                {/* Address Card */}
                {mailingAddress && (
                  <div className="rsvp-section-card">
                    <h3 className="info-heading">Address</h3>
                    <div className="rsvp-field-group">
                      <input
                        type="text"
                        placeholder="Address Line 1"
                        value={mailingAddress.address_line_1 || ''}
                        onChange={(e) => handleAddressChange('address_line_1', e.target.value)}
                        className="rsvp-input"
                        required
                      />
                    </div>
                    <div className="rsvp-field-group">
                      <input
                        type="text"
                        placeholder="Address Line 2 (optional)"
                        value={mailingAddress.address_line_2 || ''}
                        onChange={(e) => handleAddressChange('address_line_2', e.target.value)}
                        className="rsvp-input"
                      />
                    </div>
                    <div className="rsvp-address-row">
                      <div className="rsvp-field-group">
                        <input
                          type="text"
                          placeholder="City"
                          value={mailingAddress.city || ''}
                          onChange={(e) => handleAddressChange('city', e.target.value)}
                          className="rsvp-input"
                          required
                        />
                      </div>
                      <div className="rsvp-field-group">
                        <input
                          type="text"
                          placeholder="State"
                          value={mailingAddress.state || ''}
                          onChange={(e) => handleAddressChange('state', e.target.value)}
                          className="rsvp-input"
                          required
                        />
                      </div>
                      <div className="rsvp-field-group">
                        <input
                          type="text"
                          placeholder="Postal Code"
                          value={mailingAddress.postal_code || ''}
                          onChange={(e) => handleAddressChange('postal_code', e.target.value)}
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
                          value={mailingAddress.phone_number || ''}
                          onChange={(e) => handleAddressChange('phone_number', e.target.value)}
                          className="rsvp-input"
                          required
                        />
                      </div>
                      <div className="rsvp-field-group">
                        <input
                          type="email"
                          placeholder="Email"
                          value={mailingAddress.email || ''}
                          onChange={(e) => handleAddressChange('email', e.target.value)}
                          className="rsvp-input"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Existing Guest Cards */}
                {existingGuests.map((guest) => (
                  <div key={guest.id} className="rsvp-section-card">
                    <div className="rsvp-guest-header">
                      <h3 className="rsvp-guest-title">Guest</h3>
                    </div>
                    <div className="rsvp-field-group">
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={guest.full_name}
                        onChange={(e) => handleExistingGuestNameChange(guest.id, e.target.value)}
                        className="rsvp-input"
                        required
                      />
                    </div>
                    <div className="rsvp-events-row">
                      <div className="rsvp-toggle-group">
                        <label className="rsvp-event-label" data-tooltip="July 16th, 7pm">Welcome Gathering</label>
                        <button
                          type="button"
                          onClick={() => handleExistingGuestRSVPChange(guest.id, 'welcomeGathering', guest.welcomeGathering === 'yes' ? 'no' : 'yes')}
                          className={`rsvp-toggle-button ${guest.welcomeGathering === 'yes' ? 'active' : ''}`}
                          data-tooltip="July 16th, 7pm"
                        >
                          {guest.welcomeGathering === 'yes' ? 'Attending' : 'Not Attending'}
                        </button>
                      </div>
                      <div className="rsvp-toggle-group">
                        <label className="rsvp-event-label" data-tooltip="July 17th, 5:30pm">Ceremony</label>
                        <button
                          type="button"
                          onClick={() => handleExistingGuestRSVPChange(guest.id, 'ceremony', guest.ceremony === 'yes' ? 'no' : 'yes')}
                          className={`rsvp-toggle-button ${guest.ceremony === 'yes' ? 'active' : ''}`}
                          data-tooltip="July 17th, 5:30pm"
                        >
                          {guest.ceremony === 'yes' ? 'Attending' : 'Not Attending'}
                        </button>
                      </div>
                      <div className="rsvp-toggle-group">
                        <label className="rsvp-event-label" data-tooltip="July 17th, 6:30pm">Reception</label>
                        <button
                          type="button"
                          onClick={() => handleExistingGuestRSVPChange(guest.id, 'reception', guest.reception === 'yes' ? 'no' : 'yes')}
                          className={`rsvp-toggle-button ${guest.reception === 'yes' ? 'active' : ''}`}
                          data-tooltip="July 17th, 6:30pm"
                        >
                          {guest.reception === 'yes' ? 'Attending' : 'Not Attending'}
                        </button>
                      </div>
                      <div className="rsvp-toggle-group">
                        <label className="rsvp-event-label" data-tooltip="July 18th, Time TBD">Brunch</label>
                        <button
                          type="button"
                          onClick={() => handleExistingGuestRSVPChange(guest.id, 'brunch', guest.brunch === 'yes' ? 'no' : 'yes')}
                          className={`rsvp-toggle-button ${guest.brunch === 'yes' ? 'active' : ''}`}
                          data-tooltip="July 18th, Time TBD"
                        >
                          {guest.brunch === 'yes' ? 'Attending' : 'Not Attending'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* New Guest Cards */}
                {newGuests.map((guest, index) => (
                  <div key={`new-${index}`} className="rsvp-section-card">
                    <div className="rsvp-guest-header">
                      <h3 className="rsvp-guest-title">New Guest {index + 1}</h3>
                      <button
                        type="button"
                        onClick={() => removeNewGuest(index)}
                        className="rsvp-remove-guest"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="rsvp-field-group">
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={guest.name}
                        onChange={(e) => handleNewGuestChange(index, 'name', e.target.value)}
                        className="rsvp-input"
                        required
                      />
                    </div>
                    <div className="rsvp-events-row">
                      <div className="rsvp-toggle-group">
                        <label className="rsvp-event-label" data-tooltip="July 16th, 7pm">Welcome Gathering</label>
                        <button
                          type="button"
                          onClick={() => handleNewGuestChange(index, 'welcomeGathering', guest.welcomeGathering === 'yes' ? 'no' : 'yes')}
                          className={`rsvp-toggle-button ${guest.welcomeGathering === 'yes' ? 'active' : ''}`}
                          data-tooltip="July 16th, 7pm"
                        >
                          {guest.welcomeGathering === 'yes' ? 'Attending' : 'Not Attending'}
                        </button>
                      </div>
                      <div className="rsvp-toggle-group">
                        <label className="rsvp-event-label" data-tooltip="July 17th, 5:30pm">Ceremony</label>
                        <button
                          type="button"
                          onClick={() => handleNewGuestChange(index, 'ceremony', guest.ceremony === 'yes' ? 'no' : 'yes')}
                          className={`rsvp-toggle-button ${guest.ceremony === 'yes' ? 'active' : ''}`}
                          data-tooltip="July 17th, 5:30pm"
                        >
                          {guest.ceremony === 'yes' ? 'Attending' : 'Not Attending'}
                        </button>
                      </div>
                      <div className="rsvp-toggle-group">
                        <label className="rsvp-event-label" data-tooltip="July 17th, 6:30pm">Reception</label>
                        <button
                          type="button"
                          onClick={() => handleNewGuestChange(index, 'reception', guest.reception === 'yes' ? 'no' : 'yes')}
                          className={`rsvp-toggle-button ${guest.reception === 'yes' ? 'active' : ''}`}
                          data-tooltip="July 17th, 6:30pm"
                        >
                          {guest.reception === 'yes' ? 'Attending' : 'Not Attending'}
                        </button>
                      </div>
                      <div className="rsvp-toggle-group">
                        <label className="rsvp-event-label" data-tooltip="July 18th, Time TBD">Brunch</label>
                        <button
                          type="button"
                          onClick={() => handleNewGuestChange(index, 'brunch', guest.brunch === 'yes' ? 'no' : 'yes')}
                          className={`rsvp-toggle-button ${guest.brunch === 'yes' ? 'active' : ''}`}
                          data-tooltip="July 18th, Time TBD"
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
                    onClick={addNewGuest}
                    className="rsvp-add-guest"
                  >
                    + Add Guest
                  </button>
                </div>

                {submitError && (
                  <div className="rsvp-message rsvp-error">
                    {submitError}
                  </div>
                )}
                {submitSuccess && (
                  <div className="rsvp-message rsvp-success">
                    RSVP updated successfully!
                  </div>
                )}
                <div className="rsvp-actions">
                  <button
                    type="submit"
                    className="rsvp-submit-button"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Updating...' : 'Update RSVP'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default EditRSVP

