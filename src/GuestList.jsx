import { useState, useEffect } from 'react'
import './Landing.css'

const API_BASE_URL = 'https://wedding-rsvp-one-gamma.vercel.app'
const MAIN_EVENT_ID = '010e9472-8ea4-4239-9882-f8c3fe676f2b'

function GuestList() {
  const [guests, setGuests] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showGuestList, setShowGuestList] = useState(false)
  const [selectedEventId, setSelectedEventId] = useState(null)
  const [deletingGuestId, setDeletingGuestId] = useState(null)
  const [guestBookNotesCount, setGuestBookNotesCount] = useState(0)
  const [isLoadingComments, setIsLoadingComments] = useState(false)

  useEffect(() => {
    const fetchGuestData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch guest list from the new single endpoint
        const response = await fetch(`${API_BASE_URL}/event/${MAIN_EVENT_ID}/guest-list`)
        if (!response.ok) {
          throw new Error('Failed to fetch guest list')
        }
        
        const guestDataArray = await response.json()
        
        // Filter out guests who RSVP'd "no" for the main event
        const filteredGuests = (guestDataArray || []).filter(guest => {
          const mainEvent = guest.events?.find(e => e.id === MAIN_EVENT_ID)
          if (!mainEvent?.guests || mainEvent.guests.length === 0) {
            // If no main event or no guests, include them (edge case)
            return true
          }
          
          // Check if all party members RSVP'd "no" for the main event
          const allNo = mainEvent.guests.every(partyMember => partyMember.rsvp_response === 'no')
          
          // Exclude if all party members said "no"
          return !allNo
        })
        
        setGuests(filteredGuests)
      } catch (err) {
        console.error('Error fetching guest data:', err)
        setError(err.message || 'Failed to load guest data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchGuestData()
  }, [])

  // Fetch guest book notes count (just one comment to get total)
  useEffect(() => {
    const fetchNotesCount = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/comments?page=1&page_size=1`)
        if (response.ok) {
          const data = await response.json()
          setGuestBookNotesCount(data.total || 0)
        }
      } catch (err) {
        console.error('Error fetching notes count:', err)
        // Don't show error, just leave count at 0
      }
    }

    fetchNotesCount()
  }, [])

  const handleDeleteGuest = async (guestId) => {
    if (!window.confirm('Are you sure you want to delete this guest? This action cannot be undone.')) {
      return
    }

    try {
      setDeletingGuestId(guestId)
      const response = await fetch(`${API_BASE_URL}/guest/${guestId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete guest')
      }

      // Remove the deleted guest from the state
      setGuests(prevGuests => {
        return prevGuests.map(guest => {
          const mainEvent = guest.events?.find(e => e.id === MAIN_EVENT_ID)
          if (mainEvent?.guests) {
            // Remove the deleted guest from party members
            const updatedGuests = mainEvent.guests.filter(g => g.id !== guestId)
            if (updatedGuests.length === 0) {
              // If no guests left in this party, remove the entire guest entry
              return null
            }
            // Update the guest with remaining party members
            return {
              ...guest,
              events: guest.events.map(e => 
                e.id === MAIN_EVENT_ID 
                  ? { ...e, guests: updatedGuests }
                  : {
                      ...e,
                      guests: e.guests?.filter(g => g.id !== guestId) || []
                    }
              )
            }
          }
          return guest
        }).filter(Boolean) // Remove null entries
      })
    } catch (err) {
      console.error('Error deleting guest:', err)
      alert('Failed to delete guest. Please try again.')
    } finally {
      setDeletingGuestId(null)
    }
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

  const generateExcelList = () => {
    // Generate tab-separated values for Excel
    const lines = ['Guest Names\tAddress\tCity\tState\tZip Code']
    
    guests.forEach(guest => {
      const names = formatPartyNames(guest)
      const address = guest.mailing_address
      
      // Combine address lines 1 and 2 if both exist
      const addressLines = [
        address?.address_line_1 || '',
        address?.address_line_2 || ''
      ].filter(Boolean).join(', ')
      
      const city = address?.city || ''
      const state = address?.state || ''
      const zipCode = address?.postal_code || ''
      
      lines.push(`${names}\t${addressLines}\t${city}\t${state}\t${zipCode}`)
    })
    
    return lines.join('\n')
  }

  const generateEventNameList = (eventId) => {
    if (!guests || guests.length === 0) return ''
    
    const names = []
    
    guests.forEach(guest => {
      const event = guest.events?.find(e => e.id === eventId)
      if (!event || !event.guests) return
      
      // Get party members from main event
      const mainEvent = guest.events?.find(e => e.id === MAIN_EVENT_ID)
      const partyMembers = mainEvent?.guests || []
      
      // For each party member who RSVP'd "yes" to this event, add their name
      partyMembers.forEach(partyMember => {
        const memberRSVP = event.guests?.find(g => g.id === partyMember.id)
        if (memberRSVP?.rsvp_response === 'yes') {
          names.push(partyMember.full_name)
        }
      })
    })
    
    return names.join('\n')
  }

  const fetchAllComments = async () => {
    setIsLoadingComments(true)
    try {
      let allComments = []
      let currentPage = 1
      let hasMore = true
      
      // Fetch all pages of comments
      while (hasMore) {
        const response = await fetch(`${API_BASE_URL}/comments?page=${currentPage}&page_size=100`)
        const data = await response.json()
        
        if (data.comments && data.comments.length > 0) {
          allComments = [...allComments, ...data.comments]
          currentPage++
          hasMore = currentPage <= (data.total_pages || 0)
        } else {
          hasMore = false
        }
      }
      
      return allComments
    } catch (err) {
      console.error('Error fetching all comments:', err)
      throw err
    } finally {
      setIsLoadingComments(false)
    }
  }

  const generateGuestBookNotesList = async () => {
    try {
      const comments = await fetchAllComments()
      
      // Create a map of invitee_id to guest data for quick lookup
      const inviteeToGuestMap = new Map()
      guests.forEach(guest => {
        const mainEvent = guest.events?.find(e => e.id === MAIN_EVENT_ID)
        if (mainEvent?.guests) {
          mainEvent.guests.forEach(partyMember => {
            inviteeToGuestMap.set(partyMember.id, {
              name: partyMember.full_name,
              mailingAddress: guest.mailing_address
            })
          })
        }
      })
      
      // Generate Excel-copiable list
      const lines = ['Author Name\tAddress\tCity\tState\tZip Code\tComment Text']
      
      comments.forEach(comment => {
        const guestData = inviteeToGuestMap.get(comment.invitee_id)
        const authorName = comment.invitee_name || guestData?.name || 'Anonymous'
        
        let address = 'N/A'
        let city = 'N/A'
        let state = 'N/A'
        let zipCode = 'N/A'
        
        if (guestData?.mailingAddress) {
          const addr = guestData.mailingAddress
          const addressLines = [
            addr.address_line_1 || '',
            addr.address_line_2 || ''
          ].filter(Boolean).join(', ')
          address = addressLines || 'N/A'
          city = addr.city || 'N/A'
          state = addr.state || 'N/A'
          zipCode = addr.postal_code || 'N/A'
        }
        
        // Escape tabs and newlines in comment text for Excel
        const commentText = (comment.message_text || '').replace(/\t/g, ' ').replace(/\n/g, ' ')
        
        lines.push(`${authorName}\t${address}\t${city}\t${state}\t${zipCode}\t${commentText}`)
      })
      
      return lines.join('\n')
    } catch (err) {
      console.error('Error generating guest book notes list:', err)
      return 'Error loading guest book notes. Please try again.'
    }
  }

  const handleGuestBookNotesClick = async () => {
    setSelectedEventId('guest-book-notes')
    setShowGuestList(true)
  }

  const getSelectedEventName = () => {
    if (selectedEventId === 'guest-book-notes') return 'Guest Book Notes'
    if (!selectedEventId || !guests || guests.length === 0) return 'Guest List'
    
    const subEvents = guests[0]?.events?.filter(e => e.id !== MAIN_EVENT_ID) || []
    const selectedEvent = subEvents.find(e => e.id === selectedEventId)
    return selectedEvent?.name || 'Guest List'
  }

  const [guestBookNotesContent, setGuestBookNotesContent] = useState('')

  const getModalContent = () => {
    if (selectedEventId === 'guest-book-notes') {
      return guestBookNotesContent
    }
    if (selectedEventId) {
      return generateEventNameList(selectedEventId)
    }
    return generateExcelList()
  }

  // Load guest book notes when modal opens for guest book notes
  useEffect(() => {
    if (showGuestList && selectedEventId === 'guest-book-notes' && !guestBookNotesContent && !isLoadingComments) {
      generateGuestBookNotesList().then(content => {
        setGuestBookNotesContent(content)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showGuestList, selectedEventId])

  const handleCopyToClipboard = () => {
    const text = getModalContent()
    const message = selectedEventId === 'guest-book-notes'
      ? 'Guest book notes copied to clipboard! You can paste it into Excel.'
      : selectedEventId 
        ? 'Attendee list copied to clipboard!'
        : 'Guest list copied to clipboard! You can paste it into Excel.'
    
    navigator.clipboard.writeText(text).then(() => {
      alert(message)
    }).catch(err => {
      console.error('Failed to copy:', err)
      // Fallback: select the textarea content
      const textarea = document.getElementById('guest-list-textarea')
      if (textarea) {
        textarea.select()
        document.execCommand('copy')
        alert(message)
      }
    })
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
          <div 
            className="guest-stat guest-stat-clickable" 
            onClick={() => {
              setSelectedEventId(null)
              setShowGuestList(true)
            }}
            title="Click to view Excel-copiable list"
          >
            <span className="guest-stat-label">Total Parties:</span>
            <span className="guest-stat-value">{guests.length}</span>
          </div>
          {Object.entries(eventTotals).map(([eventId, eventTotal]) => (
            <div 
              key={eventId} 
              className="guest-stat guest-stat-clickable"
              onClick={() => {
                setSelectedEventId(eventId)
                setShowGuestList(true)
              }}
              title={`Click to view list of ${eventTotal.name} attendees`}
            >
              <span className="guest-stat-label">{eventTotal.name}:</span>
              <span className="guest-stat-value">{eventTotal.count}</span>
            </div>
          ))}
          <div 
            className="guest-stat guest-stat-clickable"
            onClick={handleGuestBookNotesClick}
            title="Click to view Excel-copiable list of guest book notes"
          >
            <span className="guest-stat-label">Guest Book Notes:</span>
            <span className="guest-stat-value">{guestBookNotesCount}</span>
          </div>
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

              {(() => {
                // Find the main event (Carlos & Elizabeth)
                const mainEvent = guest.events?.find(e => e.id === MAIN_EVENT_ID)
                // Show party members for all parties
                if (mainEvent?.guests && mainEvent.guests.length > 0) {
                  return (
                    <div className="guest-party-section">
                      <h3 className="guest-section-title">Party Members</h3>
                      <div className="guest-party-list">
                        {mainEvent.guests.map((partyMember) => (
                          <div key={partyMember.id} className="guest-party-member">
                            <div className="party-member-header">
                              <span className="party-member-name">{partyMember.full_name}</span>
                              <button
                                className="guest-delete-button"
                                onClick={() => handleDeleteGuest(partyMember.id)}
                                disabled={deletingGuestId === partyMember.id}
                                title="Delete guest"
                              >
                                {deletingGuestId === partyMember.id ? 'Deleting...' : '×'}
                              </button>
                            </div>
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
      
      {showGuestList && (
        <div className="guest-list-modal-overlay" onClick={() => {
          setShowGuestList(false)
          setSelectedEventId(null)
          if (selectedEventId === 'guest-book-notes') {
            setGuestBookNotesContent('')
          }
        }}>
          <div className="guest-list-modal" onClick={(e) => e.stopPropagation()}>
            <div className="guest-list-modal-header">
              <h2 className="guest-list-modal-title">
                {selectedEventId === 'guest-book-notes' 
                  ? 'Guest Book Notes (Excel Format)'
                  : selectedEventId 
                    ? `${getSelectedEventName()} Attendees`
                    : 'Guest List (Excel Format)'}
              </h2>
              <button 
                className="guest-list-modal-close"
                onClick={() => {
                  setShowGuestList(false)
                  setSelectedEventId(null)
                  if (selectedEventId === 'guest-book-notes') {
                    setGuestBookNotesContent('')
                  }
                }}
              >
                ×
              </button>
            </div>
            <div className="guest-list-modal-content">
              {isLoadingComments && selectedEventId === 'guest-book-notes' ? (
                <div className="guest-list-loading">Loading guest book notes...</div>
              ) : (
                <textarea
                  id="guest-list-textarea"
                  className="guest-list-textarea"
                  value={getModalContent()}
                  readOnly
                  onClick={(e) => e.target.select()}
                />
              )}
              <div className="guest-list-modal-actions">
                <button 
                  className="guest-list-copy-button"
                  onClick={handleCopyToClipboard}
                >
                  Copy to Clipboard
                </button>
                <button 
                  className="guest-list-close-button"
                  onClick={() => {
                    setShowGuestList(false)
                    setSelectedEventId(null)
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GuestList

