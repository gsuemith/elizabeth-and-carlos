import { useState } from 'react'
import './Landing.css'
import { useLanguage } from './LanguageContext'
import { translations } from './translations'

const API_BASE_URL = 'https://wedding-rsvp-one-gamma.vercel.app'
const MAIN_EVENT_ID = '010e9472-8ea4-4239-9882-f8c3fe676f2b'
const EVENT_IDS = {
  welcomeGathering: '3d8d906d-2f37-4fb9-9e93-52c3cfbaaf28',
  ceremony: '3d6f9509-9f01-4ed6-bb56-caaeb4989128',
  reception: 'b2d1a136-7ac4-4df9-83f2-ce8ab7be6dfa',
  brunch: 'c727c901-c122-46f9-8c2a-fa6fb845f80a'
}

function RSVP({ onBack, onEditRSVP }) {
  const { language } = useLanguage()
  const t = translations[language]
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [isDuplicateEmail, setIsDuplicateEmail] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
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

  const formatPhoneNumber = (value) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '')
    
    // Limit to 10 digits
    const limitedDigits = digits.slice(0, 10)
    
    // Format as (***) ***-****
    if (limitedDigits.length === 0) return ''
    if (limitedDigits.length <= 3) return `(${limitedDigits}`
    if (limitedDigits.length <= 6) return `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3)}`
    return `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3, 6)}-${limitedDigits.slice(6)}`
  }

  const getDigitsOnly = (value) => {
    return value.replace(/\D/g, '')
  }

  const handleAddressChange = (field, value) => {
    if (field === 'phone') {
      // Store only digits, but display formatted
      const digitsOnly = getDigitsOnly(value)
      setAddress(prev => ({ ...prev, [field]: digitsOnly }))
    } else {
      setAddress(prev => ({ ...prev, [field]: value }))
      // Clear duplicate email error if email is changed
      if (field === 'email' && isDuplicateEmail) {
        setIsDuplicateEmail(false)
        setSubmitError(null)
      }
    }
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
          postal_code: address.postalCode,
          email: address.email,
          phone_number: address.phone,
          password: address.password,
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
        const errorMessage = errorData.detail || 'Failed to create invitee'
        
        // Check if it's a duplicate email error
        const isDuplicate = inviteeResponse.status === 400 || 
                           inviteeResponse.status === 409 ||
                           errorMessage.toLowerCase().includes('email') ||
                           errorMessage.toLowerCase().includes('already exists') ||
                           errorMessage.toLowerCase().includes('duplicate')
        
        if (isDuplicate) {
          setIsDuplicateEmail(true)
          setSubmitError(t.duplicateEmail)
          setIsSubmitting(false)
          return
        }
        
        throw new Error(errorMessage)
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
      // Reset form and return to landing page after successful submission
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
        if (onBack) {
          onBack()
        }
      }, 3000)
    } catch (error) {
      console.error('RSVP submission error:', error)
      setIsDuplicateEmail(false)
      setSubmitError(error.message || 'Failed to submit RSVP. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="invitation-page">
      <div className="rsvp-page-buttons">
        {onEditRSVP && (
          <button className="back-button edit-rsvp-button" onClick={onEditRSVP}>
            {t.editRSVP}
          </button>
        )}
        <button className="back-button back-button-right" onClick={onBack}>
          {t.returnToWebsite}
        </button>
      </div>
      <div className="invitation-container">
        <div className="rsvp-scroll-container">
          <h2 className="rsvp-page-title">{t.rsvp}</h2>
          
          <form className="rsvp-form" onSubmit={handleSubmit}>
            {/* Address Card */}
            <div className="rsvp-section-card">
              <h3 className="info-heading">{t.address}</h3>
              <div className="rsvp-field-group">
                <input
                  type="text"
                  placeholder={t.addressLine1}
                  value={address.line1}
                  onChange={(e) => handleAddressChange('line1', e.target.value)}
                  className="rsvp-input"
                  required
                />
              </div>
              <div className="rsvp-field-group">
                <input
                  type="text"
                  placeholder={t.addressLine2}
                  value={address.line2}
                  onChange={(e) => handleAddressChange('line2', e.target.value)}
                  className="rsvp-input"
                />
              </div>
              <div className="rsvp-address-row">
                <div className="rsvp-field-group rsvp-field-city">
                  <input
                    type="text"
                    placeholder={t.city}
                    value={address.city}
                    onChange={(e) => handleAddressChange('city', e.target.value)}
                    className="rsvp-input"
                    required
                  />
                </div>
                <div className="rsvp-field-group rsvp-field-state">
                  <input
                    type="text"
                    placeholder={t.state}
                    value={address.state}
                    onChange={(e) => handleAddressChange('state', e.target.value)}
                    className="rsvp-input"
                    required
                  />
                </div>
                <div className="rsvp-field-group rsvp-field-postal">
                  <input
                    type="text"
                    placeholder={t.postalCode}
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
                    placeholder={t.phone}
                    value={formatPhoneNumber(address.phone)}
                    onChange={(e) => handleAddressChange('phone', e.target.value)}
                    className="rsvp-input"
                    required
                  />
                </div>
                <div className="rsvp-field-group">
                  <input
                    type="email"
                    placeholder={t.email}
                    value={address.email}
                    onChange={(e) => handleAddressChange('email', e.target.value)}
                    className="rsvp-input"
                    required
                  />
                </div>
              </div>
              <div className="rsvp-password-row">
                <div className="rsvp-field-group rsvp-password-field" data-tooltip={t.passwordTooltip}>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder={t.password}
                    value={address.password}
                    onChange={(e) => handleAddressChange('password', e.target.value)}
                    className="rsvp-input"
                    required
                  />
                  <button
                    type="button"
                    className="rsvp-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
                <div className="rsvp-field-group rsvp-password-field" data-tooltip={t.passwordTooltip}>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder={t.confirmPassword}
                    value={address.confirmPassword}
                    onChange={(e) => handleAddressChange('confirmPassword', e.target.value)}
                    className="rsvp-input"
                    required
                  />
                  <button
                    type="button"
                    className="rsvp-password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>
            </div>

            {/* Guest Cards */}
            {guests.map((guest, index) => (
              <div key={index} className="rsvp-section-card">
                <div className="rsvp-guest-header">
                  <h3 className="rsvp-guest-title">{t.guest} {index + 1}</h3>
                  {guests.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeGuest(index)}
                      className="rsvp-remove-guest"
                    >
                      {t.remove}
                    </button>
                  )}
                </div>
                <div className="rsvp-field-group">
                  <input
                    type="text"
                    placeholder={t.fullName}
                    value={guest.name}
                    onChange={(e) => handleGuestChange(index, 'name', e.target.value)}
                    className="rsvp-input"
                    required
                  />
                </div>
                <div className="rsvp-events-row">
                  <div className="rsvp-toggle-group">
                    <label className="rsvp-event-label" data-tooltip={language === 'es' ? '16 de julio, 7pm' : 'July 16th, 7pm'}>{t.welcomeGatheringEvent}</label>
                    <button
                      type="button"
                      onClick={() => handleGuestChange(index, 'welcomeGathering', guest.welcomeGathering === 'yes' ? 'no' : 'yes')}
                      className={`rsvp-toggle-button ${guest.welcomeGathering === 'yes' ? 'active' : ''}`}
                      data-tooltip={language === 'es' ? '16 de julio, 7pm' : 'July 16th, 7pm'}
                    >
                      {guest.welcomeGathering === 'yes' ? t.attending : t.notAttending}
                    </button>
                  </div>
                  <div className="rsvp-toggle-group">
                    <label className="rsvp-event-label" data-tooltip={language === 'es' ? '17 de julio, 5:30pm' : 'July 17th, 5:30pm'}>{t.ceremonyEvent}</label>
                    <button
                      type="button"
                      onClick={() => handleGuestChange(index, 'ceremony', guest.ceremony === 'yes' ? 'no' : 'yes')}
                      className={`rsvp-toggle-button ${guest.ceremony === 'yes' ? 'active' : ''}`}
                      data-tooltip={language === 'es' ? '17 de julio, 5:30pm' : 'July 17th, 5:30pm'}
                    >
                      {guest.ceremony === 'yes' ? t.attending : t.notAttending}
                    </button>
                  </div>
                  <div className="rsvp-toggle-group">
                    <label className="rsvp-event-label" data-tooltip={language === 'es' ? '17 de julio, 6:30pm' : 'July 17th, 6:30pm'}>{t.receptionEvent}</label>
                    <button
                      type="button"
                      onClick={() => handleGuestChange(index, 'reception', guest.reception === 'yes' ? 'no' : 'yes')}
                      className={`rsvp-toggle-button ${guest.reception === 'yes' ? 'active' : ''}`}
                      data-tooltip={language === 'es' ? '17 de julio, 6:30pm' : 'July 17th, 6:30pm'}
                    >
                      {guest.reception === 'yes' ? t.attending : t.notAttending}
                    </button>
                  </div>
                  <div className="rsvp-toggle-group">
                    <label className="rsvp-event-label" data-tooltip={language === 'es' ? '18 de julio, Hora por determinar' : 'July 18th, Time TBD'}>{t.brunchEvent}</label>
                    <button
                      type="button"
                      onClick={() => handleGuestChange(index, 'brunch', guest.brunch === 'yes' ? 'no' : 'yes')}
                      className={`rsvp-toggle-button ${guest.brunch === 'yes' ? 'active' : ''}`}
                      data-tooltip={language === 'es' ? '18 de julio, Hora por determinar' : 'July 18th, Time TBD'}
                    >
                      {guest.brunch === 'yes' ? t.attending : t.notAttending}
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {submitError && (
              <div 
                className={`rsvp-message rsvp-error ${isDuplicateEmail ? 'rsvp-error-clickable' : ''}`}
                onClick={isDuplicateEmail && onEditRSVP ? onEditRSVP : undefined}
                style={isDuplicateEmail ? { cursor: 'pointer', textDecoration: 'underline' } : {}}
              >
                {submitError}
              </div>
            )}
            {submitSuccess && (
              <div className="rsvp-message rsvp-success">
                {t.rsvpSubmitted}
              </div>
            )}
            <div className="rsvp-actions">
              <button
                type="button"
                onClick={addGuest}
                className="rsvp-add-guest"
                disabled={isSubmitting}
              >
                {t.addGuest}
              </button>
              <button 
                type="submit" 
                className="rsvp-submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? t.submitting : t.submitRSVP}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default RSVP

