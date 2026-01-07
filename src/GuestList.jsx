import { useState, useEffect } from 'react'
import './Landing.css'

const API_BASE_URL = 'https://wedding-rsvp-one-gamma.vercel.app'
const MAIN_EVENT_ID = '010e9472-8ea4-4239-9882-f8c3fe676f2b'

function GuestList() {
  const [guests, setGuests] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchGuestData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // First, fetch the main event to get the guest_list
        const eventResponse = await fetch(`${API_BASE_URL}/event`)
        if (!eventResponse.ok) {
          throw new Error('Failed to fetch main event')
        }
        const events = await eventResponse.json()
        const eventData = events.find(event => event.id === MAIN_EVENT_ID)
        
        if (!eventData.guest_list || eventData.guest_list.length === 0) {
          setGuests([])
          setIsLoading(false)
          return
        }

        // Fetch data for each guest
        const guestPromises = eventData.guest_list.map(async (guestId) => {
          const guestResponse = await fetch(`${API_BASE_URL}/guest/${guestId}`)
          if (!guestResponse.ok) {
            throw new Error(`Failed to fetch guest ${guestId}`)
          }
          return guestResponse.json()
        })

        const guestDataArray = await Promise.all(guestPromises)
        setGuests(guestDataArray)
      } catch (err) {
        console.error('Error fetching guest data:', err)
        setError(err.message || 'Failed to load guest data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchGuestData()
  }, [])

  const getEventRSVP = (guest, eventId) => {
    const event = guest.events?.find(e => e.id === eventId)
    if (!event || !event.guests) return 'N/A'
    
    // Find the guest in this event's guests array by matching full_name
    // or by matching mailing_address if available
    const guestRSVP = event.guests.find(g => {
      if (g.mailing_address === guest.mailing_address?.id) {
        return true
      }
      // Fallback: match by name if mailing_address doesn't match
      return g.full_name === guest.full_name
    })
    return guestRSVP?.rsvp_response || 'N/A'
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const formatAddress = (address) => {
    if (!address) return 'N/A'
    const parts = [
      address.address_line_1,
      address.address_line_2,
      `${address.city}, ${address.state} ${address.postal_code}`
    ].filter(Boolean)
    return parts.join(', ')
  }

  const formatPartyNames = (guest) => {
    const mainEvent = guest.events?.find(e => e.id === MAIN_EVENT_ID)
    if (!mainEvent?.guests || mainEvent.guests.length === 0) {
      return guest.full_name || 'N/A'
    }
    
    const partyNames = mainEvent.guests.map(g => g.full_name).filter(Boolean)
    
    if (partyNames.length === 0) {
      return guest.full_name || 'N/A'
    }
    
    if (partyNames.length === 1) {
      return partyNames[0]
    }
    
    if (partyNames.length === 2) {
      return `${partyNames[0]} & ${partyNames[1]}`
    }
    
    // 3 or more: use Oxford comma
    const allButLast = partyNames.slice(0, -1).join(', ')
    const last = partyNames[partyNames.length - 1]
    return `${allButLast}, & ${last}`
  }

  const calculateEventTotals = () => {
    if (!guests || guests.length === 0) return {}
    
    // Get all sub-events (exclude main event)
    const subEvents = guests[0]?.events?.filter(e => e.id !== MAIN_EVENT_ID) || []
    
    const totals = {}
    
    subEvents.forEach(subEvent => {
      let count = 0
      // Count all guests across all mailing addresses who RSVP'd "yes" for this event
      guests.forEach(guest => {
        const event = guest.events?.find(e => e.id === subEvent.id)
        if (event?.guests) {
          event.guests.forEach(g => {
            if (g.rsvp_response === 'yes') {
              count++
            }
          })
        }
      })
      totals[subEvent.id] = {
        name: subEvent.name,
        count: count
      }
    })
    
    return totals
  }

  if (isLoading) {
    return (
      <div className="guest-list-container">
        <div className="guest-list-card">
          <h1 className="guest-list-title">Guest List Dashboard</h1>
          <div className="guest-list-loading">Loading guest data...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="guest-list-container">
        <div className="guest-list-card">
          <h1 className="guest-list-title">Guest List Dashboard</h1>
          <div className="guest-list-error">Error: {error}</div>
        </div>
      </div>
    )
  }

  const eventTotals = calculateEventTotals()

  return (
    <div className="guest-list-container">
      <div className="guest-list-card">
        <h1 className="guest-list-title">Guest List Dashboard</h1>
        <div className="guest-list-stats">
          <div className="guest-stat">
            <span className="guest-stat-label">Total Guests:</span>
            <span className="guest-stat-value">{guests.length}</span>
          </div>
          {Object.values(eventTotals).map((eventTotal) => (
            <div key={eventTotal.name} className="guest-stat">
              <span className="guest-stat-label">{eventTotal.name}:</span>
              <span className="guest-stat-value">{eventTotal.count}</span>
            </div>
          ))}
        </div>
        
        <div className="guest-list-scroll">
          {guests.map((guest, index) => (
            <div key={guest.mailing_address?.id || index} className="guest-card">
              <div className="guest-header">
                <h2 className="guest-name">{formatPartyNames(guest)}</h2>
              </div>
              
              <div className="guest-info-section">
                <h3 className="guest-section-title">Contact Information</h3>
                <div className="guest-info-grid">
                  <div className="guest-info-item">
                    <span className="guest-info-label">Address:</span>
                    <span className="guest-info-value">{formatAddress(guest.mailing_address)}</span>
                  </div>
                  <div className="guest-info-item">
                    <span className="guest-info-label">Email:</span>
                    <span className="guest-info-value">{guest.mailing_address?.email || 'N/A'}</span>
                  </div>
                  <div className="guest-info-item">
                    <span className="guest-info-label">Phone:</span>
                    <span className="guest-info-value">{guest.mailing_address?.phone_number || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="guest-rsvp-section">
                <h3 className="guest-section-title">RSVP Responses</h3>
              </div>

              {(() => {
                // Find the main event (Carlos & Elizabeth)
                const mainEvent = guest.events?.find(e => e.id === MAIN_EVENT_ID)
                // Show party members if there are multiple guests with the same mailing address
                if (mainEvent?.guests && mainEvent.guests.length > 1) {
                  return (
                    <div className="guest-party-section">
                      <h3 className="guest-section-title">Party Members</h3>
                      <div className="guest-party-list">
                        {mainEvent.guests.map((partyMember) => (
                          <div key={partyMember.id} className="guest-party-member">
                            <span className="party-member-name">{partyMember.full_name}</span>
                            <div className="party-member-rsvps">
                              {guest.events?.filter(e => e.id !== MAIN_EVENT_ID).map((event) => {
                                const memberRSVP = event.guests?.find(g => g.id === partyMember.id)
                                return (
                                  <span 
                                    key={event.id} 
                                    className={`party-member-rsvp party-rsvp-${memberRSVP?.rsvp_response || 'no'}`}
                                  >
                                    {event.name}: {memberRSVP?.rsvp_response?.toUpperCase() || 'N/A'}
                                  </span>
                                )
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                }
                return null
              })()}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default GuestList

